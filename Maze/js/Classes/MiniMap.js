var MiniMap = function(width, height, player, scene){
	// mini map camera
	var mapCamera = new BABYLON.FreeCamera("minimap", new BABYLON.Vector3(0,80,0), scene);
	mapCamera.setTarget(new BABYLON.Vector3(0.01, 0.01, 0.01));
	// Activate the orthographic projection
	mapCamera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
	mapCamera.rotation.y = 0;

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

	// Add the camera to the list of active cameras of the game
	scene.activeCameras.push(mapCamera);

	// show correct area on mini map
	mapCamera.orthoLeft = -width * 10/2;
	mapCamera.orthoRight = width * 10/2;
	mapCamera.orthoTop =  height * 10/2;
	mapCamera.orthoBottom = -height * 10/2;

	// player on mini map
	var playerMaterial = new BABYLON.StandardMaterial('playerMaterial', scene);
	playerMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
	playerMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
	playerMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

	var playerOnMiniMap = BABYLON.Mesh.CreateCylinder("player", 5, 0, 4, 6, 1, scene, false);
	playerOnMiniMap.rotation.x = Math.PI / 2;
	playerOnMiniMap.scaling.z = 1.5;
	playerOnMiniMap.position.y = 50;
	playerOnMiniMap.material = playerMaterial;
	playerOnMiniMap.layerMask = 1;
	// The sphere position will be displayed accordingly to the player position
	playerOnMiniMap.registerBeforeRender(function() {
		playerOnMiniMap.rotation.y = player.rotation.y;
		playerOnMiniMap.position.x = player.position.x;
		playerOnMiniMap.position.z = player.position.z;
	});
};