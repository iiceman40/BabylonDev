function createScene() {

	// This creates a basic Babylon Scene object (non-mesh)
	var scene = new BABYLON.Scene(engine);
	scene.gravity = new BABYLON.Vector3(0, -0.0981, 0);
	scene.collisionsEnabled = true;
	scene.workerCollisions = true;

	// set scene background color to black
	scene.clearColor = new BABYLON.Color3(0.8, 0.8, 1);

	// This creates and positions a free camera (non-mesh)
	//var camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 5 * 2, 150, new BABYLON.Vector3(0, 50, 0), scene);

	var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(5, 50.1, 5), scene);
	camera.applyGravity = true;
	camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
	camera.checkCollisions = true;
	camera.speed = 0.6;

	camera.layerMask = 2; // 010 in binary
	scene.activeCameras.push(camera);
	scene.cameraToUseForPointers = camera;

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);




	var player = camera;

	var miniMap = new MiniMap(width, height, player, scene);

	// crate a maze
	var maze = initMaze(width, height, startingPoint);

	// create maze representation
	var mazeOuterBox = BABYLON.Mesh.CreateBox('mazeOuterBox', 1, scene);
	mazeOuterBox.scaling.x = (maze.width + 1) * 10;
	mazeOuterBox.scaling.z = (maze.height + 1) * 10;
	mazeOuterBox.scaling.y = 10;

	// materials
	var wallMaterial = new WallMaterial(scene);
	var groundMaterial = new GroundMaterial(maze, scene);

	var connectorSize = 1;
	var connectorOffset = 5;
	var connectors = [];
	var boxes = [];

	// display maze
	for (y = 0; y < maze.height; y++) {
		for (x = 0; x < maze.width; x++) {
			var cell = maze.map[y][x];

			var posX = (x - maze.width/2 + 0.5) * 10;
			var posZ = (y - maze.height/2 + 0.5) * 10;

			var box = BABYLON.Mesh.CreateBox('mazeCell', 8, scene);
			box.scaling.y = 2;
			box.isVisible = false;
			box.position.x = posX;
			box.position.z = posZ;
			box.position.y = 1.5;
			boxes.push(box);

			// connectors
			if(!cell.walls['N']){
				var connectorN = BABYLON.Mesh.CreateBox('connector', connectorSize, scene);
				connectorN.position = new BABYLON.Vector3(posX, 0, posZ - connectorOffset);
				connectorN.scaling.x = 5;
				connectorN.scaling.y = 5;
				connectorN.scaling.z = 2;
				connectors.push(connectorN);
			}
			if(!cell.walls['S']){
				var connectorS = BABYLON.Mesh.CreateBox('connector', connectorSize, scene);
				connectorS.position = new BABYLON.Vector3(posX, 0, posZ + connectorOffset);
				connectorS.scaling.x = 5;
				connectorS.scaling.y = 5;
				connectorS.scaling.z = 2;
				connectors.push(connectorS);
			}
			if(!cell.walls['W']){
				var connectorW = BABYLON.Mesh.CreateBox('connector', connectorSize, scene);
				connectorW.position = new BABYLON.Vector3(posX - connectorOffset, 0, posZ);
				connectorW.scaling.x = 2;
				connectorW.scaling.y = 5;
				connectorW.scaling.z = 5;
				connectors.push(connectorW);
			}
			if(!cell.walls['E']){
				var connectorE = BABYLON.Mesh.CreateBox('connector', connectorSize, scene);
				connectorE.position = new BABYLON.Vector3(posX + connectorOffset, 0, posZ);
				connectorE.scaling.x = 2;
				connectorE.scaling.y = 5;
				connectorE.scaling.z = 5;
				connectors.push(connectorE);
			}
		}
	}

	// merge all connectors to a track mesh
	var boxesMesh = BABYLON.Mesh.MergeMeshes(boxes, true);

	var outerBoxCSG = BABYLON.CSG.FromMesh(mazeOuterBox);
	var carvedBoxesCSG = BABYLON.CSG.FromMesh(boxesMesh);
	var subCSG = outerBoxCSG.subtract(carvedBoxesCSG);
	var mazeMesh = subCSG.toMesh("csg", wallMaterial, scene);
	mazeMesh.position = new BABYLON.Vector3(0, 0, 0);

	mazeOuterBox.dispose();

	var mazeMeshOuterBox = BABYLON.CSG.FromMesh(mazeMesh);
	var connectorsMesh = BABYLON.Mesh.MergeMeshes(connectors, true);
	var carvedConnectorsCSG = BABYLON.CSG.FromMesh(connectorsMesh);
	var subCSG2 = mazeMeshOuterBox.subtract(carvedConnectorsCSG);
	var mazeMeshFinal = subCSG2.toMesh("csg", wallMaterial, scene);
	mazeMeshFinal.position = new BABYLON.Vector3(0, 50, 0);
	mazeMeshFinal.checkCollisions = true;

	// show doors/connectors on mini map
	connectorsMesh.position.y = 55;
	connectorsMesh.layerMask = 1;
	connectorsMesh.visibility = 0.7;
	connectorsMesh.material = new DoorMaterial(scene);

	var ground = BABYLON.Mesh.CreateGround("ground1", maze.width * 10, maze.height * 10, 10, scene);
	ground.material = groundMaterial;
	ground.position.y = 48;
	ground.checkCollisions = true;
	ground.receiveShadows = true;


	// place exit
	var exit = BABYLON.Mesh.CreateSphere("exit", 32, 5, scene, false);
	exit.material = new ExitMaterial(scene);
	exit.position = new BABYLON.Vector3(-5 + maze.width * 10 / 2, 50, 5 - maze.height * 10 / 2);
	exit.checkCollisions = true;

	// TODO add exit functionality



	// enemies
	// TODO enemy movement
	var enemy = new Enemy(maze, player, scene);


	// LIGHTS AND SHADOW
	var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	hemiLight.intensity = 0.3;

	var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0.3, -1, 0.1), scene);
	light1.intensity = 0.7;

	var shadowGenerator = new BABYLON.ShadowGenerator(1024, light1);
	shadowGenerator.useBlurVarianceShadowMap = true;
	shadowGenerator.blurScale = 1.5;
	shadowGenerator.setTransparencyShadow(true);
	//shadowGenerator.blurBoxOffset = 5;

	shadowGenerator.getShadowMap().renderList.push(mazeMeshFinal);
	shadowGenerator.getShadowMap().renderList.push(enemy);


	if(window.location.hash == '#debug') {
		scene.debugLayer.show();
	}

	return scene;
}
