import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import Loading from './Loading';
import Galaxy from './Galaxy';
import Rocket from './Rocket';
import RotatingStars from './RotatingStars';
import Universe from './Universe';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef(null);

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
        audioRef.current.play().catch(e => console.error(e));
      }
    };
    
    // Listeners for any kind of interaction
    document.addEventListener('pointerdown', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('pointerdown', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src="/Interstellar-Theme(PagalNew (mp3cut (mp3cut.net).mp3" 
        loop 
      />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Canvas dpr={[1, 1]} camera={{ position: window.innerWidth < 768 ? [0, 60, 180] : [0, 40, 120], far: 100000 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls 
                makeDefault
                enableDamping={true}
                dampingFactor={0.05}
                autoRotate={true}
                autoRotateSpeed={0.5}
                minDistance={1}
                maxDistance={5000}
              />
              <EffectComposer>
                <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
              </EffectComposer>
              <Universe>
                <Galaxy />
                <Rocket />
                <RotatingStars />
              </Universe>
            </Suspense>
          </Canvas>
        </>
      )}
    </div>
  );
}

export default App;
