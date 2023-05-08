import React, { memo } from 'react';
import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';
//https://threejs.org/docs/#examples/en/controls/ArcballControls

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';
import { Spinner } from 'components/kit';

import blobsURIModel from 'services/models/media/blobsURIModel';
import figures3dExploreService from 'services/api/figures3d/figures3dService';

import {
  decodeBufferPairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import arrayBufferToBase64 from 'utils/arrayBufferToBase64';

import { IFigures3DVisualizerProps } from '../types';

import './Figures3DVisualizer.scss';

function buildScene(
  figure3dBlob: any,
  format: string,
  canvas: HTMLCanvasElement,
) {
  // Create Scene and Rendered:
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  //scene.background = new THREE.Color(0x443333);
  const width = canvas.parentElement?.offsetWidth ?? 0;
  const height = canvas.parentElement?.offsetHeight ?? 0;
  const camera = new THREE.PerspectiveCamera(
    45,
    width / height,
    0.00001,
    100000,
  );

  camera.position.set(-1, 1, 1);
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#geo')!,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.render(scene, camera);

  const loadingManager = new THREE.LoadingManager();

  // Controls:
  const controls = new ArcballControls(camera, renderer.domElement, scene);
  controls.setGizmosVisible(false);
  controls.addEventListener('change', function () {
    renderer.render(scene, camera);
  });

  // Axes
  scene.add(new THREE.AxesHelper(20));

  let loader = Object();
  if (format === 'stl') {
    loader = new STLLoader(loadingManager);
  } else if (format === 'obj') {
    loader = new OBJLoader(loadingManager);
  } else {
    console.log('File Format Not Supported');
  }

  const geometry = loader.parse(atob(figure3dBlob));

  // OBJ Files:
  if (geometry && geometry instanceof THREE.Group) {
    try {
      geometry.traverse(function (obj: any) {
        if (obj instanceof THREE.Mesh) {
          let box = new THREE.Box3().setFromObject(obj);
          const size = box.getSize(new THREE.Vector3());

          obj.scale.set(
            1 / size.length(),
            1 / size.length(),
            1 / size.length(),
          );
          obj.castShadow = true;
          obj.receiveShadow = true;
          obj.material = new THREE.MeshStandardMaterial({ color: 0x606060 });
          obj.material.side = THREE.DoubleSide;

          obj.geometry.center();
          let pivot = new THREE.Group();
          scene.add(pivot);
          pivot.add(obj);
        }
      });
    } catch (ex: any) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  }

  // STL Files:
  if (geometry instanceof THREE.BufferGeometry) {
    let material = new THREE.MeshStandardMaterial({ color: 0x606060 });
    material.side = THREE.DoubleSide;
    const obj = new THREE.Mesh(geometry, material);
    obj.geometry.center();

    let box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());

    obj.scale.set(1 / size.length(), 1 / size.length(), 1 / size.length());
    obj.castShadow = true;
    obj.receiveShadow = true;

    obj.geometry.center();

    scene.add(obj);
  }

  const ambientLight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  // Animate
  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onWindowResize);
}

function getFigures3DBlobsData(uris: string[]) {
  const request = figures3dExploreService.getFigures3DByURIs(uris);
  return {
    abort: request.abort,
    call: () => {
      return request
        .call()
        .then(async (stream) => {
          let bufferPairs = decodeBufferPairs(stream);
          let decodedPairs = decodePathsVals(bufferPairs);
          let objects = iterFoldTree(decodedPairs, 1);
          for await (let [keys, val] of objects) {
            const URI = keys[0];
            blobsURIModel.emit(URI as string, {
              [URI]: arrayBufferToBase64(val as ArrayBuffer) as string,
            });
          }
        })
        .catch((ex: any) => {
          if (ex.name === 'AbortError') {
            // Abort Error
          } else {
            // eslint-disable-next-line no-console
            console.log('Unhandled error: ');
          }
        });
    },
  };
}

function Figures3DVisualizer(
  props: IFigures3DVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading } = props;
  const [loadingScene, setLoadingScene] = React.useState(true);

  React.useEffect(() => {
    let blobURI = data?.originalValue?.blob_uri;
    let requestRef = getFigures3DBlobsData([blobURI]);

    async function fetchData() {
      await requestRef.call();
      build3DScene(
        blobsURIModel.getState()[blobURI],
        data.originalValue.format,
      );
    }
    if (blobURI) {
      fetchData();
    }
    return () => {
      if (requestRef) {
        requestRef.abort();
      }
    };
  }, [data]);

  const canvasRef = React.useRef(null);

  const build3DScene = React.useCallback((figure3dBlob, figure3dBlobFormat) => {
    if (figure3dBlob) {
      setLoadingScene(true);
      let canvas: HTMLCanvasElement | null = document.querySelector('#geo');
      if (!canvas) {
        return;
      }
      buildScene(figure3dBlob, figure3dBlobFormat, canvas);
      setLoadingScene(false);
    }
  }, []);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        className='VisualizationLoader'
        isLoading={!!isLoading}
      >
        <div className='Figures3DVisualizer'>
          {!data?.originalValue?.blob_uri ? (
            <IllustrationBlock size='xLarge' title='No Tracked Figures 3D' />
          ) : (
            <div className='Figures3DVisualizer__recordCnt'>
              {loadingScene && (
                <div className='Figures3DVisualizer__recordCnt__loader'>
                  <Spinner />
                </div>
              )}
              <canvas className='webgl' id='geo' ref={canvasRef}></canvas>
            </div>
          )}
        </div>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

Figures3DVisualizer.displayName = 'Figures3DVisualizer';

export default memo<IFigures3DVisualizerProps>(Figures3DVisualizer);
