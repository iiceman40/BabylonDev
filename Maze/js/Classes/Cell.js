var Cell = function (position) {
	this.position = position;
	this.hasBeenVisited = false;
	this.directions = ['N', 'S', 'E', 'W'];
	this.neighbors = [];
	this.walls = {
		N: true,
		S: true,
		E: true,
		W: true
	};
	this.doors = [];

};