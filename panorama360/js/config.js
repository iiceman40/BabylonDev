// CONFIGURATION
var zoomMax = 10;
var zoomMin = 256;
var zoomStepSize = 50;
var zoomDuration = 300;

var cameraTurnStepSize = 0.2;
var cameraTurnDuration = 500;

var autoRotate = true;

var loadingText = "Bitte haben Sie einen Moment Geduld, die benötigten Daten werden geladen...";

var heightCorrectionAngle = 0;
var selectedSceneId = 0;
var scenes = [
	{
		image: 'img/app7.jpg',
		preloadedImage: null,
		name: 'Wohnbereich',
		heightCorrectionAngle: -0.3,
		doors: [
			{
				position: new BABYLON.Vector3(214, -24, -464),
				target: 'scene2'
			},
			{
				position: new BABYLON.Vector3(494, -22, 130),
				target: 'scene3'
			}
		]
	},
	{
		image: 'img/app7_kitchen.jpg',
		preloadedImage: null,
		name: 'Küche',
		heightCorrectionAngle: -0.1,
		doors: [
			{
				position: new BABYLON.Vector3(228, 59, 454),
				target: 'scene1'
			},
			{
				position: new BABYLON.Vector3(510, 19, -16),
				target: 'scene4'
			}
		]
	},
	{
		image: 'img/garden1.jpg',
		preloadedImage: null,
		name: 'Garten Teil 1',
		heightCorrectionAngle: 0.3,
		doors: [
			{
				position: new BABYLON.Vector3(322, 305, -255),
				target: 'scene1'
			},
			{
				position: new BABYLON.Vector3(448, 31, 244),
				target: 'scene4'
			}
		]
	},
	{
		image: 'img/garden2.jpg',
		preloadedImage: null,
		name: 'Garten Teil 2',
		heightCorrectionAngle: 0.3,
		doors: [
			{
				position: new BABYLON.Vector3(-442, -47, -253),
				target: 'scene3'
			},
			{
				position: new BABYLON.Vector3(61, 394, -320),
				target: 'scene1'
			},
			{
				position: new BABYLON.Vector3(211, 337, -322),
				target: 'scene2'
			}
		]
	}
];