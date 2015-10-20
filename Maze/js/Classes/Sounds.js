var Sounds = function (scene) {
	// messages
	this.newRank = new BABYLON.Sound("messageSound", "sounds/newRank.mp3", scene, null, {distanceModel: 'exponential'});

	// effects
	this.laser = new BABYLON.Sound("laserSound", "sounds/laserShot.mp3", scene);

	return this;
};