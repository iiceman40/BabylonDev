var Cannon = function (offset, player, material, scene) {
	var cannon = BABYLON.MeshBuilder.CreateCylinder('cannonLeft',{diameterTop: 0.1, diameterBottom: 0.1, tessellation: 8, arc: 1, height: 2}, scene);
	cannon.rotation.x = Math.PI/2;
	cannon.parent = player;
	cannon.position = offset;
	cannon.material = material;

	cannon.outputEnd = BABYLON.MeshBuilder.CreateBox('cannonLeftOutput',{size: 0.15}, scene);
	cannon.outputEnd.position.y = 1.5;
	cannon.outputEnd.isVisible = false;
	cannon.outputEnd.parent = cannon;
	cannon.convertToFlatShadedMesh();
	return cannon;
};