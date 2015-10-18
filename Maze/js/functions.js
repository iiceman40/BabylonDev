function shuffleArray(array) {
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

function drawMaze(maze, scene){
	// create maze representation
	/*
	var mazeOuterBox = BABYLON.Mesh.CreateBox('mazeOuterBox', 1, scene);
	mazeOuterBox.scaling.x = (maze.width + 1) * 10;
	mazeOuterBox.scaling.z = (maze.height + 1) * 10;
	mazeOuterBox.scaling.y = 10;
	*/

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
			//box.scaling.y = 2;
			box.isVisible = false;
			box.position.x = posX;
			box.position.z = posZ;
			//box.position.y = 1.5;
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
	boxesMesh.visibility = 0.3;

	var outerBoxCSG = BABYLON.CSG.FromMesh(mazeOuterBox);
	var carvedBoxesCSG = BABYLON.CSG.FromMesh(boxesMesh);
	var subCSG = outerBoxCSG.subtract(carvedBoxesCSG);
	var mazeMesh = subCSG.toMesh("csg", wallMaterial, scene);
	mazeMesh.position = new BABYLON.Vector3(0, 0, 0);

	mazeOuterBox.dispose();

	var mazeMeshOuterBox = BABYLON.CSG.FromMesh(mazeMesh);
	var connectorsMesh = BABYLON.Mesh.MergeMeshes(connectors, true);
	connectorsMesh.visibility = 0.3;
	var carvedConnectorsCSG = BABYLON.CSG.FromMesh(connectorsMesh);
	var subCSG2 = mazeMeshOuterBox.subtract(carvedConnectorsCSG);
	var mazeMeshFinal = subCSG2.toMesh("csg", wallMaterial, scene);
	mazeMeshFinal.checkCollisions = true;

	mazeMesh.dispose();

	// show doors/connectors on mini map
	/*
	connectorsMesh.position.y = 55;
	connectorsMesh.layerMask = 1;
	connectorsMesh.visibility = 0.7;
	connectorsMesh.material = new DoorMaterial(scene);
	*/

	var ground = BABYLON.Mesh.CreateGround("ground1", maze.width * 10, maze.height * 10, 10, scene);
	ground.material = groundMaterial;
	ground.position.y = -2;
	ground.checkCollisions = true;
	ground.receiveShadows = true;
	ground.layerMask = 2;

	mazeMeshFinal.layerMask = 2;

	return mazeMeshFinal;
}

function drawMazeMap(mazeMesh, scene){
	mazeMap = mazeMesh.clone();
	mazeMap.layerMask = 1;
	mazeMap.material = new MazeMapMaterial(scene);
}