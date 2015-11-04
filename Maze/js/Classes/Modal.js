var Modal = function () {
	var self = this;

	this.game = null;
	this.destroyedModal = $('#destroyedModal');
	this.highscoreTable = this.destroyedModal.find('.modal-body .highscores');
	this.destroyMessage = $('.destroyed-message, form.nickname');
	this.retryButton = $('.retry');
	this.saveHighscoreButton = $('.save-highscore');

	this.show = function(game) {
		self.game = game;
		self.destroyedModal.modal('show');
	};

	this.restart = function(){
		$('.level').fadeIn(500, function() {
			config = clone(originalConfig);
			scene = createScene();
			$('.save-highscore').attr('disabled', false);
			self.highscoreTable.html('');
			self.destroyMessage.show(0);
			console.log('restarting scene');
			engine.runRenderLoop(function () {
				scene.render();
			});
		});
	};

	this.saveHighscore = function(){
		var name = $('#name').val();
		var level = (self.game) ? self.game.level : false;

		if(name && level) {
			$.post('db/add_highscore.php', {name: name, level: level}, function (data) {
				var parsedData = JSON.parse(data);
				if (parsedData.success) {
					var currentPlayerId = parsedData.id;
					// get updated highscore list
					$.post('db/get_highscore.php', {}, function (data) {
						var parsedData = JSON.parse(data);
						if (parsedData.success) {
							self.destroyMessage.hide(0);
							$('.save-highscore').attr('disabled', 'disabled');
							showHighscores(self.highscoreTable, parsedData, currentPlayerId);
							var position = $('.me:first').position();
							self.destroyedModal.find('.modal-body').scrollTop(position.top);
						} else {
							// could not retrieve high score list
							alert(parsedData.error);
						}
					});
				} else {
					// could not make highscore entry
					alert(parsedData.error);
				}
			});
		} else {
			alert('Please enter your nickname to save your highscore.');
		}
	};

	this.retryButton.unbind('click', this.restart);
	this.retryButton.bind('click', this.restart);

	this.saveHighscoreButton.unbind('click', this.saveHighscore);
	this.saveHighscoreButton.bind('click', this.saveHighscore);
};