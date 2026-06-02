import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const AsteroidBelt = ({ count = 3000, isPaused }) => {
  const meshRef = useRef()
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  // Asteroid belt is between Mars (baseOrbitRadius: 115) and Jupiter (baseOrbitRadius: 170).
  const innerRadius = 130 * scaleFactor
  const outerRadius = 155 * scaleFactor

  const dummy = useMemo(() => new THREE.Object3D(), [])
  
  const asteroids = useMemo(() => {
    return new Array(count).fill().map(() => {
      // Random angle and radius for a dense ring
      const angle = Math.random() * Math.PI * 2
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius)
      
      // Vertical variation for a 3D belt
      const y = (Math.random() - 0.5) * 15 * scaleFactor 

      // Random initial rotation
      const rx = Math.random() * Math.PI
      const ry = Math.random() * Math.PI
      const rz = Math.random() * Math.PI

      // Random scale (different sized rocks)
      const scale = (Math.random() * 0.6 + 0.1) * scaleFactor

      // Random orbit speed (inner asteroids orbit slightly faster)
      const speed = (0.02 + Math.random() * 0.01) * (150 / radius)

      return { y, rx, ry, rz, scale, speed, angle, radius }
    })
  }, [count, innerRadius, outerRadius, scaleFactor])

  const timeRef = useRef(0)

  useFrame((state, delta) => {
    timeRef.current += isPaused ? delta * 0.02 : delta;

    asteroids.forEach((asteroid, i) => {
      // Calculate current position based on orbit speed and time
      const t = -(timeRef.current * asteroid.speed) + asteroid.angle
      
      dummy.position.x = Math.cos(t) * asteroid.radius
      dummy.position.y = asteroid.y
      dummy.position.z = Math.sin(t) * asteroid.radius

      // Spin the asteroid itself to look like tumbling rocks
      dummy.rotation.x = asteroid.rx + t * 2
      dummy.rotation.y = asteroid.ry + t * 2
      dummy.rotation.z = asteroid.rz + t * 2

      // Set irregular asteroid scale
      dummy.scale.set(asteroid.scale, asteroid.scale * 0.8, asteroid.scale * 1.2)
      
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      {/* A dodecahedron looks like a perfect jagged asteroid rock! */}
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#666666" roughness={0.9} metalness={0.2} />
    </instancedMesh>
  )
}

export default AsteroidBelt
