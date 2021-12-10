import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {
    GLTFLoader
} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';

export function radInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createCube(color) {
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.MeshStandardMaterial({
            color: color
        })
    );
    cube.oldcolor = color
    cube.tag = false;
    cube.castShadow = true
    return cube;
};


export function createBall(color) {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.MeshPhongMaterial({
            color: color,
            flatShading: true
        })
    );
    sphere.position.set(0, 0, -5)
    sphere.castShadow = true
    return sphere;
};

export function createRoad(color) {

    const texture = new THREE.TextureLoader().load('../assets/textures/forestpath.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 100);
    const road = new THREE.Mesh(
        new THREE.PlaneGeometry(50, 5000),
        new THREE.MeshPhongMaterial({
            map: texture
        })
    );
    road.receiveShadow = true
    return road;
};

export function randColorGen(i) {
    var arr = []
    for (let x = 0; x < i; x++) {
        arr.push(Math.floor(Math.random() * 16777215));
    }
    return arr;
}

export async function loadGlTF(asset, x, y, z) {
    const gltfLoader = new GLTFLoader()
    return new Promise((resolve, reject) => {
        gltfLoader.load(asset, data => {
            let root = data.scene
            root.traverse(function (child) {
                child.castShadow = true;
            })
            root.scale.set(x, y, z)
            resolve(root)
        }, null, reject);
    });
}

export async function loadGlTF2() {
    const loader = new GLTFLoader()
    return new Promise((resolve, reject) => {
        loader.load( 'assets/wolf/ShibaInu.gltf', function ( gltf ) {
            gltf.scene.name = 'ShibaInu'
            gltf.scene.traverse(function (child) {
                    child.castShadow = true;
                })
            gltf.scene.scale.set(2, 2, 2)
            gltf.scene.rotation.y = -Math.PI 
            var mixer = new THREE.AnimationMixer( gltf.scene );
            gltf.animations.forEach( ( clip ) => {
                mixer.clipAction( clip ).play();
            });  
            var arr = [gltf.scene, mixer]
            resolve(arr)
          }, null, reject);
    });
    
}
