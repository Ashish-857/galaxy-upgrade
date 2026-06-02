import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'

const Planet = () => {
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  const planetRefs = useRef(Array(8).fill().map(() => React.createRef()))
  const ringRefs = useRef(Array(3).fill().map(() => React.createRef()))

  const planetData = [
    { name: 'Mercury', radius: 2 * scaleFactor, orbitRadius: 50 * scaleFactor, color: '#bcbcbc', speed: 0.8 },
    { name: 'Venus', radius: 3 * scaleFactor, orbitRadius: 70 * scaleFactor, color: '#f5c58c', speed: 0.6 },
    { name: 'Earth', radius: 5 * scaleFactor, orbitRadius: 80 * scaleFactor, color: '#5297ff', speed: 0.5 },
    { name: 'Mars', radius: 5.5 * scaleFactor, orbitRadius: 90 * scaleFactor, color: '#ff7b67', speed: 0.4 },
    { name: 'Jupiter', radius: 15 * scaleFactor, orbitRadius: 150 * scaleFactor, color: '#ffaa56', speed: 0.2, hasRing: false },
    { name: 'Saturn', radius: 12 * scaleFactor, orbitRadius: 200 * scaleFactor, color: '#a367ff', speed: 0.080, hasRing: true, ringColors: ['#e6b676', '#f0c384', '#fad192'] },
    { name: 'Uranus', radius: 11 * scaleFactor, orbitRadius: 550 * scaleFactor, color: '#67ffaf', speed: 0.051, hasRing: false },
    { name: 'Neptune', radius: 10 * scaleFactor, orbitRadius: 580 * scaleFactor, color: '#ff67e7', speed: 0.031 },
  ]

  useFrame(({ clock }) => {
    planetRefs.current.forEach((ref, index) => {
      if (ref.current) {
        const t = clock.getElapsedTime() * planetData[index].speed
        ref.current.position.x = Math.cos(t) * planetData[index].orbitRadius
        ref.current.position.y = Math.sin(t) * planetData[index].orbitRadius
        ref.current.rotation.y = t * 0.5
      }
    })

    ringRefs.current.forEach((ref, index) => {
      if (ref.current) {
        const planetIndex = planetData.findIndex(p => p.hasRing)
        ref.current.position.x = planetRefs.current[planetIndex + index].current.position.x
        ref.current.position.y = planetRefs.current[planetIndex + index].current.position.y
      }
    })
  })

  const Ring = ({ radius, tubeRadius, colors }) => (
    <group rotation={[Math.PI / 2, 0, 0]}>
      {colors.map((color, index) => (
        <mesh key={index}>
          <torusGeometry args={[radius * (1 + index * 0.1), tubeRadius, 2, 64]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )

  return (
    <>
      {/* Sun */}
      <mesh>
        <sphereGeometry args={[25 * scaleFactor, 64, 64]} />
        <meshStandardMaterial 
          color="#ffcc00" 
          emissive="#ff8800" 
          emissiveIntensity={2} 
          toneMapped={false}
        />
        <pointLight intensity={2} distance={2000 * scaleFactor} decay={2} />
      </mesh>
      {planetData.map((planet, index) => (
        <group key={index}>
          <mesh ref={planetRefs.current[index]}>
            <sphereGeometry args={[planet.radius, 32, 32]} />
            <meshStandardMaterial color={planet.color} roughness={0.7} metalness={0.3} />
            <Html distanceFactor={15}>
              <div style={{
                color: 'white',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: `${Math.max(8, planet.radius * 30)}px`,
                fontWeight: '500',
                whiteSpace: 'nowrap',
                pointerEvents: 'none'
              }}>
                {planet.name}
              </div>
            </Html>
          </mesh>
          {planet.hasRing && (
            <group ref={ringRefs.current[planetData.filter(p => p.hasRing).findIndex(p => p.name === planet.name)]}>
              <Ring radius={planet.radius * 1.8} tubeRadius={planet.radius * 0.1} colors={planet.ringColors} />
            </group>
          )}
        </group>
      ))}
    </>
  )
}

export default Planet