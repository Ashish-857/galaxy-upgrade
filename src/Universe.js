import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const MilkyWaySkybox = () => {
  const texture = useTexture('/textures/milky_way.jpg')
  return (
    <mesh>
      <sphereGeometry args={[8000, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  )
}

const Universe = ({ children, isPaused }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += isPaused ? delta * 0.0001 : delta * 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <React.Suspense fallback={null}>
        <MilkyWaySkybox />
      </React.Suspense>
      {children}
    </group>
  );
};

export default Universe;