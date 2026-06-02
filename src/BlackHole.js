import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Ring } from '@react-three/drei'
import * as THREE from 'three'

function BlackHole() {
  const ringsRef = useRef([])

  const ringCount = 100
  const maxRingRadius = 400

  useFrame((state, delta) => {
    ringsRef.current.forEach((ring, index) => {
      ring.scale.setScalar(1 - Math.sin(state.clock.elapsedTime * 0.5 + index * 0.2) * 0.1)
      ring.position.y = Math.sin(state.clock.elapsedTime * 0.5 + index * 0.2) * 0.2
      ring.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.5 + index * 0.2) * 0.3
    })
  })

  return (
    <group>
      <Sphere  args={[0, 0, 0]}>
        
      </Sphere>
      {Array.from({ length: ringCount }).map((_, index) => (
        <Ring
          key={index}
          ref={(el) => (ringsRef.current[index] = el)}
          args={[
            30 + (index / ringCount) * maxRingRadius,
            30 + (index / ringCount) * maxRingRadius + 0.8,
            69
          ]}
        >
          
          {/* <meshBasicMaterial color="yellow" side={THREE.DoubleSide} transparent opacity={0.6 - index * 0.02} /> */}
        </Ring>
        
      ))}
    </group>
  )
}

export default BlackHole