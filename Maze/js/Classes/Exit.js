var Exit = function (exitCoordinates, maze, playerOnMiniMap, mazeMesh, camera, scene) {
	var exit = BABYLON.Mesh.CreateTorus("exit", 3, 0.5, 64, scene, false);
	exit.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
	exit.material = new ExitMaterial(scene);
	exit.rotation.x = Math.PI/2;
	exit.position = getCellPosition(exitCoordinates.x, exitCoordinates.y, exitCoordinates.z, maze, spacing);
	maze.map[exitCoordinates.x][exitCoordinates.y][exitCoordinates.z].hasExit = true;

	var exitPortal = BABYLON.MeshBuilder.CreateDisc("exitPortal", {radius: 1.5, tessellation: 32}, scene);
	exitPortal.rotation.x = Math.PI/2;
	exitPortal.bakeCurrentTransformIntoVertices();
	exitPortal.material = new ExitPortalMaterial(scene);
	exitPortal.parent = exit;

	var exitLight = new BABYLON.PointLight("Omni0", new BABYLON.Vector3(0, 0, 0), scene);
	exitLight.diffuse = new BABYLON.Color3(0.5, 0, 0.5);
	exitLight.intensity = 0.8;
	exitLight.range = 15;
	exitLight.parent = exit;
	exitLight.includedOnlyMeshes = [mazeMesh,exit, exitPortal];

	var animationLight = new BABYLON.Animation("exitLightPosition", "position.y", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
	// Animation keys
	var keys = [
		{frame: 0, value: 0.5},
		{frame: 50, value: 2.5},
		{frame: 100, value: 0.5}
	];
	//Adding keys to the animation object
	animationLight.setKeys(keys);
	//Then add the animation object to box1
	exitLight.animations.push(animationLight);

	//Finally, launch animations on box1, from key 0 to key 100 with loop activated
	scene.beginAnimation(exitLight, 0, 100, true);

	var exitFound = false;
	setTimeout(function(){
		scene.registerBeforeRender(function () {
			if(!exitFound && exit.intersectsMesh(playerOnMiniMap, true)){
				exitFound = true;
				//camera.detachControl(canvas);
				engine.stopRenderLoop();
				//alert('Exit reached!');
				scene.dispose();
				scene = createScene();
				engine.runRenderLoop(function () {
					scene.render();
				});
			}
		});
	}, 100);
};