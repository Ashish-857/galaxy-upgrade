import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const Comet = ({ isPaused }) => {
  const cometRef = useRef()
  const tailRef = useRef()
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  const timeRef = useRef(0)

  useFrame((state, delta) => {
    timeRef.current += isPaused ? delta * 0.02 : delta;

    if (cometRef.current) {
      // Highly elliptical orbit
      const t = timeRef.current * 0.4;
      const a = 400 * scaleFactor; // semi-major axis
      const b = 60 * scaleFactor;  // semi-minor axis
      
      const x = Math.cos(t) * a;
      const z = Math.sin(t) * b;
      
      // Incline the orbit
      const y = Math.sin(t) * 120 * scaleFactor;

      cometRef.current.position.set(x, y, z);

      // Tail always points away from the Sun (0,0,0)
      const directionFromSun = new THREE.Vector3().copy(cometRef.current.position).normalize();
      
      // lookAt expects a point in space to look at. We want the comet "nose" to point towards the sun
      // so the tail (which is built along negative Z) points away from the sun.
      // Wait, if it looks AT the sun, negative Z points AWAY from the sun. Yes!
      const targetPos = cometRef.current.position.clone().sub(directionFromSun);
      cometRef.current.lookAt(targetPos);
      
      // The closer to the sun, the bigger and brighter the tail
      const distanceToSun = cometRef.current.position.length();
      const tailScale = Math.max(0.2, (100 * scaleFactor) / distanceToSun);
      
      if (tailRef.current) {
        tailRef.current.scale.set(1, 1, tailScale * 3); // stretch tail along Z
        
        // Increase opacity when closer to sun
        const opacity = Math.min(0.8, tailScale * 0.5);
        tailRef.current.children[0].material.opacity = opacity * 0.3;
        tailRef.current.children[1].material.opacity = opacity * 0.6;
      }
    }
  })

  return (
    <group ref={cometRef}>
      {/* Comet Core (Nucleus) */}
      <mesh>
        <dodecahedronGeometry args={[1.5 * scaleFactor, 1]} />
        <meshStandardMaterial color="#88ccff" emissive="#2288ff" emissiveIntensity={2} roughness={0.8} />
      </mesh>

      {/* Glowing Tail */}
      <group ref={tailRef}>
        <mesh position={[0, 0, -15 * scaleFactor]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[4 * scaleFactor, 30 * scaleFactor, 32]} />
          <meshBasicMaterial color="#aaddff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, -10 * scaleFactor]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[2 * scaleFactor, 20 * scaleFactor, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
    </group>
  )
}

export default Comet
