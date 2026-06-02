import React, { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'


const createGalaxyParticles = (radius, spread, count) => {
  return Array.from({ length: count }, () => {
    const t = Math.random() * 2 * Math.PI
    const r = radius + Math.random() * spread
    const x = r * Math.cos(t)
    const y = r * Math.sin(t)
    const z = (Math.random() - 0.5) * spread
    return { x, y, z }
  })
}

const Galaxy = () => {
  const { size, } = useThree()
  const scaleFactor = Math.min(size.width, size.height) / 1000

  const galaxyRefs = useRef(Array(14).fill().map(() => React.createRef()))

  const galaxies = useMemo(() => [
    { particles: createGalaxyParticles(0 * scaleFactor, 1 * scaleFactor, 500), color: '#FF0000', size: 3* scaleFactor, speed: 0.5 },
    { particles: createGalaxyParticles(0 * scaleFactor, 2 * scaleFactor, 500), color: '#FF0000', size: 3* scaleFactor, speed: 0.5 },
    { particles: createGalaxyParticles(0 * scaleFactor, 6 * scaleFactor, 500), color: '#FF0000', size: 0.09 * scaleFactor, speed: 0.5 },
    { particles: createGalaxyParticles(0 * scaleFactor, 8 * scaleFactor, 750), color: '#FFA500', size: 0.09 * scaleFactor, speed: 0.4 },
    { particles: createGalaxyParticles(0 * scaleFactor, 15 * scaleFactor, 750), color: '#FFA500', size: 0.09 * scaleFactor, speed: 0.4 },
    { particles: createGalaxyParticles(0 * scaleFactor, 25 * scaleFactor, 1000), color: '#FFA500', size: 0.09 * scaleFactor, speed: 0.3 },
    { particles: createGalaxyParticles(0 * scaleFactor, 30 * scaleFactor, 1000), color: '#FF0000', size: 0.09 * scaleFactor, speed: 0.2 },
    { particles: createGalaxyParticles(0 * scaleFactor, 38 * scaleFactor, 750), color: '#FFA500', size: 0.09 * scaleFactor, speed: 0.4 },
    { particles: createGalaxyParticles(0 * scaleFactor, 48 * scaleFactor, 750), color: '#FFA500', size: 0.09 * scaleFactor, speed: 0.4 },
    { particles: createGalaxyParticles(1000 * scaleFactor, 1000000000000000 * scaleFactor, 1500), color: '#e62020', size: 50 * scaleFactor, speed: 0.2 },
    { particles: createGalaxyParticles(1000 * scaleFactor, 1000000000000000  * scaleFactor, 1500), color: '#ffdb58', size: 50 * scaleFactor, speed: 0.2 },
    { particles: createGalaxyParticles(1000 * scaleFactor, 1000000000000000000  * scaleFactor, 1500), color: '#e62020', size: 500 * scaleFactor, speed: 0.2 },
    { particles: createGalaxyParticles(1000 * scaleFactor, 1000000000000000000  * scaleFactor, 1500), color: '#ffdb58', size: 500 * scaleFactor, speed: 0.2 },
    { particles: createGalaxyParticles(1400 * scaleFactor, 1000 * scaleFactor, 1500), color: '#f0f0f0', size: 0.09 * scaleFactor, speed: 0.4 },
  ], [scaleFactor])

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime()
    galaxyRefs.current.forEach((ref, index) => {
      if (ref.current) {
        const speed = galaxies[index].speed
        ref.current.rotation.y = elapsedTime * speed * (index % 4 ? 1.5 : -1.5)
        ref.current.rotation.x = elapsedTime * (speed / 2) * (index * 4 ? -1.5 : 1.5)
      }
    })
  })

  return (
    <>
      {galaxies.map((galaxy, index) => (
        <points key={index} ref={galaxyRefs.current[index]}>
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              array={new Float32Array(galaxy.particles.flatMap((p) => [p.x, p.y, p.z]))}
              count={galaxy.particles.length}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={galaxy.size} color={galaxy.color} sizeAttenuation transparent opacity={0.8} />
        </points>
      ))}
    </>
  )
}

export default Galaxy