$(document).ready(function(){
	var GRAVITY = -0.4;

	var canvas = document.getElementById("renderCanvas");
	var scene, meshPlayer, cameraArcRotate = [];
	var tempMouseX, tempMouseY;
	var keys = {
		left: 0,
		right: 0,
		back: 0,
		forward: 0
	};
	var speed = 5, forward, backwards;

	createScene();
	//scene.debugLayer.show();

	window.addEventListener("pointerdown", function (event) {
		tempMouseX = event.x;
		tempMouseY = event.y;
	});
	window.addEventListener("pointerup", function (event) {
		if(Math.abs(tempMouseX - event.x) < 10 && Math.abs(tempMouseY - event.y) < 10) {
			var pickResult = scene.pick(scene.pointerX, scene.pointerY);
			if(pickResult) {
				meshPlayer.destination = pickResult.pickedPoint.clone();
				meshPlayer.startingPoint = meshPlayer.position.clone();
				meshPlayer.distanceToTarget = meshPlayer.destination.subtract(meshPlayer.position.clone()).length();
				var tempDestination = pickResult.pickedPoint.clone();
				tempDestination.y = tempDestination.y + 0.5;

				var path = BABYLON.Mesh.CreateLines("lines", [
					meshPlayer.position,
					tempDestination
				], scene);
				path.color = new BABYLON.Color3(0, 0, 1);
			}
		}
	});


	function animateActor() {
		var rayPick = new BABYLON.Ray(meshPlayer.position, new BABYLON.Vector3(0, -1, 0));
		var meshFound = scene.pickWithRay(rayPick, function (item) {
			return item != meshPlayer;
		});

		/*
		if(meshFound.distance > 1.1 || true) {
			var path = BABYLON.Mesh.CreateLines("lines", [
				meshPlayer.position,
				meshFound.pickedPoint
			], scene);
			path.color = new BABYLON.Color3(1, 0, 0);
		}
		 */

		var distanceToGround = 0;
		if(meshFound.pickedPoint) {
			var rayToGround = meshFound.pickedPoint.subtract(meshPlayer.position);
			distanceToGround = rayToGround.length();
		}


		// move to clicked coordinates
		if(meshPlayer.destination) {
			var moveVector = meshPlayer.destination.subtract(meshPlayer.position);

			y = GRAVITY;

			var jump = false;
			if(jump) {
				// acceleration based on distance
				var startingPoint = new BABYLON.Vector2(meshPlayer.startingPoint.x, meshPlayer.startingPoint.z)
				var position = new BABYLON.Vector2(meshPlayer.position.x, meshPlayer.position.z);

				var distanceTraveled = startingPoint.subtract(position).length();
				var x = distanceTraveled - meshPlayer.distanceToTarget / 2;
				var y = (x * x) / (meshPlayer.distanceToTarget * meshPlayer.distanceToTarget);
				if (x > 0) {
					y *= -1;
				}
			}

			if(moveVector.length() > 0.1) {
				moveVector.y = GRAVITY;
				moveVector = moveVector.normalize();
				moveVector = moveVector.scale(0.2);
				if(distanceToGround > 1.5) {
					moveVector.y = y;
				} else {
					moveVector.y = y/5;
				}
				meshPlayer.moveWithCollisions(moveVector);
			} else {
				meshPlayer.destination = null;
				meshPlayer.startingPoint = null;
				meshPlayer.distanceToTarget = null;
			}

			var moveVectorNormalized = moveVector.normalize();
			var finalMoveVector = moveVectorNormalized.scale(this.speed);

			// rotate avatar
			var v1 = new BABYLON.Vector3(0,0,1);
			var v2 = moveVectorNormalized;

			var productVector = BABYLON.Vector3.Dot(v1, v2);
			var productLength = v1.length() * v2.length();
			var angle = Math.acos(productVector / productLength);

			if(!isNaN(angle)) {
				if(moveVectorNormalized.x<0) angle = angle * -1;

				// calculate both angles in degrees
				var angleDegrees = Math.round(angle * 180/Math.PI);
				var playerRotationDegress = Math.round(meshPlayer.rotation.y * 180/Math.PI);

				// calculate the delta
				var deltaDegrees = playerRotationDegress - angleDegrees;

				// check what direction to turn to take the shotest turn
				if(deltaDegrees > 180){
					deltaDegrees = deltaDegrees - 360;
				} else if(deltaDegrees < -180){
					deltaDegrees = deltaDegrees + 360;
				}

				var rotationSpeed = Math.round(Math.abs(deltaDegrees)/8);
				if(deltaDegrees > 0){
					meshPlayer.rotation.y -= rotationSpeed * Math.PI/180;
					if(meshPlayer.rotation.y < -Math.PI){
						meshPlayer.rotation.y = Math.PI;
					}
				}
				if(deltaDegrees < 0 ) {
					meshPlayer.rotation.y += rotationSpeed * Math.PI / 180;
					if(meshPlayer.rotation.y > Math.PI){
						meshPlayer.rotation.y = -Math.PI;
					}
				}

			}

		}
	}
	function CameraFollowActor() {
		//meshPlayer.rotation.y = -4.69 - cameraArcRotate[0].alpha;
		cameraArcRotate[0].target.x = parseFloat(meshPlayer.position.x);
		cameraArcRotate[0].target.y = parseFloat(meshPlayer.position.y)+1;
		cameraArcRotate[0].target.z = parseFloat(meshPlayer.position.z);
	}

	function createScene() {

		var engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);

		//Active gravity and collision
		scene.gravity = new BABYLON.Vector3(0, GRAVITY, 0);
		scene.collisionsEnabled = true;

		// Light directional
		var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, 0), scene);
		light.specular = new BABYLON.Color3(0.05, 0.05, 0.05);
		light.position = new BABYLON.Vector3(30, 50, 5);
		light.intensity = 1;

		var sun = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(60, 100, 10), scene);
		sun.intensity = 0.1;

		var sphere = BABYLON.Mesh.CreateSphere("box", 9, 1, scene);
		sphere.position = light.position;

		// Shadows
		var shadowGenerator = new BABYLON.ShadowGenerator(4096, light);
		shadowGenerator.useVarianceShadowMap = false;
		shadowGenerator.usePoissonSampling = true;

		// Camera third person
		cameraArcRotate[0] = new BABYLON.ArcRotateCamera("CameraBaseRotate", -Math.PI/2, Math.PI/5, 25, new BABYLON.Vector3(0, 0, 0), scene);
		cameraArcRotate[0].wheelPrecision = 15;
		cameraArcRotate[0].lowerRadiusLimit = 2;
		//cameraArcRotate[0].upperRadiusLimit = 50;
		cameraArcRotate[0].minZ = 0;
		cameraArcRotate[0].minX = 4096;
		scene.activeCamera = cameraArcRotate[0];
		cameraArcRotate[0].attachControl(canvas);

		// Terrain
		var extraGround = BABYLON.Mesh.CreateGround("extraGround", 1000, 1000, 1, scene, false);
		var extraGroundMaterial = new BABYLON.StandardMaterial("extraGround", scene);
		extraGroundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
		extraGroundMaterial.diffuseTexture.uScale = 60;
		extraGroundMaterial.diffuseTexture.vScale = 60;
		extraGround.position.y = -2.05;
		extraGround.material = extraGroundMaterial;
		extraGround.checkCollisions = true;
		extraGround.receiveShadows = true;

		var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/ground_heightmap.png", 100, 100, 100, 0, 10, scene, false);
		var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
		groundMaterial.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
		groundMaterial.diffuseTexture.uScale = 6;
		groundMaterial.diffuseTexture.vScale = 6;
		groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		ground.position.y = -2.0;
		ground.material = groundMaterial;
		ground.checkCollisions = true;
		ground.receiveShadows = true;

		// Wall
		var wall = BABYLON.Mesh.CreateBox("wall", 1, scene);
		wall.scaling = new BABYLON.Vector3(15, 6, 1);
		wall.position.y = 3;
		wall.position.z = 20;
		wall.checkCollisions = true;
		wall.receiveShadows = true;
		shadowGenerator.getShadowMap().renderList.push(wall);

		// Ramp
		var ramp = BABYLON.Mesh.CreateBox("ramp", 5, scene);
		ramp.scaling = new BABYLON.Vector3(3, 0.1, 1);
		ramp.position.y = 1;
		ramp.position.z = -20;
		ramp.rotation.z = Math.PI/7;
		ramp.checkCollisions = true;
		ramp.receiveShadows = true;
		shadowGenerator.getShadowMap().renderList.push(ramp);

		var rampLarge = BABYLON.Mesh.CreateBox("rampLarge", 10, scene);
		rampLarge.scaling = new BABYLON.Vector3(3, 0.1, 1);
		rampLarge.position.y = 4;
		rampLarge.position.z = -20;
		rampLarge.position.x = -20;
		rampLarge.rotation.z = Math.PI/7;
		rampLarge.checkCollisions = true;
		rampLarge.receiveShadows = true;
		shadowGenerator.getShadowMap().renderList.push(rampLarge);

		var box = BABYLON.Mesh.CreateBox("box", 5, scene);
		box.position.y = 1.5;
		box.position.z = -20;
		box.position.x = 10;
		box.checkCollisions = true;
		box.receiveShadows = true;
		shadowGenerator.getShadowMap().renderList.push(box);

		// Skybox
		var skybox = BABYLON.Mesh.CreateBox("skyBox", 1000.0, scene);
		var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("skybox/skybox", scene);
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		skybox.material = skyboxMaterial;

		// Character/Player
		BABYLON.SceneLoader.ImportMesh("Body", "models/", "bobbin.babylon", scene, function (newMeshes, particleSystems) {
			meshPlayer = newMeshes[0];
			meshPlayer.position.y = 4;
			meshPlayer.receiveShadows = true;
			shadowGenerator.getShadowMap().renderList.push(meshPlayer);

			meshPlayer.checkCollisions = true;
			meshPlayer.ellipsoid = new BABYLON.Vector3(1, 1.2, 1);
			meshPlayer.ellipsoidOffset = new BABYLON.Vector3(0, 2.4, 0);
			meshPlayer.applyGravity = true;

			// Water
			var waterMesh = BABYLON.Mesh.CreateGround("waterMesh", 1024, 1024, 1, scene, false);
			waterMesh.position.y = 0.5;

			var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(512, 512));
			water.backFaceCulling = true;
			water.bumpTexture = new BABYLON.Texture("textures/water_bump.png", scene);
			water.windForce = -5;
			water.waveHeight = 0.2;
			water.bumpHeight = 0.05;
			water.waterColor = new BABYLON.Color3(0.2, 0.2, 0.25);
			water.colorBlendFactor = 0.3;

			// Assign the water material
			waterMesh.material = water;

			// refraction
			water.refractionTexture.renderList.push(extraGround);
			water.refractionTexture.renderList.push(ground);
			water.refractionTexture.renderList.push(skybox);
			water.refractionTexture.renderList.push(meshPlayer);
			water.refractionTexture.renderList.push(ramp);
			water.refractionTexture.renderList.push(rampLarge);
			water.refractionTexture.renderList.push(box);
			// reflection
			water.reflectionTexture.renderList.push(extraGround);
			water.reflectionTexture.renderList.push(ground);
			water.reflectionTexture.renderList.push(skybox);
			water.reflectionTexture.renderList.push(meshPlayer);
			water.reflectionTexture.renderList.push(ramp);
			water.reflectionTexture.renderList.push(rampLarge);
			water.reflectionTexture.renderList.push(box);

		});


		scene.registerBeforeRender(function() {
			if(scene.isReady() && meshPlayer) {
				animateActor();
			}
		});

		engine.runRenderLoop(function () {
			scene.render();
			if(scene.isReady() && meshPlayer){
				CameraFollowActor();
			}
		});

		window.addEventListener("resize", function () { engine.resize();});
	}

});