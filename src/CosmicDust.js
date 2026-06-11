import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const CosmicDust = ({ count = 2500, isPaused }) => {
  const pointsRef = useRef()
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000
  const timeRef = useRef(0)

  // Generate random particle positions
  const particles = useMemo(() => {
    const tempPositions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Distribute particles in a spherical shell around the solar system
      // Orbit radii range from close to Sun (35) to far beyond Neptune (800)
      const radius = (35 + Math.random() * 750) * scaleFactor
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      tempPositions[i * 3] = x
      tempPositions[i * 3 + 1] = y
      tempPositions[i * 3 + 2] = z
    }
    return tempPositions
  }, [count, scaleFactor])

  useFrame((state, delta) => {
    timeRef.current += isPaused ? delta * 0.02 : delta;
    if (pointsRef.current) {
      // Extremely slow and majestic drift on multiple axes
      pointsRef.current.rotation.y = timeRef.current * 0.008
      pointsRef.current.rotation.x = timeRef.current * 0.005
      pointsRef.current.rotation.z = timeRef.current * 0.003
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8 * scaleFactor}
        color="#ffdca8" // Warm light reflecting solar glow
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default CosmicDust
