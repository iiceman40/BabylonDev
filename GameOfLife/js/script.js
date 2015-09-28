var canvas, engine, scene;

var rules = [2, 7, 5, 7];
var people = []; // all people objects in the scene

var occupiedCellsIndex = {}; // indexed list of all currently occupied spots
var emptyCells = []; // all empty spots that might or might not be populated this turn
var processedIndices = {};
var dyingPeople = [];
var newBornPositions = [];

// colors
var livingColor = new BABYLON.Color3(0, 0, 1);
var newbornColor = new BABYLON.Color3(0, 1, 0);
var dyingColor = new BABYLON.Color3(1, 0, 0);

// materials
var livingMat, dyingMat, newbornMat;

$(document).ready(function () {

	canvas = document.getElementById("renderCanvas");
	engine = new BABYLON.Engine(canvas, true);
	scene = createScene();
	engine.runRenderLoop(function () {
		scene.render();
	});

	window.addEventListener("resize", function () {
		engine.resize();
	});

	$('.nextStep').click(function(){
		processPeople(scene);
	})

});

/**
 * FUNCTIONS
 */
function createScene() {

	// This creates a basic Babylon Scene object (non-mesh)
	var scene = new BABYLON.Scene(engine);
	// This creates and positions a free camera (non-mesh)
	var camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 5 * 2, 15, new BABYLON.Vector3(0, 0, 0), scene);
	// This attaches the camera to the canvas
	camera.attachControl(canvas, true);
	// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
	var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
	// Default intensity is 1. Let's dim the light a small amount
	light.intensity = 0.7;
	// set scene background color to black
	scene.clearColor = new BABYLON.Color3(0, 0, 0);

	// game fo life implementation
	// materials
	livingMat = new BABYLON.StandardMaterial('living', scene);
	livingMat.diffuseColor = livingColor;
	newbornMat = new BABYLON.StandardMaterial('newborn', scene);
	newbornMat.diffuseColor = newbornColor;
	dyingMat = new BABYLON.StandardMaterial('dying', scene);
	dyingMat.diffuseColor = dyingColor;

	// create starting seed
	addPerson(new BABYLON.Vector3(0, 0, 0), scene);
	addPerson(new BABYLON.Vector3(0, 1, 0), scene);
	//addPerson(new BABYLON.Vector3(0, -1, 0), scene);
	addPerson(new BABYLON.Vector3(0, 0, 1), scene);
	addPerson(new BABYLON.Vector3(0, 0, -1), scene);
	//addPerson(new BABYLON.Vector3(1, 0, 0), scene);
	//addPerson(new BABYLON.Vector3(-1, 0, 0), scene);

	//addPerson(new BABYLON.Vector3(-1, -1, 0), scene);
	//addPerson(new BABYLON.Vector3(-1, -1, -1), scene);

	addPerson(new BABYLON.Vector3(1, 1, 0), scene);
	addPerson(new BABYLON.Vector3(-1, 1, 0), scene);
	//addPerson(new BABYLON.Vector3(1, 1, 1), scene);

	// in a certain interval
	//setInterval(function(){
	//	processPeople(scene);
	//}, 2000);

	return scene;
}


function processPeople(scene){
	// rest variables for new iteration
	emptyCells = [];
	processedIndices = {};
	var personCount = 0;

	// check for dying
	// for all people
	for (var i = 0; i < scene.meshes.length; i++) {

		if(scene.meshes[i].isPerson) {
			personCount++;
			var person = scene.meshes[i];
			// count the persons neighbors
			var neighborsCount = checkNeighborhood(person);

			// check if cell lives or dies based on the rules
			if (neighborsCount < rules[0] || neighborsCount > rules[1]) {
				// cell dies
				dyingPeople.push(person);
			} else {
				// cell survives
				person.material = livingMat;
			}
		}

	}

	// check for newborn
	// for all empty neighbor cells on the list
	for(var j=0; j < emptyCells.length; j++){
		// count its neighbors
		var position = emptyCells[j];
		var neighborCountOfEmptySpot = countNeighbors(position);
		console.log(neighborCountOfEmptySpot);
		// check if the spot should be populated according to the rules
		if(neighborCountOfEmptySpot >= rules[2] && neighborCountOfEmptySpot <= rules[3]){
			// populate if condition is fulfilled
			newBornPositions.push(position);
		}
	}

	// remove dying cells
	for(var k=0; k < dyingPeople.length; k++){
		removePerson(dyingPeople[k], dyingMat);
	}
	dyingPeople = [];

	// create newborn
	for(var l=0; l <  newBornPositions.length; l++){
		addPerson(newBornPositions[l], scene);
		personCount++;
	}
	newBornPositions = [];

	$('.personCount').text(personCount);

}

/**
 * adds a person to a certain position
 * @param position
 * @param scene
 */
function addPerson(position, scene){
	var person = BABYLON.Mesh.CreateSphere("sphere1", 16, 1.3, scene);
	person.position = position;
	person.isPerson = true;
	person.material = newbornMat;
	var positionString = getNeighborPositionString(position);
	occupiedCellsIndex[positionString] = true;
	return person;
}

function removePerson(person, dyingMat){
	person.material = dyingMat;
	setTimeout(function(){
		var positionString = getNeighborPositionString(person.position);
		delete occupiedCellsIndex[positionString];
		person.dispose();
	}, 500)
}

/**
 * finds all neighbor persons for a given person
 * checks if they are empty or occupied
 * and returns the number of neighbors
 * @param person
 * @returns {number}
 */
function checkNeighborhood(person) {
	var neighborsCount = 0;

	// check all neighbor spots
	for(var x = -1; x <= 1; x++ ){
		for(var y = -1; y <= 1; y++ ){
			for(var z = -1; z <= 1; z++ ) {

				// don't count itself as neighbor
				if(!(x == 0 && y == 0 && z == 0)) {
					// spot position
					var neighborSpot = new BABYLON.Vector3(
						person.position.x + x,
						person.position.y + y,
						person.position.z + z
					);

					// check if spot is occupied
					var positionString = getNeighborPositionString(neighborSpot);

					if (occupiedCellsIndex[positionString]) {
						// neighbor found
						neighborsCount++;
					} else {
						if (!processedIndices[positionString]) {
							// empty spot found
							emptyCells.push(neighborSpot);
						}
					}
					// mark es processed this turn
					processedIndices[positionString] = true;
				}

			}
		}
	}
	return neighborsCount;
}

/**
 * just counts the neighbors of a certain position
 * @param position
 * @returns {number}
 */
function countNeighbors(position) {
	var neighborsCount = 0;

	// check all neighbor spots
	for(var x = -1; x <= 1; x++ ){
		for(var y = -1; y <= 1; y++ ){
			for(var z = -1; z <= 1; z++ ) {

				// don't count itself as neighbor
				if(!(x == 0 && y == 0 && z == 0)) {
					// spot position
					var neighborSpot = new BABYLON.Vector3(
						position.x + x,
						position.y + y,
						position.z + z
					);

					// check if spot is occupied
					var positionString = getNeighborPositionString(neighborSpot);

					if (occupiedCellsIndex[positionString]) {
						// neighbor found
						neighborsCount++;
					}
				}

			}
		}
	}
	return neighborsCount;
}

/**
 * to string for position vector
 * @param neighborSpot
 * @returns {string}
 */
function getNeighborPositionString(neighborSpot){
	return neighborSpot.x + '/' + neighborSpot.y + '/' + neighborSpot.z;
}