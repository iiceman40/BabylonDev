/**
 * MAZE VARIABLES
 */
var config = {
	version: 0.1,

	startingLevel: 1,
	width: 2,
	height: 2,
	depth: 2,
	startingPoint: new BABYLON.Vector3(0, 0, 0),

	cellSize: 10,
	wallThickness: 2,
	spacing: 20,

	useDecals: true,
	animateTerminals: true,
	enemyEye: true,
	enemyLight: true,
	enemyHealthBar: true,

	mobileCamera: true,

	controls: {
		up: 87,
		down: 83,
		left: 65,
		right: 68,
		use: 32,
		shootPrimary: 0,
		shootSecondary: 2
	}

};