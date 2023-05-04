import React, { memo } from 'react';
import _ from 'lodash-es';
import * as THREE from 'three';

import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { ArcballControls } from 'three/examples/jsm/controls/ArcballControls.js';
//https://threejs.org/docs/#examples/en/controls/ArcballControls

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import IllustrationBlock from 'components/IllustrationBlock/IllustrationBlock';

import blobsURIModel from 'services/models/media/blobsURIModel';
import geometriesExploreService from 'services/api/geometriesExplore/geometriesExploreService';

import {
  decodeBufferPairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import arrayBufferToBase64 from 'utils/arrayBufferToBase64';

import { IGeometriesVisualizerProps } from '../types';

import './GeometriesVisualizer.scss';

function buildScene(
  geometryBlob: any,
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

  loadingManager.onLoad = function () {
    console.log('Loading complete!');
    const loadingScreen = document.getElementById('loader');
    loadingScreen?.classList.add('fade-out');
    loadingScreen?.remove();
  };

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

  const geometry = loader.parse(atob(geometryBlob));

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

function getGeometriesBlobsData(uris: string[]) {
  const request = geometriesExploreService.getGeometriesByURIs(uris);
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
        .catch((ex) => {
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

function GeometriesVisualizer(
  props: IGeometriesVisualizerProps,
): React.FunctionComponentElement<React.ReactNode> {
  const { data, isLoading } = props;
  const [geometryBlob, setGeometryBlob] = React.useState('');
  const [geometryBlobFormat, setGeometryBlobFormat] = React.useState('');
  const [loadingScene, setLoadingScene] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      let blobURI = data?.geometriesSetData?.[' = 1'][0].blob_uri;
      setGeometryBlobFormat(data?.geometriesSetData?.[' = 1'][0].format);
      if (blobURI !== undefined) {
        let requestRef = getGeometriesBlobsData([blobURI]);
        await requestRef.call();
        setGeometryBlob(blobsURIModel.getState()[blobURI]);
        return () => {
          requestRef.abort();
        };
      }
    }
    fetchData();
  }, [data]);

  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    if (geometryBlob !== '') {
      let canvas: HTMLCanvasElement | null = document.querySelector('#geo');
      if (!canvas) {
        return;
      }
      buildScene(geometryBlob, geometryBlobFormat, canvas);
      setLoadingScene(false);
    }
  }, [geometryBlob]);

  return (
    <ErrorBoundary>
      <BusyLoaderWrapper
        className='VisualizationLoader'
        isLoading={!!props.isLoading}
      >
        <div className='GeometriesVisualizer'>
          {_.isEmpty(props.data?.geometriesSetData) ? (
            <IllustrationBlock size='xLarge' title='No Tracked Figures' />
          ) : (
            <div className='GeometriesVisualizer__recordCnt'>
              {loadingScene && <div id='loader'></div>}
              <canvas className='webgl' id='geo' ref={canvasRef}></canvas>
            </div>
          )}
        </div>
      </BusyLoaderWrapper>
    </ErrorBoundary>
  );
}

GeometriesVisualizer.displayName = 'GeometriesVisualizer';

export default memo<IGeometriesVisualizerProps>(GeometriesVisualizer);
