import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Initialize the scene
const scene = new THREE.Scene();

// CAMERAS
// Camera
const Camera = new THREE.PerspectiveCamera(50.0, window.innerWidth / window.innerHeight, 0.1, 1000);
Camera.position.set(7.358891487121582, 4.958309173583984, 6.925790786743164);
Camera.rotation.set(1.1093189716339111, 0.8149281740188599, -0.0);
console.log('Camera Camera position:', Camera.position);
scene.add(Camera);

// LIGHTS
const Light = new THREE.PointLight(0xffffff);
Light.position.set(4.076245307922363, 5.903861999511719, -1.0054539442062378);
scene.add(Light);

const Light_001 = new THREE.PointLight(0xffffff);
Light_001.position.set(2.6887617111206055, 6.127673149108887, 4.206856727600098);
scene.add(Light_001);

const Light_002 = new THREE.PointLight(0xffffff);
Light_002.position.set(-1.1169939041137695, 3.3908045291900635, 2.345602035522461);
scene.add(Light_002);

const Presets_007_Default = new THREE.SpotLight(0xffffff, 1000.0, 40.0, 1.1407254934310913, 0, 1);
Presets_007_Default.castShadow = true; // enable shadow
Presets_007_Default.target.position.set(-0.16875651478767395, 8.793540000915527, -0.18415677547454834);
scene.add(Presets_007_Default);

const Presets_009_p01 = new THREE.PointLight(0xffffff);
Presets_009_p01.position.set(-0.1272968351840973, 9.583904266357422, -0.02368711307644844);
scene.add(Presets_009_p01);

const Presets_010_p02 = new THREE.SpotLight(0xffffff, 2000.0, 40.0, 1.44687819480896, 0, 1);
Presets_010_p02.castShadow = true; // enable shadow
Presets_010_p02.target.position.set(-0.2392231673002243, 8.369512557983398, 0.06647974252700806);
scene.add(Presets_010_p02);

// OBJECTS
const loader = new GLTFLoader();

// BezierCurve
loader.load('exported_gltfs/BezierCurve.glb',
	(gltf) => {
		const BezierCurve = gltf.scene;
		BezierCurve.position.set(0.0, 0.0, -0.0);
		BezierCurve.rotation.set(0.0, 0.0, 0.0);
		scene.add(BezierCurve);
	},
	(xhr) => {
		console.log('BezierCurve loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model BezierCurve', error);
	}
);

// Cube
loader.load('exported_gltfs/Cube.glb',
	(gltf) => {
		const Cube = gltf.scene;
		Cube.position.set(0.0, 0.0, -0.0);
		Cube.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube);
	},
	(xhr) => {
		console.log('Cube loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube', error);
	}
);

// Cube_001
loader.load('exported_gltfs/Cube_001.glb',
	(gltf) => {
		const Cube_001 = gltf.scene;
		Cube_001.position.set(0.0, 0.0, -0.0);
		Cube_001.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_001);
	},
	(xhr) => {
		console.log('Cube_001 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_001', error);
	}
);

// Cube_002
loader.load('exported_gltfs/Cube_002.glb',
	(gltf) => {
		const Cube_002 = gltf.scene;
		Cube_002.position.set(0.0, 0.0, -0.0);
		Cube_002.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_002);
	},
	(xhr) => {
		console.log('Cube_002 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_002', error);
	}
);

// Cube_003
loader.load('exported_gltfs/Cube_003.glb',
	(gltf) => {
		const Cube_003 = gltf.scene;
		Cube_003.position.set(0.0, 0.0, -0.0);
		Cube_003.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_003);
	},
	(xhr) => {
		console.log('Cube_003 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_003', error);
	}
);

// Cube_004
loader.load('exported_gltfs/Cube_004.glb',
	(gltf) => {
		const Cube_004 = gltf.scene;
		Cube_004.position.set(0.0, 0.0, -0.0);
		Cube_004.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_004);
	},
	(xhr) => {
		console.log('Cube_004 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_004', error);
	}
);

// Cube_005
loader.load('exported_gltfs/Cube_005.glb',
	(gltf) => {
		const Cube_005 = gltf.scene;
		Cube_005.position.set(0.0, 0.0, -0.0);
		Cube_005.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_005);
	},
	(xhr) => {
		console.log('Cube_005 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_005', error);
	}
);

// Cube_006
loader.load('exported_gltfs/Cube_006.glb',
	(gltf) => {
		const Cube_006 = gltf.scene;
		Cube_006.position.set(0.0, 0.0, -0.0);
		Cube_006.rotation.set(0.0, 0.0, 0.0);
		scene.add(Cube_006);
	},
	(xhr) => {
		console.log('Cube_006 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_006', error);
	}
);

// Cube_007
loader.load('exported_gltfs/Cube_007.glb',
	(gltf) => {
		const Cube_007 = gltf.scene;
		Cube_007.position.set(0.0, 0.0, -0.0);
		Cube_007.rotation.set(0.0, 0.0, 0.0);
		scene.add(Cube_007);
	},
	(xhr) => {
		console.log('Cube_007 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_007', error);
	}
);

// Cube_008
loader.load('exported_gltfs/Cube_008.glb',
	(gltf) => {
		const Cube_008 = gltf.scene;
		Cube_008.position.set(0.0, 0.0, -0.0);
		Cube_008.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_008);
	},
	(xhr) => {
		console.log('Cube_008 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_008', error);
	}
);

// Cube_009
loader.load('exported_gltfs/Cube_009.glb',
	(gltf) => {
		const Cube_009 = gltf.scene;
		Cube_009.position.set(0.0, 0.0, -0.0);
		Cube_009.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_009);
	},
	(xhr) => {
		console.log('Cube_009 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_009', error);
	}
);

// Cube_010
loader.load('exported_gltfs/Cube_010.glb',
	(gltf) => {
		const Cube_010 = gltf.scene;
		Cube_010.position.set(0.0, 0.0, -0.0);
		Cube_010.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_010);
	},
	(xhr) => {
		console.log('Cube_010 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_010', error);
	}
);

// Cube_011
loader.load('exported_gltfs/Cube_011.glb',
	(gltf) => {
		const Cube_011 = gltf.scene;
		Cube_011.position.set(0.0, 0.0, -0.0);
		Cube_011.rotation.set(0.0, 0.0, -0.0);
		scene.add(Cube_011);
	},
	(xhr) => {
		console.log('Cube_011 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Cube_011', error);
	}
);

// Torus_001
loader.load('exported_gltfs/Torus_001.glb',
	(gltf) => {
		const Torus_001 = gltf.scene;
		Torus_001.position.set(0.0, 0.0, -0.0);
		Torus_001.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_001);
	},
	(xhr) => {
		console.log('Torus_001 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_001', error);
	}
);

// Torus_002
loader.load('exported_gltfs/Torus_002.glb',
	(gltf) => {
		const Torus_002 = gltf.scene;
		Torus_002.position.set(0.0, 0.0, -0.0);
		Torus_002.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_002);
	},
	(xhr) => {
		console.log('Torus_002 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_002', error);
	}
);

// Torus_003
loader.load('exported_gltfs/Torus_003.glb',
	(gltf) => {
		const Torus_003 = gltf.scene;
		Torus_003.position.set(0.0, 0.0, -0.0);
		Torus_003.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_003);
	},
	(xhr) => {
		console.log('Torus_003 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_003', error);
	}
);

// Torus_004
loader.load('exported_gltfs/Torus_004.glb',
	(gltf) => {
		const Torus_004 = gltf.scene;
		Torus_004.position.set(0.0, 0.0, -0.0);
		Torus_004.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_004);
	},
	(xhr) => {
		console.log('Torus_004 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_004', error);
	}
);

// Torus_005
loader.load('exported_gltfs/Torus_005.glb',
	(gltf) => {
		const Torus_005 = gltf.scene;
		Torus_005.position.set(0.0, 0.0, -0.0);
		Torus_005.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_005);
	},
	(xhr) => {
		console.log('Torus_005 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_005', error);
	}
);

// Torus_006
loader.load('exported_gltfs/Torus_006.glb',
	(gltf) => {
		const Torus_006 = gltf.scene;
		Torus_006.position.set(0.0, 0.0, -0.0);
		Torus_006.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_006);
	},
	(xhr) => {
		console.log('Torus_006 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_006', error);
	}
);

// Torus_007
loader.load('exported_gltfs/Torus_007.glb',
	(gltf) => {
		const Torus_007 = gltf.scene;
		Torus_007.position.set(0.0, 0.0, -0.0);
		Torus_007.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_007);
	},
	(xhr) => {
		console.log('Torus_007 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_007', error);
	}
);

// Torus_008
loader.load('exported_gltfs/Torus_008.glb',
	(gltf) => {
		const Torus_008 = gltf.scene;
		Torus_008.position.set(0.0, 0.0, -0.0);
		Torus_008.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_008);
	},
	(xhr) => {
		console.log('Torus_008 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_008', error);
	}
);

// Torus_009
loader.load('exported_gltfs/Torus_009.glb',
	(gltf) => {
		const Torus_009 = gltf.scene;
		Torus_009.position.set(0.0, 0.0, -0.0);
		Torus_009.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_009);
	},
	(xhr) => {
		console.log('Torus_009 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_009', error);
	}
);

// Torus_010
loader.load('exported_gltfs/Torus_010.glb',
	(gltf) => {
		const Torus_010 = gltf.scene;
		Torus_010.position.set(0.0, 0.0, -0.0);
		Torus_010.rotation.set(0.0, 0.0, -0.0);
		scene.add(Torus_010);
	},
	(xhr) => {
		console.log('Torus_010 loaded: ' + (xhr.loaded / xhr.total * 100) + '%');
	},
	(error) => {
		console.error('An error happened loading the model Torus_010', error);
	}
);

// RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Background Color
scene.background = new THREE.Color(0x0c0c0c);

// Event Listeners
window.addEventListener('resize', () => {
	Camera.aspect = window.innerWidth / window.innerHeight;
	Camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

// OrbitControls
const controls = new OrbitControls(Camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Animation loop
function animate() {
	requestAnimationFrame(animate);
	controls.update(); // for damping
	renderer.render(scene, Camera);
}

animate();
