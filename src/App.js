import './App.css';
import {
  ZapparCamera, ImageTracker, ZapparCanvas, Loader, BrowserCompatibility,
} from '@zappar/zappar-react-three-fiber';
import glb from './assets/brain.glb';
import targetImage from './assets/brain_morph.zpt';
import { useGLTF } from '@react-three/drei';
import { Mesh, Box3, Vector3 } from "three";
import "./App.css";
import React, { Suspense, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

const LoadModal = (props) => {
  const { scene: originalScene } = useGLTF(props.model_path);
  const modelRef = useRef();

  const clonedScene = React.useMemo(() => {
    const clone = originalScene.clone();

    // Calculate the center of the model
    const box = new Box3().setFromObject(clone);
    const center = new Vector3();
    box.getCenter(center);

    // Move the model so that its center is at the origin
    clone.position.sub(center);

    clone.traverse((child) => {
      if (child instanceof Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material = child.material.map((mat) => mat.clone());
        } else {
          child.material = child.material.clone();
        }
      }
    });

    return clone;
  }, [originalScene]);

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.x += delta * 0.5; // Rotate on X-axis
      modelRef.current.rotation.y += delta * 0.5; // Rotate on Y-axis
    }
  });

  return (
    <group ref={modelRef} {...props}>
      <primitive object={clonedScene} />
    </group>
  );
};

function App() {
  return (
    <>
      <BrowserCompatibility />
      <ZapparCanvas>
        <ZapparCamera />
        <Suspense fallback={null}>
          <ImageTracker targetImage={targetImage}>
            <React.Suspense fallback={null}>
              <LoadModal
                model_path={glb}
                scale={0.01}
                position={[0 , 0, -2]}
              />
            </React.Suspense>
          </ImageTracker>
        </Suspense>
        <directionalLight position={[2.5, 8, 5]} intensity={5} />
        <Loader />
      </ZapparCanvas>
      <div id="zappar-button" role="button" style={{display:"none"}}>Play Animation</div>
    </>
  );
}

export default App;