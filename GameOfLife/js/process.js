// handle incomming messages
self.addEventListener('message', function(e) {
	//processPeople(e.data);
	//self.postMessage(e.data);
	if(e.data.task == 'processPeople'){
		processPeople(e.data.meshes);
	}
}, false);



function processPeople(people){
	// rest variables for new iteration
	emptyCells = [];
	processedIndices = {};
	var personCount = 0;

	// check for dying
	// for all people
	for (var i = 0; i < people.length; i++) {

		if(people[i].isPerson) {
			personCount++;
			var person = people[i];
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

	// TODO return that to the main thread

	$('.personCount').text(personCount);

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