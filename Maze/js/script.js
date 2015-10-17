var canvas, engine, scene;

$(document).ready(function () {

	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);
	scene = createScene();
	engine.runRenderLoop(function () {
		scene.render();
	});

	window.addEventListener("resize", function () {
		engine.resize();
	});

});

/**
 * FUNCTIONS
 */
function createScene() {

	// This creates a basic Babylon Scene object (non-mesh)
	var scene = new BABYLON.Scene(engine);
	scene.gravity = new BABYLON.Vector3(0, -0.0981, 0);
	scene.collisionsEnabled = true;
	scene.workerCollisions = true;

	// set scene background color to black
	scene.clearColor = new BABYLON.Color3(0.8, 0.8, 1);

	// This creates and positions a free camera (non-mesh)
	//var camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 5 * 2, 150, new BABYLON.Vector3(0, 0, 0), scene);

	var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(5, 50.1, 5), scene);
	camera.applyGravity = true;
	camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
	camera.checkCollisions = true;
	camera.speed = 0.6;

	camera.layerMask = 2; // 010 in binary

	scene.activeCameras.push(camera);

	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);

	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	var hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	hemiLight.intensity = 0.3;
	var light1 = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(0.3, -1, 0.1), scene);
	light1.intensity = 0.7;

	/**
	 * MAZE VARIABLES
	 */
	var width = 6;
	var height = 6;
	var startingPoint = new BABYLON.Vector2(0, 0);

	// crate a maze
	var maze = initMaze(width, height, startingPoint);

	// mini map camera
	var mm = new BABYLON.FreeCamera("minimap", new BABYLON.Vector3(0,80,0), scene);
	mm.setTarget(new BABYLON.Vector3(0.01, 0.01, 0.01));
	// Activate the orthographic projection
	mm.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
	mm.rotation.y = 0;

	// viewport
	var ration = $(document).width() / $(document).height();
	var xstart = 1 - width/100;
	var ystart = 1 - height/100 * ration;
	var viewportWidth = 1 - xstart;
	var viewportHeight = 1 - ystart;

	mm.viewport = new BABYLON.Viewport(
		xstart,
		ystart,
		viewportWidth,
		viewportHeight
	);

	mm.layerMask = 1; // 001 in binary

	// Add the camera to the list of active cameras of the game
	scene.activeCameras.push(mm);

	// show correct area on mini map
	mm.orthoLeft = -width * 10/2;
	mm.orthoRight = width * 10/2;
	mm.orthoTop =  height * 10/2;
	mm.orthoBottom = -height * 10/2;

	// player on mini map
	var playerMaterial = new BABYLON.StandardMaterial('playerMaterial', scene);
	playerMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
	playerMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
	playerMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

	var playerOnMiniMap = BABYLON.Mesh.CreateCylinder("player", 5, 0, 4, 6, 1, scene, false);
	playerOnMiniMap.rotation.x = Math.PI / 2;
	playerOnMiniMap.scaling.z = 1.5;
	playerOnMiniMap.position.y = 50;
	playerOnMiniMap.material = playerMaterial;
	// The sphere position will be displayed accordingly to the player position
	playerOnMiniMap.registerBeforeRender(function() {
		playerOnMiniMap.rotation.y = camera.rotation.y;
		playerOnMiniMap.position.x = camera.position.x;
		playerOnMiniMap.position.z = camera.position.z;
	});

	var mazeOuterBox = BABYLON.Mesh.CreateBox('mazeOuterBox', 1, scene);
	mazeOuterBox.scaling.x = (maze.width + 1) * 10;
	mazeOuterBox.scaling.z = (maze.height + 1) * 10;
	mazeOuterBox.scaling.y = 10;

	var wallMaterial = new BABYLON.StandardMaterial('wallMaterial', scene);
	wallMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
	wallMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
	wallMaterial.diffuseTexture = new BABYLON.Texture('img/brick_wall.jpg', scene);
	wallMaterial.diffuseTexture.uScale = 5;
	wallMaterial.diffuseTexture.vScale = 5;
	wallMaterial.bumpTexture = new BABYLON.Texture('img/brick_wall_normalmap.png', scene);
	wallMaterial.bumpTexture.uScale = 5;
	wallMaterial.bumpTexture.vScale = 5;

	var groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
	groundMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
	groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	groundMaterial.diffuseTexture = new BABYLON.Texture('img/ground.jpg', scene);
	groundMaterial.diffuseTexture.uScale = maze.width * 5;;
	groundMaterial.diffuseTexture.vScale = maze.height * 5;;
	groundMaterial.bumpTexture = new BABYLON.Texture('img/ground_normalmap.png', scene);
	groundMaterial.bumpTexture.uScale = maze.width * 5;
	groundMaterial.bumpTexture.vScale = maze.height * 5;

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

	// show doors/connecots on mini map
	var doorMaterial = new BABYLON.StandardMaterial('playerMaterial', scene);
	doorMaterial.diffuseColor = new BABYLON.Color3(0, 0.7, 0);
	doorMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	connectorsMesh.position.y = 55;
	connectorsMesh.layerMask = 1;
	connectorsMesh.visibility = 0.7;
	connectorsMesh.material = doorMaterial;

	var ground = BABYLON.Mesh.CreateGround("ground1", maze.width * 10, maze.height * 10, 10, scene);
	ground.material = groundMaterial;
	ground.position.y = 48;
	ground.checkCollisions = true;
	ground.receiveShadows = true;

	var shadowGenerator = new BABYLON.ShadowGenerator(1024, light1);
	shadowGenerator.getShadowMap().renderList.push(mazeMeshFinal);
	shadowGenerator.useBlurVarianceShadowMap = true;
	shadowGenerator.blurScale = 1.5;
	//shadowGenerator.blurBoxOffset = 5;


	// place exit
	var exitMaterial = new BABYLON.StandardMaterial('exitMaterial', scene);
	exitMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
	exitMaterial.emissiveColor = new BABYLON.Color3(1, 0, 1);

	var exit = BABYLON.Mesh.CreateSphere("exit", 32, 5, scene, false);
	exit.material = exitMaterial;
	exit.position = new BABYLON.Vector3(-5 + maze.width * 10 / 2, 50, 5 - maze.height * 10 / 2);
	exit.checkCollisions = true;

	var exitFound = false;
	exit.registerBeforeRender(function() {
		if(!exitFound && exit.intersectsMesh(playerOnMiniMap, false)){
			exitFound = true;
			console.log('You found the exit!');
		}
	});



	// enemies
	var enemyMaterial = new BABYLON.StandardMaterial('exitMaterial', scene);
	enemyMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
	enemyMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);
	enemyMaterial.alpha = 0.5;

	var enemy = BABYLON.Mesh.CreateSphere("enemy", 32, 3, scene, false);
	enemy.material = enemyMaterial;
	enemy.position = new BABYLON.Vector3(5 - maze.width * 10 / 2, 49.5, 5 - maze.height * 10 / 2);
	enemy.checkCollisions = true;

	var animationScaling = new BABYLON.Animation("scalingAnimation", "scaling", 100, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	// Animation keys
	var keysScaling = [];
	//At the animation key 0, the value of scaling is "1"
	keysScaling.push({
		frame: 0,
		value: new BABYLON.Vector3(1, 1, 1)
	});
	//At the animation key 20, the value of scaling is "0.2"
	keysScaling.push({
		frame: 50,
		value: new BABYLON.Vector3(1.1, 0.7, 1.1)
	});
	//At the animation key 100, the value of scaling is "1"
	keysScaling.push({
		frame: 100,
		value: new BABYLON.Vector3(1, 1, 1)
	});
	//Adding keys to the animation object
	animationScaling.setKeys(keysScaling);
	//Then add the animation object to box1
	enemy.animations.push(animationScaling);

	var animationPosition = new BABYLON.Animation("scalingAnimation", "position.y", 100, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	// Animation keys
	var keysPostion = [];
	//At the animation key 0, the value of scaling is "1"
	keysPostion.push({
		frame: 0,
		value: 49.5
	});
	//At the animation key 20, the value of scaling is "0.2"
	keysPostion.push({
		frame: 50,
		value: 50.5
	});
	//At the animation key 100, the value of scaling is "1"
	keysPostion.push({
		frame: 100,
		value: 49.5
	});
	//Adding keys to the animation object
	animationPosition.setKeys(keysPostion);
	//Then add the animation object to box1
	enemy.animations.push(animationPosition);

	//Finally, launch animations on box1, from key 0 to key 100 with loop activated
	scene.beginAnimation(enemy, 0, 100, true);

	// enemy health bar
	var healthBarMaterial = new BABYLON.StandardMaterial("hb1mat", scene);
	healthBarMaterial.diffuseColor = BABYLON.Color3.Green();
	healthBarMaterial.emissiveColor = BABYLON.Color3.Green();
	healthBarMaterial.backFaceCulling = false;

	var healthBarContainerMaterial = new BABYLON.StandardMaterial("hb2mat", scene);
	healthBarContainerMaterial.diffuseColor = BABYLON.Color3.Blue();
	healthBarContainerMaterial.backFaceCulling = false;

	var healthBar = BABYLON.Mesh.CreatePlane("hb1", {width:2, height:.5, subdivisions:4}, scene);
	var healthBarContainer = BABYLON.Mesh.CreatePlane("hb2", {width:2, height:.5, subdivisions:4}, scene);

	healthBar.position = new BABYLON.Vector3(0, 0, -.01);
	healthBarContainer.position = new BABYLON.Vector3(0, 2, 0);

	healthBar.parent = healthBarContainer;
	healthBarContainer.parent = enemy;

	healthBar.material = healthBarMaterial;
	healthBarContainer.material = healthBarContainerMaterial;
	healthBarContainer.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;

	var alive = true;
	var healthPercentage = 100;

	scene.registerBeforeRender(function () {

		if (alive) {

			// Re-calculate health bar length.
			healthBar.scaling.x = healthPercentage / 100;
			healthBar.position.x =  (1 - (healthPercentage / 100)) * -1;

			if (healthBar.scaling.x < 0) {
				alive = false;
			}
			else if (healthBar.scaling.x < .5) {
				healthBarMaterial.diffuseColor = BABYLON.Color3.Yellow();
				healthBarMaterial.emissiveColor = BABYLON.Color3.Yellow();
			}
			else if (healthBar.scaling.x < .3) {
				healthBarMaterial.diffuseColor = BABYLON.Color3.Red();
				healthBarMaterial.emissiveColor = BABYLON.Color3.Red();
			}

		} else {
			enemy.dispose();
		}
	});

	// TODO slimey wobble and jumping animation


	// TODO enemy movement


	// melee attack action
	scene.cameraToUseForPointers = camera;
	enemy.actionManager = new BABYLON.ActionManager(scene);
	enemy.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
		var distance = camera.position.subtract(enemy.position).length();
		console.log(distance);

		if(distance < 6) {
			healthPercentage -= 10;
			if (healthPercentage <= 0) {
				healthPercentage = 0;
				alive = false;
			}
		}
	}));



	//scene.debugLayer.show();


	return scene;
}

function initMaze(width, height, startingPoint) {
	var maze = new Maze(width, height, startingPoint);

	carvePassageFrom(maze.map[startingPoint.y][startingPoint.x], maze);

	return maze;
}

var Maze = function(width, height, startingPoint){
	this.width = width;
	this.height =  height;
	this.startingPoint = startingPoint;
	this.map = [];

	for (y = 0; y < height; y++) {
		this.map[y] = [];
		for (x = 0; x < width; x++) {
			this.map[y][x] = new Cell(new BABYLON.Vector2(x, y));
		}
	}
};

var Cell = function (position) {
	this.position = position;
	this.hasBeenVisited = false;
	this.directions = ['N', 'S', 'E', 'W'];
	this.neighbors = [];
	this.walls = {
		N: true,
		S: true,
		E: true,
		W: true
	};
	this.doors = [];

};

/**
 * carves a path to a neighbor cell
 * @param cell
 * @param maze
 */
function carvePassageFrom(cell, maze) {
	var directions = shuffle(cell.directions);

	for(var i=0; i<directions.length; i++){
		cell.hasBeenVisited = true;
		var direction = directions[i];
		var directionVector;
		switch (direction){
			case 'N':
				directionVector = new BABYLON.Vector2(0, -1);
				break;
			case 'S':
				directionVector = new BABYLON.Vector2(0, 1);
				break;
			case 'E':
				directionVector = new BABYLON.Vector2(1, 0);
				break;
			case 'W':
				directionVector = new BABYLON.Vector2(-1, 0);
				break;
		}
		var neighborPosition = cell.position.add(directionVector);
		// check if neighbor would be in map boundaries
		if (
			neighborPosition.x >= 0 && neighborPosition.x < maze.width &&
			neighborPosition.y >= 0 && neighborPosition.y < maze.height
		) {
			// check if already visited
			var neighbor = maze.map[neighborPosition.y][neighborPosition.x];
			if(!neighbor.hasBeenVisited) {
				// carve path
				removeWalls(cell, direction, neighbor);

				carvePassageFrom(neighbor, maze);
			}
		}
	}

}

function removeWalls(cell, direction, neighbor){
	var oppositeDirection;
	switch (direction){
		case 'N':
			oppositeDirection = 'S';
			break;
		case 'S':
			oppositeDirection = 'N';
			break;
		case 'E':
			oppositeDirection = 'W';
			break;
		case 'W':
			oppositeDirection = 'E';
			break;
	}
	cell.walls[direction] = false;
	neighbor.walls[oppositeDirection] = false;
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}