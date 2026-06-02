import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import './App.css';
import logo from './ashish-high-resolution-logo-white-transparent.png';

const SpinningShape = () => {
  const meshRef = useRef();
  const innerRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current && innerRef.current) {
      const time = clock.getElapsedTime();
      meshRef.current.rotation.x = time * 0.5;
      meshRef.current.rotation.y = time * 0.8;
      
      innerRef.current.rotation.x = -time * 0.4;
      innerRef.current.rotation.y = -time * 0.6;
    }
  });

  return (
    <group>
      {/* Outer Ring */}
      <mesh ref={meshRef}>
        <torusGeometry args={[1.5, 0.05, 16, 100]} />
        <meshStandardMaterial color="#00bfff" emissive="#00bfff" emissiveIntensity={0.8} />
      </mesh>
      {/* Inner Geometry */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ff00ff" wireframe={true} emissive="#ff00ff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

const Loading = () => {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#030303', overflow: 'hidden' }}>
      <Canvas dpr={[1, 1]} camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <SpinningShape />
      </Canvas>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <img src={logo} alt="Logo" style={{ width: '150px', height: 'auto', opacity: 0.9 }} />
        <div style={{
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'sans-serif',
          letterSpacing: '5px',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          Loading Universe...
        </div>
      </div>
    </div>
  );
};

export default Loading;
