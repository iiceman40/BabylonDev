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

function drawMaze(maze, config, scene) {
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

	var outerTunnel = BABYLON.MeshBuilder.CreateBox('mazeConnectorOuter', {
		height: connectorHeight + 2,
		width: connectorWidth + 2,
		depth: 10
	}, scene);
	var innerTunnel = BABYLON.MeshBuilder.CreateBox('mazeConnectorInner', {
		height: connectorHeight,
		width: connectorWidth,
		depth: 10
	}, scene);

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

				var cellPos = getCellPosition(x, y, z, maze, config.spacing);

				var posX = cellPos.x;
				var posY = cellPos.y;
				var posZ = cellPos.z;

				var outerBox = BABYLON.Mesh.CreateBox('mazeCellOuter', config.cellSize, scene);
				var innerBox = BABYLON.Mesh.CreateBox('mazeCellInner', config.cellSize - config.wallThickness, scene);

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

	boxesMesh.dispose();
	connectorsMesh.dispose();

	var tunnelsMesh = BABYLON.Mesh.MergeMeshes(tunnels, true);

	var finalMazeMesh = BABYLON.Mesh.MergeMeshes([mazeMesh, tunnelsMesh], true);
	finalMazeMesh.checkCollisions = true;
	finalMazeMesh.name = "mazeCellsMesh";
	finalMazeMesh.receiveShadows = true;
	finalMazeMesh.layerMask = 2;
	finalMazeMesh.material = wallMaterial;

	tunnelsMesh.dispose();
	mazeMesh.dispose();

	var outerTunnelsMesh = BABYLON.Mesh.MergeMeshes(outerTunnels, true);
	outerTunnelsMesh.name = 'outerTunnelMesh';
	outerTunnelsMesh.layerMask = 1;

	var outerBoxesMesh = BABYLON.Mesh.MergeMeshes(outerBoxes, true);
	outerBoxesMesh.layerMask = 1;
	outerBoxesMesh.name = 'outerBoxesMesh';

	drawMazeMap(finalMazeMesh, scene);

	return finalMazeMesh;
}

function drawMazeMap(mazeMesh, scene) {
	mazeMap = mazeMesh.clone();
	mazeMap.layerMask = 1;
	mazeMap.material = new MazeMapMaterial(scene);
	mazeMap.name = 'mazeMapMesh';
}

function getCellPosition(gridX, gridY, gridZ, maze, spacing) {
	var posX = (gridX - maze.width / 2 + 0.5) * spacing;
	var posY = (gridY - maze.height / 2 + 0.5) * spacing;
	var posZ = (gridZ - maze.depth / 2 + 0.5) * spacing;

	return new BABYLON.Vector3(posX, posY, posZ);
}

function wrapText(text, x, y, font, color, clearColor, invertY, update, dynamicTexture) {
	if (update === void 0) {
		update = true;
	}
	var size = dynamicTexture.getSize();
	if (clearColor) {
		dynamicTexture._context.fillStyle = clearColor;
		dynamicTexture._context.fillRect(0, 0, size.width, size.height);
	}
	dynamicTexture._context.font = font;
	if (x === null) {
		var textSize = dynamicTexture._context.measureText(text);
		x = (size.width - textSize.width) / 2;
	}
	dynamicTexture._context.fillStyle = color;

	//dynamicTexture._context.fillText(text, x, y);
	var words = text.split(' ');
	var line = '';
	var lineHeight = 50;
	var maxWidth = size.width - 10;

	for (var n = 0; n < words.length; n++) {
		var testLine = line;
		var isBreak = words[n] == '<br/>';

		if (!isBreak) {
			testLine = line + words[n] + ' ';
		}

		var metrics = dynamicTexture._context.measureText(testLine);
		var testWidth = metrics.width;

		if ((testWidth > maxWidth && n > 0) || isBreak) {
			dynamicTexture._context.fillText(line, x, y);

			if (isBreak) {
				line = '';
			} else {
				line = words[n] + ' ';
			}
			y += lineHeight;
		} else {
			line = testLine;
		}
	}
	dynamicTexture._context.fillText(line, x, y);

	if (update) {
		dynamicTexture.update(invertY);
	}
}

function initPointerLock(canvas, camera) {
	// On click event, request pointer lock
	canvas.addEventListener("click", function (evt) {
		canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
		if (canvas.requestPointerLock) {
			canvas.requestPointerLock();
		}
	}, false);

	// Event listener when the pointerlock is updated (or removed by pressing ESC for example).
	var pointerlockchange = function (event) {
		var controlEnabled = (
		document.mozPointerLockElement === canvas
		|| document.webkitPointerLockElement === canvas
		|| document.msPointerLockElement === canvas
		|| document.pointerLockElement === canvas);
		// If the user is already locked
		if (!controlEnabled) {
			camera.detachControl(canvas);
		} else {
			camera.attachControl(canvas);
		}
	};

	// Attach events to the document
	document.addEventListener("pointerlockchange", pointerlockchange, false);
	document.addEventListener("mspointerlockchange", pointerlockchange, false);
	document.addEventListener("mozpointerlockchange", pointerlockchange, false);
	document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
}

function speakPart(textArray, part, terminal) {

	if(terminal) {
		terminal.isPlayingMessage = true;
	}

	var html = $('<p>' + textArray[part] + '</p>');
	var utterance = new SpeechSynthesisUtterance(html.text());
	utterance.lang = 'en-US';
	utterance.rate = 0.7;
	utterance.pitch = 0.8;

	utterance.onend = function (event) {
		if (part < textArray.length - 1) {
			speakPart(textArray, part + 1, terminal)
		} else {
			if(terminal) {
				terminal.isPlayingMessage = false;
			}
		}
	};

	setTimeout(function(){
		window.speechSynthesis.speak(utterance);
	});
}

function updateBar(bar, value) {
	bar.scaling.x = value / 100;
}

function initTerminals(maze, player, miniMap, availableMessages, shadowGenerator, scene) {
	var numberOfTerminals = Math.floor(maze.numberOfRooms / 4);
	// add a terminal to the first room
	new Terminal(new BABYLON.Vector3(maze.width - 1, maze.height - 1, 0), maze, player, miniMap, availableMessages, shadowGenerator, scene);
	var placedTerminals = 1;

	while (numberOfTerminals - placedTerminals > 0) {
		var x = Math.floor(Math.random() * maze.width);
		var y = Math.floor(Math.random() * maze.height);
		var z = Math.floor(Math.random() * maze.depth);
		if (!maze.map[y][x][z].hasTerminal) {
			new Terminal(new BABYLON.Vector3(x, y, z), maze, player, miniMap, availableMessages, shadowGenerator, scene);
			placedTerminals++;
		}
	}
}

/**
 *
 * @param enemies
 * @param maze
 * @param player
 * @param mazeMesh
 * @param game
 * @param scene
 */
function initEnemies(enemies, maze, player, mazeMesh, game, scene) {
	var numberOfEnemies = Math.floor(maze.numberOfRooms / 4);
	var spawnedEnemies = 0;

	while (numberOfEnemies - spawnedEnemies > 0) {
		var x = Math.floor(Math.random() * maze.width);
		var y = Math.floor(Math.random() * maze.height);
		var z = Math.floor(Math.random() * maze.depth);
		var distanceToPlayer = player.position.subtract(getCellPosition(x, y, z, maze, config.spacing)).length();
		if (!maze.map[y][x][z].hasEnemy && !maze.map[y][x][z].hasExit && distanceToPlayer > game.enemyDetectionDistance) {
			maze.map[y][x][z].hasEnemy = true;
			enemies.push(new Enemy(maze, player, new BABYLON.Vector3(x, y, z), mazeMesh, game, scene));
			spawnedEnemies++;
		}
	}
}

function showHighscores(highscoreTable, parsedData, currentPlayerId){
	highscoreTable.html('');
	for (var i = 0; i < parsedData.list.length; i++) {
		var entry = parsedData.list[i];
		var css = (currentPlayerId && currentPlayerId == entry.id) ? 'me' : '';
		var rank = i + 1;
		highscoreTable.append('<tr class="' + css + '"><td>' + rank + '.</td><td>' + entry.name + '</td><td>' + entry.level + '</td></tr>');
	}
}