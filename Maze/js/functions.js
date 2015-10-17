/**
 * @param width
 * @param height
 * @param startingPoint
 * @returns {Maze}
 */
function initMaze(width, height, startingPoint) {
	var maze = new Maze(width, height, startingPoint);

	carvePassageFrom(maze.map[startingPoint.y][startingPoint.x], maze);

	return maze;
}

/**
 * carves a path to a neighbor cell
 * @param cell
 * @param maze
 */
function carvePassageFrom(cell, maze) {
	var directions = shuffle(cell.directions);

	for(var i=0; i<directions.length; i++){
		cell.hasBeenVisited = true;
		var direction = directions[i];
		var directionVector;
		switch (direction){
			case 'N':
				directionVector = new BABYLON.Vector2(0, -1);
				break;
			case 'S':
				directionVector = new BABYLON.Vector2(0, 1);
				break;
			case 'E':
				directionVector = new BABYLON.Vector2(1, 0);
				break;
			case 'W':
				directionVector = new BABYLON.Vector2(-1, 0);
				break;
		}
		var neighborPosition = cell.position.add(directionVector);
		// check if neighbor would be in map boundaries
		if (
			neighborPosition.x >= 0 && neighborPosition.x < maze.width &&
			neighborPosition.y >= 0 && neighborPosition.y < maze.height
		) {
			// check if already visited
			var neighbor = maze.map[neighborPosition.y][neighborPosition.x];
			if(!neighbor.hasBeenVisited) {
				// carve path
				removeWalls(cell, direction, neighbor);

				carvePassageFrom(neighbor, maze);
			}
		}
	}

}

function removeWalls(cell, direction, neighbor){
	var oppositeDirection;
	switch (direction){
		case 'N':
			oppositeDirection = 'S';
			break;
		case 'S':
			oppositeDirection = 'N';
			break;
		case 'E':
			oppositeDirection = 'W';
			break;
		case 'W':
			oppositeDirection = 'E';
			break;
	}
	cell.walls[direction] = false;
	neighbor.walls[oppositeDirection] = false;
}

function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex ;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}