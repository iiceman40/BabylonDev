var engine, canvas, label, remainingAssetsManager;
var targetToGoTo = null;
var previousAutoRotateValue = true;

// MAIN FUNCTION
$(document).ready(function(){
	label = $("#label");
	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);

	$('#stillLoading').text(loadingText);

	var scene = createScene();

	engine.loadingUIText = loadingText;
	engine.runRenderLoop(function () {
		scene.render();
	});

	// event listeners
	window.addEventListener("resize", function () {
		engine.resize();
	});

	$(document).bind('mousemove',function(e){
		label.css({
			left:  e.pageX,
			top:   e.pageY - 30
		});
	});

	// toggling full screen
	$('.toggleFullscreen').click(function(){
		//engine.switchFullscreen(true);
		var element = document.getElementById("canvas-wrapper");
		if (
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement
		) {
			quitFullscreen(element);
			$(this).removeClass('active');
		} else {
			launchFullscreen(element);
			$(this).addClass('active');
		}

	});

	// toggling auto rotate
	$('.toggleAutoRotate').click(function(){
		autoRotate = (!autoRotate);
		$(this).toggleClass('active');
	});

	// zooming in and out
	$('.zoomIn').click(function(){
		animateValue(scene.activeCamera, 'radius', Math.max(scene.activeCamera.radius - zoomStepSize, zoomMax), zoomDuration, false, scene);
	});
	$('.zoomOut').click(function(){
		animateValue(scene.activeCamera, 'radius', Math.min(scene.activeCamera.radius + zoomStepSize, zoomMin), zoomDuration, false, scene);
	});

	// turning the camera with buttons
	$('.turnRight').click(function(){
		animateValue(scene.activeCamera, 'alpha', scene.activeCamera.alpha - cameraTurnStepSize, cameraTurnDuration, true, scene);
	});
	$('.turnLeft').click(function(){
		animateValue(scene.activeCamera, 'alpha', scene.activeCamera.alpha + cameraTurnStepSize, cameraTurnDuration, true, scene);
	});
	$('.turnUp').click(function(){
		animateValue(scene.activeCamera, 'beta', scene.activeCamera.beta - cameraTurnStepSize, cameraTurnDuration, true, scene);
	});
	$('.turnDown').click(function(){
		animateValue(scene.activeCamera, 'beta', scene.activeCamera.beta + cameraTurnStepSize, cameraTurnDuration, true, scene);
	});

});


/**
 * main function to create scene
 * @returns {BABYLON.Scene}
 */
function createScene() {
	var hashes = location.hash.split('#');

	// create the scene
	var scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3(0.9, 0.9, 0.9);

	// check for parameters and define doors
	if(hashes[1]) {
		selectedSceneId = getSceneIdFromName(hashes[1]);
	}

	// init selected scene
	var selectedScene = scenes[selectedSceneId];

	if(selectedScene.hasOwnProperty('heightCorrectionAngle')) {
		heightCorrectionAngle = selectedScene.heightCorrectionAngle;
	}

	// define what assets to load and what objects to add
	var assetsManager = new BABYLON.AssetsManager(scene);
	var initialTextureTask = assetsManager.addTextureTask("image task", selectedScene.image);

	initialTextureTask.onSuccess = function(task) {
		selectedScene.preloadedImage = task.texture;

		// check for debug parameter
		if(hashes[1] == 'debug' || hashes[2] == 'debug') {
			scene.debugLayer.show();
			// picking positions on sphere for creating new doors easily
			window.addEventListener("click", function () {
				// We try to pick an object
				var pickResult = scene.pick(scene.pointerX, scene.pointerY);
				if(pickResult && pickResult.pickedPoint) {
					console.log(Math.round(pickResult.pickedPoint.x) + ', ' + Math.round(pickResult.pickedPoint.y) + ', ' + Math.round(pickResult.pickedPoint.z));
				}
			});
		}

		// create the environment sphere
		var environmentSphere = createEnvironmentSphere(selectedScene, scene);
		// create doors
		createDoors(selectedScene.doors, environmentSphere, scene);

		// start pre loading remaining textures
		remainingAssetsManager = new BABYLON.AssetsManager(scene);
		for(var j = 0; j < scenes.length; j++){
			if(!scenes[j].preloadedImage) {
				var newTask = remainingAssetsManager.addTextureTask('scene with array id ' + j + ' image task', scenes[j].image);
				newTask.sceneId = j;
				newTask.onSuccess = function (task) {
					scenes[task.sceneId].preloadedImage = task.texture;
					//console.log('loading of scene with array id ' + task.sceneId + ' done', scenes[task.sceneId].preloadedImage);
					// if the scene that just finished loading has already been selected, go there
					var thisSceneTargetName = 'scene' + (parseInt(task.sceneId) + 1);
					if(targetToGoTo == thisSceneTargetName){
						goToThisTarget(targetToGoTo, scene);
					}
				};
			}
		}
		setTimeout(function(){
			remainingAssetsManager.useDefaultLoadingScreen = false;
			remainingAssetsManager.load();
		}, 100);

	};

	// camera
	var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, Math.PI/2 + heightCorrectionAngle, 250, new BABYLON.Vector3(0, 10, 0), scene);
	camera.attachControl(canvas, true);
	camera.lowerRadiusLimit = zoomMax;
	camera.upperRadiusLimit = zoomMin;

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
		var environmentSphere = scene.getMeshByName('environmentSphere');
		if(environmentSphere && autoRotate) {
			environmentSphere.rotation.y += 0.001;
		}
	});

	return scene;

}

function setDoorActions(doorObject, target, scene){
	doorObject.actionManager = new BABYLON.ActionManager(scene);
	doorObject.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, function () {
		previousAutoRotateValue = autoRotate;
		autoRotate = false;
		goToThisTarget(target, scene);
	}));
	doorObject.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOutTrigger, function(){
		autoRotate = true;
		label.fadeOut(100);
	}));
	doorObject.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function(){
		autoRotate = false;
		if(doorObject.name) {
			var sceneId = getSceneIdFromName(doorObject.name);
			label.text(scenes[sceneId].name).fadeIn(100);
		}
	}));
}

function goToThisTarget(target, scene){
	var path = 'http://' + window.location.hostname + window.location.pathname;
	window.location.href = path + '#' + target;

	var sceneId = getSceneIdFromName(target);
	var selectedScene = scenes[sceneId];

	// load new scene
	if(selectedScene.preloadedImage) {
		$('#stillLoading').fadeOut(100);
		// clear current scene
		for(var i=scene.meshes.length-1; i>=0; i--){
			scene.meshes[i].dispose();
		}
		// set new environment texture
		var environmentSphere = createEnvironmentSphere(selectedScene, scene);
		// set new doors
		createDoors(selectedScene.doors, environmentSphere, scene);
		// set camera angle
		if(selectedScene.hasOwnProperty('heightCorrectionAngle')) {
			heightCorrectionAngle = selectedScene.heightCorrectionAngle;
		}
		scene.activeCamera.alpha = Math.PI/2;
		scene.activeCamera.beta = Math.PI/2 + heightCorrectionAngle;

		autoRotate = previousAutoRotateValue;

	} else {
		//location.reload(); // if required area is not yet loaded, reload the page to trigger the loading screen
		targetToGoTo = target;
		$('#stillLoading').fadeIn(100);
	}
}

function getSceneIdFromName(name){
	return parseInt(name.replace('scene', '')) - 1;
}

function launchFullscreen(element) {
	if(element.requestFullscreen) {
		element.requestFullscreen();
	} else if(element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if(element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if(element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}
function quitFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.msExitFullscreen) {
		document.msExitFullscreen();
	}
}

/**
 *
 * @param object
 * @param property
 * @param targetValue
 * @param duration
 * @param stopAutoRotateDuringAnimation
 * @param scene
 */
function animateValue(object, property, targetValue, duration, stopAutoRotateDuringAnimation, scene) {
	var animation = new BABYLON.Animation(
		"animate value",
		property,
		100 * (1000.0 / duration),
		BABYLON.Animation.ANIMATIONTYPE_FLOAT,
		BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
	);

	// Animation keys
	var keys = [];
	keys.push({
		frame: 0,
		value: object[property]
	});

	keys.push({
		frame: 100,
		value: targetValue
	});

	// Adding keys to the animation object
	animation.setKeys(keys);

	// launch animation directly
	var reactivateAutoRotateAfterAnimation = false;
	if(autoRotate && stopAutoRotateDuringAnimation){
		autoRotate = false;
		reactivateAutoRotateAfterAnimation = true;
	}
	scene.stopAnimation(object);
	scene.beginDirectAnimation(object, [animation], 0, 100, false, 1, function(){
		if(reactivateAutoRotateAfterAnimation) {
			autoRotate = true;
		}
	});
}

function createDoors(doors, environmentSphere, scene){
	if(doors.length > 0) {

		var targetTexture = new BABYLON.Texture('img/target.png', scene);

		var doorMaterial = new BABYLON.StandardMaterial("doorMaterial", scene);
		doorMaterial.emissiveColor = new BABYLON.Color3(1, 1, 1);
		doorMaterial.opacityTexture = targetTexture;
		doorMaterial.diffuseTexture = targetTexture;

		for(var i=0; i<doors.length; i++){
			var doorObject = BABYLON.Mesh.CreatePlane(doors[i].target, 30, scene);
			doorObject.position = doors[i].position.subtract(doors[i].position.scale(0.05));
			doorObject.parent = environmentSphere;
			doorObject.material = doorMaterial;
			doorObject.lookAt(BABYLON.Vector3.Zero());

			// define door actions
			setDoorActions(doorObject, doors[i].target, scene);
		}

	}
}

function createEnvironmentSphere(selectedScene, scene){
	environmentSphere = BABYLON.Mesh.CreateSphere("environmentSphere", 32, 1024, scene);

	var material = new BABYLON.StandardMaterial("environmentMaterial", scene);
	material.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
	material.diffuseTexture = selectedScene.preloadedImage;
	material.diffuseTexture.wAng = -Math.PI/2;
	material.diffuseTexture.vAng = Math.PI;
	material.diffuseTexture.level = 1.4;
	material.backFaceCulling = false;

	// assign material to environment sphere
	environmentSphere.material = material;

	return environmentSphere;
}