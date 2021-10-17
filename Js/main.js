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


var clock = new THREE.Clock();
var time = 0
var delta = 0
var speed = 0.2
var score = 0
const colors = randColorGen(10);
var lanes = [[-10,0,-100],[0,0,-100],[10,0,-100]] 



var changing = 0
var lane = 1
var jumping = 0
var press = 0
const hmax = 8
var gameover = 0
var jumpStartTime = 0

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
  ball = createBall(0xf9f9f9)
  scene.add(ball)
  randCube()
  
  function animate(){ 
    score++
    scoreHTML.innerHTML = ("Score: " + Math.floor(score / 10))
    if (speed <= 0.4)
      speed+=0.005
    obj.forEach((o, index, object)=>{
      collision(o.position.x,o.position.y,o.position.z)
      o.position.z += speed
      if(o.position.z >= 5) {
        scene.remove(o)
        object.splice(index, 1);
      } 
    })
    if(obj[obj.length-1].position.z >= - 80){
      randCube()
    } 
    if(!gameover){
      ballAnimation()
      renderer.render(scene,camera)
      requestAnimationFrame(animate);
    }
    else {
      x.removeEventListener("keydown", res);
      return
    }
  }
}

