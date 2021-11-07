import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {GLTFLoader} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/FBXLoader.js';

export function radInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createCube(color, lanes) { 
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.MeshStandardMaterial({ color: color })
    );
    cube.oldcolor = color
    cube.tag = false;
    const pos = radInt(0,2);
    cube.position.set(lanes[pos][0],lanes[pos][1],lanes[pos][2])
    return cube;
};

export function createBall(color) { 
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(3, 32, 32),
      new THREE.MeshPhongMaterial({ color: color, flatShading: true })
    );
    sphere.position.set(0,0,-5)
    return sphere;
};

export function createRoad(color) { 
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 5000),
      new THREE.MeshPhongMaterial({ color: color })
    );
    return road;
};

export function randColorGen(i) {
    var arr = []
    for (let x = 0; x < i; x ++){
        arr.push(Math.floor(Math.random()*16777215));
    }
    return arr;
}

export async function loadFBX(asset,x,y,z) {
    const fbxLoader = new FBXLoader()
    return new Promise((resolve, reject) => {
        fbxLoader.load(asset, data=>{
            data.traverse(function (child) {
            child.castShadow = true;
        })
        data.scale.set(x,y,z)
        resolve(data)} , null, reject);
  });
}








