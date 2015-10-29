function createScene() {
	var enemies = [];
	// TODO create a Game Class to store all information needed and just hand the Game Object to important functions

	// SCENE SETUP
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.8, 0.8, 1);
	scene.collisionsEnabled = true;
	scene.workerCollisions = true;

	// CREATE MAZE
	var maze = new Maze(width, height, depth, startingPoint);

	// DRAW MAZE
	var mazeMesh = drawMaze(maze, scene);

	// INIT SOUNDS
	var sounds = new Sounds(scene); // TODO check if all are ready to play?

	// MESSAGES
	var availableMessages = [
		new Message("You are doing really great. <br/> <br/> Fun fact: <br/> <br/> A lot of people don't undestand sarcasm!", null),
		new Message("Hey, what's up, buttercup?", null),
		new Message("Get out of my head!", null)
	];

	// CAMERA/PLAYER
	var player = new Player(mazeMesh, getCellPosition(width - 1, height - 1, 0, maze, spacing), sounds, enemies, scene);
	initPointerLock(canvas, player);

	// CREATE MINI MAP
	var miniMap = new MiniMap(100, 100, maze, player, scene);
	player.miniMap = miniMap;

	// PLACE EXIT
	maze.exit = new Exit(new BABYLON.Vector3(0, 0, depth - 1), maze, miniMap.playerOnMiniMap, mazeMesh, player, scene);

	// LIGHTS AND SHADOW
	var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	hemiLight.intensity = 0.05;
	//var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0.3, -1, 0.1), scene);
	//light1.intensity = 0.1;

	var shadowGenerator = new BABYLON.ShadowGenerator(1024, player.flashlight);
	shadowGenerator.usePoissonSampling = true;
	shadowGenerator.setDarkness(0.3);

	// TERMINALS
	initTerminals(maze, player, miniMap, availableMessages, shadowGenerator, scene);

	// ENEMIES
	initEnemies(enemies, maze, player, mazeMesh, sounds, scene);

	// DEBUG LAYER
	if(window.location.hash == '#debug') {
		scene.debugLayer.show();
	}

	return scene;
}
