$(document).ready(function(){

	createScene();

	function createScene() {
		var canvas = document.getElementById("renderCanvas");

		var engine = new BABYLON.Engine(canvas, true);

		BABYLON.SceneLoader.Load("", "models/Mannequin6animation.babylon", engine, function (newScene) {
			newScene.executeWhenReady(function () {

				// Camera 1 (right side)
				var camera1 = new BABYLON.ArcRotateCamera("camera1", 0, Math.PI/2, 20, new BABYLON.Vector3(0,7,0), newScene);
				newScene.activeCameras.push(camera1);

				// Camera 2 (left side)
				var camera2 = new BABYLON.ArcRotateCamera("camera2", -Math.PI/2, Math.PI/2, 20, new BABYLON.Vector3(0,7,0), newScene);
				newScene.activeCameras.push(camera2);

				// Viewports
				camera1.viewport = new BABYLON.Viewport(0.5, 0, 0.5, 1.0); // right
				camera2.viewport = new BABYLON.Viewport(0.0, 0, 0.5, 1.0); // left

				// Camera control
				camera2.attachControl(canvas, true);

				// Animation
				var skeleton = newScene.getSkeletonById(0);
				newScene.beginAnimation(skeleton, 1, 50, true, 1);

				engine.runRenderLoop(function () {
					newScene.render();
				});
			});
		});

		window.addEventListener("resize", function () { engine.resize();});
	}

});