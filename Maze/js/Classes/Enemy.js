/**
 * @param maze
 * @param player
 * @param scene {BABYLON.Scene}
 * @constructor
 */
var Enemy = function(maze, player, scene){
	var enemyMaterial = new BABYLON.StandardMaterial('enemyMaterial', scene);
	enemyMaterial.diffuseColor = new BABYLON.Color3(0, 1, 0);
	enemyMaterial.emissiveColor = new BABYLON.Color3(0, 1, 0);

	var enemy = BABYLON.Mesh.CreateSphere("enemy", 32, 3, scene, false);
	enemy.material = enemyMaterial;
	enemy.position = new BABYLON.Vector3(5 - maze.width * 10 / 2, 49, 5 - maze.height * 10 / 2);
	enemy.checkCollisions = true;
	enemy.visibility = 0.7;

	var animationScaling = new BABYLON.Animation("scalingAnimation", "scaling", 100, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	// Animation keys
	var keysScaling = [];
	keysScaling.push({
		frame: 0,
		value: new BABYLON.Vector3(1.1, 0.85, 1.1)
	});
	keysScaling.push({
		frame: 40,
		value: new BABYLON.Vector3(1, 1, 1)
	});
	keysScaling.push({
		frame: 45,
		value: new BABYLON.Vector3(1, 1, 1)
	});
	keysScaling.push({
		frame: 100,
		value: new BABYLON.Vector3(1.1, 0.85, 1.1)
	});
	//Adding keys to the animation object
	animationScaling.setKeys(keysScaling);
	//Then add the animation object to box1
	enemy.animations.push(animationScaling);

	var originalPosition = enemy.position.clone();

	var animationPosition = new BABYLON.Animation("scalingAnimation", "position.y", 100, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	// Animation keys
	var keysPostion = [];
	keysPostion.push({
		frame: 0,
		value: originalPosition.y
	});
	keysPostion.push({
		frame: 40,
		value: originalPosition.y + 1.8
	});
	keysPostion.push({
		frame: 50,
		value: originalPosition.y + 2
	});
	keysPostion.push({
		frame: 100,
		value: originalPosition.y
	});
	//Adding keys to the animation object
	animationPosition.setKeys(keysPostion);
	//Then add the animation object to box1
	enemy.animations.push(animationPosition);

	//Finally, launch animations on box1, from key 0 to key 100 with loop activated
	scene.beginAnimation(enemy, 0, 100, true);


	// enemy health bar
	var healthBarMaterial = new BABYLON.StandardMaterial("hb1mat", scene);
	healthBarMaterial.diffuseColor = BABYLON.Color3.Green();
	healthBarMaterial.emissiveColor = BABYLON.Color3.Green();
	healthBarMaterial.backFaceCulling = false;

	var healthBarContainerMaterial = new BABYLON.StandardMaterial("hb2mat", scene);
	healthBarContainerMaterial.diffuseColor = BABYLON.Color3.Blue();
	healthBarContainerMaterial.backFaceCulling = false;

	var healthBar = BABYLON.Mesh.CreatePlane("hb1", {width: 2, height: 0.5, subdivisions: 4}, scene);
	var healthBarContainer = BABYLON.Mesh.CreatePlane("hb2", {width:2, height:.5, subdivisions:4}, scene);

	healthBar.position = new BABYLON.Vector3(0, 0, -.01);
	healthBarContainer.position = new BABYLON.Vector3(0, 2, 0);

	healthBar.parent = healthBarContainer;
	healthBarContainer.parent = enemy;

	healthBar.material = healthBarMaterial;
	healthBarContainer.material = healthBarContainerMaterial;
	healthBarContainer.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;

	var alive = true;
	var healthPercentage = 100;

	scene.registerBeforeRender(function () {

		if (alive) {

			// Re-calculate health bar length.
			healthBar.scaling.x = healthPercentage / 100;
			healthBar.position.x =  (1 - (healthPercentage / 100)) * -1;

			if (healthBar.scaling.x < 0) {
				alive = false;
			}
			else if (healthBar.scaling.x < .5) {
				healthBarMaterial.diffuseColor = BABYLON.Color3.Yellow();
				healthBarMaterial.emissiveColor = BABYLON.Color3.Yellow();
			}
			else if (healthBar.scaling.x < .3) {
				healthBarMaterial.diffuseColor = BABYLON.Color3.Red();
				healthBarMaterial.emissiveColor = BABYLON.Color3.Red();
			}

		} else {
			enemy.dispose();
		}
	});

	// melee attack action
	enemy.actionManager = new BABYLON.ActionManager(scene);
	enemy.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
		var distance = player.position.subtract(enemy.position).length();
		console.log(distance);

		if(distance < 10) {
			healthPercentage -= 10;
			if (healthPercentage <= 0) {
				healthPercentage = 0;
				alive = false;
			}
		}
	}));

	return enemy;
};