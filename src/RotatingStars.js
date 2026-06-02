import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

const RotatingStars = ({ countOverride, fade = false }) => {
  const starsRef = useRef()
  const { size } = useThree()

  const isMobile = size.width < 768
  const isLowPerfDevice = typeof window !== 'undefined' && window.navigator.hardwareConcurrency < 4

  const {
    starCount,
    starRadius,
    starDepth,
    starFactor,
    rotationSpeed,
    starSpeed
  } = useMemo(() => ({
    starCount: countOverride || (isMobile || isLowPerfDevice ? 5000 : 20000),
    starRadius: isMobile ? 100 : 300,
    starDepth: isMobile ? 20 : 30,
    starFactor: isMobile ? 3 : 4,
    rotationSpeed: isMobile ? 0.06 : 0.08,
    starSpeed: isMobile ? 3 : 5
  }), [isMobile, isLowPerfDevice, countOverride])

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime()
    if (starsRef.current) {
      starsRef.current.rotation.x = elapsed * rotationSpeed
      starsRef.current.rotation.y = elapsed * (rotationSpeed * 1.5)
    }
  })

  return (
    <Stars
      ref={starsRef}
      radius={starRadius}
      depth={starDepth}
      count={starCount}
      factor={starFactor}
      saturation={80}
      fade={fade}
      speed={starSpeed}
    />
  )
}

export default RotatingStars
