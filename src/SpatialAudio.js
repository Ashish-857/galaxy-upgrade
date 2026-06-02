import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

const SpatialAudio = () => {
  const { camera } = useThree();
  const audioCtxRef = useRef(null);
  const sunGainRef = useRef(null);

  useEffect(() => {
    // Only init on first click due to browser autoplay policies
    const initAudio = () => {
      if (audioCtxRef.current) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;

        // Sun Roar (Low frequency oscillator + noise approximation)
        const sunOsc = ctx.createOscillator();
        sunOsc.type = 'triangle';
        sunOsc.frequency.value = 45;
        
        sunGainRef.current = ctx.createGain();
        sunGainRef.current.gain.value = 0;
        
        sunOsc.connect(sunGainRef.current);
        sunGainRef.current.connect(ctx.destination);
        sunOsc.start();
      } catch(e) {
        console.warn("Web Audio API not supported", e);
      }

      document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, []);

  useFrame(() => {
    if (!audioCtxRef.current || !sunGainRef.current) return;
    
    // Sun distance (Sun is at 0,0,0)
    const sunDist = camera.position.distanceTo({x:0, y:0, z:0});
    // Closer = louder. Max volume at dist < 100, silent at dist > 500
    const sunVolume = Math.max(0, 1 - (sunDist / 500));
    
    // Smoothly set volume
    sunGainRef.current.gain.setTargetAtTime(sunVolume * 0.8, audioCtxRef.current.currentTime, 0.1);
  });
  
  return null;
}

export default SpatialAudio;
