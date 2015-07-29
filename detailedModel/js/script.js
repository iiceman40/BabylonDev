$(window).ready(function(){

	var canvas = document.getElementById("renderCanvas");
	var scene, camera;

	createScene();
	//scene.debugLayer.show();

	function createScene() {

		var engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);

		// Light directional
		var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -1, 1).normalize(), scene);
		light.specular = new BABYLON.Color3(0.05, 0.05, 0.05);
		light.position = new BABYLON.Vector3(100, 200, -100);
		light.intensity = 0.7;

		var lightSphere = BABYLON.Mesh.CreateSphere('lightsphere', 16, 10, scene);
		lightSphere.position = light.position;

		camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/5, 35, new BABYLON.Vector3(0, 0, 0), scene);
		scene.activeCamera = camera;
		camera.attachControl(canvas);

		// Shadows
		var shadowGenerator = new BABYLON.ShadowGenerator(4096, light);
		//shadowGenerator.useBlurVarianceShadowMap = true;
		shadowGenerator.usePoissonSampling = true;

		// Character/Player
		BABYLON.SceneLoader.ImportMesh("SYLT_Business_Wom_13", "models/", "woman.babylon", scene, function (newMeshes, particleSystems) {
			var woman = newMeshes[0];
			woman.position.y = -120;
			woman.receiveShadows = true;
			shadowGenerator.getShadowMap().renderList.push(woman);
		});

		engine.runRenderLoop(function () {
			scene.render();
		});

		window.addEventListener("resize", function () { engine.resize();});
	}

});