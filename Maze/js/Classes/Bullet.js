/**
 * @param bulletMaterial1
 * @param bulletMaterial2
 * @param shooter
 * @param target
 * @param scene
 * @returns {Bullet}
 * @constructor
 */
function Bullet(bulletMaterial1, bulletMaterial2, shooter, target, scene) {

	this.shooter = shooter;
	this.speed = 1;
	this.direction = target.subtract(shooter.position).normalize();

	this.mainMesh = BABYLON.MeshBuilder.CreateSphere('bullet', {diameter: 0.08}, scene);
	this.mainMesh.scaling.z = 30;
	this.mainMesh.rotation = shooter.rotation.clone();
	this.mainMesh.material = bulletMaterial2;

	this.outsideMesh = BABYLON.MeshBuilder.CreateSphere('outsideMesh', {diameter: 0.1}, scene);
	this.outsideMesh.material = bulletMaterial1;
	this.outsideMesh.parent = this.mainMesh;
	this.outsideMesh.flipFaces(true);

	return this;
}

Bullet.prototype.updatePosition = function(bulletIndex, mazeMesh, enemies, player){
	var disposeBullet = false;

	// update bullet position
	this.mainMesh.position = this.mainMesh.position.add(this.direction.scale(this.speed));

	// check if enemy got hit - bullet fired by player
	if(enemies) {
		for (var j = 0; j < enemies.length; j++) {
			var enemy = enemies[j];
			if (enemy.alive && this.mainMesh.position.subtract(enemy.position).length() < 1) {
				disposeBullet = true;
				enemy.hit(10);
			}
		}
	}
	// check if player got hit - bullet fired by enemy
	if (player && this.mainMesh.position.subtract(player.position).length() < 1) {
		disposeBullet = true;
		player.hit(10);
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
		this.shooter.bullets[bulletIndex] = null;
		this.outsideMesh.dispose();
		this.mainMesh.dispose();
		this.shooter.bullets.splice(bulletIndex, 1);
	}
};