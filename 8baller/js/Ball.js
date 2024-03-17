var Ball = function (x, y, z, name, color) {
  this.color = color || 0xcc0000; 
  this.texture = 'images/balls/' + name + '.png';

  this.mesh = this.createMesh(x,y,z);
  this.sphere = new THREE.Sphere(this.mesh.position, Ball.RADIUS); 
  scene.add(this.mesh);

  this.rigidBody = this.createBody(x,y,z);
  world.addBody(this.rigidBody);
  this.name = name;
  this.fallen = false;
};

Ball.RADIUS = 5.715 / 2; 
Ball.MASS = 0.170; 
Ball.contactMaterial = new CANNON.Material("ballMaterial");

Ball.envMapUrls = [
  'images/skybox1/px.png', 
  'images/skybox1/nx.png', 
  'images/skybox1/py.png', 
  'images/skybox1/ny.png', 
  'images/skybox1/pz.png', 
  'images/skybox1/nz.png' 
];

var cubeTextureLoader = new THREE.CubeTextureLoader();
Ball.envMap = cubeTextureLoader.load(Ball.envMapUrls, function (tex) {
  Ball.envMap = tex;
});

Ball.prototype.onEnterHole = function () {
  this.rigidBody.velocity.set(0, 0, 0);
  this.rigidBody.angularVelocity.set(0, 0, 0);
  world.removeBody(this.rigidBody);
  eightballgame.coloredBallEnteredHole(this.name);
};

Ball.prototype.createBody = function (x,y,z) {
  var sphereBody = new CANNON.Body({
    mass: Ball.MASS,
    position: new CANNON.Vec3(x,y,z), 
    shape: new CANNON.Sphere(Ball.RADIUS),
    material: Ball.contactMaterial
  });

  sphereBody.linearDamping = sphereBody.angularDamping = 0.5;
  sphereBody.allowSleep = true;

  sphereBody.sleepSpeedLimit = 0.5; 
  sphereBody.sleepTimeLimit = 0.1; 

  return sphereBody;
};

Ball.prototype.createMesh = function (x,y,z) {
  var geometry = new THREE.SphereGeometry(Ball.RADIUS, 16, 16);
  var material = new THREE.MeshPhongMaterial({
    specular: 0xffffff,
    shininess: 140,
    reflectivity: 0.1,
    envMap: Ball.envMap,
    combine: THREE.AddOperation,
    shading: THREE.SmoothShading
  });

  if (this.texture) {
    textureLoader.load(this.texture, function (tex) {
      material.map = tex;
      material.needsUpdate = true;
    });
  } else {
    material.color = new THREE.Color(this.color);
  }

  var sphere = new THREE.Mesh(geometry, material);

  sphere.position.set(x,y,z);

  sphere.castShadow = true;
  sphere.receiveShadow = true;

  return sphere;
};

Ball.prototype.tick = function (dt) {
  this.mesh.position.copy(this.rigidBody.position);
  this.mesh.quaternion.copy(this.rigidBody.quaternion);

  if (this.rigidBody.position.y < -4 * Ball.RADIUS && !this.fallen) {
    this.fallen = true;
    this.onEnterHole();
  }
};
