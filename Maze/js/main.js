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

	// preparing textures
	var texturesToLoad = [
		{name: 'wallTexture', path: 'img/Grill9_normal.png'}
	];
	var loadedTextures = {};

	var assetsManager = new BABYLON.AssetsManager(scene);

	for(var i=0; i < texturesToLoad.length; i++) {
		var currentTexture = texturesToLoad[i];
		var textureTask = assetsManager.addTextureTask("wall textures task", currentTexture.path);
		textureTask.nameOfLoadedTexture = currentTexture.name;
		textureTask.onSuccess = function (task) {
			loadedTextures[task.nameOfLoadedTexture] = task.texture;
			console.log('finished loading ', task.nameOfLoadedTexture);
		};
	}

	assetsManager.onFinish = function (tasks) {
		console.log('finished loading assets');
		engine.runRenderLoop(function () {
			scene.render();
		});
	};

	assetsManager.load();


	window.addEventListener("resize", function () {
		engine.resize();
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