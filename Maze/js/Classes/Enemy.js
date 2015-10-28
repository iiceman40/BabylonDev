/**
 * @param maze
 * @param player
 * @param positionCoordinates
 * @param mazeMesh
 * @param sounds
 * @param scene {BABYLON.Scene}
 * @constructor
 */
var Enemy = function(maze, player, positionCoordinates, mazeMesh, sounds, scene){


	var enemy = BABYLON.Mesh.CreateSphere("enemy", 32, 2, scene, false);
	enemy.material = new EnemyMaterial(scene);
	enemy.position = getCellPosition(positionCoordinates.x, positionCoordinates.y, positionCoordinates.z, maze, spacing);
	enemy.position.y -= 1;
	enemy.checkCollisions = true;
	enemy.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

	var enemyEye = BABYLON.MeshBuilder.CreateCylinder('eye', {diameter: 0.3, height: 0.1}, scene);
	enemyEye.material = new EnemyEyeMaterial(scene);
	enemyEye.parent = enemy;
	enemyEye.position.z = -1.95;
	enemyEye.rotation.x = Math.PI/2;

	var enemyLight = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 0), scene);
	enemyLight.diffuse = new BABYLON.Color3(0.5, 0, 0);
	enemyLight.intensity = 1;
	enemyLight.range = 4;
	enemyLight.parent = enemy;
	enemyLight.includedOnlyMeshes = [enemy];
	enemyLight.position.z = -3;



	// ANIMATIONS
	var originalPosition = enemy.position.clone();

	var animationPosition = new BABYLON.Animation("scalingAnimation", "position", 50, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	// Animation keys
	var keysPostion = [];
	keysPostion.push({
		frame: 0,
		value: originalPosition
	});
	keysPostion.push({
		frame: 15,
		value: new BABYLON.Vector3(originalPosition.x, originalPosition.y + 1, originalPosition.z)
	});
	keysPostion.push({
		frame: 50,
		value: new BABYLON.Vector3(originalPosition.x + 1, originalPosition.y, originalPosition.z + 1)
	});
	keysPostion.push({
		frame: 80,
		value: new BABYLON.Vector3(originalPosition.x - 1, originalPosition.y - 1, originalPosition.z)
	});
	keysPostion.push({
		frame: 100,
		value: originalPosition
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
	//healthBarContainer.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;

	var healthBar = BABYLON.MeshBuilder.CreatePlane("hb1", {width: 2, height: 0.5, subdivisions: 4}, scene);
	healthBar.material = new HealthBarMaterialFull(scene);
	healthBar.position = new BABYLON.Vector3(0, 0, -.01);
	healthBar.parent = healthBarContainer;

	enemy.alive = true;
	enemy.healthPercentage = 100;

	scene.registerBeforeRender(function () {

		if (enemy.alive) {

			// Re-calculate health bar length.
			healthBar.scaling.x = enemy.healthPercentage / 100;
			healthBar.position.x =  (1 - (enemy.healthPercentage / 100)) * -1;

			if (healthBar.scaling.x < 0) {
				enemy.die();
			} else if (enemy.healthPercentage <= 30) {
				healthBar.material = new HealthBarMaterialCritical(scene);
			} else if (enemy.healthPercentage <= 50) {
				healthBar.material = new HealthBarMaterialDamaged(scene);
			}

		} else {

		}

	});

	enemy.die = function(){
		enemy.alive = false;
		enemy.dispose();
	};

	enemy.bullets = [];

	var bulletMaterial = new BulletMaterial(scene);
	var bulletMaterialOutside = new BulletMaterialOutside(scene);

	var decalMaterial = new BABYLON.StandardMaterial("decalMat", scene);
	decalMaterial.diffuseTexture = new BABYLON.Texture("img/bullet_hole.png", scene);
	decalMaterial.diffuseTexture.hasAlpha = true;
	decalSize = new BABYLON.Vector3(0.5, 0.5, 0.5);

	var hits = [];

	enemy.playerIsInRange = false;
	enemy.cannonReady = true;

	var lines = null;
	setInterval(function(){
		if(enemy.alive) {
			var direction = player.onMiniMap.position.clone().subtract(enemy.position.clone());
			var ray = new BABYLON.Ray(enemy.position.clone(), direction);
			var pickingInfo = scene.pickWithRay(ray, function (mesh) {
				return mesh == mazeMesh || mesh == player.onMiniMap;
			});

			if(lines) {
				lines.dispose();
			}
			/*
			lines = BABYLON.MeshBuilder.CreateLines('lines', {
				points: [enemy.position.clone(), enemy.position.clone().add(direction)]
			}, scene);
			*/

			if (pickingInfo.hit && pickingInfo.pickedMesh.name == 'player') {
				console.log('player spotted');
				enemy.playerIsInRange = true;
			} else {
				if(enemy.playerIsInRange){
					console.log('lost sight of player');
				}
				enemy.playerIsInRange = false;
			}
		}
	}, 500);

	scene.registerBeforeRender(function(){

		if(enemy.alive && enemy.playerIsInRange && enemy.cannonReady) {
			// fire laser bullet from player in the direction the player is currently looking
			var newBullet = new Bullet(bulletMaterial, bulletMaterialOutside, enemy, player.position, scene);
			newBullet.position = enemy.absolutePosition.clone();
			newBullet.lookAt(player.position);
			enemy.bullets.push(newBullet);
			sounds.laser.play();
			enemy.cannonReady = false;

			setTimeout(function(){
				enemy.cannonReady = true;
			}, 700);
		}

		for(var i=0; i<enemy.bullets.length; i++){
			var bullet = enemy.bullets[i];
			if(bullet) {

				// dispose on out of range or wall hit
				bullet.position = bullet.position.clone().add(bullet.direction.clone().scale(1));
				if (bullet.position.length() > width * spacing + height * spacing + depth * spacing) {
					enemy.bullets[i] = null;
					bullet.outside.dispose();
					bullet.dispose();
				}

				// CHECK IF PLAY GOT HIT
				if(bullet.position.subtract(player.position).length() < 0.5){
					console.log('player got hit');
					player.health -= 10;
					if(player.health <= 0){
						alert('You got destroyed!');
					}
					updateBar(player.healthBar, player.health);
				}

			}
		}

		// TODO remove disposed bullets from array
	});

	return enemy;
};