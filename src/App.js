import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Loading from './Loading';
import Galaxy from './Galaxy';
import Rocket from './Rocket';
import RotatingStars from './RotatingStars';
import Universe from './Universe';
import AsteroidBelt from './AsteroidBelt';
import { Voyager } from './Spacecrafts';
import SpatialAudio from './SpatialAudio';

import { PLANET_DATA } from './PlanetData';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [focusedPlanetIndex, setFocusedPlanetIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  // Attempt to play audio as soon as loading is done
  useEffect(() => {
    if (!isLoading && audioRef.current) {
      audioRef.current.volume = 1;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Browser blocked autoplay. Waiting for user interaction.");
        });
      }
    }
  }, [isLoading]);

  // Fallback: Start audio on the very first click anywhere on the page
  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          // Play successful, remove listeners
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
          document.removeEventListener('touchend', handleInteraction);
        }).catch(e => console.error(e));
      } else if (audioRef.current && !audioRef.current.paused) {
        // Already playing
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('touchend', handleInteraction);
      }
    };
    
    // Use robust mobile touch events instead of pointerdown
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('touchend', handleInteraction);

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('touchend', handleInteraction);
    };
  }, []);

  const isPaused = focusedPlanetIndex !== null;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif' }}>
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src="/Interstellar-Theme(PagalNew (mp3cut (mp3cut.net).mp3" 
        loop 
      />

      {/* 3D Canvas Context */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        {isLoading ? (
          <Loading />
        ) : (
        <Canvas dpr={[1, 1]} camera={{ position: window.innerWidth < 768 ? [0, 60, 180] : [0, 40, 120], far: 100000 }} shadows>
            <color attach="background" args={['#000000']} />
            <ambientLight intensity={1.5} />
            <SpatialAudio />
            <Suspense fallback={null}>
              <pointLight position={[0, 0, 0]} intensity={2} distance={5000} decay={1} />
              <OrbitControls 
                makeDefault
                enableDamping={true}
                dampingFactor={0.05}
                autoRotate={!isPaused}
                autoRotateSpeed={0.5}
                minDistance={1}
                maxDistance={12000}
              />
              <EffectComposer>
                <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
              </EffectComposer>
              <Universe isPaused={isPaused}>
                <Galaxy isPaused={isPaused} />
                <AsteroidBelt isPaused={isPaused} />
                <Voyager isPaused={isPaused} />
                <Rocket focusedPlanetIndex={focusedPlanetIndex} setFocusedPlanetIndex={setFocusedPlanetIndex} isPaused={isPaused} />
                <RotatingStars isPaused={isPaused} />
              </Universe>
            </Suspense>
          </Canvas>
        )}
      </div>

      {/* 2D HTML UI Overlay */}
      {!isLoading && (
        <>
          {/* Sidebar / Bottom Bar */}
          <div style={{
            position: 'absolute',
            ...(isMobile ? {
              bottom: 0, left: 0, width: '100%', height: 'auto',
              padding: '15px 10px',
              background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            } : {
              top: 0, left: 0, height: '100%', width: '250px',
              padding: '20px',
              background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            }),
            display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
            zIndex: 10, pointerEvents: 'none'
          }}>
            {!isMobile && (
              <h1 style={{ color: 'white', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '40px', fontSize: '24px', pointerEvents: 'auto' }}>Solar System</h1>
            )}
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'row' : 'column', 
              gap: '15px', 
              pointerEvents: 'auto', 
              paddingRight: isMobile ? '20px' : '0',
              overflowX: isMobile ? 'auto' : 'visible',
              maxWidth: '100vw',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: isMobile ? '10px' : '0'
            }}>
              <button 
                onClick={() => setFocusedPlanetIndex(null)}
                style={{
                  background: focusedPlanetIndex === null ? 'rgba(255,255,255,0.2)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.4)',
                  color: 'white', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer',
                  textAlign: 'left', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px',
                  whiteSpace: 'nowrap', transition: 'all 0.3s ease'
                }}
              >
                The Sun
              </button>
              {PLANET_DATA.map((planet, index) => (
                <button
                  key={index}
                  onClick={() => setFocusedPlanetIndex(index)}
                  style={{
                    background: focusedPlanetIndex === index ? 'rgba(255,255,255,0.2)' : 'transparent',
                    border: focusedPlanetIndex === index ? '1px solid white' : '1px solid transparent',
                    color: 'white', padding: '12px 15px', borderRadius: '8px', cursor: 'pointer',
                    textAlign: 'left', textTransform: 'uppercase', letterSpacing: '1px',
                    display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: planet.color, boxShadow: `0 0 8px ${planet.color}`, flexShrink: 0 }} />
                  {planet.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Info Panel / Top Panel on Mobile */}
          <div style={{
            position: 'absolute',
            ...(isMobile ? {
              top: focusedPlanetIndex !== null ? '20px' : '-400px',
              left: '50%', transform: 'translateX(-50%)',
              width: '90%', right: 'auto',
              transition: 'top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            } : {
              top: '50%', right: focusedPlanetIndex !== null ? '40px' : '-400px',
              transform: 'translateY(-50%)', width: '320px', left: 'auto',
              transition: 'right 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }),
            background: 'rgba(10, 15, 30, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '30px', boxSizing: 'border-box',
            zIndex: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {focusedPlanetIndex !== null && (
              <>
                <h2 style={{ color: PLANET_DATA[focusedPlanetIndex].color, textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 10px 0', fontSize: isMobile ? '24px' : '32px' }}>
                  {PLANET_DATA[focusedPlanetIndex].name}
                </h2>
                <div style={{ width: '100%', height: '2px', background: `linear-gradient(90deg, ${PLANET_DATA[focusedPlanetIndex].color}, transparent)`, marginBottom: isMobile ? '15px' : '20px' }} />
                <p style={{ color: '#cccccc', lineHeight: '1.6', fontSize: isMobile ? '13px' : '15px', marginBottom: isMobile ? '15px' : '20px', display: isMobile ? '-webkit-box' : 'block', WebkitLineClamp: isMobile ? 3 : 'none', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {PLANET_DATA[focusedPlanetIndex].info}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: isMobile ? '13px' : '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                    <span style={{ color: '#888' }}>Type</span>
                    <span style={{ color: 'white', textTransform: 'capitalize' }}>{PLANET_DATA[focusedPlanetIndex].type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '5px' }}>
                    <span style={{ color: '#888' }}>Orbit Radius</span>
                    <span style={{ color: 'white' }}>{PLANET_DATA[focusedPlanetIndex].baseOrbitRadius} Million km</span>
                  </div>
                </div>
                <button 
                  onClick={() => setFocusedPlanetIndex(null)}
                  style={{
                    marginTop: isMobile ? '20px' : '30px', width: '100%', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.3)', color: 'white',
                    padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    textTransform: 'uppercase', letterSpacing: '1px', fontSize: isMobile ? '12px' : '14px'
                  }}
                >
                  Return to Sun
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
