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
	player.keysUp.push(87);
	player.keysDown.push(83);
	player.keysLeft.push(65);
	player.keysRight.push(68);
	player.position = getCellPosition(width - 1, height - 1, 0, maze, spacing);

	// CREATE MINI MAP
	var miniMap = new MiniMap(100, 100, maze, player, scene);
	player.onMiniMap = miniMap.playerOnMiniMap;

	// PLACE EXIT
	var exit = new Exit(new BABYLON.Vector3(0, 0, depth - 1), maze, miniMap.playerOnMiniMap, mazeMesh, camera, scene);

	// LIGHTS AND SHADOW
	var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	hemiLight.intensity = 0.05;

	//var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0.3, -1, 0.1), scene);
	//light1.intensity = 0.1;

	var playerLight1 = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0), 1.8, 2, scene);
	playerLight1.intensity = 0.5;
	playerLight1.range = 35;

	scene.registerBeforeRender(function () {
		//console.log(camera);
		playerLight1.position = player.position.clone();
		playerLight1.position.y += 1;
		playerLight1.direction = player.getTarget().subtract(player.position);
		playerLight1.direction.y -= 0.2;
	});

	var shadowGenerator = new BABYLON.ShadowGenerator(1024, playerLight1);
	shadowGenerator.usePoissonSampling = true;
	shadowGenerator.setDarkness(0.3);

	// INIT SOUNDS
	var sounds = new Sounds(scene);
	// TODO check if all are ready to play?

	// Messages
	var availableMessages = [
		new Message("You are doing really great. <br/> <br/> Fun fact: <br/> <br/> A lot of people don't undestand sarcasm!", null),
		new Message("Hey, what's up, buttercup?", null),
		new Message("Get out of my head!", null)
	];

	// MAP TERMINALS
	var numberOfTerminals = Math.floor(maze.numberOfRooms/4);

	// add a terminal to the first room
	new Terminal(new BABYLON.Vector3(width - 1, height - 1, 0), maze, player, miniMap, availableMessages, shadowGenerator, scene);
	var placedTerminals = 1;

	while(numberOfTerminals - placedTerminals > 0){
		var x = Math.floor(Math.random() * width);
		var y = Math.floor(Math.random() * height);
		var z = Math.floor(Math.random() * depth);

		if(!maze.map[y][x][z].hasTerminal){
			new Terminal(new BABYLON.Vector3(x, y, z), maze, player, miniMap, availableMessages, shadowGenerator, scene);
			placedTerminals++;
		}

	}
	console.log('number of rooms: ', maze.numberOfRooms, 'number of terminals: ', numberOfTerminals);

	initPointerLock(canvas, camera);

	// EVENT LISTENERS
	// terminal interaction event listener
	window.addEventListener("mouseup", function (evt) {
		// right click to interact with terminal
		if (evt.button === 2) {
			var ray = new BABYLON.Ray(player.position, player.getTarget().subtract(player.position), 5);
			var pickingInfo = scene.pickWithRay(ray, function(mesh){
				return mesh.name == 'terminalScreen';
			});

			if(pickingInfo.hit && !miniMap.isVisible) {
				var terminal = pickingInfo.pickedMesh.terminal;
				terminal.activateTerminal();
				terminal.isActive = true;
			} else if(miniMap.isVisible){
				miniMap.hideMiniMap();
			}

		}

		return false;
	});

	// COCKPIT HUD
	player.energyLevel = 100;
	player.health = 100;

	player.energyBar = BABYLON.MeshBuilder.CreateBox('energyBar', {size: 0.02, width: 0.45}, scene);
	player.energyBar.parent = camera;
	player.energyBar.position = new BABYLON.Vector3(0, -0.37, 1);
	player.energyBar.renderingGroupId = 2;
	player.energyBar.material = new EnergyBarMaterial(scene);

	player.healthBar = BABYLON.MeshBuilder.CreateBox('energyBar', {size: 0.02, width: 0.45}, scene);
	player.healthBar.parent = camera;
	player.healthBar.position = new BABYLON.Vector3(0, -0.4, 1);
	player.healthBar.renderingGroupId = 2;
	player.healthBar.material = new HealthBarMaterial(scene);

	// recharge bars
	setInterval(function(){
		player.energyLevel += 2;
		if(player.energyLevel > 100){
			player.energyLevel = 100;
		}
		updateBar(player.energyBar, player.energyLevel);
	}, 100);
	/*
	setInterval(function(){
		player.health += 1;
		if(player.health > 100){
			player.health = 100;
		}
		updateBar(player.healthBar, player.health);
	}, 300);
	*/

	var statusBarsLight = new BABYLON.PointLight("energyBarLight", new BABYLON.Vector3(1, 10, 1), scene);
	statusBarsLight.diffuse = new BABYLON.Color3(1,1,1);
	statusBarsLight.specular = new BABYLON.Color3(1,1,1);
	statusBarsLight.parent = player;
	statusBarsLight.includedOnlyMeshes = [player.energyBar, player.healthBar];

	// ADD ENEMIES
	// TODO enemy movement - chase player? dodge?
	var enemies = [];
	var numberOfEnemies = Math.floor(maze.numberOfRooms/4);

	// add a terminal to the first room
	var spawnedEnemies = 0;

	while(numberOfEnemies - spawnedEnemies > 0){
		x = Math.floor(Math.random() * width);
		y = Math.floor(Math.random() * height);
		z = Math.floor(Math.random() * depth);

		if(!maze.map[y][x][z].hasEnemy && !maze.map[y][x][z].hasExit){
			maze.map[y][x][z].hasEnemy = true;
			enemies.push(new Enemy(maze, player, new BABYLON.Vector3(x, y, z), mazeMesh, sounds, scene));
			spawnedEnemies++;
		}

	}
	console.log('number of rooms: ', maze.numberOfRooms, 'number of terminals: ', numberOfEnemies);

	// SHOOTING
	player.bullets = [];
	var bulletMaterial = new BulletMaterial(scene);
	var bulletMaterialOutside = new BulletMaterialOutside(scene);
	var currentCannon = 1;

	// init cannons
	var cannonMaterial = new CannonMaterial(scene);
	var cannonLeft = new Cannon(new BABYLON.Vector3(-0.3, -0.3, 0), player, cannonMaterial, scene);
	var cannonRight = new Cannon(new BABYLON.Vector3(0.3, -0.3, 0), player, cannonMaterial, scene);

	// shooting light effect
	var cannonLight = new BABYLON.PointLight("cannonLight", new BABYLON.Vector3(1, 10, 1), scene);
	cannonLight.diffuse = new BABYLON.Color3(1,0,0);
	cannonLight.specular = new BABYLON.Color3(1,0,0);
	cannonLight.position = player.position;
	cannonLight.includedOnlyMeshes = [cannonLeft, cannonRight];
	cannonLight.intensity = 2;
	cannonLight.setEnabled(false);

	// mouse events for shooting
	var keepShooting = false;
	var cannonReady = true;
	window.addEventListener("mousedown", function (evt) {
		// left click to start fire
		if (evt.button === 0 && !miniMap.isVisible) {
			keepShooting = true;
		}
	});
	window.addEventListener("mouseup", function (evt) {
		keepShooting = false;
	});

	$('body').on('contextmenu', 'canvas', function(e){ return false; });

	// REGISTER BEFORE RENDER FOR SHOOTING
	scene.registerBeforeRender(function(){
		if(keepShooting && cannonReady && player.energyLevel >= 10) {
			cannonReady = false;
			player.energyLevel -= 10;
			if(player.energyLevel <= 0){
				player.energyLevel = 1;
			}
			updateBar(player.energyBar, player.energyLevel);
			// fire laser bullet from player in the direction the player is currently looking
			var newBullet = new Bullet(bulletMaterial, bulletMaterialOutside, player, player.getTarget(), scene);
			cannonLight.setEnabled(true);
			if (currentCannon == 1) {
				newBullet.position = cannonLeft.outputEnd.absolutePosition.clone();
				currentCannon = 2;
				cannonLight.position = cannonLeft.outputEnd.absolutePosition.clone();
			} else {
				newBullet.position = cannonRight.outputEnd.absolutePosition.clone();
				currentCannon = 1;
				cannonLight.position = cannonRight.outputEnd.absolutePosition.clone();
			}
			player.bullets.push(newBullet);
			sounds.laser.play();

			setTimeout(function(){
				cannonReady = true;
				cannonLight.setEnabled(false);
			}, 200);
		}

		for(var i=player.bullets.length-1; i>=0; i--){
			var bullet = player.bullets[i];
			if(bullet) {
				// check for all hit
				var ray = new BABYLON.Ray(bullet.position.clone(), bullet.direction.clone().scale(0.5), 1);
				var pickInfo = scene.pickWithRay(ray, function(mesh){
					return mesh == mazeMesh;
				});

				// dispose on out of range or wall hit
				var disposeBullet = false;
				bullet.position = bullet.position.clone().add(bullet.direction.clone().scale(1));
				if (bullet.position.length() > width * spacing + height * spacing + depth * spacing || pickInfo.hit) {
					disposeBullet = true;
				}

				// ATTACKING ENEMY ACTION
				for(var j=0; j<enemies.length; j++){
					var enemy = enemies[j];
					if(enemy.alive && bullet && bullet.intersectsMesh(enemy, true)){
						disposeBullet = true;
						enemy.healthPercentage -= 10;
						if (enemy.healthPercentage <= 0) {
							enemy.healthPercentage = 0;
							enemy.die();
						}
					}
				}

				if(disposeBullet){
					player.bullets[i] = null;
					bullet.outside.dispose();
					bullet.dispose();
					player.bullets.splice(i,1);
				}
			}
		}

	});


	// DEBUG LAYER
	if(window.location.hash == '#debug') {
		scene.debugLayer.show();
	}

	return scene;
}
