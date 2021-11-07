import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r132/build/three.module.js';
import * as utils from './util.js'

main()

async function main(){
  const scoreHTML = document.querySelector("#score");
  const start = document.querySelector("#start")
  const scene = new THREE.Scene()

  scene.background = new THREE.Color(0x121212);

  const canvas = document.querySelector("#bg");

  const size = {
    w : window.innerWidth * 0.8 ,
    h : window.innerHeight * 0.8 
  }

  scene.add(new THREE.DirectionalLight(0xffffbb, 1));
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const banana = await utils.loadFBX('../assets/Banana3.fbx',1,1,1);

  const camera = new THREE.PerspectiveCamera(90, size.w / size.h,0.1,1000);
  camera.position.set(0, 20, 10);
  const pi = Math.PI;
  camera.rotation.y = 360 * (pi/180);
  camera.rotation.x = -30 * (pi/180);
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize( size.w , size.h);
  renderer.setPixelRatio(window.devicePixelRatio);

  var obj = []
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


  scoreHTML.innerHTML = ("Score: " + 0)
  start.addEventListener('click',(e)=> {
    console.log(banana)
    banana.position.set(-10,0,-50)
    scene.add(banana)
    console.log(scene)
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
    var ball = utils.createBall(0x007BC0)
    scene.add(ball)
    var road = utils.createRoad(0x557BC0)
    road.position.set(0, -5, -5)
    road.rotation.x = 270 * (pi/180);
    // road.rotation.z = 3 * (pi/180);
    scene.add(road)
    const light = new THREE.DirectionalLight( 0xffffff, 0.85 );
    light.position.set( 0, 5, 5 )
    scene.add( light );
    randCube()
    
    function animate(){ 
      // console.log(scene)
      // score++
      // scoreHTML.innerHTML = ("Score: " + Math.floor(score / 10))
      // if (speed <= 0.4)
      //   speed+=0.005
      // obj.forEach((o, index, object)=>{
      //   collision(o.position.x,o.position.y,o.position.z,ball)
      //   o.position.z += speed
      //   if(o.position.z >= 5) {
      //     scene.remove(o)
      //     object.splice(index, 1);
      //   } 
      // })
      // if(obj[obj.length-1].position.z >= - 80){
      //   randCube()
      // } 
      if(!gameover){
        ballAnimation(ball)
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
        var cube = utils.createCube(colors[utils.radInt(0,9)],lanes)
        obj.push(cube)
        scene.add(cube)
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

  function collision(x,y,z,ball){
    if (Math.abs(ball.position.x - x) < 3 && Math.abs(ball.position.y - y) < 3  && Math.abs(ball.position.z - z) < 3){
        gameover = 1;
    }
  }
}