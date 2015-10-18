function createScene() {

	// SCENE SETUP
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.8, 0.8, 1);
	scene.collisionsEnabled = true;
	scene.workerCollisions = true;

	// CAMERA
	var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(10 - width * 20 / 2, -10 + height * 20 / 2, -10 + depth * 20 / 2), scene);
	//camera.applyGravity = true;
	camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
	camera.checkCollisions = true;
	camera.speed = 0.5;
	camera.layerMask = 2; // 010 in binary
	camera.attachControl(canvas, true);

	scene.activeCameras.push(camera);
	scene.cameraToUseForPointers = camera;


	// the camera acts as the player
	var player = camera;

	// CREATE MINI MAP
	var playerOnMiniMap = new MiniMap(100, 56, player, scene);

	// CREATE MAZE
	var maze = new Maze(width, height, depth, startingPoint);

	// DRAW MAZE
	var mazeMesh = drawMaze(maze, scene);

	// PLACE EXIT
	var exit = BABYLON.Mesh.CreateTorus("exit", 3, 0.5, 64, scene, false);
	exit.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
	exit.material = new ExitMaterial(scene);
	exit.rotation.x = Math.PI/2;
	exit.position = new BABYLON.Vector3(-10 + maze.width * 20 / 2, 10 - maze.height * 20 / 2, 10 - maze.depth * 20 / 2);

	var exitPortal = BABYLON.MeshBuilder.CreateDisc("exitPortal", {radius: 1.5, tessellation: 32}, scene);
	exitPortal.rotation.x = Math.PI/2;
	exitPortal.bakeCurrentTransformIntoVertices();
	exitPortal.material = new ExitPortalMaterial(scene);
	exitPortal.parent = exit;

	var exitLight = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 0), scene);
	exitLight.diffuse = new BABYLON.Color3(0.5, 0, 0.5);
	exitLight.intensity = 0.8;
	exitLight.range = 15;
	exitLight.position = exit.position;

	var exitFound = false;
	setTimeout(function(){
		scene.registerBeforeRender(function () {
			if(!exitFound && exit.intersectsMesh(playerOnMiniMap, true)){
				exitFound = true;
				camera.detachControl(canvas);
				alert('Exit reached!');
			}
		});
	}, 100);

	// ADD ENEMIES
	// TODO enemy movement - chase player? dodge?
	var enemy = new Enemy(maze, player, scene);

	// LIGHTS AND SHADOW
	var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	hemiLight.intensity = 0.05;

	//var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0.3, -1, 0.1), scene);
	//light1.intensity = 0.1;

	var playerLight1 = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0), 1.3, 2, scene);
	playerLight1.intensity = 0.5;
	playerLight1.range = 35;

	scene.registerBeforeRender(function () {
		playerLight1.position = player.position;
		playerLight1.direction = player.getTarget().subtract(player.position);
	});

	// DEBUG LAYER
	if(window.location.hash == '#debug') {
		scene.debugLayer.show();
	}

	return scene;
}
