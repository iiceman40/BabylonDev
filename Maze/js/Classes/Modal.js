var Modal = function (game) {
	$('#destroyedModal').modal('show');


	window.addEventListener("resize", function () {
		engine.resize();
	});

	$('.retry').click(function(){
		$('.level').fadeIn(500, function() {
			config = clone(originalConfig);
			scene = createScene();
			engine.runRenderLoop(function () {
				scene.render();
			});
		});
	});

	var highscoreTable = $('.modal-body .highscores');
	var destroyMessage = $('.destroyed-message, form.nickname');

	$('.save-highscore').click(function(){
		var name = $('#name').val();
		$.post('db/add_highscore.php', {
			name: name,
			level: game.level
		}, function(data){
			var parsedData = JSON.parse(data);
			if(parsedData.success) {
				// get updated highscore lsit
				$.post('db/get_highscore.php', {}, function (data) {
					var parsedData = JSON.parse(data);
					if (parsedData.success) {
						highscoreTable.html('');
						destroyMessage.hide();
						$('.save-highscore').attr('disabled', 'disabled');
						for (var i = 0; i < parsedData.list.length; i++) {
							var entry = parsedData.list[i];
							var css = (name == entry.name) ? 'me' : '';
							var rank = i + 1;
							highscoreTable.append('<tr class="' + css + '"><td>' + rank + '.</td><td>' + entry.name + '</td><td>' + entry.level + '</td></tr>');
						}
						var position = $('.me:first').position();
						$('.modal-body').scrollTop(position.top);
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
	})
};