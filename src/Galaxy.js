import React, { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Creates a beautiful spiral galaxy
const createSpiralGalaxy = (radius, count, armCount, spin, spread) => {
  return Array.from({ length: count }, () => {
    // Start arms outside the solar system (radius > 400)
    const minR = 400;
    const r = minR + Math.random() * (radius - minR);
    
    const armIndex = Math.floor(Math.random() * armCount);
    const armOffset = (Math.PI * 2) / armCount * armIndex;
    
    // Spin factor creates the spiral curve
    const spinAngle = r * spin / radius;
    
    // Spread increases as we go further out
    const currentSpread = r * spread;
    const randomX = (Math.random() - 0.5) * currentSpread;
    const randomY = (Math.random() - 0.5) * currentSpread * 0.3; // Flat disk shape
    const randomZ = (Math.random() - 0.5) * currentSpread;

    const angle = spinAngle + armOffset;

    const x = Math.cos(angle) * r + randomX;
    const y = randomY;
    const z = Math.sin(angle) * r + randomZ;
    
    return { x, y, z }
  })
}

const Galaxy = ({ isPaused }) => {
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  const galaxyGroupRef = useRef()
  const timeRef = useRef(0)

  const galaxies = useMemo(() => [
    // Inner bright spiral arms starting right outside the solar system
    { particles: createSpiralGalaxy(1500 * scaleFactor, 5000, 4, 2, 0.15), color: '#ffffff', size: 5 * scaleFactor },
    // Majestic Spiral Arms
    { particles: createSpiralGalaxy(2500 * scaleFactor, 8000, 4, 3, 0.2), color: '#3388ff', size: 4 * scaleFactor },
    { particles: createSpiralGalaxy(4000 * scaleFactor, 8000, 4, 3.5, 0.25), color: '#aa33ff', size: 3 * scaleFactor },
    { particles: createSpiralGalaxy(5500 * scaleFactor, 8000, 4, 4, 0.3), color: '#ff3366', size: 4 * scaleFactor },
    // Outer scattered star dust
    { particles: createSpiralGalaxy(7000 * scaleFactor, 5000, 4, 4.5, 0.6), color: '#555555', size: 2 * scaleFactor },
  ], [scaleFactor])

  useFrame((state, delta) => {
    timeRef.current += isPaused ? delta * 0.02 : delta;
    if (galaxyGroupRef.current) {
      // Extremely slow majestic spin of the entire galaxy
      galaxyGroupRef.current.rotation.y = timeRef.current * 0.02
    }
  })

  return (
    <group ref={galaxyGroupRef}>
      {galaxies.map((galaxy, index) => (
        <points key={index}>
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              array={new Float32Array(galaxy.particles.flatMap((p) => [p.x, p.y, p.z]))}
              count={galaxy.particles.length}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={galaxy.size} 
            color={galaxy.color} 
            sizeAttenuation 
            transparent 
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      ))}
    </group>
  )
}

export default Galaxy