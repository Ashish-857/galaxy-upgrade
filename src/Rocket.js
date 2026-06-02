import React, { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { PLANET_DATA } from './PlanetData'
import { ISS } from './Spacecrafts'

const CloudsMaterial = () => {
  const texture = useTexture('/textures/earth_clouds.jpg')
  return (
    <meshStandardMaterial 
      map={texture} 
      transparent={true} 
      opacity={0.5} 
      blending={THREE.AdditiveBlending}
      depthWrite={false}
    />
  )
}

const SunMaterial = () => {
  const texture = useTexture('/textures/sun.jpg')
  return (
    <meshStandardMaterial 
      map={texture}
      emissiveMap={texture}
      emissive="#ffffff" 
      emissiveIntensity={1.5} 
      toneMapped={false}
    />
  )
}

const PlanetMaterial = ({ planet }) => {
  const texture = useTexture(planet.textureMap)
  return (
    <meshStandardMaterial 
      map={texture}
      roughness={planet.roughness !== undefined ? planet.roughness : 0.6}
      metalness={planet.metalness !== undefined ? planet.metalness : 0.1}
    />
  )
}


const Planet = ({ focusedPlanetIndex, setFocusedPlanetIndex, isPaused }) => {
  const { size } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  const planetRefs = useRef(Array(8).fill().map(() => React.createRef()))
  const timeRef = useRef(0)

  const isAnimatingRef = useRef(false)
  const prevFocusedRef = useRef(focusedPlanetIndex)
  const introAnimatingRef = useRef(true)
  const hasSetStartPos = useRef(false)
  const moonRef = useRef()
  const cloudsRef = useRef()

  useFrame((state, delta) => {
    // Accumulate time gracefully: slow down to very slow speed if paused, and general speed is now 5x slower
    timeRef.current += isPaused ? delta * 0.002 : delta * 0.15;

    if (prevFocusedRef.current !== focusedPlanetIndex) {
      isAnimatingRef.current = true;
      prevFocusedRef.current = focusedPlanetIndex;
    }

    PLANET_DATA.forEach((planet, index) => {
      if (planetRefs.current[index] && planetRefs.current[index].current) {
        const orbitRadius = planet.baseOrbitRadius * scaleFactor
        const offset = index * (Math.PI / 4) 
        const t = -((timeRef.current * planet.speed) + offset)
        planetRefs.current[index].current.position.x = Math.cos(t) * orbitRadius
        planetRefs.current[index].current.position.z = Math.sin(t) * orbitRadius
        
        // Realistic planet self-rotation: Very slow and majestic
        const rotationSpeed = planet.type === 'gas' ? (planet.name === 'Jupiter' ? 0.3 : 0.2) : 0.05;
        planetRefs.current[index].current.rotation.y += delta * rotationSpeed * (isPaused ? 0.02 : 1);
      }
    })

    // Update Earth's Moon
    if (moonRef.current && planetRefs.current[2] && planetRefs.current[2].current) {
      const moonT = -(timeRef.current * 1.5); // Moon orbits fast
      const earthRadius = PLANET_DATA[2].baseRadius * scaleFactor;
      const moonRadius = earthRadius * 4;
      moonRef.current.position.x = planetRefs.current[2].current.position.x + Math.cos(moonT) * moonRadius;
      moonRef.current.position.z = planetRefs.current[2].current.position.z + Math.sin(moonT) * moonRadius;
      moonRef.current.position.y = Math.sin(moonT * 0.5) * (moonRadius * 0.3); // slight inclination
      moonRef.current.rotation.y += delta * 0.5;
    }

    // Update Earth's Clouds
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.9 * (isPaused ? 0.02 : 1);
    }

    if (state.controls) {
      // Cinematic Intro Fly-Through
      if (introAnimatingRef.current && focusedPlanetIndex === null) {
        const startPos = new THREE.Vector3(0, 1000, 2500);
        const endPos = new THREE.Vector3(0, window.innerWidth < 768 ? 60 : 40, window.innerWidth < 768 ? 180 : 120);
        
        if (!hasSetStartPos.current) {
          state.camera.position.copy(startPos);
          hasSetStartPos.current = true;
        }
        
        state.camera.position.lerp(endPos, 0.025); // Faster lerp so it finishes
        state.controls.target.lerp(new THREE.Vector3(0,0,0), 0.05);

        if (state.camera.position.distanceTo(endPos) < 20) {
          introAnimatingRef.current = false;
        }
        return; // Skip normal focus logic during intro
      }
      const target = new THREE.Vector3()
      if (focusedPlanetIndex !== null && planetRefs.current[focusedPlanetIndex] && planetRefs.current[focusedPlanetIndex].current) {
        planetRefs.current[focusedPlanetIndex].current.getWorldPosition(target)
        
        // Auto-zoom to the planet only when animating
        const radius = PLANET_DATA[focusedPlanetIndex].baseRadius * scaleFactor
        const desiredDistance = radius * 8 
        const currentDistance = state.camera.position.distanceTo(target)
        
        if (isAnimatingRef.current) {
          if (Math.abs(currentDistance - desiredDistance) > 5) {
            const direction = state.camera.position.clone().sub(target).normalize()
            if (direction.lengthSq() === 0) direction.set(0, 0, 1)
            const desiredPosition = target.clone().add(direction.multiplyScalar(desiredDistance))
            state.camera.position.lerp(desiredPosition, 0.05)
          } else {
            isAnimatingRef.current = false; // Stop animating, give control back to user
          }
        }
      } else {
        target.set(0, 0, 0)
        
        // Auto-zoom back out to see the whole solar system
        const desiredDistance = window.innerWidth < 768 ? 200 : 160
        const currentDistance = state.camera.position.distanceTo(target)
        
        if (isAnimatingRef.current) {
          if (Math.abs(currentDistance - desiredDistance) > 5) {
            const direction = state.camera.position.clone().sub(target).normalize()
            if (direction.lengthSq() === 0) direction.set(0, 0, 1)
            const desiredPosition = target.clone().add(direction.multiplyScalar(desiredDistance))
            state.camera.position.lerp(desiredPosition, 0.05)
          } else {
            isAnimatingRef.current = false;
          }
        }
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
        onClick={(e) => { e.stopPropagation(); setFocusedPlanetIndex(null); }}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <sphereGeometry args={[25 * scaleFactor, 64, 64]} />
        <React.Suspense fallback={<meshStandardMaterial color="#ffcc00" />}>
          <SunMaterial />
        </React.Suspense>
        
        {/* Photorealistic Soft Sun Glow Corona removed as per user request */}

        <pointLight intensity={4} distance={3000 * scaleFactor} decay={1} />
      </mesh>

      {PLANET_DATA.map((planet, index) => {
        const orbitRadius = planet.baseOrbitRadius * scaleFactor
        const radius = planet.baseRadius * scaleFactor
        
        return (
          <group key={index}>
            {/* Planet Orbit Path */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[orbitRadius - 0.2, orbitRadius + 0.2, 128]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.05} side={THREE.DoubleSide} />
            </mesh>

            {/* Planet */}
            <mesh 
              ref={planetRefs.current[index]}
              onClick={(e) => { e.stopPropagation(); setFocusedPlanetIndex(index); }}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
            >
              <sphereGeometry args={[radius, 64, 64]} />
              
              <React.Suspense fallback={<meshPhysicalMaterial color={planet.color} />}>
                <PlanetMaterial planet={planet} />
              </React.Suspense>

              {/* Atmosphere/Clouds layer for added realism */}
              <mesh ref={planet.name === 'Earth' ? cloudsRef : null}>
                <sphereGeometry args={[radius * 1.05, 64, 64]} />
                {planet.name === 'Earth' ? (
                  <React.Suspense fallback={null}>
                    <CloudsMaterial />
                  </React.Suspense>
                ) : (
                  <meshBasicMaterial 
                    color={planet.color} 
                    transparent={true} 
                    opacity={0.15} 
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                )}
              </mesh>
            </mesh>

            {/* Earth's Moon & ISS */}
            {planet.name === 'Earth' && (
              <>
                <mesh ref={moonRef}>
                  <sphereGeometry args={[radius * 0.25, 32, 32]} />
                  <meshStandardMaterial color="#cccccc" roughness={0.9} metalness={0.1} />
                </mesh>
                <ISS isPaused={isPaused} earthRef={planetRefs.current[index]} />
              </>
            )}

            {/* Rings */}
            {planet.hasRing && (
              <Ring 
                radius={radius * 1.6} 
                tubeRadius={radius * 0.05} 
                colors={planet.ringColors} 
                planetRef={planetRefs.current[index]}
              />
            )}
          </group>
        )
      })}
    </>
  )
}

export default Planet