function createScene() {

	// SCENE SETUP
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.8, 0.8, 1);
	scene.gravity = new BABYLON.Vector3(0, -0.0981, 0);
	scene.collisionsEnabled = true;
	scene.workerCollisions = true;

	// CAMERA
	var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(5, 0, 5), scene);
	camera.applyGravity = true;
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
	var miniMap = new MiniMap(100, 50, player, scene);

	// CREATE MAZE
	var maze = new Maze(width, height, startingPoint);

	// DRAW MAZE
	var mazeMesh = drawMaze(maze, scene);
	var mazeMap = drawMazeMap(mazeMesh, scene);

	// PLACE EXIT
	var exit = BABYLON.Mesh.CreateSphere("exit", 32, 5, scene, false);
	exit.material = new ExitMaterial(scene);
	exit.position = new BABYLON.Vector3(-5 + maze.width * 10 / 2, 0, 5 - maze.height * 10 / 2);
	exit.checkCollisions = true;
	// TODO add exit functionality

	// ADD ENEMIES
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

	shadowGenerator.getShadowMap().renderList.push(mazeMesh);
	shadowGenerator.getShadowMap().renderList.push(enemy);

	// DEBUG LAYER
	if(window.location.hash == '#debug') {
		scene.debugLayer.show();
	}

	return scene;
}
