var engine, canvas;

$(document).ready(function(){
	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);

	var scene = createScene();

	engine.runRenderLoop(function () {
		scene.render();
	});

	window.addEventListener("resize", function () { engine.resize();});

});

function createScene() {
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);

	var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, Math.PI/2-0.3, 150, new BABYLON.Vector3(0, 0, 0), scene);
	camera.setTarget(BABYLON.Vector3.Zero());
	camera.attachControl(canvas, true);

	camera.lowerRadiusLimit = 10;
	camera.upperRadiusLimit = 250;

	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 1;

	var sphere1 = BABYLON.Mesh.CreateSphere("sphere1", 32, 512, scene);

	//var sphere2 = BABYLON.Mesh.CreateSphere("sphere1", 32, 5, scene);
	//sphere2.position = new BABYLON.Vector3(0, 0, 10);

	var material = new BABYLON.StandardMaterial("texture1", scene);
	material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
	//material.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0);
	material.diffuseTexture = new BABYLON.Texture("img/_61U9543-Panorama_equi-2_small.jpg", scene);
	material.diffuseTexture.wAng = -Math.PI/2;
	material.diffuseTexture.vAng = Math.PI;
	// material.diffuseTexture.uAng = Math.PI;

	material.diffuseTexture.level = 1.5;
	// material.diffuseTexture.vOffset = -Math.PI/2;  // left-right
	// material.diffuseTexture.uOffset = 0; // up-down

	// material.diffuseTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;
	material.backFaceCulling = false;
	sphere1.material = material;
	//sphere1.infiniteDistance = true;

	scene.registerBeforeRender(function(){
		material.diffuseTexture.vOffset += 0.00025;
	});

	return scene;

}