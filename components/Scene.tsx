"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AccumulativeShadows, Environment, Lightformer, RandomizedLight, RoundedBox } from "@react-three/drei";
import { Bloom, BrightnessContrast, DepthOfField, EffectComposer, HueSaturation, Noise, Vignette } from "@react-three/postprocessing";
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";

/* Scale: 1 unit = 12.7 cm. A letter sheet is 1.7 x 2.2, a 12 oz foam cup is ~0.7 wide, paper is 0.1 mm thick. */

/* ---------- procedural textures ---------- */

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  return [c, c.getContext("2d")!] as const;
}

function agePaper(ctx: CanvasRenderingContext2D, w: number, h: number, amount = 1) {
  for (let i = 0; i < 60 * amount; i++) {
    ctx.fillStyle = `rgba(170,140,95,${Math.random() * 0.06})`;
    ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 40 + Math.random() * 180, 0, Math.PI * 2); ctx.fill();
  }
  // fiber noise
  const img = ctx.getImageData(0, 0, w, h); const d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 9; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  ctx.putImageData(img, 0, 0);
}

function paperTexture(kind: "invoice" | "letter" | "form" | "blank") {
  const [c, ctx] = makeCanvas(1024, 1324);
  ctx.fillStyle = kind === "blank" ? "#efebe2" : "#f2eee5"; ctx.fillRect(0, 0, c.width, c.height);
  agePaper(ctx, 1024, 1324, kind === "blank" ? 1.6 : 1);
  const line = (x: number, y: number, w: number, h = 9, a = 0.55) => { ctx.fillStyle = `rgba(40,40,45,${a})`; ctx.fillRect(x, y, w, h); };
  if (kind === "invoice") {
    ctx.fillStyle = "#23262e"; ctx.font = "bold 54px Helvetica, Arial"; ctx.fillText("INVOICE", 90, 150);
    ctx.font = "26px Helvetica, Arial"; ctx.fillStyle = "#555"; ctx.fillText("No. 2190   ·   Due on receipt", 90, 200);
    line(90, 240, 844, 2, 0.5);
    for (let r = 0; r < 9; r++) { const y = 300 + r * 64; line(90, y, 260 + Math.random() * 200, 10, 0.5); line(700, y, 120, 10, 0.5); line(860, y, 70, 10, 0.6); }
    line(90, 900, 844, 2, 0.5);
    ctx.fillStyle = "#23262e"; ctx.font = "bold 34px Helvetica, Arial"; ctx.fillText("TOTAL DUE", 90, 970); ctx.fillText("$1,850.00", 740, 970);
    ctx.save(); ctx.translate(600, 1150); ctx.rotate(-0.22); ctx.strokeStyle = "rgba(190,40,40,.7)"; ctx.lineWidth = 8; ctx.strokeRect(-200, -56, 400, 112);
    ctx.fillStyle = "rgba(190,40,40,.72)"; ctx.font = "bold 72px Helvetica, Arial"; ctx.textAlign = "center"; ctx.fillText("PAST DUE", 0, 26); ctx.restore();
  } else if (kind === "letter") {
    ctx.fillStyle = "#23262e"; ctx.font = "bold 40px Helvetica, Arial"; ctx.fillText("Estimate", 90, 140);
    for (let r = 0; r < 22; r++) { const y = 220 + r * 44; if (r % 6 === 5) continue; line(90, y, 500 + Math.random() * 340, 9, 0.45); }
    // coffee ring
    ctx.save(); ctx.translate(700, 1050); ctx.strokeStyle = "rgba(96,58,22,.55)"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = "rgba(96,58,22,.25)"; ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(0, 0, 150, 0.4, 2.6); ctx.stroke(); ctx.restore();
  } else if (kind === "form") {
    ctx.fillStyle = "#23262e"; ctx.font = "bold 34px Helvetica, Arial"; ctx.fillText("Permit Application  —  City of Westbrook", 90, 130);
    for (let r = 0; r < 14; r++) { const y = 200 + r * 72; ctx.strokeStyle = "rgba(40,40,45,.5)"; ctx.lineWidth = 2; ctx.strokeRect(90, y, 844, 50); line(110, y + 18, 120 + Math.random() * 100, 8, 0.4); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

function woodTexture() {
  const [c, ctx] = makeCanvas(1024, 1024);
  ctx.fillStyle = "#1c1410"; ctx.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * 1024; const a = 0.05 + Math.random() * 0.12; const w = 1 + Math.random() * 3;
    ctx.strokeStyle = Math.random() < 0.5 ? `rgba(70,46,30,${a})` : `rgba(10,6,4,${a})`; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x <= 1024; x += 64) ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 6 + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }
  const img = ctx.getImageData(0, 0, 1024, 1024); const d = img.data;
  for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - 0.5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); t.anisotropy = 8; return t;
}

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

/* ---------- paper that behaves like paper ---------- */

const T = 0.002;        // loose-stacked sheet pitch (paper plus air)
const SHEETS = 400;     // ~10 cm of accumulated mail, invoices and envelopes
const PILE_H = SHEETS * T;
const DESK = 0.0025;

type Cup = { x: number; z: number; r0: number; r1: number; h: number };
type Support = { hx: number; hz: number };

/*
  Builds one sheet as a dense mesh and bends it the way gravity would:
  - inside the pile footprint it lies flat at its height in the pile
  - past the edge it droops with a cantilever curve until it meets the desk, then lies flat
  - if it reaches the cup it is pushed out to the cup's wall, so it presses against the foam instead of passing through
  - exposed corners curl up slightly, the way old paper does
*/
function drapedSheet(o: {
  cx: number; cz: number; yaw: number; y0: number; w: number; d: number;
  support: Support; k: number; cup?: Cup; curl?: number; approach?: [number, number];
}) {
  const segU = 44, segV = 56;
  const geo = new THREE.PlaneGeometry(o.w, o.d, segU, segV);
  geo.rotateX(-Math.PI / 2); // lie in XZ, +y up; u along x, v along -z
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const cy = Math.cos(o.yaw), sy = Math.sin(o.yaw);
  const hw = o.w / 2, hd = o.d / 2;
  const ax = o.approach?.[0] ?? 1, az = o.approach?.[1] ?? 0;
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i), v = pos.getZ(i);
    let x = o.cx + u * cy - v * sy, z = o.cz + u * sy + v * cy;
    const dx = Math.max(0, Math.abs(x) - o.support.hx), dz = Math.max(0, Math.abs(z) - o.support.hz);
    const dOut = Math.hypot(dx, dz);
    let y = o.y0 - o.k * dOut * dOut;
    if (y < DESK) y = DESK;
    if (o.curl && dOut === 0) {
      const t = Math.max(0, (Math.abs(u) / hw + Math.abs(v) / hd) - 1.35) / 0.65;
      if (u > 0 && v > 0) y += o.curl * t * t;
      if (u < 0 && v < 0) y += o.curl * 0.5 * t * t;
    }
    if (o.cup && y < o.cup.h) {
      const r = o.cup.r0 + (o.cup.r1 - o.cup.r0) * Math.min(1, y / o.cup.h) + 0.004;
      const vx = x - o.cup.x, vz = z - o.cup.z;
      const dist = Math.hypot(vx, vz);
      if (dist < r) {
        let nx = vx + ax * 0.18, nz = vz + az * 0.18; const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
        x = o.cup.x + nx * r; z = o.cup.z + nz * r;
      }
    }
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function toLocal(px: number, pz: number, gx: number, gz: number, yaw: number): [number, number] {
  const dx = px - gx, dz = pz - gz; const c = Math.cos(-yaw), s = Math.sin(-yaw);
  return [dx * c - dz * s, dx * s + dz * c];
}

function PaperPile({ cupLocal }: { cupLocal: Cup }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const support: Support = { hx: 0.8, hz: 1.05 };
  const drapes = useMemo(() => {
    // the loose sheets: index in the pile, overhang and direction. The big one at mid-height reaches the cup.
    const list: Array<{ idx: number; cx: number; cz: number; yaw: number; w: number; d: number; k: number; kind: "blank" | "form" | "invoice"; cup?: boolean; curl?: number; approach?: [number, number] }> = [
      { idx: 330, cx: -0.72, cz: 0.35, yaw: 0.1, w: 1.7, d: 2.2, k: 1.1, kind: "form" },
      { idx: 60, cx: -0.3, cz: 0.45, yaw: -0.05, w: 1.7, d: 2.2, k: 0.8, kind: "blank" },
      { idx: 120, cx: -0.3, cz: 0.42, yaw: 0.08, w: 1.7, d: 2.2, k: 0.8, kind: "blank" },
      { idx: 170, cx: -0.42, cz: -0.35, yaw: -0.12, w: 1.7, d: 2.2, k: 0.85, kind: "blank" },
      { idx: 260, cx: 0.15, cz: 0.55, yaw: 0.2, w: 1.7, d: 2.2, k: 0.8, kind: "blank" },
      { idx: 300, cx: -0.5, cz: 0.1, yaw: 0.05, w: 1.7, d: 2.8, k: 0.75, kind: "blank" },
      { idx: 215, cx: -0.4, cz: -0.3, yaw: -0.2, w: 1.7, d: 2.2, k: 0.85, kind: "blank" },
      { idx: 372, cx: -0.1, cz: 0.3, yaw: 0.1, w: 1.7, d: 2.2, k: 0.8, kind: "blank", curl: 0.05 },
      { idx: SHEETS, cx: 0.03, cz: -0.02, yaw: 0.06, w: 1.7, d: 2.2, k: 0.8, kind: "invoice", curl: 0.07 },
    ];
    return list;
  }, []);
  const skip = useMemo(() => new Set(drapes.map((d) => d.idx)), [drapes]);

  const data = useMemo(() => {
    const m = new THREE.Matrix4(); const q = new THREE.Quaternion(); const p = new THREE.Vector3(); const sc = new THREE.Vector3();
    const mats: THREE.Matrix4[] = []; const cols: THREE.Color[] = [];
    let dx = 0, dz = 0, ry = 0;
    const white = new THREE.Color("#f4f1ea"), old = new THREE.Color("#e2d5b8");
    for (let i = 0; i < SHEETS; i++) {
      if (Math.random() < 0.05) { dx = THREE.MathUtils.clamp(dx + (Math.random() - 0.5) * 0.1, -0.1, 0.1); dz = THREE.MathUtils.clamp(dz + (Math.random() - 0.5) * 0.1, -0.1, 0.1); ry = THREE.MathUtils.clamp(ry + (Math.random() - 0.5) * 0.1, -0.1, 0.1); }
      const jx = (Math.random() - 0.5) * 0.04, jz = (Math.random() - 0.5) * 0.04, jr = (Math.random() - 0.5) * 0.04;
      let w = 1.7, d = 2.2, th = T * 0.55;
      let col = new THREE.Color().lerpColors(white, old, Math.pow(1 - i / SHEETS, 1.4) * Math.random());
      const r = Math.random(); let ox = 0, oz = 0;
      if (skip.has(i)) { w = 0; d = 0; }                                                        // a draped sheet takes this slot
      else if (r < 0.05) { w = 1.8; d = 2.4; th = T * 1.6; col = new THREE.Color("#cfae7a"); }   // manila envelope
      else if (r < 0.14) { w = 1.9; d = 0.83; th = T * 1.4; col = new THREE.Color("#f6f3ec"); ox = (Math.random() - 0.5) * 0.3; oz = (Math.random() - 0.5) * 1.2; } // #10 envelope
      else if (r < 0.19) { w = 0.62; d = 1.0 + Math.random() * 0.8; col = new THREE.Color("#fafaf6"); ox = (Math.random() - 0.5) * 0.9; oz = (Math.random() - 0.5) * 0.8; } // receipt
      else if (r < 0.23) { d = 2.8; oz = 0.3; }                                                 // legal, sticks out the back
      else if (r < 0.3) { ox = (Math.random() - 0.5) * 0.22; oz = (Math.random() - 0.5) * 0.22; }   // small shifts only: a 1 cm overhang doesn't sag
      p.set(dx + jx + ox, i * T + T / 2, dz + jz + oz);
      q.setFromEuler(new THREE.Euler(0, ry + jr, 0));
      sc.set(w, th, d);
      mats.push(m.clone().compose(p, q, sc)); cols.push(col);
    }
    return { mats, cols };
  }, [skip]);

  useEffect(() => {
    const im = ref.current; if (!im) return;
    data.mats.forEach((mm, i) => { im.setMatrixAt(i, mm); im.setColorAt(i, data.cols[i]); });
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
  }, [data]);

  const tex = useMemo(() => ({ blank: paperTexture("blank"), form: paperTexture("form"), invoice: paperTexture("invoice") }), []);
  const geos = useMemo(() => drapes.map((d) => drapedSheet({
    cx: d.cx, cz: d.cz, yaw: d.yaw, y0: d.idx * T + T / 2, w: d.w, d: d.d, support, k: d.k,
    cup: d.cup ? cupLocal : undefined, curl: d.curl, approach: d.approach,
  })), [drapes, cupLocal]);

  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, SHEETS]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial color="#ffffff" map={tex.blank} roughness={0.93} sheen={0.35} sheenRoughness={0.9} sheenColor="#ffffff" />
      </instancedMesh>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} castShadow receiveShadow>
          <meshPhysicalMaterial map={tex[drapes[i].kind]} roughness={0.92} sheen={0.35} sheenRoughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- the rest of the desk ---------- */

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

const CUP = { r0: 0.26, r1: 0.355, h: 0.86 };

function Cup() {
  const bump = useMemo(() => foamBump(), []);
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    pts.push(new THREE.Vector2(0, 0), new THREE.Vector2(CUP.r0 - 0.01, 0), new THREE.Vector2(CUP.r0 + 0.005, 0.02), new THREE.Vector2(CUP.r0, 0.05));
    for (let i = 0; i <= 10; i++) { const k = i / 10; pts.push(new THREE.Vector2(CUP.r0 + k * (CUP.r1 - CUP.r0), 0.05 + k * (CUP.h - 0.12))); }
    pts.push(new THREE.Vector2(CUP.r1 + 0.012, CUP.h - 0.05), new THREE.Vector2(CUP.r1 + 0.02, CUP.h - 0.025), new THREE.Vector2(CUP.r1 + 0.008, CUP.h), new THREE.Vector2(CUP.r1 - 0.02, CUP.h - 0.01), new THREE.Vector2(CUP.r1 - 0.03, CUP.h - 0.05));
    for (let i = 10; i >= 0; i--) { const k = i / 10; pts.push(new THREE.Vector2(CUP.r0 - 0.025 + k * (CUP.r1 - CUP.r0), 0.06 + k * (CUP.h - 0.13))); }
    pts.push(new THREE.Vector2(0, 0.06));
    return new THREE.LatheGeometry(pts, 96);
  }, []);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshPhysicalMaterial color="#f7f5f0" roughness={0.95} bumpMap={bump} bumpScale={0.0045} sheen={0.6} sheenRoughness={1} sheenColor="#ffffff" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, CUP.h - 0.14, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[CUP.r1 - 0.045, 64]} />
        <meshPhysicalMaterial color="#1d0f07" roughness={0.08} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      <group position={[0, CUP.h - 0.08, 0]}><Steam /></group>
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
      <mesh position={[0, 0, 0.0385]}>
        <planeGeometry args={[0.69, 1.5]} />
        <meshPhysicalMaterial map={screen} emissiveMap={screen} emissive="#ffffff" emissiveIntensity={0.9} roughness={0.06} clearcoat={1} clearcoatRoughness={0.02} />
      </mesh>
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
    const aspect = size.width / size.height;
    const z = aspect > 1.15 ? 5.2 + (aspect - 1.15) * 1.8 : 5.2;
    camera.position.set(0.55 * (z / 5.2), 3.0 * (z / 5.2), z);
    camera.lookAt(0.15, 0.25, -0.3);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

class Catch extends Component<{ children: ReactNode }, { err: unknown }> {
  state = { err: null as unknown };
  static getDerivedStateFromError(err: unknown) { return { err }; }
  componentDidCatch(err: unknown) { (window as unknown as { __sceneError?: string }).__sceneError = String((err as Error)?.stack || err); console.error("scene error", err); }
  render() { return this.state.err ? null : this.props.children; }
}

/* world layout */
const PILE = { x: -0.85, z: -0.15, yaw: 0.25 };
const CUP_POS = { x: 1.05, z: -1.25 };

export default function Scene() {
  const wood = useMemo(() => woodTexture(), []);
  const cupLocal = useMemo<Cup>(() => { const [x, z] = toLocal(CUP_POS.x, CUP_POS.z, PILE.x, PILE.z, PILE.yaw); return { x, z, ...CUP }; }, []);
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0.55, 3.0, 5.2], fov: 32, near: 0.1, far: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      shadows="variance"
      style={{ position: "absolute", inset: 0 }}
    >
      <Look />
      <Catch>
      <Suspense fallback={null}>
        <Environment resolution={512} frames={1} environmentIntensity={0.65}>
          <Lightformer form="rect" intensity={3.2} color="#ffe2bd" position={[-6, 3.5, 2]} rotation={[0, Math.PI / 2.4, 0]} scale={[5, 3.2, 1]} />
          <Lightformer form="rect" intensity={1.1} color="#fff6ea" position={[0, 7, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[3, 3, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#7f93ff" position={[6, 2, -1]} rotation={[0, -Math.PI / 2, 0]} scale={[3, 2, 1]} />
          <Lightformer form="rect" intensity={0.5} color="#ffd9b8" position={[0, 1, 7]} scale={[8, 2, 1]} />
        </Environment>
        {/* one big soft window light: VSM gives it a wide, soft penumbra like a real window would */}
        <spotLight position={[-3.5, 5.5, 3]} angle={0.55} penumbra={1} intensity={52} color="#ffdcb8" castShadow
          shadow-mapSize={[2048, 2048]} shadow-radius={7} shadow-blurSamples={16} shadow-bias={-0.0004} shadow-normalBias={0.015} />
        <directionalLight position={[4, 3, -3]} intensity={0.5} color="#8fa4ff" />
        <Rig>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
            <planeGeometry args={[16, 16]} />
            <meshPhysicalMaterial map={wood} roughness={0.62} clearcoat={0.12} clearcoatRoughness={0.45} />
          </mesh>
          <AccumulativeShadows temporal frames={80} alphaTest={0.85} opacity={0.85} scale={10} color="#000" colorBlend={0.6}>
            <RandomizedLight amount={8} radius={5} ambient={0.5} intensity={1.2} position={[-3.5, 5.5, 3]} bias={0.001} />
          </AccumulativeShadows>
          <group position={[PILE.x, 0, PILE.z]} rotation={[0, PILE.yaw, 0]}><PaperPile cupLocal={cupLocal} /></group>
          <group position={[CUP_POS.x, 0, CUP_POS.z]}><Cup /></group>
          <group position={[1.6, 0.04, -0.05]} rotation={[-Math.PI / 2, 0, -0.45]}><Phone /></group>
        </Rig>
        <EffectComposer multisampling={4}>
          <DepthOfField target={[0.1, 0.35, -0.2]} focalLength={0.04} bokehScale={1.3} />
          <Bloom intensity={0.3} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur />
          <HueSaturation saturation={-0.06} />
          <BrightnessContrast brightness={0.03} contrast={0.05} />
          <Noise opacity={0.06} />
          <Vignette eskil={false} offset={0.25} darkness={0.45} />
        </EffectComposer>
      </Suspense>
      </Catch>
    </Canvas>
  );
}
