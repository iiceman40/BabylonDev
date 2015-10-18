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

var HealthBarMaterialFull = function(scene) {
	var healthBarMaterial = new BABYLON.StandardMaterial("healthBarFullMaterial", scene);
	healthBarMaterial.diffuseColor = BABYLON.Color3.Green();
	healthBarMaterial.emissiveColor = BABYLON.Color3.Green();
	healthBarMaterial.backFaceCulling = false;
	return healthBarMaterial;
};

var HealthBarMaterialDamaged = function(scene) {
	var healthBarMaterial = new BABYLON.StandardMaterial("healthBarDamagedMaterial", scene);
	healthBarMaterial.diffuseColor = BABYLON.Color3.Yellow();
	healthBarMaterial.emissiveColor = BABYLON.Color3.Yellow();
	healthBarMaterial.backFaceCulling = false;
	return healthBarMaterial;
};

var HealthBarMaterialCritical = function(scene) {
	var healthBarMaterial = new BABYLON.StandardMaterial("healthBarCriticalMaterial", scene);
	healthBarMaterial.diffuseColor = BABYLON.Color3.Red();
	healthBarMaterial.emissiveColor = BABYLON.Color3.Red();
	healthBarMaterial.backFaceCulling = false;
	return healthBarMaterial;
};

var HealthBarContainerMaterial = function(scene) {
	var healthBarContainerMaterial = new BABYLON.StandardMaterial("healthBarContainerMaterial", scene);
	healthBarContainerMaterial.diffuseColor = BABYLON.Color3.Blue();
	healthBarContainerMaterial.backFaceCulling = false;
	return healthBarContainerMaterial;
};

var MazeMapMaterial = function(scene) {
	// xray material
	var xray_mat = new BABYLON.StandardMaterial("xray", scene);
	xray_mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
	xray_mat.alpha = 0.3;
	var fresnel_params = new BABYLON.FresnelParameters();
	fresnel_params.isEnabled = true;
	fresnel_params.leftColor = new BABYLON.Color3(0.5, 0.6, 1);
	fresnel_params.rightColor = new BABYLON.Color3(0, 0, 0);
	fresnel_params.power = 2;
	fresnel_params.bias = 0.1;
	var fresnel_params2 = new BABYLON.FresnelParameters();
	fresnel_params2.isEnabled = true;
	fresnel_params2.leftColor = new BABYLON.Color3(1, 1, 1);
	fresnel_params2.rightColor = new BABYLON.Color3(0.2, 0.2, 0.2);
	fresnel_params2.power = 2;
	fresnel_params2.bias = 0.5;
	xray_mat.emissiveFresnelParameters = fresnel_params;
	xray_mat.opacityFresnelParameters = fresnel_params2;

	return xray_mat;
};