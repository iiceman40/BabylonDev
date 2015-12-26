function createScene() {

	console.log(config.mode);

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

	// MESSAGES // TODO move to config or separate file
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

	// PLAYER
	var player = new Player(mazeMesh, getCellPosition(config.width - 1, config.height - 1, 0, maze, config.spacing), game, scene);
	player.initPointerLock(canvas);
	player.initStatusBarUpdateInterval();
	// sync flashlight
	scene.beforeCameraRender = function(){
		player.syncFlashlight();
	};
	// triggers the shooting if player.keepShooting is active
	scene.registerBeforeRender(function () {
		player.shooting();
	});
	// EVENT LISTENERS
	// start shooting
	canvas.removeEventListener("mousedown", mouseDownEvent);
	mouseDownEvent = function (evt) {
		// left click to start fire
		if (evt.button === config.controls.shootPrimary && !player.miniMap.isVisible) {
			player.keepShooting = true;
		}
		// right click to launch a rocket
		if (evt.button === config.controls.shootSecondary && !player.miniMap.isVisible) {
			player.shootRocket();
		}
	};
	canvas.addEventListener("mousedown", mouseDownEvent);
	// stop shooting
	canvas.removeEventListener("mouseup", mouseUpEvent);
	mouseUpEvent = function (evt) {
		if (evt.button === config.controls.shootPrimary) {
			player.keepShooting = false;
		}
	};
	canvas.addEventListener("mouseup", mouseUpEvent);
	// terminal interactions
	window.removeEventListener("keydown", keyDownEvent);
	keyDownEvent = function (event) {
		event = event || window.event;
		// space click to interact with terminal
		if (event.keyCode === config.controls.use) {
			player.useTerminal();
		}
		return false;
	};
	window.addEventListener("keydown", keyDownEvent);

	// CREATE MINI MAP
	var miniMap = new MiniMap(100, 100, maze, player.camera, scene);
	player.miniMap = miniMap;

	// PLACE EXIT
	maze.exit = new Exit(new BABYLON.Vector3(0, 0, config.depth - 1), maze, miniMap.playerOnMiniMap, mazeMesh, game, player.camera, scene);

	// LIGHTS AND SHADOW
	var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	hemiLight.intensity = 0.05;
	//var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0.3, -1, 0.1), scene);
	//light1.intensity = 0.1;

	var shadowGenerator = new BABYLON.ShadowGenerator(1024, player.flashlight);
	shadowGenerator.usePoissonSampling = true;
	shadowGenerator.setDarkness(0.3);

	// TERMINALS
	initTerminals(maze, player.camera, miniMap, availableMessages, shadowGenerator, scene);

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
