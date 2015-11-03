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
	var speed = 1;
	var diameter = 0.08;

	if(type == Projectile.PROJECTILETYPE_ROCKET){
		speed = 0.3;
		diameter = 0.2;
	}

	this.type = type;
	this.shooter = shooter;
	this.speed = speed;
	this.direction = target.subtract(shooter.position).normalize();
	this.explosionSound = game.sounds.explosion;

	this.mainMesh = BABYLON.MeshBuilder.CreateSphere('bullet', {diameter: diameter}, scene);
	this.mainMesh.rotation = shooter.rotation.clone();

	if(this.type == Projectile.PROJECTILETYPE_ROCKET) {
		this.damage = 50;
		this.mainMesh.scaling.z = 10;
		this.mainMesh.material = game.materials[color];

		// Create a particle system
		this.thruster = BABYLON.MeshBuilder.CreateBox('thruster', {size: 0.01}, scene);
		this.thruster.parent = this.mainMesh;
		this.particleSystem = new BABYLON.ParticleSystem("particles", 2000, scene);

		//Texture of each particle
		this.particleSystem.particleTexture = new BABYLON.Texture("img/smoke.png", scene);
		this.particleSystem.particleTexture.hasAlpha = true;

		// Where the particles come from
		this.particleSystem.emitter = this.thruster; // the starting object, the emitter
		this.particleSystem.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
		this.particleSystem.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...

		// Colors of all particles
		this.particleSystem.color1 = new BABYLON.Color4(1, 1, 1, 0.5);
		this.particleSystem.color2 = new BABYLON.Color4(1, 1, 1, 0.5);
		this.particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);

		// Size of each particle (random between...
		this.particleSystem.minSize = 0.05;
		this.particleSystem.maxSize = 0.3;

		// Life time of each particle (random between...
		this.particleSystem.minLifeTime = 0.3;
		this.particleSystem.maxLifeTime = 0.5;

		// Emission rate
		this.particleSystem.emitRate = 1500;

		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		this.particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_STANDARD;

		// Set the gravity of all particles
		this.particleSystem.gravity = new BABYLON.Vector3(0, 0, 0);

		// Direction of each particle after it has been emitted
		this.particleSystem.direction1 = new BABYLON.Vector3(-0.5, -0.5, -2);
		this.particleSystem.direction2 = new BABYLON.Vector3(0.5, 0.5, -2);

		// Angular speed, in radians
		this.particleSystem.minAngularSpeed = 0;
		this.particleSystem.maxAngularSpeed = Math.PI;

		// Speed
		this.particleSystem.minEmitPower = 0.1;
		this.particleSystem.maxEmitPower = 0.5;
		this.particleSystem.updateSpeed = 0.005;

		this.particleSystem.disposeOnStop = false;

		// Start the particle system
		this.particleSystem.start();
	}

	if(this.type == Projectile.PROJECTILETYPE_BULLET) {
		this.damage = 10;
		this.mainMesh.scaling.z = 30;
		this.mainMesh.material = game.materials['bright' + color.charAt(0).toUpperCase() + color.slice(1)];

		this.outsideMesh = BABYLON.MeshBuilder.CreateSphere('outsideMesh', {diameter: 0.1}, scene);
		this.outsideMesh.material = game.materials[color];
		this.outsideMesh.parent = this.mainMesh;
		this.outsideMesh.flipFaces(true);
	}

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
			this.explosionSound.play();
		}
		if(this.particleSystem) {
			this.particleSystem.stop();
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