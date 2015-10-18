function shuffleArray(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

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

	var connectorDepth = 2;
	var connectorWidth = 5;
	var connectorHeight = 5;
	var connectorOffset = 5;
	var connectors = [];
	var boxes = [];
	var outerBoxes = [];
	var tunnels = [];
	var outerTunnels = [];

	var outerTunnel = BABYLON.MeshBuilder.CreateBox('mazeConnectorOuter', {height: connectorHeight+2, width: connectorWidth+2, depth: 10}, scene);
	var innerTunnel = BABYLON.MeshBuilder.CreateBox('mazeConnectorInner', {height: connectorHeight, width: connectorWidth, depth: 10}, scene);

	var outerTunnelCSG = BABYLON.CSG.FromMesh(outerTunnel);
	var innerTunnelCSG = BABYLON.CSG.FromMesh(innerTunnel);
	var subTunnelCSG = outerTunnelCSG.subtract(innerTunnelCSG);
	var tunnelBlueprint = subTunnelCSG.toMesh("csg", wallMaterial, scene);

	outerTunnel.scaling = new BABYLON.Vector3(1.05, 1.05, 1.05);
	outerTunnel.flipFaces();
	outerTunnel.material = new BoxEdgeMaterial(scene);
	outerTunnel.layerMask = 1;

	innerTunnel.dispose();
	//outerTunnel.dispose();

	// display maze
	for (var y = 0; y < maze.height; y++) {
		for (var x = 0; x < maze.width; x++) {
			for (var z = 0; z < maze.depth; z++) {
				var cell = maze.map[y][x][z];

				var posX = (x - maze.width / 2 + 0.5) * 20;
				var posY = (y - maze.height / 2 + 0.5) * 20;
				var posZ = (z - maze.depth / 2 + 0.5) * 20;

				var outerBox = BABYLON.Mesh.CreateBox('mazeCellOuter', 10, scene);
				var innerBox = BABYLON.Mesh.CreateBox('mazeCellInner', 8, scene);

				var outerBoxCSG = BABYLON.CSG.FromMesh(outerBox);
				var innerBoxCSG = BABYLON.CSG.FromMesh(innerBox);
				var subBoxCSG = outerBoxCSG.subtract(innerBoxCSG);
				var box = subBoxCSG.toMesh("csg", wallMaterial, scene);

				innerBox.dispose();
				outerBox.scaling = new BABYLON.Vector3(1.05, 1.05, 1.05);
				outerBox.position = new BABYLON.Vector3(posX, posY, posZ);
				outerBox.flipFaces();
				outerBox.material = new BoxEdgeMaterial(scene);
				outerBox.layerMask = 1;
				outerBoxes.push(outerBox);

				// Temp
				//outerBox.dispose();

				box.isVisible = false;
				box.position.x = posX;
				box.position.y = posY;
				box.position.z = posZ;
				boxes.push(box);

				// connectors
				if (!cell.walls['N']) {
					var connectorN = BABYLON.Mesh.CreateBox('connector', 1, scene);
					connectorN.position = new BABYLON.Vector3(posX, posY, posZ - connectorOffset);
					connectorN.scaling.x = connectorWidth;
					connectorN.scaling.y = connectorHeight;
					connectorN.scaling.z = connectorDepth;
					connectors.push(connectorN);
					var tunnelN = tunnelBlueprint.clone('tunnelN');
					tunnelN.position = new BABYLON.Vector3(posX, posY, posZ - connectorOffset * 2);
					tunnels.push(tunnelN);
					var outerTunnelN = outerTunnel.clone();
					outerTunnelN.position = tunnelN.position;
					outerTunnels.push(outerTunnelN);
				}
				if (!cell.walls['S']) {
					var connectorS = BABYLON.Mesh.CreateBox('connector', 1, scene);
					connectorS.position = new BABYLON.Vector3(posX, posY, posZ + connectorOffset);
					connectorS.scaling.x = connectorWidth;
					connectorS.scaling.y = connectorHeight;
					connectorS.scaling.z = connectorDepth;
					connectors.push(connectorS);
				}
				if (!cell.walls['W']) {
					var connectorW = BABYLON.Mesh.CreateBox('connector', 1, scene);
					connectorW.position = new BABYLON.Vector3(posX - connectorOffset, posY, posZ);
					connectorW.scaling.x = connectorDepth;
					connectorW.scaling.y = connectorHeight;
					connectorW.scaling.z = connectorWidth;
					connectors.push(connectorW);
					var tunnelW = tunnelBlueprint.clone('tunnelW');
					tunnelW.position = new BABYLON.Vector3(posX - connectorOffset * 2, posY, posZ);
					tunnelW.rotation.y = Math.PI / 2;
					tunnels.push(tunnelW);
					var outerTunnelW = outerTunnel.clone();
					outerTunnelW.rotation = tunnelW.rotation;
					outerTunnelW.position = tunnelW.position;
					outerTunnels.push(outerTunnelW);
				}
				if (!cell.walls['E']) {
					var connectorE = BABYLON.Mesh.CreateBox('connector', 1, scene);
					connectorE.position = new BABYLON.Vector3(posX + connectorOffset, posY, posZ);
					connectorE.scaling.x = connectorDepth;
					connectorE.scaling.y = connectorHeight;
					connectorE.scaling.z = connectorWidth;
					connectors.push(connectorE);
				}

				if (!cell.walls['UP']) {
					var connectorUp = BABYLON.Mesh.CreateBox('connector', 1, scene);
					connectorUp.position = new BABYLON.Vector3(posX, posY + connectorOffset, posZ);
					connectorUp.scaling.x = connectorWidth;
					connectorUp.scaling.y = connectorDepth;
					connectorUp.scaling.z = connectorHeight;
					connectors.push(connectorUp);
					var tunnelUp = tunnelBlueprint.clone('tunnelW');
					tunnelUp.position = new BABYLON.Vector3(posX, posY + connectorOffset * 2, posZ);
					tunnelUp.rotation.x = Math.PI / 2;
					tunnels.push(tunnelUp);
					var outerTunnelUp = outerTunnel.clone();
					outerTunnelUp.rotation = tunnelUp.rotation;
					outerTunnelUp.position = tunnelUp.position;
					outerTunnels.push(outerTunnelUp);
				}
				if (!cell.walls['DOWN']) {
					var connectorDown = BABYLON.Mesh.CreateBox('connector', 1, scene);
					connectorDown.position = new BABYLON.Vector3(posX, posY - connectorOffset, posZ);
					connectorDown.scaling.x = connectorWidth;
					connectorDown.scaling.y = connectorDepth;
					connectorDown.scaling.z = connectorHeight;
					connectors.push(connectorDown);
				}
			}
		}
	}

	tunnelBlueprint.dispose();
	outerTunnel.dispose();

	// merge all connectors to a track mesh
	var boxesMesh = BABYLON.Mesh.MergeMeshes(boxes, true);
	boxesMesh.name = boxesMesh.id = 'boxesMesh';

	var mazeMeshOuterBox = BABYLON.CSG.FromMesh(boxesMesh);
	var connectorsMesh = BABYLON.Mesh.MergeMeshes(connectors, true);
	var carvedConnectorsCSG = BABYLON.CSG.FromMesh(connectorsMesh);
	var subCSG2 = mazeMeshOuterBox.subtract(carvedConnectorsCSG);
	var mazeMesh = subCSG2.toMesh("csg", wallMaterial, scene);
	mazeMesh.checkCollisions = true;
	mazeMesh.name = "mazeCellsMesh";
	mazeMesh.layerMask = 2;

	boxesMesh.dispose();
	connectorsMesh.dispose();

	var tunnelsMesh =  BABYLON.Mesh.MergeMeshes(tunnels, true);
	tunnelsMesh.name = 'tunnelsMesh';
	tunnelsMesh.checkCollisions = true;
	tunnelsMesh.layerMask = 2;

	var outerTunnelsMesh = BABYLON.Mesh.MergeMeshes(outerTunnels, true);
	outerTunnelsMesh.name = 'outerTunnelMesh';
	outerTunnelsMesh.layerMask = 1;

	var outerBoxesMesh = BABYLON.Mesh.MergeMeshes(outerBoxes, true);
	outerBoxesMesh.layerMask = 1;
	outerBoxesMesh.name = 'outerBoxesMesh';

	drawMazeMap(mazeMesh, tunnelsMesh, scene);

	return mazeMesh;
}

function drawMazeMap(mazeMesh, tunnelsMesh, scene){
	mazeMap = mazeMesh.clone();
	mazeMap.layerMask = 1;
	mazeMap.material = new MazeMapMaterial(scene);
	mazeMap.name = 'mazeMapMesh';

	tunnelsMap = tunnelsMesh.clone();
	tunnelsMap.layerMask = 1;
	tunnelsMap.material = new MazeMapMaterial(scene);
	tunnelsMap.name = 'tunnelsMapMesh';
}