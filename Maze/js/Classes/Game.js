var Game = function (config, scene) {
	this.level = config.startingLevel;

	this.enemies = [];

	this.sounds = new Sounds(scene);
	this.bulletMaterial = new BulletMaterial(scene);
	this.bulletMaterialOutside = new BulletMaterialOutside(scene);

	this.outOfBoundsDistance = config.width * config.spacing;
	this.enemyDetectionDistance = config.spacing * Math.max(1, Math.min(this.level * 0.5, 3));

	return this;
};