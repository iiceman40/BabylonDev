var Cell = function (position) {
	this.position = position;
	this.hasBeenVisited = false;
	this.directions = ['N', 'S', 'E', 'W', 'UP', 'DOWN'];
	this.walls = {
		N: true,
		S: true,
		E: true,
		W: true,
		UP: true,
		DOWN: true
	};
	this.doors = [];
	this.hasTerminal = false;

};