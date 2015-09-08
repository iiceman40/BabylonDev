/**
 * VARIABLES
 */
var spacecraft = null;
var eniviornment = null;
var currentTarget = null;
var targetIndicator = null;
var targetIndicatorLine = null;
var targetIndicatorLinePreview = null;
var targetIndicatorColor = new BABYLON.Color3(0, 0.5, 0);


/**
 * DOCUMENT READY
 */
$(document).ready(function(){
	var canvas = document.getElementById("renderCanvas");
	var scene = createScene(canvas);

	$('#toggleDebugLayer').click(function(){
		if(scene.debugLayer._enabled){
			scene.debugLayer.hide();
		} else {
			scene.debugLayer.show();
		}
	})

});


/*
 * FUNCTIONS
 */
var createScene = function (canvas) {
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);

	// create camera
	var camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI/2 , Math.PI/4, 50, new BABYLON.Vector3(0, 0, 5), scene);
	//camera.upperBetaLimit = 1;
	camera.lowerRadiusLimit = 4;
	camera.attachControl(canvas, true);
	scene.activeCamera = camera;

	// create directional light
	var light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(0, -1, 0), scene);
	light.intensity = 0.3;

	// create environment
	eniviornment = new Environment(scene);

	// create spacecraft
	spacecraft = new Spacecraft(scene);


	/**
	 * MOUSE DOWN
	 */
	window.addEventListener("mousedown", function (e) {

		if (e.target.id == 'renderCanvas') {
			var pickResult = scene.pick(scene.pointerX, scene.pointerY);

			if(pickResult.pickedMesh.isTargetable || e.button == 0) {
				camera.detachControl(canvas);
			}
		}

	});


	/**
	 * MOUSE UP
	 */
	var targetToTurnTo = null;
	var movementTargetPoint = null;
	window.addEventListener("mouseup", function (e) {

		if (e.target.id == 'renderCanvas' && e.button == 0) {

			var pickResult;
			pickResult = scene.pick(scene.pointerX, scene.pointerY, function(mesh){
				return mesh.isTargetable && !mesh.isOutline; // make sure mesh is targetable and is not the outline
			});

			if (pickResult.hit) {

				// initiate shooting the target
				spacecraft.clearTargetIndicator();
				movementTargetPoint = null;
				targetToTurnTo = pickResult.pickedMesh; // spacecraft will be turned to this point and then fires laser

			} else {

				// moving to target location
				targetToTurnTo = null;

				pickResult = scene.pick(scene.pointerX, scene.pointerY);
				if (pickResult.pickedPoint) {
					// set spacecraft target
					movementTargetPoint = pickResult.pickedPoint;
					if (targetIndicator) {
						targetIndicator.dispose();
					}
					targetIndicator = BABYLON.Mesh.CreateSphere('targetIndicator', 1, 0.7, scene);
					targetIndicator.scaling.y = 0.01;
					targetIndicator.material = new BABYLON.StandardMaterial('indicatiorMaterial', scene);
					targetIndicator.material.emissiveColor = targetIndicatorColor;
					targetIndicator.position = movementTargetPoint.clone();
				}

			}

			camera.attachControl(canvas, true);

		}

	});


	/**
	 * BEFORE RENDER
	 */
	var cursor = null;
	var cursorMaterial = new BABYLON.StandardMaterial('cursorMaterial', scene);
	cursorMaterial.emissiveColor = targetIndicatorColor;
	cursor = BABYLON.Mesh.CreateSphere('targetIndicator', 1, 0.3, scene);
	cursor.scaling.y = 0.01;
	cursor.material = cursorMaterial;

	scene.registerBeforeRender(function () {

		// face target for shooting
		if(targetToTurnTo){
			var turnDone = spacecraft.faceTarget(targetToTurnTo);
			if(turnDone){
				spacecraft.shootLaser(targetToTurnTo, scene);
				targetToTurnTo = null;
			}
		}

		// move spaceship
		if (movementTargetPoint) {
			spacecraft.facePoint(movementTargetPoint);
			spacecraft.moveForward(movementTargetPoint, scene);
		}

		// rotate and move asteroids
		var asteroids = eniviornment.asteroids;
		for(i=0; i<asteroids.length; i++) {
			var direction = asteroids[i].rotationDirection;

			// rotate asteroids
			if(direction >= 3 || direction == 1) {
				asteroids[i].rotation.x += asteroids[i].rotationSpeed;
			}
			if(direction >= 4 || direction == 2) {
				asteroids[i].rotation.y += asteroids[i].rotationSpeed;
			}
			if(direction >= 5 || direction == 3) {
				asteroids[i].rotation.z += asteroids[i].rotationSpeed;
			}

			// move asteroid slightly
			if(direction >= 3 || direction == 1) {
				asteroids[i].position.x += asteroids[i].rotationSpeed;
			}
			if(direction >= 5 || direction == 3) {
				asteroids[i].position.z += asteroids[i].rotationSpeed;
			}
		}

		// move cursor
		var pickInfo = scene.pick(scene.pointerX, scene.pointerY, function(mesh){
			return mesh == eniviornment.ground;
		});
		if (scene && spacecraft && pickInfo.hit) {
			// place cursor marker
			cursor.position = pickInfo.pickedPoint;

			// show movement direction/attack line
			if(targetIndicatorLinePreview){
				targetIndicatorLinePreview.dispose();
			}

			if(spacecraft.spacecraftAvatar) {
				targetIndicatorLinePreview = BABYLON.Mesh.CreateDashedLines('targetIndicator', [
					spacecraft.spacecraftAvatar.position,
					pickInfo.pickedPoint
				], 1, 1, Math.round(spacecraft.spacecraftAvatar.position.subtract(pickInfo.pickedPoint).length() / 2), scene);

				// decide line color
				if(currentTarget){
					targetIndicatorLinePreview.color = new BABYLON.Color3(0.7, 0, 0);
				} else {
					targetIndicatorLinePreview.color = targetIndicatorColor;
				}
			}

		}

	});


	/**
	 * RENDER
	 */
	engine.runRenderLoop(function () {
		scene.render();
	});


	/**
	 * ON RESIZE
	 */
	window.addEventListener("resize", function () {
		engine.resize();
	});


	return scene;

};


function initTargetableActions(target, customOutline, scene){
	target.actionManager = new BABYLON.ActionManager(scene);
	target.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(e){
			var mesh = e.meshUnderPointer;
			customOutline.position = mesh.position;
			customOutline.rotation = mesh.rotation;
			customOutline.isVisible = true;
			currentTarget = mesh;
		})
	);

	target.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(e){
			customOutline.isVisible = false;
			currentTarget = null;
		})
	);
}