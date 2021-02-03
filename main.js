(function e () {

  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load( 'sky/front.png');
  let texture_bk = new THREE.TextureLoader().load( 'sky/back.png');
  let texture_up = new THREE.TextureLoader().load( 'sky/top.png');
  let texture_dn = new THREE.TextureLoader().load( 'sky/bottom.png');
  let texture_rt = new THREE.TextureLoader().load( 'sky/right.png');
  let texture_lf = new THREE.TextureLoader().load( 'sky/left.png');
    
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));


  for (let i = 0; i < 6; i++)
     materialArray[i].side = THREE.BackSide;
  let skyboxGeo = new THREE.BoxGeometry( 1000, 1000, 1000);
  let skybox = new THREE.Mesh( skyboxGeo, materialArray );
    

 

  

  const paddleStates = {
    MOVING_LEFT: 0,
    MOVING_RIGHT: 1,
    STATIONARY: 2
  };
  // Hard-coded "settings"
  const settings = {
    //backgroundColor: 0x00ffff,
    paddleSpeed: 0.3,
    ballSpeed: 0.2
  };

  const levelBounds = {
    top: -35.0,
    right: 20.0,
    left: -20.0,
    bottom: 0.0
  };

  const bricks = {
    rows: 9,
    columns: 17,
    distanceFromEdges: 0.2,
    distanceFromTop: 10.0,
    spacing: 0.7,
    color: 0xffffff,
    texture: new THREE.TextureLoader().load('buildings-high-rise-textures-photo-texture-of_640v640.jpg'),
    depth: 3
  };
  let paddle, ball;
  let earth;

  function createMeshAtPosition(meshProperties, position) {
    const mesh = new THREE.Mesh(meshProperties.geometry, meshProperties.material);
    mesh.position.copy(position);

    return mesh;
  }

  function createFullScreenRenderer(elementId, settings) {
    const renderer = new THREE.WebGLRenderer({
      canvas: document.getElementById(elementId)
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(settings.backgroundColor);
    return renderer;
  }

  function createCamera() {
    const camera = new THREE.PerspectiveCamera(
      90,
      window.innerWidth / window.innerHeight,
      0.1,
      3000);
    camera.position.set(0, 10, 0.0);
    camera.lookAt(0.0, 0.0, -10.0);
    return camera;
  }

  

  function makeResizeCallback(camera, renderer) {
    return function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
  }

  function makeKeyDownCallback(paddle, speed) {
    return function(event) {
      if (paddle.state === paddleStates.STATIONARY) {
      
        
        if (event.key === "ArrowLeft") {
          paddle.velocity.x = -speed;
          paddle.state = paddleStates.MOVING_LEFT;

        } else if (event.key === "ArrowRight") {
          paddle.velocity.x = speed;
          paddle.state = paddleStates.MOVING_RIGHT;
        }
      }
    };
  }

  function makeKeyUpCallback(paddle) {
    return function(event) {
      if (paddle.state === paddleStates.MOVING_LEFT && event.key === "ArrowLeft" ||
        paddle.state === paddleStates.MOVING_RIGHT && event.key === "ArrowRight") {
        paddle.velocity.x = 0.0;
        paddle.state = paddleStates.STATIONARY;
      }
    };
  }
  const updatePosition = gameObject => gameObject.mesh.position.add(gameObject.velocity);

  

  function resolveBallBlockCollision(blockMesh, blockProperties, callback) {
    if (ShouldFlipBallZDirection(blockMesh, blockProperties)) {
      ball.velocity.z *= -1.0;
      callback();
      return true;
    }

    if (ShouldFlipBallXDirection(blockMesh, blockProperties)) {
      ball.velocity.x *= -1.0;
      callback();
      return true;
    }

    
    return false;
  }
  
  function ShouldFlipBallZDirection(blockMesh, blockProperties) {
    return ((ball.mesh.position.z + ball.radius > blockMesh.position.z - blockProperties.height / 2 &&
          (ball.mesh.position.z < blockMesh.position.z)) &&
        (ball.mesh.position.x > blockMesh.position.x - blockProperties.width / 2) &&
        (ball.mesh.position.x < blockMesh.position.x + blockProperties.width / 2) &&
        (ball.velocity.z > 0.0)) ||
      ((ball.mesh.position.z - ball.radius < blockMesh.position.z + blockProperties.height / 2 &&
          (ball.mesh.position.z > blockMesh.position.z)) &&
        (ball.mesh.position.x > blockMesh.position.x - blockProperties.width / 2) &&
        (ball.mesh.position.x < blockMesh.position.x + blockProperties.width / 2) &&
        (ball.velocity.z < 0.0));
  }

  function ShouldFlipBallXDirection(blockMesh, blockProperties) {
    return ((ball.mesh.position.x + ball.radius > blockMesh.position.x - blockProperties.width / 2 &&
          (ball.mesh.position.x < blockMesh.position.x)) &&
        (ball.mesh.position.z > blockMesh.position.z - blockProperties.height / 2) &&
        (ball.mesh.position.z < blockMesh.position.z + blockProperties.height / 2) &&
        (ball.velocity.x > 0.0)) ||
      ((ball.mesh.position.x - ball.radius < blockMesh.position.x + blockProperties.width / 2 &&
          (ball.mesh.position.x > blockMesh.position.x)) &&
        (ball.mesh.position.z > blockMesh.position.z - blockProperties.height / 2) &&
        (ball.mesh.position.z < blockMesh.position.z + blockProperties.height / 2) &&
        (ball.velocity.x < 0.0));
  }




  function main() {
    paddle = {
      width: 4,
      height: 1,
      depth: 1,
      color: 0xffffff,
      texture: new THREE.TextureLoader().load('warning.jpg'),
      velocity: new THREE.Vector3(0.0, 0.0, 0.0),
      state: paddleStates.STATIONARY,
      startPosition: new THREE.Vector3(0.0, 0.0, -4.0)
    };



    ball = {
      radius: 0.5,
      color: 0xffff00,
      //texture: new THREE.TextureLoader().load("earth.jpg"),
      texture: new THREE.TextureLoader().load('earth.jpg'),
      velocity: new THREE.Vector3(settings.ballSpeed, 0.0, -settings.ballSpeed),
      startPosition: new THREE.Vector3(0.0, 0.0, -9.0),
      segments: {
        width: 16,
        height: 16
      }
    };

    const lights = [
      new THREE.AmbientLight(0xff00ff, 0.5),
      new THREE.PointLight(0xffff00, 0.5)
    ];



    // Game

    // Создание сцены
    const renderer = createFullScreenRenderer("game-window", settings);

    const scene = new THREE.Scene();
    scene.add( skybox );

    // Создание камеры и добавления ее на сцену
    const camera = createCamera();
    scene.add(camera);

    // OrbitControl
    //let controls = new THREE.OrbitControls(camera);
   //controls.addEventListener('click', renderer);

    paddle.mesh = createMeshAtPosition({
      geometry: new THREE.BoxGeometry(paddle.width, paddle.depth, paddle.height),
      material: new THREE.MeshBasicMaterial({
        // color: paddle.color,
        map:paddle.texture
      })
    }, paddle.startPosition);
    scene.add(paddle.mesh);

      THREE.TextureLoader()
    
    ball.mesh = createMeshAtPosition({
      geometry: new THREE.SphereGeometry(ball.radius, ball.segments.width, ball.segments.height),
      material: new THREE.MeshBasicMaterial({
        // color: paddle.color,
        map:ball.texture
      })
      
      
    }, ball.startPosition);
    scene.add(ball.mesh);

    lights.forEach(light => scene.add(light));

    /*bricks.mesh = createMeshAtPosition({
      geometry: new THREE.SphereGeometry(bricks.width, bricks.depth, bricks.height),
      material: new THREE.MeshBasicMaterial({
        // color: paddle.color,
        map:paddle.texture
      })
    })*/
    const levelWidth = levelBounds.right - levelBounds.left;
    const brick = {
      width: (levelWidth - 2 * bricks.distanceFromEdges + bricks.spacing * (1 - bricks.columns)) / bricks.columns,
      height: (bricks.distanceFromTop - bricks.distanceFromEdges) / bricks.rows,
      depth: bricks.depth
    };


    ////////////////////////POSOTION OF BRICKS

    const visibleBricks = [];
    for (let row = 0; row < bricks.rows; row += 1) {
      for (let column = 0; column < bricks.columns; column += 1) {
        if(column % 2 == 0){
          //visibleBricks[] = 0x33ff00;
          //console.log(123);
          
        }
        let position = new THREE.Vector3(
          levelBounds.left + bricks.distanceFromEdges + column * (brick.width + bricks.spacing) + 1 * brick.width,
          0.0,
          levelBounds.top + bricks.distanceFromEdges + row * (brick.height + bricks.spacing) + 1 * brick.height);
        const mesh = createMeshAtPosition({
          geometry: new THREE.BoxGeometry(brick.width, brick.depth, brick.height),
          
          material: new THREE.MeshBasicMaterial({
            map:bricks.texture
          })
        }, position);
        const name = `${row},${column}`;
        mesh.name = name;
        scene.add(mesh);
        visibleBricks.push({
          position: position,
          name: name
        });
      }
    }

    let countBricks = document.querySelector('.countBricks>span');
    countBricks.innerHTML = visibleBricks.length;

    requestAnimationFrame(render);


    ////////////////////LIGHT(OFF)

    const light2 = new THREE.PointLight( 0x000061, 100000000, 100000000 );
    light2.position.set( 5, 5, -10 );
    //scene.add( light2 );
      

    let lifes = 3;
    

    scene.add( skybox ); 






    /////////////////////KOLIZJA
    function render() {
    /*
      container = document.createElement( 'div' );
      container.appendChild( renderer.domElement );

      container = document.getElementById( 'mycustomdiv' );*/
      //PointLight(255,0,0, 0, 10, 0);
      

      // update paddle position
      // ball-level collision
      if ((ball.mesh.position.z - ball.radius < levelBounds.top && ball.velocity.z < 0.0)) {
        ball.velocity.z *= -1.0;
      }
      if(ball.mesh.position.z + ball.radius > levelBounds.bottom && ball.velocity.z > 0.0)
      {

        alert("GAME OVER");
        location.reload();
        
      }

      
      //console.log("Y - "+paddle.velocity.y);

      if(paddle.mesh.position.x > levelBounds.right-5)
      {
        paddle.mesh.position.x = levelBounds.right-5;
        //console.log("X - "+paddle.mesh.position.x);
      }
      
      if(paddle.mesh.position.x < levelBounds.left+5)
      {
        paddle.mesh.position.x = levelBounds.left+5;
        //console.log("X - "+paddle.mesh.position.x);
      }
      

      if ((ball.mesh.position.x + ball.radius > levelBounds.right && ball.velocity.x > 0.0) ||
        (ball.mesh.position.x - ball.radius < levelBounds.left && ball.velocity.x < 0.0)) {
        ball.velocity.x *= -1.0;
      }

      resolveBallBlockCollision(paddle.mesh, paddle, function() {});

      // ball-brick collision
      visibleBricks.some(function(visibleBrick, i) {
        return resolveBallBlockCollision(visibleBrick, brick, function() {
          scene.remove(scene.getObjectByName(visibleBrick.name));
          
          visibleBricks.splice(i, 1);

          countBricks.innerHTML = visibleBricks.length;
          
        });
      });

    

      updatePosition(paddle);
      updatePosition(ball);
      // Инициализация рендера
      renderer.render(scene, camera);

      // Подщет кадров
      requestAnimationFrame(render);
    }

    window.addEventListener("resize", makeResizeCallback(camera, renderer), false);
    window.addEventListener("keydown", makeKeyDownCallback(paddle, settings.paddleSpeed), false);
    window.addEventListener("keyup", makeKeyUpCallback(paddle), false);
  }

  window.addEventListener("load", main, false);

  

}

)();



/////////////////////////MENU
const closeBtnWindow = document.querySelector('.closeBtn');
const controlsWindow = document.querySelector('.controls');
const openBtnWindow= document.querySelector('.helpBtn');
const stopBallBtn = document.querySelector('.stopBall');

function close(){
  controlsWindow.style.display = 'none';
  darkWrapper.style.display = 'none';
}



function showContolsWindow(){
  controlsWindow.style.display = 'block';
  darkWrapper.style.display = 'block';
}

function pauseGame(){
  alert('Game Paused');
}

closeBtnWindow.addEventListener('click', close);

openBtnWindow.addEventListener('click', showContolsWindow);

stopBallBtn.addEventListener('click',pauseGame);