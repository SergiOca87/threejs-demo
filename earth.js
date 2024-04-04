import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Starback from 'starback'

/* Stars background */
const canvas = document.getElementById('canvas')
const starback = new Starback(canvas, {
    type: 'dot',
    width: 4000,
    height: 2000,
    quantity: 100,
    direction: 225,
    backgroundColor: ['#000', '#000'],
    randomOpacity: true,
});

/* APIS */
// const url = 'https://planets-info-by-newbapi.p.rapidapi.com/api/v1/planets/3';
// const options = {
//     method: 'GET',
//     headers: {
//         'X-RapidAPI-Key': 'DkBRLHsG7KmshMk8bvJt1EO5nbbEp1haBBLjsnaXUSD7gptIs7',
//         'X-RapidAPI-Host': 'planets-info-by-newbapi.p.rapidapi.com'
//     }
// };

// try {
//     const response = await fetch(url, options);
//     const result = await response.text();
//     console.log(result);
// } catch (error) {
//     console.error(error);
// }

/* THREE.js model */
const scene = new THREE.Scene();
scene.background = null; // Optional: Adds a background color to the scene
const container = document.querySelector('.earth-scene');
const rect = container.getBoundingClientRect();

const camera = new THREE.PerspectiveCamera(40, rect.width / rect.height, 1, 1000);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Clear color set to black with 0 opacity
renderer.setSize(rect.width, rect.height);
document.querySelector('.earth-scene').appendChild(renderer.domElement);

// Loader initialization
const loader = new FBXLoader();

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; // Disable zooming
controls.enablePan = false; // Disable panning
controls.enableDamping = true; // Enable damping (inertia) for smoother rotation
controls.dampingFactor = 0.05;

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Bright white light
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

directionalLight.intensity = 15; // Adjust as needed

// Experiment with the light position to find the best angle for illumination
directionalLight.position.set(5, 5, 5); // Adjust the position values as needed

const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Adjust the intensity as needed
scene.add(ambientLight);

const fillLight = new THREE.DirectionalLight(0xffffff, .5); // Adjust color and intensity as needed
fillLight.position.set(-5, -3, -5); // Position it opposite the main light to fill shadows
scene.add(fillLight);

// Texture loading for the model
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('/earth/Earth_diffuse_8k.png', texture => {
    texture.encoding = THREE.sRGBEncoding;
    texture.flipY = false; // Texture-specific adjustments
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
});

// Model loading and setup
let myModel = null;
loader.load('/earth/Earth.fbx', function (object) {
    myModel = object;
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material.map = earthTexture;
            child.material.needsUpdate = true;
        }
    });
    scene.add(object);
}, undefined, function (error) {
    console.error('An error happened during loading the model: ', error);
});

// Animation loop for model rotation
// function animate() {
//     requestAnimationFrame(animate);

//     if (myModel) {
//         myModel.rotation.y += 0.0005; // Adjust for desired rotation speed
//         myModel.rotation.x += 0.0005;
//     }

//     controls.update();
//     renderer.render(scene, camera);
// }

// animate();


function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // set render target sizes here
}

function animate(time) {
    time *= 0.001;  // seconds
    if (myModel) {
        myModel.rotation.y += 0.000243; // Y-axis rotation
        myModel.rotation.x += 0.000243;
    }

    controls.update();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

const resizeObserver = new ResizeObserver(resizeCanvasToDisplaySize);
resizeObserver.observe(renderer.domElement, { box: 'content-box' });