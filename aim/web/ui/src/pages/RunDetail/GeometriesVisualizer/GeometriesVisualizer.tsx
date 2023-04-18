import React, { memo } from 'react';
import _ from 'lodash-es';
import * as THREE from 'three';

import { useProgress, Html } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
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

function buildScene() {
  // Create Scene and Rendered:
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  //scene.background = new THREE.Color(0x443333);
  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.001,
    1000,
  );

  camera.position.set(-1, 1, 1);
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#geo'),
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  const loadingManager = new THREE.LoadingManager();

  loadingManager.onLoad = function () {
    console.log('Loading complete!');
    const loadingScreen = document.getElementById('loader');
    loadingScreen.classList.add('fade-out');
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

  // Load GEO:
  const geoFileName = '/static-files/bunny.obj';

  var loader = Object();
  if (geoFileName.endsWith('.stl')) {
    loader = new STLLoader(loadingManager);
  } else if (geoFileName.endsWith('.obj')) {
    loader = new OBJLoader(loadingManager);
  } else {
    console.log('File Format Not Supported');
  }

  // load a resource
  loader.load(
    geoFileName,
    function (geometry: Any) {
      console.log(geometry);

      if (geometry instanceof THREE.Group) {
        geometry.traverse(function (obj) {
          if (obj instanceof THREE.Mesh) {
            console.log(obj);
            var box = new THREE.Box3().setFromObject(obj);
            obj.size = box.getSize(new THREE.Vector3()); // store car size

            obj.scale.set(
              1 / obj.size.length(),
              1 / obj.size.length(),
              1 / obj.size.length(),
            );
            obj.castShadow = true;
            obj.receiveShadow = true;
            obj.material = new THREE.MeshStandardMaterial({ color: 0x606060 });

            obj.geometry.center();
            var pivot = new THREE.Group();
            scene.add(pivot);
            pivot.add(obj);
          }
        });
      }

      if (geometry instanceof THREE.BufferGeometry) {
        console.log(geometry);
        var material = new THREE.MeshStandardMaterial({ color: 0x606060 });
        material.side = THREE.DoubleSide;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.geometry.center();
        scene.add(mesh);
      }
    },
    // called when loading is in progresses
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log(error);
      console.log('An error happened');
    },
  );

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
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onWindowResize);
}

function Loader() {
  const { progress } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

function getGeometriesBlobsData(uris: string[]) {
  const request = geometriesExploreService.getGeometriesByURIs(uris);
  return {
    abort: request.abort,
    call: () => {
      return request
        .call()
        .then(async (stream) => {
          console.log(stream);
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
          console.log(ex);
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
  const [geometryBlobs, setGeometryBlobs] = React.useState({});
  console.log('data?.geometriesSetData', data?.geometriesSetData);
  console.log(
    'data?.geometriesSetData[0].blob_uri',
    data?.geometriesSetData?.[' = 1'],
  );
  React.useEffect(() => {
    blobsURIModel.init();
  }, []);

  React.useEffect(() => {
    setGeometryBlobs(
      getGeometriesBlobsData([data?.geometriesSetData?.[' = 1'][0].blob_uri]),
    );
  }, []);

  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    var canvas = document.querySelector('#geo');
    console.log('canvas: ', canvas);
    if (!canvas) {
      return;
    }
    buildScene();
  }, [canvasRef, props]);

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
              <div id='loader'></div>
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
