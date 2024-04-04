import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

/* THREE.js scene setup */
const scene = new THREE.Scene();
const container = document.querySelector('.mars-scene');
const rect = container.getBoundingClientRect();

const camera = new THREE.PerspectiveCamera(40, rect.width / rect.height, 1, 1000);
camera.position.set(0, 0, 10); // Adjust based on your model's scale and position


const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(rect.width, rect.height);
document.querySelector('.mars-scene').appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 0); // Transparent background
// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

/* Lighting */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

/* Texture loading */
const textureLoader = new THREE.TextureLoader();
const marsTextures = {
    diffuse: textureLoader.load('/mars/textures/Diffuse_2k.png'),
    bump: textureLoader.load('/mars/textures/Bump_2K.png'),
    clouds: textureLoader.load('/mars/textures/Clouds_2k.png'),
    dust: textureLoader.load('/mars/textures/Dust_2k.png')
};

// Apply the maximum anisotropy for better texture quality
Object.values(marsTextures).forEach(texture => {
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
});



/* Model loading */
const loader = new FBXLoader();
let marsModel = null;

loader.load('/mars/mars.fbx', function (object) {
    object.position.set(0, 0, 0); // Position at the origin
    object.scale.set(0.001, 0.001, 0.001); // Adjust the scale as needed

    // object.traverse(function (child) {
    //     if (child.isMesh) {
    //         child.material.map = marsTextures.diffuse; // Diffuse or color map
    //         child.material.bumpMap = marsTextures.bump; // Bump map for surface detail
    //         child.material.specularMap = marsTextures.dust; // Specular map for shininess
    //         child.material.needsUpdate = true;
    //     }
    // });
    scene.add(object);
    console.log("Model loaded and added.");
    // object.traverse(function (child) {
    //     if (child.isMesh) {
    //         child.material.map = marsTextures.diffuse;
    //         child.material.bumpMap = marsTextures.bump;
    //         child.material.specularMap = marsTextures.dust; // Assuming specular use for dust texture
    //         child.material.needsUpdate = true;
    //     }
    // });
    // scene.add(object);
}, undefined, function (error) {
    console.error('An error happened during loading the model: ', error);
});

/* Animation loop */
function animate(time) {
    time *= 0.001;  // Convert to seconds
    if (marsModel) {
        marsModel.rotation.y += 0.000243; // Adjust rotation speed as needed
        marsModel.rotation.x += 0.000243;
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

/* Handle canvas resizing */
function resizeCanvasToDisplaySize() {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

const resizeObserver = new ResizeObserver(resizeCanvasToDisplaySize);
resizeObserver.observe(renderer.domElement, { box: 'content-box' });
