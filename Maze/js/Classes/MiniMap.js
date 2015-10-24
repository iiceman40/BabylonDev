var MiniMap = function(miniMapWidth, miniMapHeight, maze, player, scene){
	var self = this;

	// mini map camera
	this.mapCamera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 5 * 2, Math.max(maze.width, maze.height, maze.depth) * 50, new BABYLON.Vector3(0,0,0), scene);

	this.isVisible = false;

	// viewport
	var ration = $(document).width() / $(document).height();
	var xstart = 1 - miniMapWidth/100;
	var ystart = 1 - miniMapHeight/100;
	var viewportWidth = 1 - xstart;
	var viewportHeight = 1 - ystart;

	this.mapCamera.viewport = new BABYLON.Viewport(
		xstart,
		ystart,
		viewportWidth,
		viewportHeight
	);

	this.mapCamera.layerMask = 1; // 001 in binary

	// disable key control for mini map
	this.mapCamera.keysUp = [];
	this.mapCamera.keysDown = [];
	this.mapCamera.keysLeft = [];
	this.mapCamera.keysRight = [];

	this.playerKeys = {
		up: player.keysUp,
		down: player.keysDown,
		left: player.keysLeft,
		right: player.keysRight
	};

	// fix/hack for triggering the intersect event with the player on the mini map and the exit
	scene.activeCameras.push(this.mapCamera);
	setTimeout(function(){
		var index = scene.activeCameras.indexOf(self.mapCamera);
		if(index != -1){
			scene.activeCameras.splice(index,1);
		}
	}, 0);

	// Add the camera to the list of active cameras of the game
	// show and hide camera on key toggle
	/*
	window.addEventListener("keydown", function(event){
		if(event.keyCode == 77){
			var index = scene.activeCameras.indexOf(self.mapCamera);
			if(index == -1){
				self.showMiniMap();
			} else {
				self.hideMiniMap(index);
			}
		}
	});
	*/

	this.showMiniMap = function(){
		$('.hud').fadeOut(200);
		$('.closeMapHint').fadeIn(1000);
		scene.activeCameras.push(self.mapCamera);
		self.mapCamera.attachControl(canvas, true);
		player.keysUp = [];
		player.keysDown = [];
		player.keysLeft = [];
		player.keysRight = [];
		this.isVisible = true;
	};

	this.hideMiniMap = function(mapCameraIndex){
		if(typeof mapCameraIndex == 'undefined'){
			mapCameraIndex = scene.activeCameras.indexOf(self.mapCamera);
		}
		scene.activeCameras.splice(mapCameraIndex, 1);
		self.mapCamera.detachControl(canvas);
		player.keysUp = this.playerKeys.up;
		player.keysDown = this.playerKeys.down;
		player.keysLeft = this.playerKeys.left;
		player.keysRight = this.playerKeys.right;
		$('.hud').fadeIn(200);
		$('.closeMapHint').fadeOut(200);
		this.isVisible = false;
	};

	// player on mini map
	var playerMaterial = new BABYLON.StandardMaterial('playerMaterial', scene);
	playerMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
	playerMaterial.emissiveColor = new BABYLON.Color3(1, 0, 0);
	playerMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

	this.playerOnMiniMap = BABYLON.Mesh.CreateCylinder("player", 3, 0, 2, 6, 1, scene, false);
	this.playerOnMiniMap.rotation.x = Math.PI / 2;
	this.playerOnMiniMap.bakeCurrentTransformIntoVertices();
	this.playerOnMiniMap.scaling.z = 1.5;
	this.playerOnMiniMap.material = playerMaterial;
	this.playerOnMiniMap.layerMask = 1;

	// The sphere position will be displayed accordingly to the player position
	this.playerOnMiniMap.registerBeforeRender(function() {
		self.playerOnMiniMap.rotation = player.rotation;
		self.playerOnMiniMap.position = player.position;
	});

	return this;
};