var Terminal = function (position, maze, player, miniMap, availableMessages, shadowGenerator, scene) {
	var self = this;

	this.activeMessageText = '';
	this.isPlayingMessage = false;
	//this.message = new Message("You have a new, worse rank. <br/> <br/> Congratulations. <br/> <br/> To everyone above you.", sounds[soundId]);
	var messageId = Math.floor(Math.random() * availableMessages.length);
	console.log(messageId, availableMessages.length);
	this.message = availableMessages[messageId];


	var terminalCase = BABYLON.MeshBuilder.CreateBox('terminalCase', {size: 0.6, depth: 0.3}, scene);
	terminalCase.material = new TerminalCaseMaterial(scene);
	shadowGenerator.getShadowMap().renderList.push(terminalCase);

	var terminalScreen = BABYLON.MeshBuilder.CreateBox('terminalScreen', {size: 0.5, depth: 0.32}, scene);
	terminalScreen.material = new TerminalScreenMaterial(scene);
	terminalScreen.parent = terminalCase;
	terminalScreen.terminal = this;


	this.activateTerminal = function(){
		miniMap.showMiniMap();

		var message = 'newRank';
		console.log(this.message);
		var sound = this.message.sound;
		if(sound) {
			sound.attachToMesh(terminalCase);
			//if(!sound.isPlaying) {
				//sound.play();
			//}
		}
		if(!this.isPlayingMessage) {
			this.isPlayingMessage = true;
			speakPart(self.message.text.split('<br/> <br/>'), 0, this);
			this.isPlayingMessage = false;
		}

		// update screen text
		if(self.activeMessageText.length == 0){
			var typingInterval = setInterval(function(){
				self.activeMessageText = self.message.text.substr(0,self.activeMessageText.length + 2);
				if(self.activeMessageText.length == self.message.text.length){
					clearInterval(typingInterval);
				}
			}, 150);
		}
	};

	var blink = false;
	setInterval(function(){
		blink = !blink;
	}, 200);

	setInterval(function() {
		var message = self.activeMessageText;
		if(blink){
			message += '|'
		}
		// text, x, y, font, color, clearColor, invertY, update, dynamicTexture
		wrapText(message, 20, 60, "bold 40px Lucida Console", "green", "#19321C", true, true, terminalScreen.material.diffuseTexture);
	}, 100);


	// add terminal to room
	var cell = maze.map[position.y][position.x][position.z];
	for(var i=0; i < cell.directions.length; i++){
		var direction = cell.directions[i];
		var wallExists = cell.walls[direction];
		// check if wall exists and if so place terminal there
		console.log(direction, wallExists);
		if(wallExists){
			terminalCase.position = getCellPosition(position.x, position.y, position.z, maze, spacing);
			if(direction == 'S') {
				console.log('placing terminal at south wall');
				terminalCase.position.z += (cellSize - wallThickness) / 2 - 0.15;
				break;
			}
			if(direction == 'N') {
				console.log('placing terminal at north wall');
				terminalCase.position.z -= (cellSize - wallThickness) / 2 - 0.15;
				terminalCase.rotation.y = Math.PI;
				break;
			}
			if(direction == 'E') {
				console.log('placing terminal at east wall');
				terminalCase.position.x += (cellSize - wallThickness) / 2 - 0.15;
				terminalCase.rotation.y = Math.PI/2;
				break;
			}
			if(direction == 'W') {
				console.log('placing terminal at west wall');
				terminalCase.position.x -= (cellSize - wallThickness) / 2 - 0.15;
				terminalCase.rotation.y = -Math.PI/2;
				break;
			}
		}
		// TODO handle if no wall was available??
	}

};