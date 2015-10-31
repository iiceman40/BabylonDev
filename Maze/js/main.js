var canvas, engine, scene;
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
	})
});

function clone(obj) {
	if (null == obj || "object" != typeof obj) return obj;
	var copy = obj.constructor();
	for (var attr in obj) {
		if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
	}
	return copy;
}