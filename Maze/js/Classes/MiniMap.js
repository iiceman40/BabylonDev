var MiniMap = function(width, height, player, scene){
	// mini map camera
	var mapCamera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 5 * 2, 150, player.position, scene);

	// viewport
	var ration = $(document).width() / $(document).height();
	var xstart = 1 - width/100;
	var ystart = 1 - height/100 * ration;
	var viewportWidth = 1 - xstart;
	var viewportHeight = 1 - ystart;

	mapCamera.viewport = new BABYLON.Viewport(
		xstart,
		ystart,
		viewportWidth,
		viewportHeight
	);

	mapCamera.layerMask = 1; // 001 in binary

	// disable key control for mini map
	mapCamera.keysUp = [];
	mapCamera.keysDown = [];
	mapCamera.keysLeft = [];
	mapCamera.keysRight = [];

	// Add the camera to the list of active cameras of the game
	// show and hdie camera on key toggle
	window.addEventListener("keydown", function(event){
		if(event.keyCode == 77){
			var index = scene.activeCameras.indexOf(mapCamera);
			if(index == -1){
				scene.activeCameras.push(mapCamera);
			} else {
				scene.activeCameras.splice(index,1);
			}
		}

	});

	mapCamera.attachControl(canvas, true);

	// player on mini map
	var playerMaterial = new BABYLON.StandardMaterial('playerMaterial', scene);
	playerMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
	playerMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
	playerMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

	var playerOnMiniMap = BABYLON.Mesh.CreateCylinder("player", 5, 0, 4, 6, 1, scene, false);
	playerOnMiniMap.rotation.x = Math.PI / 2;
	playerOnMiniMap.scaling.z = 1.5;
	playerOnMiniMap.material = playerMaterial;
	playerOnMiniMap.layerMask = 1;

	// The sphere position will be displayed accordingly to the player position
	playerOnMiniMap.registerBeforeRender(function() {
		playerOnMiniMap.rotation.y = player.rotation.y;
		playerOnMiniMap.position.x = player.position.x;
		playerOnMiniMap.position.z = player.position.z;
	});
};