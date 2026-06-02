import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export const ISS = ({ isPaused, earthRef }) => {
  const issRef = useRef()
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  const timeRef = useRef(0)

  useFrame((state, delta) => {
    timeRef.current += isPaused ? delta * 0.02 : delta;

    if (issRef.current && earthRef && earthRef.current) {
      // Orbit around Earth
      const t = timeRef.current * 2.5;
      
      // Earth baseRadius is 3 in PlanetData. ISS orbits very close.
      const orbitRadius = 3 * scaleFactor * 1.8; 
      
      const x = earthRef.current.position.x + Math.cos(t) * orbitRadius;
      const z = earthRef.current.position.z + Math.sin(t) * orbitRadius;
      const y = earthRef.current.position.y + Math.sin(t * 1.5) * orbitRadius * 0.5; // highly inclined orbit

      issRef.current.position.set(x, y, z);
      
      // ISS rotates as it orbits to always face Earth
      issRef.current.lookAt(earthRef.current.position);
    }
  })

  // Procedural ISS Model
  return (
    <group ref={issRef} scale={[0.15 * scaleFactor, 0.15 * scaleFactor, 0.15 * scaleFactor]}>
      {/* Central Tube */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.5, 0.5, 4, 16]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Solar Panels Left */}
      <mesh position={[-1.5, 0, 0]}>
        <boxGeometry args={[2, 0.05, 4]} />
        <meshStandardMaterial color="#223366" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Solar Panels Right */}
      <mesh position={[1.5, 0, 0]}>
        <boxGeometry args={[2, 0.05, 4]} />
        <meshStandardMaterial color="#223366" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Habitation Modules */}
      <mesh position={[0, 0, 1]}>
        <cylinderGeometry args={[0.8, 0.8, 2, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.3} roughness={0.7} />
      </mesh>
    </group>
  )
}

export const Voyager = ({ isPaused }) => {
  const voyagerRef = useRef()
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  const timeRef = useRef(0)

  useFrame((state, delta) => {
    timeRef.current += isPaused ? delta * 0.02 : delta;

    if (voyagerRef.current) {
      // Moving outward slowly from the system
      const t = timeRef.current * 0.05;
      
      // Start far out, move further out
      const distance = 250 * scaleFactor + t * 20 * scaleFactor;
      
      const x = Math.cos(t * 0.1) * distance;
      const z = Math.sin(t * 0.1) * distance;
      const y = Math.sin(t * 0.05) * 50 * scaleFactor;

      voyagerRef.current.position.set(x, y, z);
      
      // Point antenna towards the sun
      voyagerRef.current.lookAt(0, 0, 0);
    }
  })

  // Procedural Voyager Model
  return (
    <group ref={voyagerRef} scale={[0.3 * scaleFactor, 0.3 * scaleFactor, 0.3 * scaleFactor]}>
      {/* Main Bus */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ddccaa" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* High Gain Antenna (Dish) */}
      <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.5, 0.1, 0.5, 32]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.8} />
      </mesh>
      {/* RTG Boom */}
      <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
        <meshStandardMaterial color="#555555" />
      </mesh>
      {/* Magnetometer Boom */}
      <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  )
}
