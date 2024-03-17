var WIDTH = 960,
  HEIGHT = 480;

var renderer, scene, camera, game, controls, lightsConfig, world, gui, eightballgame;
var debug = false;
var progressBar;

var stats = new Stats();
stats.setMode(2);

var textureLoader = new THREE.TextureLoader();
THREE.DefaultLoadingManager.onProgress = function (item, loaded, total) {
  if (typeof progressBar !== 'undefined') {
    progressBar.style.width = (loaded / total * 100) + '%';
  }

  if (loaded == total && total > 7) {
    var progBarDiv = document.getElementById('loading');
    progBarDiv.parentNode.removeChild(progBarDiv);

    gui.show(document.getElementById('mainMenu'));

    var canvasContainer = document.getElementById('canvas');
    canvasContainer.appendChild(renderer.domElement);
    draw();
  }
};

var VIEW_ANGLE = 60,
  ASPECT = WIDTH / HEIGHT,
  NEAR = 50,
  FAR = 1000;

var clock = new THREE.Clock();

function onLoad() {
  gui = new GameGui();

  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.up = new THREE.Vector3(0, 1, 0);
  camera.position.set(-170, 70, 0);

  scene = new THREE.Scene();
  scene.add(camera);

  // create renderer
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  renderer.shadowMap.enabled = true;
  renderer.shadowMapSoft = true;
  renderer.setClearColor(0x262626, 1);

  world = createPhysicsWorld();
  game = new Game();
  setCollisionBehaviour();
  // Configure lighting:
  addLights();

  // MOUSE controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  controls.enableZoom = true;
  controls.enablePan = true;

  controls.minDistance = 35;
  controls.maxDistance = 165;
  controls.maxPolarAngle = 1 * Math.PI;

  camera.position.set(-170, 70, 0);

  renderer.setClearColor(0x262626, 1);
}

function createPhysicsWorld() {
  w = new CANNON.World();
  w.gravity.set(0, 30 * -9.82, 0);

  w.solver.iterations = 10;
  w.solver.tolerance = 0;

  w.allowSleep = false;

  w.fixedTimeStep = 1.0 / 60.0;

  return w;
}

function setCollisionBehaviour() {
  world.defaultContactMaterial.friction = 0.1;
  world.defaultContactMaterial.restitution = 0.85;

  var ball_floor = new CANNON.ContactMaterial(
    Ball.contactMaterial,
    Table.floorContactMaterial,
    { friction: 0.7, restitution: 0.1 }
  );

  var ball_wall = new CANNON.ContactMaterial(
    Ball.contactMaterial,
    Table.wallContactMaterial,
    { friction: 0.5, restitution: 0.9 }
  );

  world.addContactMaterial(ball_floor);
  world.addContactMaterial(ball_wall);
}

function draw() {
  stats.begin();

  controls.target.copy(game.balls[0].mesh.position);
  controls.update();

  world.step(w.fixedTimeStep);

  var dt = clock.getDelta();
  game.tick(dt);

  stats.end();
  requestAnimationFrame(draw);
  renderer.render(scene, camera);
}

function addLights() {
  var light = new THREE.AmbientLight(0x0d0d0d);
  scene.add(light);
  var tableLight1 = new TableLight(Table.LEN_X / 4, 150, 0);
  var tableLight2 = new TableLight(-Table.LEN_X / 4, 150, 0);
}

// Start the onLoad function when the window loads
window.onload = onLoad;

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
