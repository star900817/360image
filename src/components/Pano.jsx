import { MDBFile } from 'mdb-react-ui-kit';
import * as PANOLENS from 'panolens';
import * as THREE from 'three';
import { useEffect, useState, useRef } from 'react';
import UploadFiles from './upload-files.component';

import ImageSelect from './ImageSelect.jsx';

import { OrbitControls } from './OrbitControls.js';
import { OrbitControlsGizmo } from './OrbitControlsGizmo.js';

// Focus tweening parameter
const parameters = {
  amount: 50,
  duration: 1000,
  curve: 'Exponential',
  easing: 'Out',
  iterative: false,
};

const baseScale = 2;

console.log(PANOLENS);
let panorama = new PANOLENS.ImagePanorama('/assets/test (2).jpg');
console.log(panorama);

var viewer;
var geometry = new THREE.Geometry();
var lines;

var posArray = [];
var polygonArray = [];
var linesArray = [];
var circleArray = [];

var linesPolygonObject = [];
var linesObject = [];
var circleObject = [];
var textsObject = [];

const defaultStatus = {
  POLYGON: false,
  LINE: false,
  CIRCLE: false,
  TEXT: false,
};

let statusData = {
  ...defaultStatus,
};

let textContent;

const loader = new THREE.FontLoader();

// promisify font loading
function loadFont(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}
const font = await loadFont(
  'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json'
);

const Pano = () => {
  const [url, setUrl] = useState('');
  const [isNew, setIsNew] = useState(true);
  const [status, setIsStatus] = useState({ ...defaultStatus });
  const [listData, setListData] = useState([]);

  const pano = useRef(null);
  const upload = (file) => {
    console.log(file.name);

    initPano(file.name);

    setIsNew(false);
  };

  const onSelectImage = (img) => {
    console.log(img);
    initPano(img);
    setIsNew(false);
  };

  const onChangeText = (e) => {
    textContent = e.target.value;
  };

  const drawLine = (pos) => {
    if (!statusData.LINE) return;

    if (window.event.ctrlKey || true) {
      //ctrl was held down during the click
      if (lines != undefined) {
        viewer.remove(lines);
      }
      if (posArray.length > 1) {
        posArray[1] = pos;
      } else {
        posArray.push(pos);
      }
      const pArray = [...posArray];

      geometry = new THREE.BufferGeometry();
      // geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
      geometry.setFromPoints(pArray);
      // lines
      var matLines = new THREE.LineBasicMaterial({
        color: 'blue',
        linewidth: 10,
      });
      lines = new THREE.Line(geometry, matLines);
      viewer.add(lines);

      // Create an array of positions for the vertices
      const positions = [
        0,
        0,
        0, // Vertex 1
        1,
        1,
        1, // Vertex 2
        2,
        2,
        2, // Vertex 3
      ];

      // Create an array of colors for the vertices
      const colors = [
        1,
        0,
        0, // Color for Vertex 1 (red)
        0,
        1,
        0, // Color for Vertex 2 (green)
        0,
        0,
        1, // Color for Vertex 3 (blue)
      ];

      // Create a LineGeometry
      const geometry1 = new THREE.LineGeometry();

      // Set the positions and colors of the vertices
      geometry1.setPositions(positions);
      geometry1.setColors(colors);
      // Create a LineMaterial
      const material = new THREE.LineMaterial({
        linewidth: 5, // Set the desired line width here
        color: 0xff0000, // Set the line color
      });

      // Create a Line2 object using the geometry and material
      const line = new THREE.Line2(geometry1, material);

      viewer.add(line);
    }
  };

  const drawPolygon = (pos) => {
    console.log(status, '-------');

    if (!statusData.POLYGON) return;
    console.log(pos, status.POLYGON);

    if (window.event.ctrlKey || true) {
      //ctrl was held down during the click
      if (lines != undefined) {
        viewer.remove(lines);
      }
      posArray.push(pos);
      const pArray = [...posArray];

      // Remove center vertex

      geometry = new THREE.BufferGeometry().setFromPoints(pArray);
      // lines
      var matLines = new THREE.LineBasicMaterial({ color: 'yellow' });
      lines = new THREE.LineLoop(geometry, matLines);
      viewer.add(lines);
    }
  };

  const drawCircle = (pos) => {
    if (!statusData.CIRCLE) return;

    if (window.event.ctrlKey || true) {
      if (lines != undefined) {
        viewer.remove(lines);
      }
      if (posArray.length > 1) {
        posArray[1] = pos;
      } else {
        posArray.push(pos);
      }
      const pArray = [...posArray];
      var radius = distanceVector(pArray[0], pArray[pArray.length - 1]),
        segments = 64,
        material = new THREE.LineBasicMaterial({ color: 0x0000ff }),
        geometry = new THREE.CircleGeometry(radius, segments);
      // material.depthTest = false
      // Remove center vertex
      geometry.vertices.shift();

      const obj = new THREE.LineLoop(geometry, material);
      obj.position.set(
        pArray[0].x * 0.95,
        pArray[0].y * 0.95,
        pArray[0].z * 0.95
      );
      obj.renderOrder = 999;

      console.log(obj);
      viewer.add(obj);
    }
  };

  const drawText = (pos) => {
    if (!statusData.TEXT || textContent == '') return;

    console.log(textContent);

    const textGeometry = new THREE.TextGeometry(textContent, {
      font: font,
      size: 50,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: false,
      bevelThickness: 0.5,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    const material2 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh = new THREE.Mesh(textGeometry, material2);
    mesh.position.set(pos.x * 0.5, pos.y * 0.5, pos.z * 0.5);

    mesh.lookAt(new THREE.Vector3(-pos.x, -pos.y, -pos.z));

    addTextObject(mesh);

    viewer.add(mesh);

    viewer.getCamera().lookAt(pos);
  };

  const distanceVector = (v1, v2) => {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  };

  const addPolygonObject = () => {
    //ctrl was held down during the click

    const pArray = [...posArray];

    geometry = new THREE.BufferGeometry().setFromPoints(pArray);
    // lines
    var matLines = new THREE.LineBasicMaterial({ color: 'yellow' });
    const lines1 = new THREE.LineLoop(geometry, matLines);
    linesPolygonObject.push(lines1);
    viewer.add(lines1);

    ChangeListData();
  };

  const addLineObject = () => {
    //ctrl was held down during the click

    const pArray = [...posArray];

    geometry = new THREE.BufferGeometry().setFromPoints(pArray);
    // lines
    var matLines = new THREE.LineBasicMaterial({ color: 'blue' });
    const lines1 = new THREE.LineLoop(geometry, matLines);
    linesObject.push(lines1);
    viewer.add(lines1);

    ChangeListData();
  };

  const addCircleObject = () => {
    const pArray = [...posArray];
    var radius = 100,
      segments = 64,
      material = new THREE.LineBasicMaterial({ color: 0x0000ff }),
      geometry = new THREE.CircleGeometry(radius, segments);

    // Remove center vertex
    geometry.vertices.shift();

    const obj = new THREE.LineLoop(geometry, material);
    circleObject.push(obj);
    viewer.add(obj);

    ChangeListData();
  };

  const addTextObject = (mesh) => {
    textsObject.push(mesh);

    ChangeListData();
  };

  const ChangeListData = () => {
    const poly = linesPolygonObject.map((data, i) => {
      return {
        icon: 'polyline',
        index: i,
      };
    });

    const lines = linesObject.map((data, i) => {
      return {
        icon: 'pen_size_1',
        index: i,
      };
    });

    const circles = circleObject.map((data, i) => {
      return {
        icon: 'circle',
        index: i,
      };
    });

    const texts = textsObject.map((data, i) => {
      return {
        icon: 'text_increase',
        index: i,
      };
    });

    console.log('----------xxxx-----------', texts);
    const data = [...poly, ...lines, ...circles, ...texts];
    setListData(data);
  };

  const initPano = (url) => {
    panorama && panorama.dispose() && viewer.remove(panorama);

    posArray = [];

    linesObject = [];
    circleObject = [];
    linesPolygonObject = [];
    textsObject = [];
    textContent = '';
    ChangeListData();

    panorama = new PANOLENS.ImagePanorama(`assets/${url}`);

    panorama.addEventListener('click', function (e) {
      if (e.intersects.length > 0) return;
      const a = viewer.raycaster.intersectObject(viewer.panorama, true)[0]
        .point;

      drawText(a);
      drawPolygon(a);
      drawLine(a);
      drawCircle(a);
    });

    // panorama.addEventListener("mousemove", function(e) {
    //   if (e.intersects.length > 0) return;
    //   const a = viewer.raycaster.intersectObject(viewer.panorama, true)[0].point;
    //   console.log("-------mouse move")
    //   drawMove(a)
    // })

    if (viewer == undefined) {
      viewer = new PANOLENS.Viewer({
        container: document.querySelector('#coucou'),
      });

      // window.addEventListener('mouseup', onPointerDown);

      // viewer.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
      // viewer.camera.position.set( 15, 12, 12 );

      // // Orbit Controls
      // const controls = new OrbitControls( viewer.camera, document.querySelector("#coucou") );

      // // Obit Controls Gizmo
      // const controlsGizmo = new OrbitControlsGizmo(controls, { size: 100, padding: 8 });

      // // Add the Gizmo to the document
      // document.body.appendChild(controlsGizmo.domElement);

      // Grid Helper
      // viewer.add(new THREE.GridHelper(10, 10, "#666666", "#222222"));

      viewer.getCamera().fov = 120;
      viewer.getCamera().updateProjectionMatrix();

      viewer.getRenderer().sortObjects = true;
    } else {
      const scene = viewer.getScene();
      for (var i = scene.children.length - 1; i >= 0; i--) {
        const obj = scene.children[i];
        scene.remove(obj);
      }
    }
    panorama.renderOrder = 0;
    viewer.add(panorama);

    // var dotGeometry = new THREE.Geometry();
    // dotGeometry.vertices.push(new THREE.Vector3( 0, 0, 0));
    // var dotMaterial = new THREE.PointsMaterial( { size: 50, sizeAttenuation: false } );
    // var dot = new THREE.Points( dotGeometry, dotMaterial );
    // viewer.add( dot );
  };

  const onPolygon = () => {
    console.log(status, '-------');
    if (posArray.length > 0) {
      if (statusData.POLYGON) {
        addPolygonObject();
      } else {
        initDraw();
      }

      polygonArray.push(posArray);
      posArray = [];
    }

    console.log(status);
    setIsStatus({
      ...defaultStatus,
      POLYGON: !status.POLYGON,
    });

    statusData = {
      ...defaultStatus,
      POLYGON: !status.POLYGON,
    };
  };

  const onLine = () => {
    if (posArray.length > 0) {
      if (statusData.LINE) {
        addLineObject();
      } else {
        initDraw();
      }

      linesArray.push(posArray);
      posArray = [];
    }
    setIsStatus({
      ...defaultStatus,
      LINE: !status.LINE,
    });

    statusData = {
      ...defaultStatus,
      LINE: !status.LINE,
    };
  };

  const onCircle = () => {
    if (posArray.length > 0) {
      if (statusData.CIRCLE) {
        addCircleObject();
      } else {
        initDraw();
      }

      circleArray.push(posArray);
      posArray = [];
    }
    setIsStatus({
      ...defaultStatus,
      CIRCLE: !status.CIRCLE,
    });
    statusData = {
      ...defaultStatus,
      CIRCLE: !status.CIRCLE,
    };
  };

  const onText = () => {
    setIsStatus({
      ...defaultStatus,
      TEXT: !status.TEXT,
    });

    statusData = {
      ...defaultStatus,
      TEXT: !status.TEXT,
    };
  };

  const initDraw = () => {
    if (lines != undefined) {
      viewer.remove(lines);
    }
  };

  useEffect(() => {}, [pano]);

  return (
    <>
      <div className="control-div">
        <div
          className="btn btn-success"
          onClick={() => {
            setIsNew(!isNew);
          }}
        >
          <span className="material-symbols-outlined">drive_folder_upload</span>
        </div>
        <div
          className={`btn btn-${status.POLYGON ? 'success' : 'info'}`}
          onClick={onPolygon.bind(this)}
        >
          <span className="material-symbols-outlined">polyline</span>
        </div>
        <div
          className={`btn btn-${status.LINE ? 'success' : 'info'}`}
          onClick={onLine.bind(this)}
        >
          <span className="material-symbols-outlined">pen_size_1</span>
        </div>
        <div
          className={`btn btn-${status.CIRCLE ? 'success' : 'info'}`}
          onClick={onCircle.bind(this)}
        >
          <span className="material-symbols-outlined">circle</span>
        </div>
        <div
          className={`btn btn-${status.TEXT ? 'success' : 'info'}`}
          onClick={onText.bind(this)}
        >
          <span className="material-symbols-outlined">text_increase</span>
        </div>
        {status.TEXT && (
          <div className="form-group">
            <input className="input input-group" onChange={onChangeText} />
          </div>
        )}
        {/* <div className={`btn btn-${isText?'success' : 'info'}`} onClick={onLine.bind(this)}>Text</div> */}
      </div>

      <div className="coucou" ref={pano} id="coucou">
        {isNew && (
          <div className="coucou-new">
            <UploadFiles uploadFile={upload} />
          </div>
        )}
        {/* {isNew && <ImageSelect onSelectImage={onSelectImage} />} */}
      </div>

      <div data-spy="scroll" className="control-list">
        <div className="list-group">
          {listData.map((list, i) => (
            <a
              key={i}
              href="#"
              className="list-group-item list-group-item-action flex-column align-items-start"
            >
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">
                  <span className="material-symbols-outlined">{list.icon}</span>
                </h5>
                <small>{i + 1}</small>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
};

export default Pano;
