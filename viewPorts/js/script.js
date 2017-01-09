$(document).ready(function () {

	createScene();

	function createScene() {
		var canvas = document.getElementById("renderCanvas");

		var engine = new BABYLON.Engine(canvas, true);
		var scene = new BABYLON.Scene(engine);

		// Camera 1 (right side)
		var camera1 = new BABYLON.ArcRotateCamera("camera1", 0, Math.PI / 2, 250, new BABYLON.Vector3(0, 90, 0), scene);
		scene.activeCameras.push(camera1);

		// Camera 2 (left side)
		var camera2 = new BABYLON.ArcRotateCamera("camera2", -Math.PI / 2, Math.PI / 2, 250, new BABYLON.Vector3(0, 90, 0), scene);
		scene.activeCameras.push(camera2);

		scene.activeCamera.attachControl(canvas, true);

		var light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(-.5, -1, .7), scene);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.intensity = 0.8;

		BABYLON.SceneLoader.ImportMesh("15_RootNode", "models/", "walking.babylon", scene, function (newMeshes, particleSystems, skeletons) {
			scene.debugLayer.show();

			var mesh = newMeshes[2];
			console.log(mesh.skeleton)

			// Viewports
			camera1.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1.0); // right
			camera2.viewport = new BABYLON.Viewport(0.0, 0, 0.5, 1.0); // left

			// Camera control
			camera2.attachControl(canvas, true);

			// Animation
			var skeleton = mesh.skeleton;

			skeleton.createAnimationRange("walk", 1, 31);

			skeleton.beginAnimation("walk", true);

		});

		engine.runRenderLoop(function () {
			scene.render();
		});

		window.addEventListener("resize", function () {
			engine.resize();
		});
	}

});