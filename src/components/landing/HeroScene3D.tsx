import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function EnergyOrb({ position, color, speed = 1, distort = 0.4, size = 1 }: {
  position: [number, number, number];
  color: string;
  speed?: number;
  distort?: number;
  size?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15 * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
  });

  return (
    <Float speed={1.5 * speed} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} scale={size}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.8}
          distort={distort}
          speed={2 * speed}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const count = 200;
  const meshRef = useRef<THREE.Points>(null);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#7B2FF2"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function EnergyRing({ radius = 3, color = '#7B2FF2', speed = 1 }: {
  radius?: number; color?: string; speed?: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.x = Math.PI * 0.4 + Math.sin(state.clock.elapsedTime * 0.3 * speed) * 0.1;
    ringRef.current.rotation.z = state.clock.elapsedTime * 0.15 * speed;
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <torusGeometry args={[radius, 0.015, 16, 100]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  );
}

export function HeroScene3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#7B2FF2" />
        <pointLight position={[-5, -3, 3]} intensity={0.5} color="#E91E8C" />
        <pointLight position={[0, 3, -3]} intensity={0.4} color="#00B4D8" />

        {/* Main orbs */}
        <EnergyOrb position={[-3.5, 1.5, -2]} color="#7B2FF2" speed={0.8} distort={0.5} size={0.6} />
        <EnergyOrb position={[3.8, -1, -1]} color="#E91E8C" speed={1.2} distort={0.3} size={0.45} />
        <EnergyOrb position={[0, 2.8, -3]} color="#00B4D8" speed={0.6} distort={0.6} size={0.35} />
        <EnergyOrb position={[-2, -2.5, -1.5]} color="#F7941D" speed={1} distort={0.4} size={0.3} />

        {/* Energy rings */}
        <EnergyRing radius={3.2} color="#7B2FF2" speed={0.5} />
        <EnergyRing radius={2.5} color="#E91E8C" speed={0.8} />
        <EnergyRing radius={4} color="#00B4D8" speed={0.3} />

        {/* Particle field */}
        <ParticleField />
      </Canvas>
    </div>
  );
}
