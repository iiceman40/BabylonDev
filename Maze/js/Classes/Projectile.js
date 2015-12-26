/**
 *
 * @param shooter
 * @param impactInfo
 * @param startingPosition
 * @param type
 * @param color
 * @param game
 * @param scene
 * @returns {Projectile}
 * @constructor
 */
function Projectile(shooter, impactInfo, startingPosition, type, color, game, scene) {
	var self = this;
	
	this.game = game;
	this.type = type;
	this.shooter = shooter;
	this.impactInfo = impactInfo;
	this.impactPosition = impactInfo.pickedPoint;
	this.startingPosition = startingPosition || shooter.position;
	this.direction = this.impactPosition.subtract(this.startingPosition).normalize();
	this.speed = 1;
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

		this.mainMesh = game.objects.laserBullets[color].mainMesh.createInstance('laserBulletMainMeshInstance');
		this.outsideMesh = game.objects.laserBullets[color].outsideMesh.createInstance('laserBulletOutsideMeshInstance');
		this.outsideMesh.parent = this.mainMesh;

	}

	this.mainMesh.rotation = shooter.rotation ? shooter.rotation.clone() : shooter.camera.rotation.clone();
	this.mainMesh.position = this.startingPosition;

	this.updatePosition = function(bulletIndex, mazeMesh, enemies, player){
		var disposeProjectile = false;

		// update bullet position
		self.mainMesh.position = self.mainMesh.position.add(self.direction.scale(self.speed));

		// check if enemy got hit - bullet fired by player
		if(enemies) {
			for (var j = 0; j < enemies.length; j++) {
				var enemy = enemies[j];
				if (enemy.alive && self.mainMesh.position.subtract(enemy.position).length() < 1) {
					disposeProjectile = true;
					self.impactInfo.pickedPoint = self.mainMesh.position.clone();
					self.impactInfo.pickedMesh = enemy;
					self.impactInfo.getNormal = function(){
						return new BABYLON.Vector3(0,0,0);
					};
					enemy.hit(self.damage);
				}
			}
		}
		// check if player got hit - bullet fired by enemy
		if (player && self.mainMesh.position.subtract(player.position).length() < 1) {
			disposeProjectile = true;
			player.hit(self.damage);
		}

		// if the projectile has not been marked for disposal yet ...
		if(!disposeProjectile) {
			// check if projectile has hit the maze wall
			var distanceToImpact = self.mainMesh.position.subtract(self.impactPosition).length();

			// dispose on out of range or wall hit // TODO fallback: dispose bullet if out of range
			if (distanceToImpact <= 0.5) {
				disposeProjectile = true;

				// impact decal
				if(config.useDecals) {
					var newDecal;
					if (self.type == Projectile.PROJECTILETYPE_ROCKET) {
						newDecal = BABYLON.Mesh.CreateDecal("decal", mazeMesh, self.impactInfo.pickedPoint, self.impactInfo.getNormal(true), this.game.objects.explosionDecalSize);
						newDecal.material = self.game.materials.explosionDecal;
					} else {
						newDecal = BABYLON.Mesh.CreateDecal("decal", mazeMesh, self.impactInfo.pickedPoint, self.impactInfo.getNormal(true), this.game.objects.bulletHoleSize);
						newDecal.material = self.game.materials.bulletHole;
					}
					this.shooter.impactDecals.push(newDecal);

					if (shooter.impactDecals.length > 10) {
						shooter.impactDecals[0].dispose();
						shooter.impactDecals[0] = null;
						shooter.impactDecals.splice(0, 1);
					}
				}
			}
		}

		if (disposeProjectile) {
			if(self.type == Projectile.PROJECTILETYPE_ROCKET){
				// create explosion
				var explosion = new Explosion(self.impactInfo, self.shooter, self.game, scene);

				// dispose smoke
				if(self.smokeParticleSystem) {
					self.smokeParticleSystem.stop();
				}

				// dispose after burner
				if(self.thruster) {
					self.thruster.parent = null;
					var thruster = self.thruster;
					setTimeout(function(){
						thruster.dispose();
					}, 5000);
				}
			}

			self.shooter.projectiles[bulletIndex] = null;

			if(self.outsideMesh) {
				self.outsideMesh.dispose();
			}

			self.mainMesh.dispose();
			self.shooter.projectiles.splice(bulletIndex, 1);
		}
	};

	return this;
}

Projectile.PROJECTILETYPE_BULLET = 1;
Projectile.PROJECTILETYPE_ROCKET = 2;