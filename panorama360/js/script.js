var engine, canvas;

$(document).ready(function(){
	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);

	var scene = createScene();

	engine.loadingUIText = "Bitte haben Sie einen Moment Geduld, die benötigten Daten werden geladen...";

	engine.runRenderLoop(function () {
		scene.render();
	});

	window.addEventListener("resize", function () { engine.resize();});

});

function createScene() {
	var image;
	var hashes = location.hash.split('#');

	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);

	switch(hashes[1]){
		case 'quality1':
			image = "img/_61U9543-Panorama_equi-2_tiny.jpg";
			break;
		case 'quality2':
			image = "img/_61U9543-Panorama_equi-2_small.jpg";
			break;
		case 'quality3':
			image = "img/_61U9543-Panorama_equi-2.jpg";
			break;
		default:
			image = "img/_61U9543-Panorama_equi-2_small.jpg"
	}

	var assetsManager = new BABYLON.AssetsManager(scene);
	var textureTask = assetsManager.addTextureTask("image task", image);
	textureTask.onSuccess = function(task) {
		if(hashes[1] == 'debug' || hashes[2] == 'debug') {
			scene.debugLayer.show();
		}

		var sphere1 = BABYLON.Mesh.CreateSphere("sphere1", 32, 256, scene);

		//var sphere2 = BABYLON.Mesh.CreateSphere("sphere1", 32, 5, scene);
		//sphere2.position = new BABYLON.Vector3(0, 0, 10);

		var material = new BABYLON.StandardMaterial("texture1", scene);
		material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
		material.diffuseTexture = task.texture;
		material.diffuseTexture.wAng = -Math.PI/2;
		material.diffuseTexture.vAng = Math.PI;
		material.diffuseTexture.level = 1.5;

		// material.diffuseTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
		material.backFaceCulling = false;
		sphere1.material = material;
		//sphere1.infiniteDistance = true;

		scene.registerBeforeRender(function(){
			//material.diffuseTexture.vOffset += 0.00025;
			sphere1.rotation.y += 0.001;
		});
	};

	var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, Math.PI/2-0.3, 150, new BABYLON.Vector3(0, 0, 0), scene);
	camera.setTarget(BABYLON.Vector3.Zero());
	camera.attachControl(canvas, true);

	camera.lowerRadiusLimit = 10;
	camera.upperRadiusLimit = 96;

	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 1.1;

	assetsManager.load();

	return scene;

}