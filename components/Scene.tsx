"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AccumulativeShadows, Environment, Lightformer, RandomizedLight, RoundedBox } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/* ---------- procedural textures (drawn once, on the client) ---------- */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  return [c, c.getContext("2d")!] as const;
}

/* A printed sheet: letterhead, a few paragraphs, an invoice table, a stamp. */
function paperTexture(kind: "invoice" | "letter" | "form") {
  const [c, ctx] = makeCanvas(1024, 1324);
  ctx.fillStyle = "#f3efe6"; ctx.fillRect(0, 0, c.width, c.height);
  // faint aging blotches
  for (let i = 0; i < 40; i++) {
    const g = ctx.createRadialGradient(Math.random() * 1024, Math.random() * 1324, 0, 0, 0, 0);
    ctx.fillStyle = `rgba(190,160,110,${Math.random() * 0.05})`;
    ctx.beginPath(); ctx.arc(Math.random() * 1024, Math.random() * 1324, 60 + Math.random() * 160, 0, Math.PI * 2); ctx.fill();
    void g;
  }
  const line = (x: number, y: number, w: number, h = 9, a = 0.55) => { ctx.fillStyle = `rgba(40,40,45,${a})`; ctx.fillRect(x, y, w, h); };
  if (kind === "invoice") {
    ctx.fillStyle = "#23262e"; ctx.font = "bold 54px Helvetica, Arial"; ctx.fillText("INVOICE", 90, 150);
    ctx.font = "26px Helvetica, Arial"; ctx.fillStyle = "#555"; ctx.fillText("No. 2190   ·   Due on receipt", 90, 200);
    line(90, 240, 844, 2, 0.5);
    for (let r = 0; r < 9; r++) { const y = 300 + r * 64; line(90, y, 260 + Math.random() * 200, 10, 0.5); line(700, y, 120, 10, 0.5); line(860, y, 70, 10, 0.6); }
    line(90, 900, 844, 2, 0.5);
    ctx.fillStyle = "#23262e"; ctx.font = "bold 34px Helvetica, Arial"; ctx.fillText("TOTAL DUE", 90, 970); ctx.fillText("$1,850.00", 740, 970);
    // red "PAST DUE" stamp
    ctx.save(); ctx.translate(600, 1150); ctx.rotate(-0.22); ctx.strokeStyle = "rgba(190,40,40,.75)"; ctx.lineWidth = 8; ctx.strokeRect(-200, -56, 400, 112);
    ctx.fillStyle = "rgba(190,40,40,.78)"; ctx.font = "bold 72px Helvetica, Arial"; ctx.textAlign = "center"; ctx.fillText("PAST DUE", 0, 26); ctx.restore();
  } else if (kind === "letter") {
    ctx.fillStyle = "#23262e"; ctx.font = "bold 40px Helvetica, Arial"; ctx.fillText("Estimate", 90, 140);
    for (let r = 0; r < 22; r++) { const y = 220 + r * 44; if (r % 6 === 5) continue; line(90, y, 500 + Math.random() * 340, 9, 0.45); }
  } else {
    ctx.fillStyle = "#23262e"; ctx.font = "bold 34px Helvetica, Arial"; ctx.fillText("Permit Application  —  City of Westbrook", 90, 130);
    for (let r = 0; r < 14; r++) { const y = 200 + r * 72; ctx.strokeStyle = "rgba(40,40,45,.5)"; ctx.lineWidth = 2; ctx.strokeRect(90, y, 844, 50); line(110, y + 18, 120 + Math.random() * 100, 8, 0.4); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

/* Styrofoam bead bump map. */
function foamBump() {
  const [c, ctx] = makeCanvas(1024, 512);
  ctx.fillStyle = "#808080"; ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 26000; i++) {
    const r = 2 + Math.random() * 5; const v = 110 + Math.random() * 60;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, `rgb(${v + 40},${v + 40},${v + 40})`); g.addColorStop(1, `rgb(${v - 30},${v - 30},${v - 30})`);
    ctx.save(); ctx.translate(Math.random() * 1024, Math.random() * 512); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1.5); return t;
}

/* Phone lock screen with the notifications the owner is missing while on a job. */
function screenTexture() {
  const [c, ctx] = makeCanvas(600, 1300);
  const bg = ctx.createLinearGradient(0, 0, 0, 1300); bg.addColorStop(0, "#1a2240"); bg.addColorStop(1, "#06080f");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 600, 1300);
  ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.font = "500 44px -apple-system, Helvetica, Arial"; ctx.fillText("Thursday, March 14", 300, 180);
  ctx.font = "200 190px -apple-system, Helvetica, Arial"; ctx.fillText("9:14", 300, 360);
  const card = (y: number, app: string, color: string, title: string, body: string, when: string) => {
    ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.beginPath(); ctx.roundRect(30, y, 540, 150, 28); ctx.fill();
    ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(54, y + 28, 64, 64, 16); ctx.fill();
    ctx.textAlign = "left"; ctx.fillStyle = "#fff"; ctx.font = "600 30px -apple-system, Helvetica, Arial"; ctx.fillText(title, 140, y + 60);
    ctx.font = "400 27px -apple-system, Helvetica, Arial"; ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillText(body, 140, y + 104);
    ctx.textAlign = "right"; ctx.font = "400 24px -apple-system, Helvetica, Arial"; ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillText(when, 548, y + 56);
    ctx.textAlign = "left"; ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.font = "600 22px -apple-system, Helvetica, Arial"; ctx.fillText(app.toUpperCase(), 140, y + 32);
  };
  card(520, "Phone", "#34c759", "Missed Call", "Maria R.  (2)", "2:14 PM");
  card(700, "Messages", "#34c759", "Tom B.", "Can you quote the AC this week?", "2:41 PM");
  card(880, "Mail", "#3b82f6", "Westbrook Permits", "Action required: permit 4471", "11:05 AM");
  card(1060, "Phone", "#34c759", "Missed Call", "Unknown  (555) 014-2290", "9:40 AM");
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function steamSprite() {
  const [c, ctx] = makeCanvas(128, 128);
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,250,243,.9)"); g.addColorStop(0.4, "rgba(255,250,243,.35)"); g.addColorStop(1, "rgba(255,250,243,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/* ---------- objects ---------- */

const SHEETS = 115;

function PaperStack() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const T = 0.011; // sheet thickness
  const data = useMemo(() => {
    const m = new THREE.Matrix4(); const q = new THREE.Quaternion(); const p = new THREE.Vector3(); const sc = new THREE.Vector3();
    const mats: THREE.Matrix4[] = []; const cols: THREE.Color[] = [];
    let dx = 0, dz = 0, ry = 0; // random walk so the pile leans and shifts in clumps
    for (let i = 0; i < SHEETS; i++) {
      if (Math.random() < 0.12) { dx += (Math.random() - 0.5) * 0.08; dz += (Math.random() - 0.5) * 0.08; ry += (Math.random() - 0.5) * 0.12; }
      const jitterX = (Math.random() - 0.5) * 0.03, jitterZ = (Math.random() - 0.5) * 0.03, jr = (Math.random() - 0.5) * 0.05;
      let w = 1.7, d = 2.2; let col = new THREE.Color().lerpColors(new THREE.Color("#f6f3ec"), new THREE.Color("#e6d9bd"), Math.pow(1 - i / SHEETS, 1.6) * Math.random());
      const r = Math.random();
      let ox = 0, oz = 0;
      if (r < 0.06) { w = 1.78; d = 2.28; col = new THREE.Color("#d8b98a"); }           // manila envelope
      else if (r < 0.12) { w = 0.62; d = 1.2 + Math.random(); col = new THREE.Color("#f8f8f4"); ox = (Math.random() - 0.5) * 0.9; oz = (Math.random() - 0.5) * 0.6; } // receipt
      else if (r < 0.2) { ox = (Math.random() - 0.5) * 0.45; oz = (Math.random() - 0.5) * 0.3; } // sticking out
      else if (r < 0.23) { col = new THREE.Color("#f1e35a"); w = 0.6; d = 0.6; ox = 0.5; oz = -0.6; } // sticky note
      p.set(dx + jitterX + ox, i * T + T / 2, dz + jitterZ + oz);
      q.setFromEuler(new THREE.Euler(0, ry + jr, 0));
      sc.set(w, T, d);
      mats.push(m.clone().compose(p, q, sc)); cols.push(col);
    }
    return { mats, cols, top: SHEETS * T, dx, dz, ry };
  }, []);

  useEffect(() => {
    const im = ref.current; if (!im) return;
    data.mats.forEach((m, i) => { im.setMatrixAt(i, m); im.setColorAt(i, data.cols[i]); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }, [data]);

  const invoice = useMemo(() => paperTexture("invoice"), []);
  const form = useMemo(() => paperTexture("form"), []);
  const letter = useMemo(() => paperTexture("letter"), []);

  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, SHEETS]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.92} sheen={0.5} sheenRoughness={0.9} sheenColor="#ffffff" />
      </instancedMesh>
      {/* printed top sheet, slightly askew */}
      <mesh position={[data.dx + 0.02, data.top + 0.001, data.dz - 0.01]} rotation={[-Math.PI / 2, 0, data.ry + 0.06]} receiveShadow>
        <planeGeometry args={[1.7, 2.2]} />
        <meshPhysicalMaterial map={invoice} roughness={0.9} sheen={0.4} sheenRoughness={0.9} />
      </mesh>
      {/* a form sheet that slid half-off the pile */}
      <mesh position={[data.dx + 0.55, data.top * 0.62, data.dz + 0.35]} rotation={[-Math.PI / 2, 0, data.ry - 0.35]} castShadow receiveShadow>
        <planeGeometry args={[1.7, 2.2]} />
        <meshPhysicalMaterial map={form} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* an estimate leaning against the pile on the desk */}
      <mesh position={[data.dx - 1.05, 0.002, data.dz + 0.9]} rotation={[-Math.PI / 2, 0, 0.5]} receiveShadow>
        <planeGeometry args={[1.7, 2.2]} />
        <meshPhysicalMaterial map={letter} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Steam({ count = 34 }: { count?: number }) {
  const tex = useMemo(() => steamSprite(), []);
  const refs = useRef<THREE.Sprite[]>([]);
  const seeds = useMemo(() => Array.from({ length: count }, () => ({ t: Math.random(), speed: 0.35 + Math.random() * 0.3, drift: (Math.random() - 0.5) * 0.25, phase: Math.random() * 10, size: 0.1 + Math.random() * 0.1 })), [count]);
  useFrame((_, dt) => {
    refs.current.forEach((sp, i) => {
      if (!sp) return; const s = seeds[i];
      s.t += dt * s.speed * 0.5; if (s.t > 1) s.t = 0;
      const k = s.t;
      sp.position.set(Math.sin(s.phase + k * 6) * 0.07 + s.drift * k, k * 1.1, Math.cos(s.phase + k * 5) * 0.05);
      const sc = s.size * (1 + k * 2.8); sp.scale.set(sc, sc, 1);
      (sp.material as THREE.SpriteMaterial).opacity = Math.sin(k * Math.PI) * 0.085 * (1 - k * 0.5);
    });
  });
  return (
    <group>
      {seeds.map((_, i) => (
        <sprite key={i} ref={(el) => { if (el) refs.current[i] = el; }}>
          <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0} />
        </sprite>
      ))}
    </group>
  );
}

function Cup() {
  const bump = useMemo(() => foamBump(), []);
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0, 0.0));
    pts.push(new THREE.Vector2(0.26, 0.0));
    pts.push(new THREE.Vector2(0.275, 0.02));
    pts.push(new THREE.Vector2(0.27, 0.05));   // base ridge
    for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push(new THREE.Vector2(0.27 + k * 0.1, 0.05 + k * 0.86)); }
    pts.push(new THREE.Vector2(0.385, 0.93));
    pts.push(new THREE.Vector2(0.4, 0.955));   // rolled lip
    pts.push(new THREE.Vector2(0.385, 0.98));
    pts.push(new THREE.Vector2(0.355, 0.97));
    pts.push(new THREE.Vector2(0.345, 0.93));
    for (let i = 10; i >= 0; i--) { const k = i / 10; pts.push(new THREE.Vector2(0.245 + k * 0.1, 0.06 + k * 0.85)); }
    pts.push(new THREE.Vector2(0, 0.06));
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f7f5f0" roughness={0.95} bumpMap={bump} bumpScale={0.0045} sheen={0.6} sheenRoughness={1} sheenColor="#ffffff" transmission={0} thickness={0.02} side={THREE.DoubleSide} />
      </mesh>
      {/* coffee surface */}
      <mesh position={[0, 0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 64]} />
        <meshPhysicalMaterial color="#1d0f07" roughness={0.08} metalness={0} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <group position={[0, 0.9, 0]}><Steam /></group>
    </group>
  );
}

function Phone() {
  const screen = useMemo(() => screenTexture(), []);
  return (
    <group>
      <RoundedBox args={[0.74, 1.55, 0.076]} radius={0.09} smoothness={8} castShadow receiveShadow>
        <meshPhysicalMaterial color="#2b2d31" roughness={0.3} metalness={0.75} clearcoat={0.6} clearcoatRoughness={0.25} />
      </RoundedBox>
      {/* glass + screen */}
      <mesh position={[0, 0, 0.0385]}>
        <planeGeometry args={[0.69, 1.5]} />
        <meshPhysicalMaterial map={screen} emissiveMap={screen} emissive="#ffffff" emissiveIntensity={0.9} roughness={0.06} clearcoat={1} clearcoatRoughness={0.02} />
      </mesh>
      <mesh position={[0, 0, 0.0392]}>
        <planeGeometry args={[0.735, 1.545]} />
        <meshPhysicalMaterial color="#000" roughness={0.05} clearcoat={1} transparent opacity={0.0} />
      </mesh>
      {/* soft glow on the desk from the screen */}
      <pointLight position={[0, 0, 0.2]} intensity={0.6} color="#9fb4ff" distance={1.6} decay={2} />
    </group>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!ref.current) return;
    const tx = state.pointer.x * 0.16, ty = -state.pointer.y * 0.06;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, tx, 2.5, dt);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, ty, 2.5, dt);
  });
  return <group ref={ref}>{children}</group>;
}

function Look() {
  const { camera, size } = useThree();
  useEffect(() => {
    // wide canvases (phones, where the stage is short) need the camera further back to keep the pile in frame
    const aspect = size.width / size.height;
    const z = aspect > 1.15 ? 6.7 + (aspect - 1.15) * 2.2 : 6.7;
    camera.position.set(0.6 * (z / 6.7), 4.0 * (z / 6.7), z);
    camera.lookAt(0.1, 0.35, -0.15);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0.6, 4.0, 6.7], fov: 28, near: 0.1, far: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }}
      shadows
      style={{ position: "absolute", inset: 0 }}
    >
      <Look />
      <Suspense fallback={null}>
        <Environment resolution={512} frames={1} environmentIntensity={0.7}>
          {/* a dim room: one warm window off to the left, a weak ceiling panel, cool spill from a monitor to the right */}
          <Lightformer form="rect" intensity={3.5} color="#ffe2bd" position={[-6, 3.5, 2]} rotation={[0, Math.PI / 2.4, 0]} scale={[5, 3.2, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#fff6ea" position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[3, 3, 1]} />
          <Lightformer form="rect" intensity={1.5} color="#7f93ff" position={[6, 2, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 2, 1]} />
          <Lightformer form="rect" intensity={0.5} color="#ffd9b8" position={[0, 1, 7]} scale={[8, 2, 1]} />
        </Environment>
        <spotLight position={[-3.5, 6, 3]} angle={0.5} penumbra={1} intensity={45} color="#ffe6c8" castShadow shadow-bias={-0.0002} shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[4, 3, -3]} intensity={0.6} color="#8fa4ff" />
        <Rig>
          {/* desk */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
            <planeGeometry args={[16, 16]} />
            <meshPhysicalMaterial color="#121319" roughness={0.75} clearcoat={0.08} clearcoatRoughness={0.6} />
          </mesh>
          <AccumulativeShadows temporal frames={80} alphaTest={0.85} opacity={0.9} scale={10} color="#000" colorBlend={0.6}>
            <RandomizedLight amount={8} radius={5} ambient={0.5} intensity={1.2} position={[-3.5, 6, 3]} bias={0.001} />
          </AccumulativeShadows>
          <group position={[-0.95, 0, -0.25]} rotation={[0, 0.25, 0]}><PaperStack /></group>
          <group position={[0.5, 0, 0.9]}><Cup /></group>
          <group position={[1.7, 0.04, -0.1]} rotation={[-Math.PI / 2, 0, -0.45]}><Phone /></group>
        </Rig>
        <EffectComposer multisampling={4}>
          <DepthOfField target={[0.2, 0.5, 0.2]} focalLength={0.05} bokehScale={1.6} />
          <Bloom intensity={0.35} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur />
          <Noise opacity={0.07} />
          <Vignette eskil={false} offset={0.25} darkness={0.45} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
