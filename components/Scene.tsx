"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, RoundedBox } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const CREAM = "#f4efe6";
const ORANGE = "#ff6b2c";
const SLATE = "#1b2547";

function Paper({ i }: { i: number }) {
  const rot = useMemo(() => (i - 2) * 0.06, [i]);
  return (
    <mesh position={[(i - 2) * 0.03, i * 0.045, (i - 2) * -0.02]} rotation={[0, rot, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 0.028, 2.05]} />
      <meshPhysicalMaterial color={CREAM} roughness={0.85} clearcoat={0.15} clearcoatRoughness={0.6} sheen={0.4} sheenColor={"#ffffff"} />
    </mesh>
  );
}

function Stack() {
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.6}>
      <group position={[-0.25, -0.25, 0]} rotation={[0.35, -0.55, 0.12]}>
        {[0, 1, 2, 3, 4].map((i) => <Paper key={i} i={i} />)}
        {/* an orange "paid" stamp on the top sheet */}
        <mesh position={[0.32, 0.26, -0.45]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <ringGeometry args={[0.2, 0.26, 48]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

function Ring() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.z += dt * 0.25; });
  return (
    <Float speed={1.6} rotationIntensity={0.6} floatIntensity={0.9}>
      <mesh ref={ref} position={[1.55, 0.85, -0.4]} rotation={[0.9, 0.4, 0]} castShadow>
        <torusGeometry args={[0.62, 0.17, 48, 128]} />
        <meshPhysicalMaterial color={ORANGE} roughness={0.28} metalness={0.25} clearcoat={1} clearcoatRoughness={0.2} />
      </mesh>
    </Float>
  );
}

function Slab() {
  return (
    <Float speed={1.1} rotationIntensity={0.4} floatIntensity={0.7}>
      <group position={[1.35, -0.95, 0.4]} rotation={[0.5, -0.4, 0.35]}>
        <RoundedBox args={[0.9, 1.75, 0.08]} radius={0.08} smoothness={6} castShadow>
          <meshPhysicalMaterial color={SLATE} roughness={0.25} metalness={0.7} clearcoat={0.8} clearcoatRoughness={0.15} />
        </RoundedBox>
        {/* screen glow */}
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[0.78, 1.6]} />
          <meshStandardMaterial color={"#0f1733"} emissive={"#4466ff"} emissiveIntensity={0.18} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.5, 0.05]}>
          <planeGeometry args={[0.6, 0.12]} />
          <meshStandardMaterial color={ORANGE} emissive={ORANGE} emissiveIntensity={0.6} />
        </mesh>
        {[0.26, 0.08, -0.1].map((y, i) => (
          <mesh key={i} position={[-0.07, y, 0.05]}>
            <planeGeometry args={[0.46 - i * 0.1, 0.05]} />
            <meshStandardMaterial color={"#8aa0ff"} emissive={"#8aa0ff"} emissiveIntensity={0.25} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Coin() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.6; });
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={1.2}>
      <mesh ref={ref} position={[-1.7, 1.15, -0.6]} rotation={[0.2, 0, 0.4]} castShadow>
        <cylinderGeometry args={[0.32, 0.32, 0.07, 64]} />
        <meshPhysicalMaterial color={"#f0e2c4"} roughness={0.3} metalness={0.85} clearcoat={0.6} envMapIntensity={1.4} />
      </mesh>
    </Float>
  );
}

function Rig({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (!ref.current) return;
    const tx = state.pointer.x * 0.22;
    const ty = -state.pointer.y * 0.16;
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, tx, 3, dt);
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, ty, 3, dt);
  });
  return <group ref={ref}>{children}</group>;
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 6.2], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 5]} intensity={2.4} color={"#fff1e0"} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-6, 2, -4]} intensity={1.1} color={"#6f8cff"} />
      <pointLight position={[2.5, -1, 3]} intensity={6} color={ORANGE} distance={8} decay={2} />
      <Suspense fallback={null}>
        <Rig>
          <Stack />
          <Ring />
          <Slab />
          <Coin />
        </Rig>
        <ContactShadows position={[0, -2.1, 0]} opacity={0.5} scale={12} blur={2.6} far={4} color="#000814" />
        <Environment resolution={256} frames={1}>
          <Lightformer form="rect" intensity={3} color="#fff4e6" position={[0, 4, -4]} scale={[6, 2, 1]} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={1.6} color="#ff8a4c" position={[-5, 1, 2]} rotation={[0, Math.PI / 2, 0]} scale={[4, 3, 1]} />
          <Lightformer form="rect" intensity={1.4} color="#7f9bff" position={[5, 0, 1]} rotation={[0, -Math.PI / 2, 0]} scale={[4, 3, 1]} />
          <Lightformer form="ring" intensity={2} color="#ffffff" position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={2} />
        </Environment>
      </Suspense>
    </Canvas>
  );
}
