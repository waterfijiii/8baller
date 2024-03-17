var LongWall = function (x, y, z, width) {
  var height = 2;
  var thickness = 2.5;

  this.body = new CANNON.Body({
    mass: 0, 
    material: Table.wallContactMaterial
  });

  var vertices1 = [
    0,     height, -2 * thickness, 
    0,     height,  0,             
    -2.8,  height, -2 * thickness, 
    0,    -height, -2 * thickness, 
    0,    -height,  0,             
    -2.8, -height, -2 * thickness  
  ];

  //corner of table
  var vertices2 = [
    0,  height, -2 * thickness,
    0,  height,  0,             
    8,  height, -2 * thickness, 
    0, -height, -2 * thickness, 
    0, -height,  0,             
    8, -height, -2 * thickness  
  ];

  var indices = [
    0, 1, 2,
    3, 4, 5,
    5, 0, 2,
    5, 3, 0,
    3, 4, 1,
    3, 1, 0,
    4, 5, 1,
    5, 2, 1
  ];
  var trimeshShape1 = new CANNON.Trimesh(vertices1, indices);
  var trimeshShape2 = new CANNON.Trimesh(vertices2, indices);

  this.body.position.set(x,y,z);
  this.body.addShape(trimeshShape1, new CANNON.Vec3(-width, 0, 0));
  this.body.addShape(trimeshShape2, new CANNON.Vec3( width, 0, 0));

  var boxshape = new CANNON.Box(new CANNON.Vec3(width, height, thickness));

  this.body.addShape(boxshape, new CANNON.Vec3(0 ,0, -thickness));
};
