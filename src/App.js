// // import './App.css';
// // import {
// //   ZapparCamera, ImageTracker, ZapparCanvas, Loader, BrowserCompatibility,
// // } from '@zappar/zappar-react-three-fiber';
// // import glb from './assets/brain.glb';
// // import targetImage from './assets/brain_morph.zpt';
// // import { useGLTF } from '@react-three/drei';
// // import { Mesh, Box3, Vector3 } from "three";
// // import "./App.css";
// // import React, { Suspense, useRef, useEffect, useState } from 'react';
// // import { useFrame } from '@react-three/fiber';
// // import { Pipeline } from "@zappar/zappar";

// // Pipeline.licenseKey = "x6520.zappar.io";
// // const LoadModal = (props) => {

// //   const { scene: originalScene } = useGLTF(props.model_path);
// //   const modelRef = useRef();

// //   const clonedScene = React.useMemo(() => {
// //     const clone = originalScene.clone();

// //     const box = new Box3().setFromObject(clone);
// //     const center = new Vector3();
// //     box.getCenter(center);

// //     clone.position.sub(center);

// //     clone.traverse((child) => {
// //       if (child instanceof Mesh && child.material) {
// //         if (Array.isArray(child.material)) {
// //           child.material = child.material.map((mat) => mat.clone());
// //         } else {
// //           child.material = child.material.clone();
// //         }
// //       }
// //     });

// //     return clone;
// //   }, [originalScene]);

// //   useFrame((state, delta) => {
// //     if (modelRef.current) {
// //       modelRef.current.rotation.x += delta * 0.5;
// //       modelRef.current.rotation.y += delta * 0.5;
// //     }
// //   });

// //   return (
// //     <group ref={modelRef} {...props}>
// //       <primitive object={clonedScene} />
// //     </group>
// //   );
// // };

// // function App() {
// //   const [isTracking, setIsTracking] = useState(false);

// //   return (
// //     <>
// //       <BrowserCompatibility />
// //       <ZapparCanvas>
// //         <ZapparCamera />
// //         <Suspense fallback={null}>
// //           <ImageTracker 
// //             targetImage={targetImage}
// //             onVisible={() => setIsTracking(true)}
// //             onNotVisible={() => setIsTracking(false)}
// //           >
// //             {isTracking && (
// //               <Suspense fallback={null}>
// //                 <LoadModal
// //                   model_path={glb}
// //                   scale={0.01}
// //                   position={[0 , 0, -2]}
// //                 />
// //               </Suspense>
// //             )}
// //           </ImageTracker>
// //         </Suspense>
// //         <directionalLight position={[2.5, 8, 5]} intensity={5} />
// //         <Loader />
// //       </ZapparCanvas>
// //       <div id="zappar-button" role="button" style={{display:"none"}}>Play Animation</div>
// //     </>
// //   );
// // }

// // export default App;


// import React, { useRef, useEffect, useState } from "react";
// import { Hands } from "@mediapipe/hands";
// import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
// import * as cam from "@mediapipe/camera_utils";

// const HandTracking = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [distance, setDistance] = useState(null);

//   useEffect(() => {
//     const hands = new Hands({
//       locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
//     });

//     hands.setOptions({
//       maxNumHands: 1,
//       modelComplexity: 1,
//       minDetectionConfidence: 0.7,
//       minTrackingConfidence: 0.7,
//     });


//     hands.onResults((results) => {
//       console.log(results);

//       drawResults(results);
//       if (results.multiHandLandmarks.length > 0) {
//         calculateDistance(results.multiHandLandmarks[0]);
//       }
//     });

//     if (videoRef.current) {
//       const camera = new cam.Camera(videoRef.current, {
//         onFrame: async () => {
//           await hands.send({ image: videoRef.current });
//         },
//         width: 640,
//         height: 480,
//       });
//       camera.start();
//     }
//   }, []);

//   const drawResults = (results) => {
//     const canvasElement = canvasRef.current;
//     const canvasCtx = canvasElement.getContext("2d");

//     canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
//     if (results.multiHandLandmarks) {
//       for (const landmarks of results.multiHandLandmarks) {
//         drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, { color: "#00FF00", lineWidth: 2 });
//         drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 1 });
//       }
//     }
//   };

//   const calculateDistance = (landmarks) => {
//     const indexTip = landmarks[8];
//     const thumbTip = landmarks[4];

//     const dx = indexTip.x - thumbTip.x;
//     const dy = indexTip.y - thumbTip.y;
//     const dz = indexTip.z - thumbTip.z;

//     const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
//     setDistance(dist.toFixed(4));
//   };

//   return (
//     <div>
//       <h2>Finger Distance: {distance}</h2>
//       <video ref={videoRef} style={{}}></video>
//       <canvas ref={canvasRef} width={640} height={480} style={{ position: "absolute", top: 0, left: 0 }}></canvas>
//     </div>
//   );
// };

// export default HandTracking;
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Hands } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as cam from '@mediapipe/camera_utils';
import { ZapparCamera, ImageTracker, ZapparCanvas, Loader, BrowserCompatibility } from '@zappar/zappar-react-three-fiber';
import { useGLTF } from '@react-three/drei';
import { Mesh, Box3, Vector3 } from 'three';
import { useFrame } from '@react-three/fiber';
import { Pipeline } from '@zappar/zappar';
import glb from './assets/brain.glb';
import targetImage from './assets/brain_morph.zpt';

Pipeline.licenseKey = "x6520.zappar.io";

const LoadModal = ({ model_path, scale, position, distance }) => {
  const { scene: originalScene } = useGLTF(model_path);
  const modelRef = useRef();

  const clonedScene = React.useMemo(() => {
    const clone = originalScene.clone();

    const box = new Box3().setFromObject(clone);
    const center = new Vector3();
    box.getCenter(center);

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

  console.log(distance);

  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.x += delta * 0.5;
      modelRef.current.rotation.y += delta * 0.5;
      modelRef.current.scale.setScalar(scale * (distance > 0.1 ? distance + 1 : 1));
    }
  });

  return (
    <group ref={modelRef} position={position}>
      <primitive object={clonedScene} />
    </group>
  );
};

const HandTracking = ({ onDistanceChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    hands.onResults((results) => {
      drawResults(results);
      if (results.multiHandLandmarks.length > 0) {
        const distance = calculateDistance(results.multiHandLandmarks[0]);
        onDistanceChange(distance);
      }
    });

    if (videoRef.current) {
      const camera = new cam.Camera(videoRef.current, {
        onFrame: async () => {
          await hands.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, [onDistanceChange]);

  const drawResults = (results) => {
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext('2d');

    canvasElement.width = 1280;
    canvasElement.height = 960;

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {

        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          radius: 5,
        });
        drawConnectors(canvasCtx, landmarks, Hands.HAND_CONNECTIONS, {
          color: '#fff',
          lineWidth: 2,
        });

      }
    }
  };

  const calculateDistance = (landmarks) => {
    const indexTip = landmarks[8];
    const thumbTip = landmarks[4];

    const dx = indexTip.x - thumbTip.x;
    const dy = indexTip.y - thumbTip.y;
    const dz = indexTip.z - thumbTip.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: 'none' }}></video>
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      ></canvas>
    </div>
  );
};

function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [distance, setDistance] = useState(1);

  return (
    <>
      <BrowserCompatibility />
      <ZapparCanvas>
        <ZapparCamera />
        <Suspense fallback={null}>
          <ImageTracker
            targetImage={targetImage}
            onVisible={() => setIsTracking(true)}
            onNotVisible={() => setIsTracking(false)}
          >
            {isTracking && (
              <Suspense fallback={null}>
                <LoadModal
                  model_path={glb}
                  scale={0.01}
                  position={[0, 0, -2]}
                  distance={distance}
                />
              </Suspense>
            )}
          </ImageTracker>
        </Suspense>
        <directionalLight position={[2.5, 8, 5]} intensity={5} />
        <Loader />
      </ZapparCanvas>
      <HandTracking onDistanceChange={setDistance} />
      <div id="zappar-button" role="button" style={{ display: 'none' }}>
        Play Animation
      </div>
    </>
  );
}

export default App;