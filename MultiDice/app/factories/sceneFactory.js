define(['babylonJs'], function () {

	var SceneFactory = function () {
		console.log('initiating SceneFactory');
	};

	SceneFactory.prototype.createScene = function (canvas, engine) {
		var scene = new BABYLON.Scene(engine);

		var radius = 5;
		var camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/2, radius, new BABYLON.Vector3(0, 0, 0), scene);
		camera.setTarget(BABYLON.Vector3.Zero());
		camera.attachControl(canvas, false);

		camera.lowerRadiusLimit = radius;
		camera.upperRadiusLimit = radius;

		camera.lowerBetaLimit = Math.PI/2;
		camera.upperBetaLimit = Math.PI/2;
		camera.inertia = 0.97;


		var light = new BABYLON.DirectionalLight("light1", new BABYLON.Vector3(-0.5, -1, 2), scene);
		light.parent = camera;

		//scene.debugLayer.show(true, camera);

		window.addEventListener("resize", function () {
			engine.resize();
		});

		// Register a render loop to repeatedly render the scene
		engine.runRenderLoop(function () {
			scene.render();
		});

		return scene;
	};

	return new SceneFactory();

});