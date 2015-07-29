$(window).ready(function(){

	var canvas = document.getElementById("renderCanvas");
	var scene, camera;

	createScene();
	//scene.debugLayer.show();

	function createScene() {

		var engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);

		var sun = new BABYLON.PointLight("sunlight", new BABYLON.Vector3(60, 100, 10), scene);
		sun.intensity = 0.5;

		camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/5, 35, new BABYLON.Vector3(0, 0, 0), scene);
		scene.activeCamera = camera;
		camera.attachControl(canvas);

		var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
		groundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
		groundMaterial.diffuseTexture.uScale = 50;
		groundMaterial.diffuseTexture.vScale = 50;
		groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

		var ground = BABYLON.Mesh.CreateGround("ground", 1000, 1000, 1, scene, false);
		ground.position.y = -1;
		ground.material = groundMaterial;

		// Water
		BABYLON.Engine.ShadersRepository = "";
		var waterMaterial = new WaterMaterial("water", scene, sun);
		// refraction
		waterMaterial.refractionTexture.renderList.push(ground);
		// reflection
		waterMaterial.reflectionTexture.renderList.push(ground);

		var water = BABYLON.Mesh.CreateGround("water", 1000, 1000, 1, scene, false);
		water.material = waterMaterial;

		engine.runRenderLoop(function () {
			scene.render();
		});

		window.addEventListener("resize", function () { engine.resize();});
	}

});