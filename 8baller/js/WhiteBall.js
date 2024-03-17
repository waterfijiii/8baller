var WhiteBall = function (x, y, z) {
  this.color = 0xffffff;
  this.defaultPosition = new CANNON.Vec3(-Table.LEN_X / 4, Ball.RADIUS, 0);
  Ball.call(
    this,
    this.defaultPosition.x,
    this.defaultPosition.y,
    this.defaultPosition.z,
    'whiteball',
    this.color
  );

  this.forward = new THREE.Vector3(1, 0, 0);
  this.forwardLine = this.createForwardLine();
  scene.add(this.forwardLine);

  this.dot = this.createIntersectionDot();
  scene.add(this.dot);
};

WhiteBall.prototype = Object.create(Ball.prototype);
WhiteBall.prototype.constructor = WhiteBall;
WhiteBall.prototype.hitForward = function (strength) {
  this.rigidBody.wakeUp();
  var ballPoint = new CANNON.Vec3();
  ballPoint.copy(this.rigidBody.position);

  var vec = new CANNON.Vec3();
  vec.copy(this.forward);

  vec.normalize();
  vec.scale(Ball.RADIUS, vec);
  ballPoint.vsub(vec, ballPoint);

  var force = new CANNON.Vec3();
  force.copy(this.forward.normalize());
  force.scale(strength, force);
  this.rigidBody.applyImpulse(force, ballPoint);
};

WhiteBall.prototype.onEnterHole = function () {
  this.rigidBody.velocity = new CANNON.Vec3(0);
  this.rigidBody.angularVelocity = new CANNON.Vec3(0);
  this.rigidBody.position.copy(this.defaultPosition);
  eightballgame.whiteBallEnteredHole();
};

WhiteBall.prototype.tick = function (dt) {
  Ball.prototype.tick.apply(this, arguments);

  if (this.rigidBody.sleepState == CANNON.Body.SLEEPING) {
    if (!this.forwardLine.visible) {
      this.forwardLine.visible = true;
    }
    if (!this.dot.visible) {
      this.dot.visible = true;
    }
    this.updateGuideLine();
    this.updateIntersectionDot();
  } else {
    if (this.forwardLine.visible) {
      this.forwardLine.visible = false;
    }
    if (this.dot.visible) {
      this.dot.visible = false;
    }
  }
};

WhiteBall.prototype.createIntersectionDot = function () {
  var geometry = new THREE.SphereGeometry(1, 4, 4);
  var material = new THREE.MeshBasicMaterial({opacity: 0.5, transparent: true, color: 0xffff00});
  var sphere = new THREE.Mesh(geometry, material);

  return sphere;
};
WhiteBall.prototype.updateIntersectionDot = function () {
  this.dot.position.copy(this.intersectionPoint);
};

WhiteBall.prototype.updateGuideLine = function () {
  var angle = controls.getAzimuthalAngle() + Math.PI / 2;
  this.forward.set(Math.cos(angle), 0, -Math.sin(angle));

  this.forwardLine.position.copy(this.mesh.position);

  this.forwardLine.rotation.y = angle;
  this.forward.normalize();

  var distances = [];
  for (var i = 1; i < game.balls.length; i++) {
    distances.push({
      index: i,
      dist: Math.abs(this.mesh.position.distanceTo(game.balls[i].mesh.position))
    });
  }

  distances.sort(function (a, b) { return a.dist - b.dist; });

  var intersectingBallIndex = -1;
  for (var j = 0; j < distances.length; j++) {
    var ballIndex = distances[j].index;
    var curBall = game.balls[ballIndex];
    if (this.forwardLine.ray.isIntersectionSphere(curBall.sphere)) {
      intersectingBallIndex = ballIndex;
      break;
    }
  }

  if (intersectingBallIndex == -1) {
    this.intersectionPoint = this.forwardLine.ray.intersectBox(this.forwardLine.box);
  } else {
    this.intersectionPoint = this.forwardLine.ray.intersectSphere(game.balls[intersectingBallIndex].sphere);
  }

  var distance = Math.sqrt(this.mesh.position.distanceToSquared(this.intersectionPoint));

  this.forwardLine.geometry.vertices[1].x = distance;
  this.forwardLine.geometry.verticesNeedUpdate = true;
};

WhiteBall.prototype.createForwardLine = function () {
  var lineGeometry = new THREE.Geometry();
  var vertArray = lineGeometry.vertices;

  vertArray.push(new THREE.Vector3(0, 0, 0));
  vertArray.push(new THREE.Vector3(85, 0, 0));
  lineGeometry.computeLineDistances();
  var lineMaterial = new THREE.LineDashedMaterial({ color: 0xdddddd, dashSize: 4, gapSize: 2 });
  var line = new THREE.Line(lineGeometry, lineMaterial);
  line.position.copy(new THREE.Vector3(100, 100, 100)); 
  line.box = new THREE.Box3(
    new THREE.Vector3(-Table.LEN_X / 2, 0,               -Table.LEN_Z / 2),
    new THREE.Vector3( Table.LEN_X / 2, 2 * Ball.RADIUS,  Table.LEN_Z / 2)
  );

  line.ray = new THREE.Ray(this.mesh.position, this.forward);

  return line;
};
