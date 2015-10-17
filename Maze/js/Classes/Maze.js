var Maze = function(width, height, startingPoint){
	this.width = width;
	this.height =  height;
	this.startingPoint = startingPoint;
	this.map = [];

	for (y = 0; y < height; y++) {
		this.map[y] = [];
		for (x = 0; x < width; x++) {
			this.map[y][x] = new Cell(new BABYLON.Vector2(x, y));
		}
	}
};