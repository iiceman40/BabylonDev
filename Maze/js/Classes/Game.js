var Game = function (config, scene) {

	this.level = config.startingLevel;

	this.enemies = [];
	this.materials = {
		red: new RedBulletMaterial(scene),
		brightRed: new BrightRedBulletMaterial(scene),
		blue: new BlueBulletMaterial(scene),
		brightBlue: new BrightBlueBulletMaterial(scene),
		gray: new RocketMaterial(scene),
		fire: new FireMaterial(scene),
		bulletHole: new BulletHoleMaterial(scene),
		explosionDecal: new ExplosionDecalMaterial(scene)
	};

	this.objects = {
		rocket: createRocket(this, scene),
		laserBullets: {
			red: createLaserBullet('red', 0.08, this, scene),
			blue: createLaserBullet('blue', 0.08, this, scene)
		},
		bulletHoleSize: new BABYLON.Vector3(0.2, 0.2, 0.2),
		explosionDecalSize: new BABYLON.Vector3(2, 2, 2)
	};

	this.sounds = new Sounds(scene);

	this.rocketStatusDiv = $('.rocketStatus');

	this.outOfBoundsDistance = config.width * config.spacing;
	this.enemyDetectionDistance = config.spacing * Math.max(1, Math.min(this.level * 0.5, 3));

	return this;
};