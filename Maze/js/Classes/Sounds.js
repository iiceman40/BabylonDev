var Sounds = function (scene) {
	// messages
	this.newRank = new BABYLON.Sound("messageSound", "sounds/newRank.mp3", scene, null, {distanceModel: 'exponential'});

	// effects
	this.laser = new BABYLON.Sound("laserSound", "sounds/laser_shot.mp3", scene);
	this.laser.setVolume(0.2);

	this.rocket = new BABYLON.Sound("rocketSound", "sounds/rocket_launch.mp3", scene);
	this.rocket.setVolume(0.5);

	this.explosion = new BABYLON.Sound("explosionSound", "sounds/explosion.mp3", scene);

	this.engine = new BABYLON.Sound("bridgeSound", "sounds/engine.wav", scene, null, { loop: true, autoplay: true });
	this.engine.setVolume(0.5);

	return this;
};