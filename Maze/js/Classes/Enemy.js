/**
 * @param maze
 * @param player
 * @param positionCoordinates
 * @param mazeMesh
 * @param game
 * @param scene {BABYLON.Scene}
 * @constructor
 */
var Enemy = function (maze, player, positionCoordinates, mazeMesh, game, scene) {

	var enemy = BABYLON.Mesh.CreateSphere("enemy", 32, 2, scene, false);
	enemy.material = new EnemyMaterial(scene);
	enemy.position = getCellPosition(positionCoordinates.x, positionCoordinates.y, positionCoordinates.z, maze, config.spacing);
	enemy.position.y -= 1;
	enemy.checkCollisions = true;
	enemy.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

	var enemyEye = BABYLON.MeshBuilder.CreateCylinder('eye', {diameter: 0.3, height: 0.1}, scene);
	enemyEye.material = new EnemyEyeMaterial(scene);
	enemyEye.parent = enemy;
	enemyEye.position.z = -1.95;
	enemyEye.rotation.x = Math.PI / 2;

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
	enemy.healthPercentage = 50;
	enemy.maxHealthPercentage = 50;

	enemy.hit = function(damage){
		enemy.healthPercentage -= damage;

		// update enemy health
		if (enemy.alive) {
			// Re-calculate health bar length.
			healthBar.scaling.x = enemy.healthPercentage / enemy.maxHealthPercentage;
			healthBar.position.x = (1 - (enemy.healthPercentage / enemy.maxHealthPercentage)) * -1;
			if (healthBar.scaling.x < 0) {
				enemy.die();
			} else if (enemy.healthPercentage <= 30) {
				healthBar.material = new HealthBarMaterialCritical(scene);
			} else if (enemy.healthPercentage <= 50) {
				healthBar.material = new HealthBarMaterialDamaged(scene);
			}
		}

		if (enemy.healthPercentage <= 0) {
			enemy.healthPercentage = 0;
			enemy.die();
		}
	};

	enemy.die = function () {
		// SPS creation
		var tetra = BABYLON.MeshBuilder.CreatePolyhedron("tetra", {size: 0.5}, scene);
		var box = BABYLON.MeshBuilder.CreateBox("box", {size: 0.5}, scene);
		enemy.SPS = new BABYLON.SolidParticleSystem('SPS', scene);
		enemy.SPS.addShape(tetra, 50);
		enemy.SPS.addShape(box, 50);
		var mesh = enemy.SPS.buildMesh();
		mesh.material = enemy.material;
		mesh.position = enemy.position;
		tetra.dispose();  // free memory
		box.dispose();

		// SPS behavior definition
		var speed = .1;
		var gravity = -0.002;

		// init
		enemy.SPS.initParticles = function () {
			// just recycle everything
			for (var p = 0; p < this.nbParticles; p++) {
				this.recycleParticle(this.particles[p]);
			}
		};

		// recycle
		enemy.SPS.recycleParticle = function (particle) {
			// Set particle new velocity, scale and rotation
			// As this function is called for each particle, we don't allocate new
			// memory by using "new BABYLON.Vector3()" but we set directly the
			// x, y, z particle properties instead
			particle.position.x = 0;
			particle.position.y = 0;
			particle.position.z = 0;
			particle.velocity.x = (Math.random() - 0.5) * speed;
			particle.velocity.y = Math.random() * speed;
			particle.velocity.z = (Math.random() - 0.5) * speed;
			var scale = Math.random() * 0.5;
			particle.scale.x = scale;
			particle.scale.y = scale;
			particle.scale.z = scale;
			particle.rotation.x = Math.random() * .5;
			particle.rotation.y = Math.random() * .5;
			particle.rotation.z = Math.random() * .5;
			//particle.color.r = Math.random() * 0.6 + 0.5;
			//particle.color.g = Math.random() * 0.6 + 0.5;
			//particle.color.b = Math.random() * 0.6 + 0.5;
			//particle.color.a = Math.random() * 0.6 + 0.5;
		};

		// update : will be called by setParticles()
		enemy.SPS.updateParticle = function (particle) {
			// some physics here
			//if (particle.position.y < 0) {
			//	this.recycleParticle(particle);
			//}
			particle.velocity.y += gravity;                         // apply gravity to y
			(particle.position).addInPlace(particle.velocity);      // update particle new position
			particle.position.y += speed / 2;

			var sign = (particle.idx % 2 == 0) ? 1 : -1;            // rotation sign and new value
			particle.rotation.z += 0.1 * sign;
			particle.rotation.x += 0.05 * sign;
			particle.rotation.y += 0.008 * sign;
		};


		// init all particle values and set them once to apply textures, colors, etc
		enemy.SPS.initParticles();
		enemy.SPS.setParticles();

		setTimeout(function () {
			enemy.SPS.dispose();
			enemy.SPS = null;
		}, 2000);

		enemy.alive = false;
		enemy.dispose();
	};

	enemy.bullets = [];

	var decalMaterial = new BABYLON.StandardMaterial("decalMat", scene);
	decalMaterial.diffuseTexture = new BABYLON.Texture("img/bullet_hole.png", scene);
	decalMaterial.diffuseTexture.hasAlpha = true;
	decalSize = new BABYLON.Vector3(0.5, 0.5, 0.5);

	enemy.playerIsInRange = false;
	enemy.cannonReady = true;

	setInterval(function () {
		if (enemy.alive) {
			var distanceToPlayer = player.position.subtract(enemy.position).length();

			if(distanceToPlayer < game.enemyDetectionDistance) {

				var playerOnMiniMap = player.miniMap.playerOnMiniMap;
				var direction = playerOnMiniMap.position.subtract(enemy.position);
				var ray = new BABYLON.Ray(enemy.position, direction);
				var pickingInfo = scene.pickWithRay(ray, function (mesh) {
					return mesh == mazeMesh || mesh == playerOnMiniMap;
				});

				if (pickingInfo.hit && pickingInfo.pickedMesh.name == 'player') {
					// player spotted
					enemy.playerIsInRange = true;
				} else {
					if (enemy.playerIsInRange) {
						// lost sight of player
					}
					enemy.playerIsInRange = false;
				}

			}
		}
	}, 500);

	scene.registerBeforeRender(function () {

		// update solid particle animation
		if (enemy.SPS) {
			enemy.SPS.setParticles();
			enemy.SPS.mesh.rotation.y += 0.001;
		}

		// attack player if in sight
		if (enemy.alive && enemy.playerIsInRange && enemy.cannonReady) {
			// fire laser bullet from player in the direction the player is currently looking
			var newBullet = new Projectile(enemy, player.position, Projectile.PROJECTILETYPE_BULLET, 'red', game, scene);
			newBullet.mainMesh.position = enemy.absolutePosition.clone();
			newBullet.mainMesh.lookAt(player.position);
			enemy.bullets.push(newBullet);
			enemy.cannonReady = false;
			game.sounds.laser.play();

			setTimeout(function () {
				enemy.cannonReady = true;
			}, 1000);
		}

		// update bullets
		for (var i = enemy.bullets.length - 1; i >= 0; i--) {
			enemy.bullets[i].updatePosition(i, mazeMesh, null, player);
		}

	});

	return enemy;
};