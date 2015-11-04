/**
 *
 * @param shooter
 * @param target
 * @param type
 * @param color
 * @param game
 * @param scene
 * @returns {Projectile}
 * @constructor
 */
function Projectile(shooter, target, type, color, game, scene) {
	this.game = game;
	this.type = type;
	this.shooter = shooter;
	this.direction = target.subtract(shooter.position).normalize();
	this.explosionSound = game.sounds.explosion;
	this.speed = 1;
	this.diameter = 0.08;
	this.damage = 10;

	if(this.type == Projectile.PROJECTILETYPE_ROCKET) {
		this.damage = 50;
		this.speed = 0.3;

		this.mainMesh = game.objects.rocket.createInstance('rocket');

		// create emitter
		this.thruster = BABYLON.MeshBuilder.CreateBox('thruster', {size: 0.01}, scene);
		this.thruster.position. z = -0.5;
		this.thruster.parent = this.mainMesh;
		this.thruster.isVisible = false;

		// Create a particle system for smoke
		this.smokeParticleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
		//Texture of each particle
		this.smokeParticleSystem.particleTexture = new BABYLON.Texture("img/smoke.png", scene);
		this.smokeParticleSystem.particleTexture.hasAlpha = true;
		// Where the particles come from
		this.smokeParticleSystem.emitter = this.thruster; // the starting object, the emitter
		this.smokeParticleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
		this.smokeParticleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...
		// Colors of all particles
		this.smokeParticleSystem.color1 = new BABYLON.Color4(0.4, 0.4, 0.4, 0.95);
		this.smokeParticleSystem.color2 = new BABYLON.Color4(0.6, 0.6, 0.6, 0.7);
		this.smokeParticleSystem.colorDead = new BABYLON.Color4(1, 1, 1, 0.0);
		// Size of each particle (random between...
		this.smokeParticleSystem.minSize = 0.05;
		this.smokeParticleSystem.maxSize = 0.3;
		// Life time of each particle (random between...
		this.smokeParticleSystem.minLifeTime = 0.3;
		this.smokeParticleSystem.maxLifeTime = 1;
		// Emission rate
		this.smokeParticleSystem.emitRate = 1500;
		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		this.smokeParticleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
		// Set the gravity of all particles
		this.smokeParticleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
		// Direction of each particle after it has been emitted
		this.smokeParticleSystem.direction1 = new BABYLON.Vector3(-0.5, -0.5, -2);
		this.smokeParticleSystem.direction2 = new BABYLON.Vector3(0.5, 0.5, -2);
		// Angular speed, in radians
		this.smokeParticleSystem.minAngularSpeed = 0;
		this.smokeParticleSystem.maxAngularSpeed = Math.PI;
		// Speed
		this.smokeParticleSystem.minEmitPower = 0.1;
		this.smokeParticleSystem.maxEmitPower = 0.5;
		this.smokeParticleSystem.updateSpeed = 0.005;
		// natural end
		this.smokeParticleSystem.disposeOnStop = false;
		// Start the particle system
		this.smokeParticleSystem.start();

		// Create a particle system for after burn
		this.afterburnParticleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);
		//Texture of each particle
		this.afterburnParticleSystem.particleTexture = new BABYLON.Texture("img/fire2.png", scene);
		this.afterburnParticleSystem.particleTexture.hasAlpha = true;
		// Where the particles come from
		this.afterburnParticleSystem.emitter = this.thruster; // the starting object, the emitter
		this.afterburnParticleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
		this.afterburnParticleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...
		// Colors of all particles
		this.afterburnParticleSystem.color1 = new BABYLON.Color4(1, 0.7, 0.4, 0.5);
		this.afterburnParticleSystem.color2 = new BABYLON.Color4(1, 1, 0.6, 0.1);
		this.afterburnParticleSystem.colorDead = new BABYLON.Color4(0, 0, 1, 0.0);
		// Size of each particle (random between...
		this.afterburnParticleSystem.minSize = 0.1;
		this.afterburnParticleSystem.maxSize = 0.25;
		// Life time of each particle (random between...
		this.afterburnParticleSystem.minLifeTime = 0.03;
		this.afterburnParticleSystem.maxLifeTime = 0.07;
		// Emission rate
		this.afterburnParticleSystem.emitRate = 100000;
		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		this.afterburnParticleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;
		// Set the gravity of all particles
		this.afterburnParticleSystem.gravity = new BABYLON.Vector3(0, 0, 0);
		// Direction of each particle after it has been emitted
		this.afterburnParticleSystem.direction1 = new BABYLON.Vector3(-0.2, -0.2, 0.1);
		this.afterburnParticleSystem.direction2 = new BABYLON.Vector3(0.2, 0.2, 0.1);
		// Angular speed, in radians
		this.afterburnParticleSystem.minAngularSpeed = 0;
		this.afterburnParticleSystem.maxAngularSpeed = Math.PI;
		// Speed
		this.afterburnParticleSystem.minEmitPower = 0.1;
		this.afterburnParticleSystem.maxEmitPower = 0.1;
		this.afterburnParticleSystem.updateSpeed = 0.015;
		// natural end
		this.afterburnParticleSystem.disposeOnStop = false;
		// Start the particle system
		this.afterburnParticleSystem.start();
	}

	if(this.type == Projectile.PROJECTILETYPE_BULLET) {

		this.mainMesh = BABYLON.MeshBuilder.CreateSphere('bullet', {diameter: this.diameter}, scene);
		this.mainMesh.scaling.z = 30;
		this.mainMesh.material = game.materials['bright' + color.charAt(0).toUpperCase() + color.slice(1)];

		this.outsideMesh = BABYLON.MeshBuilder.CreateSphere('outsideMesh', {diameter: 0.1}, scene);
		this.outsideMesh.material = game.materials[color];
		this.outsideMesh.parent = this.mainMesh;
		this.outsideMesh.flipFaces(true);
	}
	this.mainMesh.rotation = shooter.rotation.clone();

	return this;
}

Projectile.PROJECTILETYPE_BULLET = 1;
Projectile.PROJECTILETYPE_ROCKET = 2;

Projectile.prototype.updatePosition = function(bulletIndex, mazeMesh, enemies, player){
	var disposeBullet = false;

	// update bullet position
	this.mainMesh.position = this.mainMesh.position.add(this.direction.scale(this.speed));

	// check if enemy got hit - bullet fired by player
	if(enemies) {
		for (var j = 0; j < enemies.length; j++) {
			var enemy = enemies[j];
			if (enemy.alive && this.mainMesh.position.subtract(enemy.position).length() < 1) {
				disposeBullet = true;
				enemy.hit(this.damage);
			}
		}
	}
	// check if player got hit - bullet fired by enemy
	if (player && this.mainMesh.position.subtract(player.position).length() < 1) {
		disposeBullet = true;
		player.hit(this.damage);
	}

	if(enemies && !disposeBullet) {
		// check if bullet fired by the player has hit the maze wall
		var ray = new BABYLON.Ray(this.mainMesh.position.clone(), this.direction.scale(0.5), 1);
		var pickInfo = scene.pickWithRay(ray, function (mesh) {
			return mesh == mazeMesh;
		});

		// dispose on out of range or wall hit
		if (this.mainMesh.position.length() > config.outOfBoundsDistance || pickInfo.hit) {
			disposeBullet = true;
		}
	}

	if (disposeBullet) {
		if(this.type == Projectile.PROJECTILETYPE_ROCKET){
			// create explosion
			var explosion = BABYLON.Mesh.CreateSphere('explosion', 16, 0.1, scene);
			explosion.material = this.game.materials.fire;
			explosion.position = this.mainMesh.position;

			// animation
			var animationExplosion = new BABYLON.Animation("scalingAnimation", "scaling", 100, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);
			// Animation keys
			var keys = [
				{
					frame: 0,
					value: explosion.scaling
				},
				{
					frame: 25,
					value: new BABYLON.Vector3(15,15,15)
				}
			];
			//Adding keys to the animation object
			animationExplosion.setKeys(keys);
			//Then add the animation object to box1
			explosion.animations.push(animationExplosion);

			var visibilityExplosion = new BABYLON.Animation("scalingAnimation", "visibility", 100, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
			// Animation keys
			var visibilityKeys = [
				{
					frame: 25,
					value: explosion.visibility
				},
				{
					frame: 50,
					value: 0
				}
			];
			//Adding keys to the animation object
			visibilityExplosion.setKeys(visibilityKeys);
			//Then add the animation object to box1
			explosion.animations.push(visibilityExplosion);

			scene.beginAnimation(explosion, 0, 50, true, 1, function(){
				explosion.dispose();
			});


			// sound
			this.explosionSound.play();
		}
		if(this.smokeParticleSystem) {
			this.smokeParticleSystem.stop();
		}
		this.shooter.bullets[bulletIndex] = null;
		if(this.outsideMesh) {
			this.outsideMesh.dispose();
		}
		if(this.thruster) {
			this.thruster.parent = null;
			var thruster = this.thruster;
			setTimeout(function(){
				thruster.dispose();
			}, 5000);
		}

		this.mainMesh.dispose();
		this.shooter.bullets.splice(bulletIndex, 1);
	}
};