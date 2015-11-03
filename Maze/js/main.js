var canvas, engine, scene;
var destroyedModal;
var originalConfig = clone(config);

$(document).ready(function () {
	$('body').on('contextmenu', 'canvas', function (e) {
		return false;
	});

	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);

	scene = createScene();
	engine.runRenderLoop(function () {
		scene.render();
	});

	// UI
	destroyedModal = new Modal();

	$('#menu').click(function(){
		$('#menuModal').modal('show');
	});

	$('.show-highscores').click(function(){
		var highscoreTable = $('#menuModal').find('.modal-body .highscores');
		$.post('db/get_highscore.php', {}, function (data) {
			var parsedData = JSON.parse(data);
			if (parsedData.success) {
				showHighscores(highscoreTable, parsedData, null);
			} else {
				// could not retrieve high score list
				alert(parsedData.error);
			}
		});
	});

});

function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}