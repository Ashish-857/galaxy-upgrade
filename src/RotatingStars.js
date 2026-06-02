import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

const RotatingStars = ({ countOverride, fade = false, isPaused }) => {
  const starsRef = useRef()
  const timeRef = useRef(0)
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
    rotationSpeed: isMobile ? 0.01 : 0.015,
    starSpeed: isMobile ? 1 : 2
  }), [isMobile, isLowPerfDevice, countOverride])

  useFrame((state, delta) => {
    timeRef.current += isPaused ? delta * 0.02 : delta;
    if (starsRef.current) {
      starsRef.current.rotation.x = timeRef.current * rotationSpeed
      starsRef.current.rotation.y = timeRef.current * (rotationSpeed * 1.5)
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
