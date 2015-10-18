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
	enemy.position = new BABYLON.Vector3(10 - maze.width * 20 / 2, 0, 10 - maze.height * 20 / 2);
	enemy.checkCollisions = true;
	enemy.visibility = 0.7;

	// ANIMATIONS
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
		frame: 60,
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


	// HEALTH BAR
	var healthBarContainer = BABYLON.MeshBuilder.CreatePlane("hb2", {width: 2, height: 0.5, subdivisions: 4}, scene);
	healthBarContainer.position = new BABYLON.Vector3(0, 2, 0);
	healthBarContainer.parent = enemy;
	healthBarContainer.material = new HealthBarContainerMaterial(scene);
	healthBarContainer.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;

	var healthBar = BABYLON.MeshBuilder.CreatePlane("hb1", {width: 2, height: 0.5, subdivisions: 4}, scene);
	healthBar.material = new HealthBarMaterialFull(scene);
	healthBar.position = new BABYLON.Vector3(0, 0, -.01);
	healthBar.parent = healthBarContainer;

	var alive = true;
	var healthPercentage = 100;

	scene.registerBeforeRender(function () {

		if (alive) {

			// Re-calculate health bar length.
			healthBar.scaling.x = healthPercentage / 100;
			healthBar.position.x =  (1 - (healthPercentage / 100)) * -1;

			if (healthBar.scaling.x < 0) {
				alive = false;
			} else if (healthPercentage <= 30) {
				healthBar.material = new HealthBarMaterialCritical(scene);
			} else if (healthPercentage <= 50) {
				healthBar.material = new HealthBarMaterialDamaged(scene);
			}

		} else {
			enemy.dispose();
		}
	});

	// ATTACKING ENEMY ACTION
	enemy.actionManager = new BABYLON.ActionManager(scene);
	enemy.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function (evt) {
		var distance = player.position.subtract(enemy.position).length();

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