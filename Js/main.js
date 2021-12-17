import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import {
  OrbitControls
} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import * as utils from './util.js'
import * as Howler from 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js'
import {
  GLTFLoader
} from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/loaders/GLTFLoader.js';

const _VS = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`;


const _FS = `
uniform vec3 topColor;
uniform vec3 bottomColor;
uniform float offset;
uniform float exponent;
varying vec3 vWorldPosition;
void main() {
  float h = normalize( vWorldPosition + offset ).y;
  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
}`;

main()

async function main() {

  const bananaSound = new Howl({
    src: ['./assets/music/banana.wav'],
    volume: 0.5
  });
  const jumpSound = new Howl({
    src: ['./assets/music/jump.wav'],
    volume: 0.5
  });
  const overSound = new Howl({
    src: ['./assets/music/gameover.wav'],
    volume: 0.5
  });
  const bgm = new Howl({
    src: ['./assets/music/bgm.mp3'],
    loop: true,
    html5: true
  });

  const scoreHTML = document.querySelector("#score");
  const start = document.querySelector("#start")
  const scene = new THREE.Scene()

  scene.background = new THREE.Color(0xffffff);

  const canvas = document.querySelector("#bg");

  const size = {
    w: window.innerWidth * 0.7,
    h: window.innerHeight * 0.7
  }


  var treeMap = []
  var rockMap = []
  const banana = await utils.loadGlTF('../assets/bone_low-poly_game_ready/scene.gltf', 0.2, 0.2, 0.2);
  const trees = await utils.loadGlTF('../assets/low_poly_trees/scene.gltf', 5, 5, 5);
  const box = await utils.loadGlTF('../assets/apple_crate/scene.gltf', 0.75, 0.75, 0.75);
  var shibaAni
  shibaAni = await utils.loadGlTF2();
  var shib = shibaAni[0]
  var mixer = shibaAni[1]
  trees.traverse(child => {
    if (child.name[0] == '_' && child.type == 'Object3D') {
      // console.log(child);
      child.scale.set(1, 1, 1)
      treeMap.push(child)
    }
    if (child.name == "Rock_1_") {
      child.scale.set(1, 1, 1)
      rockMap.push(child)
    }
  });

  console.log(trees);
  const camera = new THREE.PerspectiveCamera(90, size.w / size.h, 0.1, 1000);
  camera.position.set(20, 30, 15);
  const pi = Math.PI;
  camera.rotation.y = 360 * (pi / 180);
  camera.rotation.x = -30 * (pi / 180);
  camera.rotation.z = -120 * (pi / 180);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize(size.w, size.h);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  const uniforms = {
    topColor: {
      value: new THREE.Color(0x0077FF)
    },
    bottomColor: {
      value: new THREE.Color(0x89b2eb)
    },
    offset: {
      value: 33
    },
    exponent: {
      value: 0.6
    }
  };
  // const skyGeo = new THREE.SphereBufferGeometry(1000, 0, 0);
  // const skyMat = new THREE.ShaderMaterial({
  //     uniforms: uniforms,
  //     vertexShader: _VS,
  //     fragmentShader: _FS,
  //     side: THREE.BackSide,
  // });

  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load('../assets/skybox/trance_ft.jpg');
  let texture_bk = new THREE.TextureLoader().load('../assets/skybox/trance_bk.jpg');
  let texture_up = new THREE.TextureLoader().load('../assets/skybox/trance_up.jpg');
  let texture_dn = new THREE.TextureLoader().load('../assets/skybox/trance_dn.jpg');
  let texture_rt = new THREE.TextureLoader().load('../assets/skybox/trance_rt.jpg');
  let texture_lf = new THREE.TextureLoader().load('../assets/skybox/trance_lf.jpg');

  materialArray.push(new THREE.MeshBasicMaterial({
    map: texture_ft,
    fog: false
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: texture_bk,
    fog: false
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: texture_up,
    fog: false
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: texture_dn,
    fog: false
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: texture_rt,
    fog: false
  }));
  materialArray.push(new THREE.MeshBasicMaterial({
    map: texture_lf,
    fog: false
  }));

  for (let i = 0; i < 6; i++) {
    materialArray[i].side = THREE.BackSide;
    // console.log('skybox'+i);
  }

  let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
  let skybox = new THREE.Mesh(skyboxGeo, materialArray);

  var clock2 = new THREE.Clock();
  var loader = new GLTFLoader();

  var obj = []
  var bananaList = []
  var clock = new THREE.Clock();
  var time = 0
  var delta = 0
  var speed = 0.2
  var score = 0
  var mixer
  const colors = utils.randColorGen(10);
  const lanes = [
    [-10, 0, -100],
    [0, 0, -100],
    [10, 0, -100],
    [-10, 5, -100],
    [0, 5, -100],
    [10, 5, -100]
  ]
  const treePos = [
    [-15, 0, -100],
    [-18, 0, -100],
    [-20, 0, -100],
    [15, 0, -100],
    [18, 0, -100],
    [20, 0, -100]
  ]
  var changing = 0
  var lane = 1
  var jumping = 0
  var press = 0
  const hmax = 8
  var spect = 0
  var gameover = 0
  var jumpStartTime = 0
  renderer.render(scene, camera)

  const controls = new OrbitControls(camera, canvas);
  scoreHTML.innerHTML = ("Score: " + 0)
  start.addEventListener('click', (e) => {
    bananaSound.play()
    if (!bgm.playing()) {
      bgm.play()
    }
    
    gameloop()
  })

  function gameloop() {


    const x = document
    x.addEventListener('keydown', res)

    function animate2() {
      renderer.render(scene, camera)
      requestAnimationFrame(animate2);
      if (spect == 0) {
        return
      }
    }
    animate2()

    function res(e) {
      if (press == 0) {
        spect = 0
        animate()
      }
      press++
      var key = e.code;
      cLane(key)
    }

    scoreHTML.innerHTML = ("Score: " + 0)
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    obj = []
    time = 0
    lane = 1
    delta = 0
    changing = 0
    jumping = 0
    speed = 0.2
    press = 0
    score = 0
    jumpStartTime = 0
    gameover = 0
    banana.name = 'banana'
    // scene.add(new THREE.Mesh(skyGeo, skyMat));
    scene.add(skybox);

    var ball = utils.createBall(0x007BC0)
    // scene.add(ball)
    shib.position.set(0, -3, -5)
    scene.add(shib)
    var road = utils.createRoad(0x557BC0)
    road.position.set(0, -3, -5)
    road.rotation.x = 270 * (pi / 180);
    scene.fog = new THREE.Fog(0x000000,1, 150);
    scene.add(road)
    const light = new THREE.SpotLight(0xffffff);
    const ambi = new THREE.AmbientLight(0xffffff,0.5);
    light.position.set(-3, 50, 0)
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 100;
    scene.add(light);
    scene.add(ambi);
    controls.target.set(0, 0, 0);
    controls.update();
    terrain()
    obstacle()

    console.log("AAAAA")
    console.log(shib)

    function animate() {
      var delta = clock2.getDelta();
			if ( mixer ) mixer.update( delta );
      scoreHTML.innerHTML = ("Score: " + score)
      if (speed <= 0.4)
        speed += 0.005
      obj.forEach((o, index, object) => {

        const ret = collision(o.name, o.position.x, o.position.y, o.position.z, index, ball)
        if (ret == 0) {
          gameover = 1
        }
        if (ret == 2) {
          o.name = 'noSound'
          scene.remove(o)
        }
        o.position.z += speed
        if (o.position.z >= 25) {
          scene.remove(o)
          object.splice(index, 1);
        }

      })
      road.position.z += speed;
      if (road.position.z > 1000) {
        road.position.set(0, -3, -5);

      }
      if (obj[obj.length - 1].position.z >= -80) {
        obstacle()
        terrain()
      }
      if (!gameover) {
        ballAnimation(ball)
        bananaAnimation(bananaList);
        renderer.render(scene, camera)
        requestAnimationFrame(animate);
      } else {
        overSound.play()
        bgm.pause()
        x.removeEventListener("keydown", res);
        spect = 1
        return
      }
    }
  }



  window.addEventListener("resize", () => {
    size.w = window.innerWidth * 0.8;
    size.h = window.innerHeight * 0.8;
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(window.devicePixelRatio);
  });


  function cLane(key) {
    if (key == 'ArrowLeft') {
      changing = 1
      if (lane != 0)
        lane -= 1

    }
    if (key == 'ArrowRight') {
      changing = 1
      if (lane != 2)
        lane += 1
    }
    if (key == 'ArrowUp') {
      if (!jumping) {
        if (!jumpSound.playing()) {
          jumpSound.play()
        }
        changing = 1
        jumping = 1
        delta = clock.getDelta();
        time += delta
        jumpStartTime = time
      }

    }
  }

  function obstacle() {
    var positions = []
    var amt = utils.radInt(0, 3)
    for (let i = 0; i < amt; i++) {
      var pos = utils.radInt(0, 5)
      while (pos == null || positions.includes(pos)) {
        pos = utils.radInt(0, 5)
      }
      positions.push(pos)
      const newBox = box.clone()
      newBox.position.set(lanes[pos][0], lanes[pos][1] - 1.5, lanes[pos][2])
      newBox.name = 'obstacle'
      obj.push(newBox)
      scene.add(newBox)
    }
    amt = utils.radInt(1, 3)

    for (let i = 0; i < amt; i++) {
      while (pos == null || positions.includes(pos)) {
        pos = utils.radInt(0, 5)
      }
      var newBanana = banana.clone()
      newBanana.name = 'banana'
      console.log(pos)
      newBanana.position.set(lanes[pos][0], lanes[pos][1], lanes[pos][2])
      obj.push(newBanana)
      scene.add(newBanana)
      bananaList.push(newBanana)
    }
  }

  function terrain() {
    var positions = []
    var amt = utils.radInt(0, 6)
    for (let i = 0; i < amt; i++) {
      var pos = utils.radInt(0, 5)
      while (pos == null || positions.includes(pos)) {
        pos = utils.radInt(0, 5)
      }
      var newTree = treeMap[utils.radInt(0, 11)].clone()
      newTree.name = 'tree'
      newTree.position.set(treePos[pos][0], treePos[pos][1], treePos[pos][2])
      obj.push(newTree)
      scene.add(newTree)
    }
    amt = utils.radInt(0, 2)
    for (let i = 0; i < amt; i++) {
      pos = utils.radInt(0, 5)
      while (pos == null || positions.includes(pos)) {
        pos = utils.radInt(0, 5)
      }
      var newRock = rockMap[0].clone()
      newRock.name = 'rock'
      newRock.position.set(treePos[pos][0], treePos[pos][1] - 1.5, treePos[pos][2] + 2)
      obj.push(newRock)
      scene.add(newRock)
    }
  }

  // function randCube(){
  //   var amt = utils.radInt(1,3)
  //   for (let i = 0; i<amt ; i++) {
  //     var cube = utils.createCube(colors[utils.radInt(0, 9)])
  //     cube.position.y = -1.5
  //       obj.push(cube)
  //       scene.add(cube)
  //   }
  // }
  // function randBanana(){
  //   var amt = utils.radInt(1,2)
  //   for (let i = 0; i<amt ; i++) {
  //       var pos = utils.radInt(0,2)
  //       var newBanana = banana.clone()
  //       newBanana.name = 'banana'
  //       newBanana.position.set(lanes[pos][0],lanes[pos][1],lanes[pos][2])
  //       obj.push(newBanana)
  //       scene.add(newBanana)
  //       bananaList.push(newBanana)
  //   }
  // }

  function ballAnimation(ball) {
    ball.rotation.x -= 0.05
    if (changing == 1) {
      if (ball.position.x != lanes[lane][0]) {
        if (ball.position.x < lanes[lane][0]) {
          ball.position.x += 0.5
          shib.position.x += 0.5
        }
        else
          {
            ball.position.x -= 0.5
            shib.position.x -= 0.5
          }
      } else {
        changing = 0
      }
    }
    if (jumping == 1) {
      delta = clock.getDelta();
      time += delta
      var jumpClock = time - jumpStartTime;
      ball.position.y = hmax * Math.sin((1 / (3 / 4)) * Math.PI * jumpClock)
      shib.position.y = hmax * Math.sin((1 / (3 / 4)) * Math.PI * jumpClock)
      if (jumpClock > 0.85) {
        jumping = 0;
        ball.position.y = 0
        shib.position.y = -3
      }
    }
  }

  function bananaAnimation(bananaList) {
    bananaList.forEach((b) => {
      b.rotation.y -= 0.005
    })
  }

  function collision(name, x, y, z, index, ball) {
    if (Math.abs(ball.position.x - x) < 3 && Math.abs(ball.position.y - y) < 3 && Math.abs(ball.position.z - z) < 3) {
      console.log(name)
      if (name == 'banana') {
        score++
        if (bananaSound.playing()) {
          const sec = bananaSound.seek()
          console.log(sec)
          if (sec <= 0.2)
            bananaSound.stop()
          bananaSound.play()
        } else {
          bananaSound.play()
        }
        return 2;
      }
      if (name == 'noSound') {
        return 1;
      }
      if (name == 'obstacle') {
        return 0;
      }
    }
  }

}