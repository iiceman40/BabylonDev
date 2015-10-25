var Sounds = function (scene) {
	// messages
	this.newRank = new BABYLON.Sound("messageSound", "sounds/newRank.mp3", scene, null, {distanceModel: 'exponential'});

	// effects
	this.laser = new BABYLON.Sound("laserSound", "sounds/laserShot.mp3", scene);
	this.laser.setVolume(0.2);

	this.engine = new BABYLON.Sound("bridgeSound", "sounds/engine.wav", scene, null, { loop: true, autoplay: true });
	this.engine.setVolume(0.5);

	return this;
};