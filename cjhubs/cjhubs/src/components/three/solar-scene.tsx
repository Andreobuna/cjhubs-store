"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Palette pulled from tailwind.config.ts (solar/brand scales) — three.js
// materials need literal hex values, they can't read the CSS custom
// properties the rest of the app uses.
const GEM_COLOR = "#d4af37";
const GEM_GLOW = "#f5d576";
const RING_COLOR = "#7fa0e0";
const BOX_COLOR = "#0a1533";
const BOX_EDGE = "#d4af37";
const RIBBON_COLOR = "#f5d576";

/** Central glowing gold gem — the "hub" everything orbits. */
function HubCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.15;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.035;
    meshRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.85, 0]} />
      <meshStandardMaterial
        color={GEM_COLOR}
        emissive={GEM_GLOW}
        emissiveIntensity={1.1}
        roughness={0.25}
        metalness={0.55}
      />
    </mesh>
  );
}

function OrbitRing({ radius, tilt, speed, opacity }: { radius: number; tilt: number; speed: number; opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * speed;
  });

  return (
    <group ref={groupRef} rotation={[tilt, 0, 0]}>
      <mesh>
        <torusGeometry args={[radius, 0.008, 8, 96]} />
        <meshBasicMaterial color={RING_COLOR} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

/** A small floating gift box — navy body, gold edges, a gold ribbon cross on top. */
function FloatingGift({ radius, tilt, speed, offset, scale }: {
  radius: number;
  tilt: number;
  speed: number;
  offset: number;
  scale: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  // Reused across renders instead of allocated fresh each time — geometry
  // objects are relatively expensive and this one never actually changes.
  const boxGeo = useMemo(() => new THREE.BoxGeometry(0.34, 0.34, 0.34), []);
  const edgeGeometry = useMemo(() => new THREE.EdgesGeometry(boxGeo), [boxGeo]);
  const ribbonGeoV = useMemo(() => new THREE.BoxGeometry(0.06, 0.36, 0.36), []);
  const ribbonGeoH = useMemo(() => new THREE.BoxGeometry(0.36, 0.36, 0.06), []);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    const angle = state.clock.elapsedTime * speed + offset;
    groupRef.current.position.set(Math.cos(angle) * radius, Math.sin(tilt) * Math.sin(angle) * radius, Math.sin(angle) * radius * Math.cos(tilt));
    // Gentle self-tumble so the gift reads as a floating object, not a
    // rigidly-mounted one.
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 + offset;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 + offset;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} scale={scale}>
        <primitive object={boxGeo} attach="geometry" />
        <meshStandardMaterial color={BOX_COLOR} roughness={0.35} metalness={0.4} />
        <lineSegments>
          <primitive object={edgeGeometry} attach="geometry" />
          <lineBasicMaterial color={BOX_EDGE} transparent opacity={0.85} />
        </lineSegments>
        <mesh>
          <primitive object={ribbonGeoV} attach="geometry" />
          <meshStandardMaterial color={RIBBON_COLOR} roughness={0.3} metalness={0.5} />
        </mesh>
        <mesh>
          <primitive object={ribbonGeoH} attach="geometry" />
          <meshStandardMaterial color={RIBBON_COLOR} roughness={0.3} metalness={0.5} />
        </mesh>
      </mesh>
    </group>
  );
}

function Scene() {
  // Memoized so orbit/gift configs don't reshuffle on every re-render.
  const gifts = useMemo(
    () => [
      { radius: 1.9, tilt: 0.5, speed: 0.22, offset: 0, scale: 1 },
      { radius: 2.3, tilt: -0.35, speed: -0.16, offset: 2.1, scale: 0.8 },
      { radius: 1.6, tilt: 1.1, speed: 0.28, offset: 4.2, scale: 0.65 },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2.2} color={GEM_GLOW} distance={6} decay={2} />
      <directionalLight position={[3, 2, 4]} intensity={0.35} color={"#7fa0e0"} />

      <HubCore />
      <OrbitRing radius={1.5} tilt={0.4} speed={0.12} opacity={0.35} />
      <OrbitRing radius={2.0} tilt={-0.25} speed={-0.08} opacity={0.22} />
      <OrbitRing radius={2.4} tilt={1.0} speed={0.06} opacity={0.15} />

      {gifts.map((gift, i) => (
        <FloatingGift key={i} {...gift} />
      ))}
    </>
  );
}

/**
 * Standalone, self-contained Canvas. Callers are responsible for lazy-loading
 * this (see hero-scene.tsx) — importing it eagerly would pull `three` +
 * `@react-three/fiber` into the initial bundle for every page.
 */
export function SolarScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 4.6], fov: 42 }}
      dpr={[1, 1.75]}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
    >
      <Scene />
    </Canvas>
  );
}
