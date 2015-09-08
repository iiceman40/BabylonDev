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

	var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, -5, 0), scene);
	camera.setTarget(BABYLON.Vector3.Zero());
	camera.attachControl(canvas, true);

	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 2;

	var sphere1 = BABYLON.Mesh.CreateSphere("sphere1", 32, 512, scene);

	var material = new BABYLON.StandardMaterial("texture1", scene);
	material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
	material.diffuseTexture = new BABYLON.Texture("img/01.jpg", scene);
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
		//texture.uOffset += 0.001;
	});

	return scene;

}