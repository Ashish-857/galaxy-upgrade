import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion } from 'framer-motion';
import Loading from './Loading';
import Galaxy from './Galaxy';
import Rocket from './Rocket';
import RotatingStars from './RotatingStars';
import Universe from './Universe';



function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const [volume] = useState(1); 
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  }, []);

  const startAudio = useCallback(() => {
    const newAudio = new Audio('/Interstellar-Theme(PagalNew (mp3cut (mp3cut.net).mp3');
    newAudio.loop = true;
    newAudio.volume = volume; 

    const playPromise = newAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Audio started successfully");
          setAudioStarted(true);
          setAudio(newAudio);
        })
        .catch(error => {
          console.log("Audio playback failed:", error);
          setAudioStarted(false);
        });
    }

    return () => {
      newAudio.pause();
      newAudio.currentTime = 0;
    };
  }, [volume]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume; 
    }
  }, [volume, audio]);
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Canvas dpr={[1, 1.5]} camera={{ position: window.innerWidth < 768 ? [0, 60, 180] : [0, 40, 120], far: 100000 }}>
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <OrbitControls 
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
                {/* <BlackHole /> */}
                <Rocket />
                <RotatingStars />
              </Universe>
            </Suspense>
          </Canvas>
          {!audioStarted && (
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.5 }}
              onClick={startAudio}
              style={{
                position: 'absolute',
                bottom: '60px',
                left: '50%',
                transform: 'translateX(-50%)',
                padding: '12px 30px',
                fontSize: '14px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '30px',
                cursor: 'pointer',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
              }}
            >
              Start Experience
            </motion.button>
          )}
          {audioStarted && (
            <div 
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                color: 'white'
              }}
            >
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
