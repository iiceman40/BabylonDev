var createScene;
var scene, engine, canvas;
var camera;

$(document).ready(function(){
	// init variables
	canvas = document.getElementById("renderCanvas");
	var tempMouseX = 0, tempMouseY = 0;

	// init view model
	initUi();

	createScene = function() {

		engine = new BABYLON.Engine(canvas, true);
		scene = new BABYLON.Scene(engine);

		// init textures - TODO use a texture array
		textures.baseTileTexture = new BABYLON.Texture("textures/baseTile.png", scene);
		textures.cobbleTexture = new BABYLON.Texture("textures/cobble.jpg", scene);
		textures.cobbleTextureNormal = new BABYLON.Texture("textures/cobble_normal5.png", scene);
		textures.portalTile = new BABYLON.Texture("textures/portal-tile.jpg", scene);
		textures.portalTileNormal = new BABYLON.Texture("textures/portal-tile-normalmap.png", scene);
		textures.portalTileDark = new BABYLON.Texture("textures/portal-tile-dark.jpg", scene);

		// init materials
		for(var i=0; i<materials.length; i++){
			materials[i].material = materials[i].constructor(scene);
		}

		// Light directional
		var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-2, -1, 0), scene);
		light.specular = new BABYLON.Color3(0.7, 0.7, 0.7);
		light.position = new BABYLON.Vector3(700, 700, -500);
		light.intensity = 1;

		var sun = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(100, 50, 0), scene);
		sun.intensity = 0.2;

		// show light position for debugging
		var sphere = BABYLON.Mesh.CreateSphere("light", 9, 1, scene);
		sphere.position = light.position;

		// Shadows
		var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
		//shadowGenerator.useBlurVarianceShadowMap = true;
		shadowGenerator.usePoissonSampling = true;
		shadowGenerator.bias = 0.00001;

		// Camera
		camera = new BABYLON.ArcRotateCamera('camera', -Math.PI/2, -Math.PI/2, 150, new BABYLON.Vector3.Zero(), scene);
		camera.attachControl(canvas, true);
		camera.keysUp = [];
		camera.keysDown = [];
		camera.keysLeft = [];
		camera.keysRight = [];

		// preload meshes
		var assetsManager = new BABYLON.AssetsManager(scene);

		var rampTask = assetsManager.addMeshTask("rampTask", "", "models/", "ramp.babylon");
		rampTask.onSuccess = function(task){
			companionCube = task.loadedMeshes[0];
			ramp = task.loadedMeshes[0];
			ramp.convertToFlatShadedMesh();
			ramp.scaling = new BABYLON.Vector3(2.5, 2.5 , 2.5); // scale to 2.5 for right size
			ramp.position.y = 999999;
		};

		var cubeTask = assetsManager.addMeshTask("cubeTask", "", "models/", "cube.babylon");
		cubeTask.onSuccess = function(task){
			for(var i=0; i<task.loadedMeshes.length; i++){
				task.loadedMeshes[i].isVisible = false;
			}

			companionCube = task.loadedMeshes[0];
			companionCube.isVisible = true;
			companionCube.scaling = new BABYLON.Vector3(2.25, 2.25, 2.25);
			companionCube.position.y = 999999;
		};

		// execute load everything
		assetsManager.load();

		// Ground
		var tiledGround = new BABYLON.Mesh.CreateTiledGround('tiledGround', -10*gridSize, -10*gridSize, 10*gridSize, 10*gridSize, subdivisions, precision, scene);
		tiledGround.material = materials[2].material;
		tiledGround.visibility = 0.7;
		tiledGround.receiveShadows = true;

		var verticesCount = tiledGround.getTotalVertices();
		var tileIndicesLength = tiledGround.getIndices().length / (subdivisions.w * subdivisions.h);

		tiledGround.subMeshes = [];
		tiledGround.indexedGroundSubMeshes = {};
		var base = 0;
		for (var row = 0; row < subdivisions.h; row++) {
			for (var col = 0; col < subdivisions.w; col++) {
				var matIndex = 0; // material index for this tile
				var subMesh = new BABYLON.SubMesh(matIndex, 0, verticesCount, base, tileIndicesLength, tiledGround);
				tiledGround.indexedGroundSubMeshes[subMesh._id] = subMesh;
				base += tileIndicesLength;
			}
		}

		// point the light in the direction of the tiled ground
		light.setDirectionToTarget(tiledGround.position.normalize());

		// Events
		window.addEventListener("mousedown", function (event) {
			tempMouseX = event.x;
			tempMouseY = event.y;
		});

		window.addEventListener("mouseup", function (event) {
			if(event.target == canvas && Math.abs(tempMouseX - event.x) < 10 && Math.abs(tempMouseY - event.y) < 10) {
				pickObjectInScene(event, shadowGenerator, camera);
			}
		});

		scene.registerBeforeRender(function() {
		});

		engine.runRenderLoop(function () {
			scene.render();
		});

		window.addEventListener("resize", function () { engine.resize();});
	};

	// create the initial scene
	createScene();

	var pickObjectInScene = function(event, shadowGenerator, camera){
		var pickResult = scene.pick(scene.pointerX, scene.pointerY, null, null, camera);

		if(pickResult.pickedMesh) {
			var newPosition = BABYLON.Vector3.Zero();

			if (pickResult.pickedMesh.name == 'tiledGround') {

				var tiledGround = pickResult.pickedMesh;
				var verticesCount = tiledGround.getTotalVertices();
				var tileIndicesLength = tiledGround.getIndices().length / (subdivisions.w * subdivisions.h);

				// if ground is picked
				console.log(pickResult);
				if(!tiledGround.hasOwnProperty('indexedGroundSubMeshes')){
					tiledGround.indexedGroundSubMeshes = {};
					var base = 0;
					for (var row = 0; row < subdivisions.h; row++) {
						for (var col = 0; col < subdivisions.w; col++) {
							var matIndex = 0; // material index for this tile
							var subMesh = new BABYLON.SubMesh(matIndex, 0, verticesCount, base, tileIndicesLength, tiledGround);
							tiledGround.indexedGroundSubMeshes[subMesh._id] = subMesh;
							base += tileIndicesLength;
						}
					}
				}
				var selectedSubMesh = tiledGround.indexedGroundSubMeshes[pickResult.subMeshId];
				//selectedSubMesh.materialIndex = (selectedSubMesh.materialIndex == 0) ? 1 : 0;
				newPosition = selectedSubMesh._boundingInfo.boundingBox.center;

			} else {

				// if some mesh is picked
				newPosition = pickResult.pickedMesh.position.clone();

				// calculate new position based on the selected side of the mesh
				var direction = pickResult.pickedMesh.position.subtract(pickResult.pickedPoint);
				var largest = Math.max(Math.abs(direction.x), Math.abs(direction.y), Math.abs(direction.z));
				switch (largest) {
					case Math.abs(direction.x):
						newPosition.x += gridSize * (direction.x / Math.abs(direction.x)) * -1;
						newPosition.y -= gridSize/2;
						break;
					case Math.abs(direction.y):
						var deltaY = gridSize/2  * (direction.y / Math.abs(direction.y)) * -1;
						if(deltaY == -gridSize/2) deltaY = -gridSize * 1.5;
						newPosition.y += deltaY;
						break;
					case Math.abs(direction.z):
						newPosition.z += gridSize * (direction.z / Math.abs(direction.z)) * -1;
						newPosition.y -= gridSize/2;
						break;
				}

				if(viewModel.selectedTool().name == 'remove'){
					pickResult.pickedMesh.dispose();
				}

			}
		}

		if( (event.button == 2 || viewModel.selectedTool().name == 'select') && pickResult.pickedMesh ){
			// select mesh
			var deselect = false;
			if(viewModel.selectedMesh()) {
				viewModel.selectedMesh().mesh().showBoundingBox = false;
				if(viewModel.selectedMesh().mesh() == pickResult.pickedMesh){
					deselect = true;
				}
			}

			if(deselect){
				viewModel.selectedMesh(null);
			} else {
				var selectedMeshViewModel = new SelectedMeshViewModel(pickResult.pickedMesh);
				viewModel.selectedMesh(selectedMeshViewModel);
				pickResult.pickedMesh.showBoundingBox = true;
				shadowGenerator.getShadowMap().renderList.push(pickResult.pickedMesh);
			}
		} else if(viewModel.selectedTool().name == 'add' && newPosition && viewModel.selectedMeshBlueprint()){
			// add new mesh
			var currentMesh = viewModel.selectedMeshBlueprint();
			var mesh = currentMesh.constructor();
			if(viewModel.selectedMaterial().material) {
				mesh.material = viewModel.selectedMaterial().material;
			}

			mesh.position = newPosition.add(currentMesh.offset);
			mesh.receiveShadows = true;
			shadowGenerator.getShadowMap().renderList.push(mesh);
		}
	}

});