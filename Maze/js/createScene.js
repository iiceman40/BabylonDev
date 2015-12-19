function createScene() {

	// SCENE SETUP
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.8, 0.8, 1);
	scene.collisionsEnabled = true;
	//scene.workerCollisions = true;

	var game = new Game(config, scene);
	$('.levelNumber').text(game.level);

	// CREATE MAZE
	var maze = new Maze(config.width, config.height, config.depth, config.startingPoint);

	// DRAW MAZE
	var mazeMesh = drawMaze(maze, config, scene);

	// MESSAGES
	var availableMessages = [
		new Message("You are doing really great. <br/> <br/> Fun fact: <br/> <br/> A lot of people don't undestand sarcasm!", null),
		new Message("Hey, what's up, buttercup?", null),
		new Message("Hello! <br/> <br/> This is the part where I kill you. <br/> <br/> I'm just kidding... <br/> <br/> ...maybe", null),
		new Message("Are you still there?", null),
		new Message("Get out of my head!", null),
		new Message("Oh... It's you.", null),
		new Message("If at first you don't succeed, ... <br/> <br/> fail 5 more times.", null),
		new Message("Okay. Look. We both said a lot of things that you're going to regret. But I think we can put our differences behind us. For science. <br/> <br/> You monster.", null),
		new Message("You broke it, didn't you?", null),
		new Message("So. <br/> <br/> How are you holding up?", null),
		new Message("Don't press that button. You don't know what you're doing.", null),
		new Message("How much wood would a woodchuck chuck if a woodchuck could chuck wood?")
	];

	// CAMERA/PLAYER
	var player = new Player(mazeMesh, getCellPosition(config.width - 1, config.height - 1, 0, maze, config.spacing), game, scene);
	initPointerLock(canvas, player);

	// CREATE MINI MAP
	var miniMap = new MiniMap(100, 100, maze, player, scene);
	player.miniMap = miniMap;

	// PLACE EXIT
	maze.exit = new Exit(new BABYLON.Vector3(0, 0, config.depth - 1), maze, miniMap.playerOnMiniMap, mazeMesh, game, player, scene);

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
	initEnemies(game.enemies, maze, player, mazeMesh, game, scene);

	// DEBUG LAYER
	if(window.location.hash == '#debug') {
		scene.debugLayer.show();
	}

	scene.executeWhenReady(function() {
		$('.level').delay(1000).fadeOut(500);
	});

	return scene;
}
