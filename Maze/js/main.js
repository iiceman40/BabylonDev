var canvas, engine, scene;

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

	window.addEventListener("resize", function () {
		engine.resize();
	});

});