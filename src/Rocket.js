import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const Planet = () => {
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  const planetRefs = useRef(Array(8).fill().map(() => React.createRef()))
  const [focusedPlanet, setFocusedPlanet] = React.useState(null)

  const planetData = useMemo(() => [
    { name: 'Mercury', radius: 2 * scaleFactor, orbitRadius: 50 * scaleFactor, color: '#a8a8a8', speed: 0.16, type: 'rock', metalness: 0.8, roughness: 0.4, offset: Math.random() * Math.PI * 2 },
    { name: 'Venus', radius: 3 * scaleFactor, orbitRadius: 70 * scaleFactor, color: '#f5c58c', speed: 0.12, type: 'gas', transmission: 0.2, thickness: 1, offset: Math.random() * Math.PI * 2 },
    { name: 'Earth', radius: 5 * scaleFactor, orbitRadius: 90 * scaleFactor, color: '#2b82c9', speed: 0.1, type: 'water', clearcoat: 1, clearcoatRoughness: 0.1, offset: Math.random() * Math.PI * 2 },
    { name: 'Mars', radius: 4 * scaleFactor, orbitRadius: 115 * scaleFactor, color: '#c1440e', speed: 0.08, type: 'rock', metalness: 0.2, roughness: 0.9, offset: Math.random() * Math.PI * 2 },
    { name: 'Jupiter', radius: 14 * scaleFactor, orbitRadius: 170 * scaleFactor, color: '#ffaa56', speed: 0.04, type: 'gas', transmission: 0.1, thickness: 2, offset: Math.random() * Math.PI * 2 },
    { name: 'Saturn', radius: 11 * scaleFactor, orbitRadius: 230 * scaleFactor, color: '#e6b676', speed: 0.016, hasRing: true, ringColors: ['#e6b676', '#f0c384', '#fad192'], type: 'gas', transmission: 0.3, thickness: 3, offset: Math.random() * Math.PI * 2 },
    { name: 'Uranus', radius: 8 * scaleFactor, orbitRadius: 280 * scaleFactor, color: '#67ffaf', speed: 0.010, hasRing: true, ringColors: ['#67ffaf', '#85ffd3'], type: 'gas', transmission: 0.5, thickness: 2, offset: Math.random() * Math.PI * 2 },
    { name: 'Neptune', radius: 7 * scaleFactor, orbitRadius: 320 * scaleFactor, color: '#3b59ff', speed: 0.006, type: 'gas', transmission: 0.5, thickness: 2, offset: Math.random() * Math.PI * 2 },
  ], [scaleFactor])

  useFrame((state) => {
    const clock = state.clock;
    planetRefs.current.forEach((ref, index) => {
      if (ref.current) {
        const t = -((clock.getElapsedTime() * planetData[index].speed) + planetData[index].offset)
        ref.current.position.x = Math.cos(t) * planetData[index].orbitRadius
        ref.current.position.z = Math.sin(t) * planetData[index].orbitRadius
        ref.current.rotation.y = t * 0.5 // self rotation
      }
    })

    if (state.controls) {
      const target = new THREE.Vector3()
      if (focusedPlanet !== null && planetRefs.current[focusedPlanet].current) {
        planetRefs.current[focusedPlanet].current.getWorldPosition(target)
      } else {
        target.set(0, 0, 0)
      }
      state.controls.target.lerp(target, 0.05)
    }
  })

  const Ring = ({ radius, tubeRadius, colors, planetRef }) => {
    const ringRef = useRef()
    
    useFrame(() => {
      if (ringRef.current && planetRef.current) {
        ringRef.current.position.copy(planetRef.current.position)
      }
    })

    return (
      <group ref={ringRef} rotation={[Math.PI / 2.2, Math.PI / 8, 0]}>
        {colors.map((color, index) => (
          <mesh key={index}>
            <torusGeometry args={[radius * (1 + index * 0.15), tubeRadius, 4, 64]} />
            <meshStandardMaterial color={color} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <>
      {/* Hyper-realistic Sun */}
      <mesh
        onClick={(e) => { e.stopPropagation(); setFocusedPlanet(null); }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
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
          {/* Planet Orbit Path */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[planet.orbitRadius - 0.2, planet.orbitRadius + 0.2, 128]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
          </mesh>

          {/* Planet */}
          <mesh 
            ref={planetRefs.current[index]}
            onClick={(e) => { e.stopPropagation(); setFocusedPlanet(index); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <sphereGeometry args={[planet.radius, 64, 64]} />
            
            {/* Procedural Gem/Gas Material for extreme realism without external images */}
            <meshPhysicalMaterial 
              color={planet.color}
              roughness={planet.roughness !== undefined ? planet.roughness : 0.2}
              metalness={planet.metalness !== undefined ? planet.metalness : 0.1}
              transmission={planet.transmission || 0}
              thickness={planet.thickness || 0}
              clearcoat={planet.clearcoat || 0}
              clearcoatRoughness={planet.clearcoatRoughness || 0}
              envMapIntensity={2}
            />

            {/* Atmosphere layer */}
            <mesh>
              <sphereGeometry args={[planet.radius * 1.05, 64, 64]} />
              <meshBasicMaterial 
                color={planet.color} 
                transparent={true} 
                opacity={0.2} 
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            <Html distanceFactor={15}>
              <div style={{
                color: 'white',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: `${Math.max(10, planet.radius * 20)}px`,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 0 10px rgba(255,255,255,0.1)'
              }}>
                {planet.name}
              </div>
            </Html>
          </mesh>

          {/* Rings */}
          {planet.hasRing && (
            <Ring 
              radius={planet.radius * 1.6} 
              tubeRadius={planet.radius * 0.05} 
              colors={planet.ringColors} 
              planetRef={planetRefs.current[index]}
            />
          )}
        </group>
      ))}
    </>
  )
}

export default Planet