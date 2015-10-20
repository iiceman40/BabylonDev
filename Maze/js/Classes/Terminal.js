var Terminal = function (position, maze, player, sounds, shadowGenerator, scene) {
	var self = this;

	// TODO select random message
	var message = 'newRank';

	this.message = new Message("You have a new, worse rank. <br/> Congratulations. <br/> To everyone above you.", sounds[message]);

	var terminalCase = BABYLON.MeshBuilder.CreateBox('terminalCase', {size: 0.6, depth: 0.3}, scene);
	terminalCase.material = new TerminalCaseMaterial(scene);
	shadowGenerator.getShadowMap().renderList.push(terminalCase);

	var terminalScreen = BABYLON.MeshBuilder.CreateBox('terminalScreen', {size: 0.5, depth: 0.32}, scene);
	terminalScreen.material = new TerminalScreenMaterial(scene);
	terminalScreen.parent = terminalCase;


	// interaction event listener
	window.addEventListener("mousedown", function (evt) {
		// right click to interact with terminal
		if (evt.button === 2) {
			var ray = new BABYLON.Ray(player.position, player.getTarget().subtract(player.position));
			var pickingInfo = scene.pickWithRay(ray, function(mesh){
				return mesh.name == 'terminalScreen';
			});

			if(pickingInfo.hit) {

				var message = 'newRank';
				var sound = sounds[message];
				sound.attachToMesh(terminalCase);
				if(!sound.isPlaying) {
					sound.play();
				}

				// update screen text
				wrapText(self.message.text, 20, 60, "bold 40px Lucida Console", "green", "#19321C", true, true, pickingInfo.pickedMesh.material.diffuseTexture);
			}
		}

		return false;
	});

	var blink = false;
	setInterval(function(){
		var message = self.message.text;
		if(blink){
			message += ' |'
		}
		blink = !blink;
		// text, x, y, font, color, clearColor, invertY, update, dynamicTexture
		wrapText(message, 20, 60, "bold 40px Lucida Console", "green", "#19321C", true, true, terminalScreen.material.diffuseTexture);
	}, 200);


	// add terminal to first room
	/* FIXME
	var cell = [maze.map[position.y][position.x][position.z]];
	for(var i=0; i < cell.directions.length; i++){
		var direction = cell.directions[i];
		var wall = cell.walls['direction'];
		// TODO check if wall exists and if so place terminal there
		// TODO handle if no wall was available
	}
	*/
	terminalCase.position = getCellPosition(position.y, position.x, position.z, maze, spacing);
	terminalCase.position.z += (cellSize - wallThickness) / 2 - 0.15;

};