import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/examples/jsm/controls/OrbitControls.js';
import * as utils from './util.js'

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

async function main(){
  
  const scoreHTML = document.querySelector("#score");
  const start = document.querySelector("#start")
  const scene = new THREE.Scene()

  scene.background = new THREE.Color(0xffffff);

  const canvas = document.querySelector("#bg");

  const size = {
    w : window.innerWidth * 0.8 ,
    h : window.innerHeight * 0.8 
  }

 
  const banana = await utils.loadGlTF('../assets/banana/banana.gltf',10,10,10);
  const camera = new THREE.PerspectiveCamera(90, size.w / size.h,0.1,1000);
  camera.position.set(20, 30, 15);
  const pi = Math.PI;
  camera.rotation.y = 360 * (pi/180);
  camera.rotation.x = -30 * (pi / 180);
  camera.rotation.z = -120 * (pi/180);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize( size.w , size.h);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  const uniforms = {
    topColor: { value: new THREE.Color(0x0077FF) },
    bottomColor: { value: new THREE.Color(0x89b2eb) },
    offset: { value: 33 },
    exponent: { value: 0.6 }
  };
  const skyGeo = new THREE.SphereBufferGeometry(1000, 0, 0);
  const skyMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: _VS,
      fragmentShader: _FS,
      side: THREE.BackSide,
  });
  

  var obj = []
  var bananaList = []
  var clock = new THREE.Clock();
  var time = 0
  var delta = 0
  var speed = 0.2
  var score = 0
  const colors = utils.randColorGen(10);
  var lanes = [[-10,0,-100],[0,0,-100],[10,0,-100]] 

  var changing = 0
  var lane = 1
  var jumping = 0
  var press = 0
  const hmax = 8
  var gameover = 0
  var jumpStartTime = 0
  renderer.render(scene,camera)

  const controls = new OrbitControls(camera, canvas);
  scoreHTML.innerHTML = ("Score: " + 0)
  start.addEventListener('click',(e)=> {
    gameloop()
  })

  function gameloop() {
    
    
    const x = document
    x.addEventListener('keydown', res)
    
    function res(e){
      if (press==0)
        animate()
      press++
      var key = e.code;
      cLane(key)
    }
    
    scoreHTML.innerHTML = ("Score: " + 0)
    while(scene.children.length > 0){ 
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
    scene.add(new THREE.Mesh(skyGeo, skyMat));

    // scene.add(banana)
    // console.log(scene)
    // console.log(banana)
    var ball = utils.createBall(0x007BC0)
    scene.add(ball)
    var road = utils.createRoad(0x557BC0)
    road.position.set(0, -3, -5)
    road.rotation.x = 270 * (pi/180);

    scene.add(road)
    const light = new THREE.SpotLight( 0xffffff );
    light.position.set( -3, 50, 0 )
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 100;
    scene.add( light );
    controls.target.set(0, 0, 0);
    controls.update();  
    randCube()
    console.log(scene)
    function animate(){ 
      score++
      scoreHTML.innerHTML = ("Score: " + Math.floor(score / 10))
      if (speed <= 0.4)
        speed+=0.005
      obj.forEach((o, index, object)=>{
        //collision(o.position.x,o.position.y,o.position.z,ball)
        o.position.z += speed
        if(o.position.z >= 5) {
          scene.remove(o)
          object.splice(index, 1);
        } 
      })
      if(obj[obj.length-1].position.z >= - 80){
        // randCube()
        randBanana()
      } 
      if(!gameover){
        ballAnimation(ball)
        bananaAnimation(bananaList);
        renderer.render(scene,camera)
        requestAnimationFrame(animate);
      }
      else {
        x.removeEventListener("keydown", res);
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


  function cLane(key){
    if(key == 'ArrowLeft'){
        changing = 1 
        if(lane != 0)
            lane -= 1
        
    }
    if(key == 'ArrowRight'){
        changing = 1 
        if(lane != 2)
            lane += 1
    }
    if(key == 'ArrowUp'){
        if(!jumping){
            changing = 1 
            jumping = 1
            delta = clock.getDelta();
            time += delta
            jumpStartTime = time
        }
        
    }
  }

  function randCube(){
    var amt = utils.radInt(1,3)
    for (let i = 0; i<amt ; i++) {
      var cube = utils.createCube(colors[utils.radInt(0, 9)], lanes)
      cube.position.y = -1.5
        obj.push(cube)
        scene.add(cube)
    }
  }
  function randBanana(){
    var amt = utils.radInt(1,2)
    for (let i = 0; i<amt ; i++) {
        var pos = utils.radInt(0,2)
        var newBanana = banana.clone()
        newBanana.position.set(lanes[pos][0],lanes[pos][1],lanes[pos][2])
        obj.push(newBanana)
        scene.add(newBanana)
        bananaList.push(newBanana)
    }
  }

  function ballAnimation(ball){
    ball.rotation.x -=0.05
    if(changing == 1){
        if(ball.position.x!=lanes[lane][0]){
            if(ball.position.x < lanes[lane][0])
                ball.position.x += 0.5
            else 
                ball.position.x -= 0.5
        }
        else {
            changing = 0
        }
    }
    if (jumping == 1){
        delta = clock.getDelta();
        time += delta
        var jumpClock = time - jumpStartTime;
        ball.position.y = hmax * Math.sin((1 / (3/4)) * Math.PI * jumpClock) 
        if (jumpClock > 0.75) {
            jumping = 0;
            ball.position.y = 0
        }
    }
  }

  function bananaAnimation(bananaList){
    bananaList.forEach((b,index,object)=>{
        b.rotation.y -=0.005
    })
    
  }

  function collision(x,y,z,ball){
    if (Math.abs(ball.position.x - x) < 3 && Math.abs(ball.position.y - y) < 3  && Math.abs(ball.position.z - z) < 3){
        gameover = 1;
    }
  }
}