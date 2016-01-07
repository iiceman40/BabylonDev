$(document).ready(function(){
	var canvas = document.getElementById("renderCanvas");
	var engine = new BABYLON.Engine(canvas, true);

	var scene = createScene();

	engine.runRenderLoop(function () {
		scene.render();
	});

	window.addEventListener("resize", function () { engine.resize();});

	function createScene() {
		var scene = new BABYLON.Scene(engine);

		this.camera = new BABYLON.VirtualJoysticksCamera("playerVJC", new BABYLON.Vector3(0, 0, -10), scene);
		camera.attachControl(canvas, true);

		BABYLON.MeshBuilder.CreateBox('box', {}, scene);

		return scene;
	}

});