function radInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createCube(color) { 
    const cube = new THREE.Mesh(
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.MeshBasicMaterial({ color: color })
    );
    cube.oldcolor = color
    cube.tag = false;
    pos = radInt(0,2);
    cube.position.set(lanes[pos][0],lanes[pos][1],lanes[pos][2])
    return cube;
};

function createBall(color) { 
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(3, 32, 32),
      new THREE.MeshPhongMaterial({ color: color })
    );
    sphere.position.set(0,0,-5)
    return sphere;
};

function randColorGen(i) {
    var arr = []
    for (x = 0; x < i; x ++){
        arr.push(Math.floor(Math.random()*16777215));
    }
    return arr;
}

function coupling(colors) { 
    let idx = radInt(0,9)
    sceneBuffer.push(createCube(colors[idx]), createCube(colors[idx]));
}

function resetTag(cubes) {
    for (const cube of cubes) {
        cube.tag = false
        // console.log(cube)
        cube.material.color.set(cube.oldcolor)
    }
}

function cLane(key){
    if(key == 'ArrowLeft'){
        changing = 1 
        lane -= 1
    }
    if(key == 'ArrowRight'){
        changing = 1 
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
    console.log(lane)
}

function randCube(){
    amt = radInt(1,3)
    for (i = 0; i<amt ; i++) {
        cube = createCube(colors)
        obj.push(cube)
        scene.add(cube)
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

function ballAnimation(){
    ball.rotation.x +=0.05
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

function collision(x,y,z){
    if (Math.abs(ball.position.x - x) < 3 && Math.abs(ball.position.y - y) < 3  && Math.abs(ball.position.z - z) < 3){
        console.log(x,y,z)
        console.log('dead')
        gameover = 1;
    }
}