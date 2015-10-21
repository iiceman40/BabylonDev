function createScene() {

	// SCENE SETUP
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.8, 0.8, 1);
	scene.collisionsEnabled = true;
	scene.workerCollisions = true;

	// CAMERA
	var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, 0), scene);
	//camera.applyGravity = true;
	camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
	camera.checkCollisions = true;
	camera.speed = 0.5;
	camera.layerMask = 2; // 010 in binary
	camera.attachControl(canvas, true);

	scene.activeCameras.push(camera);
	scene.cameraToUseForPointers = camera;

	// fix for missing camera ellipsoid offset
	var cameraOffsetY = 0.6;
	camera._collideWithWorld = function (velocity) {
		var globalPosition;
		if (this.parent) {
			globalPosition = BABYLON.Vector3.TransformCoordinates(this.position, this.parent.getWorldMatrix());
		}
		else {
			globalPosition = this.position;
		}
		globalPosition.subtractFromFloatsToRef(0, this.ellipsoid.y - cameraOffsetY, 0, this._oldPosition);
		this._collider.radius = this.ellipsoid;
		//no need for clone, as long as gravity is not on.
		var actualVelocity = velocity;
		//add gravity to the velocity to prevent the dual-collision checking
		if (this.applyGravity) {
			//this prevents mending with cameraDirection, a global variable of the free camera class.
			actualVelocity = velocity.add(this.getScene().gravity);
		}
		this.getScene().collisionCoordinator.getNewPosition(this._oldPosition, actualVelocity, this._collider, 3, null, this._onCollisionPositionChange, this.uniqueId);
	};


	// CREATE MAZE
	var maze = new Maze(width, height, depth, startingPoint);

	// DRAW MAZE
	var mazeMesh = drawMaze(maze, scene);

	// the camera acts as the player
	var player = camera;
	player.position = getCellPosition(width - 1, height - 1, 0, maze, spacing);

	// CREATE MINI MAP
	var miniMap = new MiniMap(100, 100, player, scene);

	// PLACE EXIT
	var exit = new Exit(new BABYLON.Vector3(width - 1, 0, depth - 1), maze, miniMap.playerOnMiniMap, camera, scene);

	// LIGHTS AND SHADOW
	var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	hemiLight.intensity = 0.05;

	//var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0.3, -1, 0.1), scene);
	//light1.intensity = 0.1;

	var playerLight1 = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0), 1.3, 2, scene);
	playerLight1.intensity = 0.5;
	playerLight1.range = 35;

	scene.registerBeforeRender(function () {
		playerLight1.position = player.position.clone();
		playerLight1.position.y += 1;
		playerLight1.direction = player.getTarget().subtract(player.position);
		playerLight1.direction.y -= 0.2;
	});

	var shadowGenerator = new BABYLON.ShadowGenerator(1024, playerLight1);
	shadowGenerator.useBlurVarianceShadowMap = true;

	// INIT SOUNDS
	var sounds = new Sounds(scene);

	// Messages
	var availableMessages = [
		new Message("You are doing really great. <br/> <br/> Fun fact: <br/> <br/> A lot of people don't undestand sarcasm!", sounds['newRank']),
		new Message("Hey, what's up?", null)
	];

	// MAP TERMINALS
	var numberOfRooms = width * height * depth;
	var numberOfTerminals = Math.floor(numberOfRooms/4);

	// add a terminal to the first room
	new Terminal(new BABYLON.Vector3(width - 1, height - 1, 0), maze, player, miniMap, availableMessages, shadowGenerator, scene);
	var placedTerminals = 1;

	while(numberOfTerminals - placedTerminals > 0){
		var x = Math.floor(Math.random() * width);
		var y = Math.floor(Math.random() * height);
		var z = Math.floor(Math.random() * depth);

		console.log(x, y, z);
		if(!maze.map[y][x][z].hasTerminal){
			new Terminal(new BABYLON.Vector3(x, y, z), maze, player, miniMap, availableMessages, shadowGenerator, scene);
			placedTerminals++;
		}

	}

	initPointerLock(canvas, camera);

	// EVENT LISTENERS
	// terminal interaction event listener
	window.addEventListener("mouseup", function (evt) {
		// right click to interact with terminal
		if (evt.button === 2) {
			var ray = new BABYLON.Ray(player.position, player.getTarget().subtract(player.position));
			var pickingInfo = scene.pickWithRay(ray, function(mesh){
				return mesh.name == 'terminalScreen';
			});

			if(pickingInfo.hit && !miniMap.isVisible) {
				var terminal = pickingInfo.pickedMesh.terminal;
				terminal.activateTerminal();
				terminal.isActive = true;
			} else {
				miniMap.hideMiniMap();
			}

		}

		return false;
	});

	// shooting
	window.addEventListener("mousedown", function (evt) {
		// left click to fire
		if (evt.button === 0) {
			sounds.laser.play();
		}

		return false;
	});

	$('body').on('contextmenu', 'canvas', function(e){ return false; });


	// pick a random room
	// place terminal
	// save position in placedTerminals
	// pick another room
	// check distance to all other terminals
	// if distance is big enough, place new terminal
	// top when number of terminal is reached (placedTerminals.length)

	console.log('number of rooms: ', numberOfRooms);
	console.log('number of terminals: ', numberOfTerminals);

	// ADD ENEMIES
	// TODO enemy movement - chase player? dodge?
	var enemy = new Enemy(maze, player, scene);

	// DEBUG LAYER
	if(window.location.hash == '#debug') {
		scene.debugLayer.show();
	}

	return scene;
}
