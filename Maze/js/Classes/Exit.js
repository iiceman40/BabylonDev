var Exit = function (exitCoordinates, maze, playerOnMiniMap, mazeMesh, camera, scene) {
	var exit = BABYLON.Mesh.CreateTorus("exit", 3, 0.5, 64, scene, false);
	exit.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
	exit.material = new ExitMaterial(scene);
	exit.rotation.x = Math.PI/2;
	exit.position = getCellPosition(exitCoordinates.x, exitCoordinates.y, exitCoordinates.z, maze, spacing);

	var exitPortal = BABYLON.MeshBuilder.CreateDisc("exitPortal", {radius: 1.5, tessellation: 32}, scene);
	exitPortal.rotation.x = Math.PI/2;
	exitPortal.bakeCurrentTransformIntoVertices();
	exitPortal.material = new ExitPortalMaterial(scene);
	exitPortal.parent = exit;

	var exitLight = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 0), scene);
	exitLight.diffuse = new BABYLON.Color3(0.5, 0, 0.5);
	exitLight.intensity = 0.8;
	exitLight.range = 15;
	exitLight.position = exit.position;
	exitLight.includedOnlyMeshes = [mazeMesh];

	var exitFound = false;
	setTimeout(function(){
		scene.registerBeforeRender(function () {
			if(!exitFound && exit.intersectsMesh(playerOnMiniMap, true)){
				exitFound = true;
				camera.detachControl(canvas);
				alert('Exit reached!');
			}
		});
	}, 100);
};