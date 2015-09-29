var engine, canvas;

$(document).ready(function(){
	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);

	var scene = createScene();

	engine.loadingUIText = "Bitte haben Sie einen Moment Geduld, die benötigten Daten werden geladen...";
	engine.runRenderLoop(function () {
		scene.render();
	});

	// event listeners
	window.addEventListener("resize", function () {
		engine.resize();
	});
	window.addEventListener("click", function () {
		// We try to pick an object
		var pickResult = scene.pick(scene.pointerX, scene.pointerY);
		console.log(Math.round(pickResult.pickedPoint.x) + ', ' + Math.round(pickResult.pickedPoint.y) + ', ' + Math.round(pickResult.pickedPoint.z));
	});

});

function createScene() {
	var environmentSphere, image;
	var doors = [];
	var hashes = location.hash.split('#');

	// create the scene
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);

	// check for parameters and define doors
	switch(hashes[1]){
		case 'scene1':
			image = "img/app7.jpg";
			doors.push({
				position: new BABYLON.Vector3(214, -24, -464),
				target: 'scene2'
			});
			doors.push({
				position: new BABYLON.Vector3(494, -22, 130),
				target: 'scene3'
			});
			break;
		case 'scene2':
			image = "img/app7_kitchen.jpg";
			doors.push({
				position: new BABYLON.Vector3(228, 59, 454),
				target: 'scene1'
			});
			doors.push({
				position: new BABYLON.Vector3(510, 19, -16),
				target: 'scene4'
			});
			break;
		case 'scene3':
			image = "img/garden1.jpg";
			doors.push({
				position: new BABYLON.Vector3(322, 305, -255),
				target: 'scene1'
			});
			doors.push({
				position: new BABYLON.Vector3(448, 31, 244),
				target: 'scene4'
			});
			break;
		case 'scene4':
			image = "img/garden2.jpg";
			doors.push({
				position: new BABYLON.Vector3(-442, -47, -253),
				target: 'scene3'
			});
			doors.push({
				position: new BABYLON.Vector3(61, 394, -320),
				target: 'scene1'
			});
			doors.push({
				position: new BABYLON.Vector3(211, 337, -322),
				target: 'scene2'
			});
			break;
		default:
			image = "img/app7.jpg"
	}

	// define what assets to load and what objects to add
	var assetsManager = new BABYLON.AssetsManager(scene);
	var textureTask = assetsManager.addTextureTask("image task", image);
	textureTask.onSuccess = function(task) {
		// check for debug parameter
		if(hashes[1] == 'debug' || hashes[2] == 'debug') {
			scene.debugLayer.show();
		}

		// create the environment sphere
		environmentSphere = BABYLON.Mesh.CreateSphere("environmentSphere", 32, 1024, scene);

		var material = new BABYLON.StandardMaterial("environmentMaterial", scene);
		material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
		material.diffuseTexture = task.texture;
		material.diffuseTexture.wAng = -Math.PI/2;
		material.diffuseTexture.vAng = Math.PI;
		material.diffuseTexture.level = 1.4;
		material.backFaceCulling = false;
		// material.diffuseTexture.coordinatesMode = BABYLON.Texture.SPHERICAL_MODE;

		// assign material to environment sphere
		environmentSphere.material = material;
		//sphere1.infiniteDistance = true;

		// create doors
		if(doors.length > 0) {
			var spriteManagerDoors = new BABYLON.SpriteManager("doorsManager","img/target.png", 10, 51, scene);


			var doorMaterial = new BABYLON.StandardMaterial("doorMaterial", scene);
			doorMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.9, 0.2);

			for(var i=0; i<doors.length; i++){
				var doorSphere = BABYLON.Mesh.CreateSphere("door1", 12, 32, scene);
				var door = new BABYLON.Sprite("player", spriteManagerDoors);
				door.size = 51;
				door.position = doors[i].position.subtract(doors[i].position.scale(0.05));
				door.parent = environmentSphere;

				doorSphere.position = doors[i].position;
				doorSphere.material = doorMaterial;

				// define door actions
				door.actionManager = new BABYLON.ActionManager(scene);
				setDoorAction(door, doors[i].target);
			}

		}

	};

	// camera
	var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, Math.PI/2-0.3, 250, new BABYLON.Vector3(0, 10, 0), scene);
	camera.attachControl(canvas, true);
	camera.lowerRadiusLimit = 10;
	camera.upperRadiusLimit = 256;

	// light
	var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	var light2 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, -1, 0), scene);
	light1.intensity = 0.5;
	light2.intensity = 0.5;

	// start the loading process
	assetsManager.load();

	// stuff to do before each render call
	scene.registerBeforeRender(function(){
		// auto rotation
		//material.diffuseTexture.vOffset += 0.00025;
		if(environmentSphere) {
			//environmentSphere.rotation.y += 0.001;
		}
	});

	return scene;

}

function setDoorAction(door, target){
	door.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
		var path = 'http://' + window.location.hostname + window.location.pathname;
		window.location.href = path + '#' + target;
		location.reload();
	}));
}