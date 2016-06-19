var Terminal = function (position, maze, player, miniMap, availableMessages, shadowGenerator, scene) {
	var self = this;

	this.activeMessageText = '';
	this.isPlayingMessage = false;
	//this.message = new Message("You have a new, worse rank. <br/> <br/> Congratulations. <br/> <br/> To everyone above you.", sounds[soundId]);
	var messageId = Math.floor(Math.random() * availableMessages.length);
	this.message = availableMessages[messageId];


	var terminalCase = BABYLON.MeshBuilder.CreateBox('terminalCase', {size: 0.6, depth: 0.3}, scene);
	terminalCase.material = new TerminalCaseMaterial(scene);
	shadowGenerator.getShadowMap().renderList.push(terminalCase);

	var terminalScreen = BABYLON.MeshBuilder.CreateBox('terminalScreen', {size: 0.5, depth: 0.32}, scene);
	terminalScreen.material = new TerminalScreenMaterial(scene);
	//terminalScreen.parent = terminalCase;
	terminalScreen.terminal = this;
	terminalScreen.isPickable = false;

	this.activateTerminal = function () {
		miniMap.showMiniMap();

		var message = 'newRank';
		var sound = this.message.sound;
		if (sound) {
			sound.attachToMesh(terminalCase);
			//if(!sound.isPlaying) {
			//sound.play();
			//}
		}
		if (!this.isPlayingMessage) {
			this.isPlayingMessage = true;
			// FIXME speak doesnt work or doesnt load the right language
			speakPart(self.message.text.split('<br/> <br/>'), 0, this);
			this.isPlayingMessage = false;
		}

		// update screen text
		if (self.activeMessageText.length == 0) {
			var typingInterval = setInterval(function () {
				self.activeMessageText = self.message.text.substr(0, self.activeMessageText.length + 2);
				if (self.activeMessageText.length == self.message.text.length) {
					clearInterval(typingInterval);
				}
			}, 150);
		}
	};

	var blink = false;
	setInterval(function () {
		blink = !blink;
	}, 200);

	if (config.animateTerminals) {
		setInterval(function () {
			var message = self.activeMessageText;
			if (blink) {
				if (self.activeMessageText.length == self.message.text.length) {
					message += ' <br/> ';
				}
				message += '|'
			}
			// text, x, y, font, color, clearColor, invertY, update, dynamicTexture
			wrapText(message, 20, 60, "bold 40px Lucida Console", "lightblue", "darkslategray", true, true, terminalScreen.material.diffuseTexture);
		}, 300);
	}


	// add this terminal to a random wall in the room
	var cell = maze.map[position.y][position.x][position.z];
	for (var i = 0; i < cell.directions.length; i++) {
		var direction = cell.directions[i];
		var wallExists = cell.walls[direction];
		// check if wall exists and if so place terminal there
		if (wallExists) {
			terminalCase.position = getCellPosition(position.x, position.y, position.z, maze, config.spacing);
			if (direction == 'S') {
				terminalCase.position.z += (config.cellSize - config.wallThickness) / 2 - 0.15;
				break;
			}
			if (direction == 'N') {
				terminalCase.position.z -= (config.cellSize - config.wallThickness) / 2 - 0.15;
				terminalCase.rotation.y = Math.PI;
				break;
			}
			if (direction == 'E') {
				terminalCase.position.x += (config.cellSize - config.wallThickness) / 2 - 0.15;
				terminalCase.rotation.y = Math.PI / 2;
				break;
			}
			if (direction == 'W') {
				terminalCase.position.x -= (config.cellSize - config.wallThickness) / 2 - 0.15;
				terminalCase.rotation.y = -Math.PI / 2;
				break;
			}
		}
	}
	// TODO handle if no wall was available??

	terminalScreen.position = terminalCase.position.clone();
	terminalScreen.rotation = terminalCase.rotation.clone();

	return terminalCase;
};