$(document).ready(function () {
	var canvas = document.getElementById("renderCanvas");
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);

	var shadowsEnabled = false;

	createScene();

	engine.runRenderLoop(function () {
		scene.render();
	});

	window.addEventListener("resize", function () {
		engine.resize();
	});

	function createScene() {
		var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 3, Math.PI * 2 / 5, 100, new BABYLON.Vector3(0, 35, 0), scene);
		camera.attachControl(canvas, true);

		var light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(0, -1, -1), scene);
		light.intensity = 0.7;

		// light
		var gateLight = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(0, 0, 0), scene);
		gateLight.diffuse = new BABYLON.Color3(0.5, 0.5, 1);
		gateLight.specular = new BABYLON.Color3(0.5, 0.5, 1);
		gateLight.intensity = 0.7;

		if(shadowsEnabled) {
			var shadowGenerator = new BABYLON.ShadowGenerator(512, light);
			shadowGenerator.useBlurVarianceShadowMap = true;
		}

		// Skybox
		//var reflectionTexture = new BABYLON.CubeTexture("textures/TropicalSunnyDay", scene);
		var reflectionTexture = new BABYLON.StarfieldProceduralTexture("stars", 1024, scene);
		var skybox = BABYLON.Mesh.CreateBox("skyBox", 1024, scene);
		var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
		skyboxMaterial.backFaceCulling = false;
		skyboxMaterial.reflectionTexture = reflectionTexture;
		skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		skyboxMaterial.disableLighting = true;
		skybox.material = skyboxMaterial;

		// Ground
		var url = "data:image/png;base64,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";
		var groundTexture = new BABYLON.Texture("data:tiles", scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE, null, null, url, true);
		var groundBumpTexture = new BABYLON.Texture("textures/tile_normal.png", scene);
		groundTexture.vScale = groundTexture.uScale = groundBumpTexture.vScale = groundBumpTexture.uScale = 150.0;
		groundBumpTexture.level = 0.8;

		var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
		groundMaterial.diffuseTexture = groundTexture;
		groundMaterial.bumpTexture = groundBumpTexture;

		var ground = BABYLON.Mesh.CreateGround("ground", 1024, 1024, 32, scene, false);
		ground.position.y = -1;
		ground.material = groundMaterial;
		ground.receiveShadows = true;

		var waterMaterial = createWaterMaterial([skybox, ground]);
		var gateMaterial = createGateMaterial();

		createStarGate(waterMaterial, gateMaterial, shadowGenerator);

		var pedestal = createButton(gateMaterial);
		pedestal.position.z = -24;
		pedestal.position.x = -44.5;

		var trigger = scene.getMeshByID('trigger');
		trigger.actionManager = new BABYLON.ActionManager(scene);
		trigger.actionManager.registerAction(
			new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function(evt){
				pause = !pause;
			})
		);

		//scene.debugLayer.show(true, camera);

		var direction = -1;
		var delta = 0;
		var pause = true;
		scene.registerBeforeRender(function(){
			if(pause === false) {
				if (delta < 97) {
					for (var i = 0; i < 8; i++) {
						var sphere = scene.getMeshByID('sphere' + i);
						sphere.rotation.z += 0.01 * direction;
					}
					delta++;
				} else {
					pause = true;
					delta = 0;
					direction *= -1;
				}
			}
		});

		return scene;
	}

	/**
	 *
	 * @param {Array} renderList
	 */
	function createWaterMaterial(renderList){
		var waterMaterial = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
		waterMaterial.backFaceCulling = true;
		waterMaterial.bumpTexture = new BABYLON.Texture("textures/waterbump.png", scene);
		waterMaterial.windForce = 5;
		waterMaterial.waveHeight = 0.3;
		waterMaterial.bumpHeight = 10;
		waterMaterial.waveLength = 0.5;
		waterMaterial.waterColor = new BABYLON.Color3(0.2, 0.2, 0.4);
		waterMaterial.colorBlendFactor = 0.7;
		waterMaterial.alpha = 0.95;

		for (var i = 0; i < renderList.length; i++) {
			waterMaterial.addToRenderList(renderList[i]);
		}

		return waterMaterial;
	}

	/**
	 *
	 * @return {*}
	 */
	function createGateMaterial() {
		var reflectivity = 0.4;
		var glossiness = 0.4;
		var color = new BABYLON.Color3(0.4, 0.4, 0.4);
		// var gateMaterial = new BABYLON.PBRMaterial("gateMaterial", scene);
		// gateMaterial.reflectionTexture = reflectionTexture;
		// gateMaterial.albedoColor = color;
		// gateMaterial.reflectivityColor = new BABYLON.Color3(reflectivity, reflectivity, reflectivity);
		// gateMaterial.microSurface = glossiness;
		// gateMaterial.usePhysicalLightFalloff = false;
		var gateMaterial = new BABYLON.StandardMaterial('gateMaterial', scene);
		gateMaterial.diffuseColor = color;
		gateMaterial.specularColor = new BABYLON.Color3(reflectivity, reflectivity, reflectivity);

		return gateMaterial;
	}

	/**
	 *
	 * @param waterMaterial
	 * @param gateMaterial
	 */
	function createStarGate(waterMaterial, gateMaterial, shadowGenerator) {
		var radius = 25;
		var gateHeightOverGround = 12;

		/**
		 * build gate
		 */
		var gate = BABYLON.Mesh.CreateTorus("gate", 2 * radius, 5, 8, scene);
		gate.rotation.x = Math.PI / 2;
		gate.convertToFlatShadedMesh();
		gate.bakeCurrentTransformIntoVertices();
		gate.position.y = radius + gateHeightOverGround;
		gate.material = gateMaterial;

		var outerGate = BABYLON.Mesh.CreateTorus("outerGate", 2 * radius * 1.45, 22, 8, scene);
		outerGate.rotation.x = Math.PI / 2;
		outerGate.scaling.y = 0.3;
		outerGate.convertToFlatShadedMesh();
		outerGate.bakeCurrentTransformIntoVertices();
		outerGate.material = gateMaterial;
		outerGate.parent = gate;

		// water material for inner gate
		var innerGate = BABYLON.Mesh.CreateSphere("innerGate", 64, 2 * radius, scene);
		innerGate.rotation.x = Math.PI / 2;
		innerGate.scaling.y = 0.005;
		innerGate.parent = gate;

		innerGate.material = waterMaterial;

		// build iris
		var slice = createSlice(scene);
		slice.material = gateMaterial;

		for (var i = 0; i < 8; i++) {
			var sphere = BABYLON.MeshBuilder.CreatePolyhedron('sphere' + i, {size: 3, type: 1}, scene);
			sphere.position.x = -Math.sin(i * 0.785) * radius;
			sphere.position.y = -Math.cos(i * 0.785) * radius;
			sphere.position.z = i * 0.1 - 0.4;
			sphere.material = gateMaterial;
			sphere.convertToFlatShadedMesh();
			sphere.parent = gate;

			sphere.rotation.z = Math.PI * 0.547 - i * 0.785;

			var clonedSlice = slice.clone('slice' + i);
			clonedSlice.parent = sphere;
			clonedSlice.position.x = 4;
			clonedSlice.position.y = 13;
			if(shadowGenerator instanceof BABYLON.ShadowGenerator) {
				shadowGenerator.getShadowMap().renderList.push(clonedSlice);
			}
		}

		if(shadowGenerator instanceof BABYLON.ShadowGenerator) {
			shadowGenerator.getShadowMap().renderList.push(scene.getMeshByID('gate'));
			shadowGenerator.getShadowMap().renderList.push(scene.getMeshByID('outerGate'));
			shadowGenerator.getShadowMap().renderList.push(scene.getMeshByID('pedestal'));
			shadowGenerator.getShadowMap().renderList.push(scene.getMeshByID('trigger'));

			shadowGenerator.getLight().position = gate.position.clone();
			shadowGenerator.getLight().position.z += 5;
		}

		slice.dispose();
	}

	/**
	 *
	 */
	function createSlice() {
		var diameter = 28;
		var slice = BABYLON.MeshBuilder.CreateCylinder('slice', {
			diameter: diameter,
			height: 1,
			tessellation: 16,
			sideOrientation: BABYLON.Mesh.DOUBLESIDE
		}, scene);

		var slice2 = BABYLON.MeshBuilder.CreateCylinder('slice2', {
			diameter: diameter,
			height: 3,
			tessellation: 16,
			sideOrientation: BABYLON.Mesh.DOUBLESIDE
		}, scene);
		slice2.position.x = -8;
		slice2.position.z = 8;

		var sliceCsg = BABYLON.CSG.FromMesh(slice);
		var slice2Csg = BABYLON.CSG.FromMesh(slice2);

		var result = sliceCsg.subtract(slice2Csg);
		var mesh = result.toMesh('result', new BABYLON.StandardMaterial('mat', scene), scene);

		slice.dispose();
		slice2.dispose();

		mesh.rotation.z = Math.PI / 2;
		mesh.rotation.y = Math.PI / 2;
		mesh.bakeCurrentTransformIntoVertices();
		mesh.convertToFlatShadedMesh();

		return mesh;
	}

	/**
	 *
	 * @param material
	 */
	function createButton(material) {
		var height = 30;

		var pedestal = BABYLON.MeshBuilder.CreateBox('pedestal', {size: 6.5, height: height}, scene);
		pedestal.position.y = height/2 - 1;
		pedestal.material = material;

		var triggerMaterial = new BABYLON.StandardMaterial('triggerMaterial', scene);
		triggerMaterial.emissiveColor = new BABYLON.Color3(0.3,0,0);
		triggerMaterial.diffuseColor = new BABYLON.Color3(1,0,0);

		var trigger = BABYLON.MeshBuilder.CreateBox('trigger', {size: 5}, scene);
		trigger.material = triggerMaterial;
		trigger.parent = pedestal;
		trigger.position.y = height/2 - 1;

		var light = new BABYLON.PointLight("pointLight", trigger.position.clone(), scene);
		light.diffuse = new BABYLON.Color3(0.8, 0, 0);
		light.specular = new BABYLON.Color3(0.8, 0.4, 0.4);
		light.intensity = 0.7;

		return pedestal;
	}

});