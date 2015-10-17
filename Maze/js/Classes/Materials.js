var WallMaterial = function(scene) {
	var wallMaterial = new BABYLON.StandardMaterial('wallMaterial', scene);
	wallMaterial.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
	wallMaterial.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
	wallMaterial.diffuseTexture = new BABYLON.Texture('img/brick_wall.jpg', scene);
	wallMaterial.diffuseTexture.uScale = 5;
	wallMaterial.diffuseTexture.vScale = 5;
	wallMaterial.bumpTexture = new BABYLON.Texture('img/brick_wall_normalmap.png', scene);
	wallMaterial.bumpTexture.uScale = 5;
	wallMaterial.bumpTexture.vScale = 5;
	return wallMaterial;
};

var GroundMaterial = function(maze, scene) {
	var groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene);
	groundMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0);
	groundMaterial.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
	groundMaterial.diffuseTexture = new BABYLON.Texture('img/ground.jpg', scene);
	groundMaterial.diffuseTexture.uScale = maze.width * 5;
	groundMaterial.diffuseTexture.vScale = maze.height * 5;
	groundMaterial.bumpTexture = new BABYLON.Texture('img/ground_normalmap.png', scene);
	groundMaterial.bumpTexture.uScale = maze.width * 5;
	groundMaterial.bumpTexture.vScale = maze.height * 5;
	return groundMaterial;
};

var DoorMaterial = function(scene) {
	var doorMaterial = new BABYLON.StandardMaterial('playerMaterial', scene);
	doorMaterial.diffuseColor = new BABYLON.Color3(0, 0.7, 0);
	doorMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	return doorMaterial;
};

var ExitMaterial = function(scene) {
	var exitMaterial = new BABYLON.StandardMaterial('exitMaterial', scene);
	exitMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
	exitMaterial.emissiveColor = new BABYLON.Color3(1, 0, 1);
	return exitMaterial;
};