import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
const Universe = ({ children }) => {
  const universeRef = useRef()
  const universeStars = React.useMemo(() => {
    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      sizeAttenuation: false
    })

    const starVertices = []
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 20000
      const y = (Math.random() - 0.5) * 20000
      const z = (Math.random() - 0.5) * 20000
      starVertices.push(x, y, z)
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3))
    return new THREE.Points(starGeometry, starMaterial)
  }, [])

  useFrame(() => {
    if (universeRef.current) {
      universeRef.current.rotation.y += 0.0005
    }
  })
  return (
    <group ref={universeRef}>
      <primitive object={universeStars} />
      {children}
    </group>
  )
}
export default Universe