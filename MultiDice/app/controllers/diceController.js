define(['diceConfig', 'sceneFactory', 'angular', 'handJs', 'babylonJs'], function (diceConfig, SceneFactory) {
	return ['$scope', function ($scope) {
		console.log(diceConfig);

		var canvas = document.getElementById("renderCanvas"),
			engine = new BABYLON.Engine(canvas, true),
			scene = SceneFactory.createScene(canvas, engine);

		var smoothnessMultiplier = 4,
			height = 3,
			diameter = 2.3,
			dice = BABYLON.MeshBuilder.CreateCylinder("diceCylinder", {
				height: height,
				diameterTop: diameter,
				diameterBottom: diameter,
				tessellation: diceConfig.length * smoothnessMultiplier
			}, scene),
			diceFont = BABYLON.MeshBuilder.CreateCylinder("diceFontCylinder", {
				height: height,
				diameterTop: diameter + 0.001,
				diameterBottom: diameter + 0.001,
				tessellation: diceConfig.length * smoothnessMultiplier
			}, scene);

		// DICE
		var blankMaterial = new BABYLON.StandardMaterial("blank", scene),
			multiMaterial = new BABYLON.MultiMaterial("diceMultiMaterial", scene),
			fontMaterial  = new BABYLON.StandardMaterial("fontMaterial", scene);

		diceFont.material = fontMaterial;

		multiMaterial.subMaterials.push(blankMaterial);

		dice.material = multiMaterial;
		dice.subMeshes = [];

		var totalVertices = dice.getTotalVertices(),
			totalIndices = dice.getTotalIndices(),
			indicesPerLateralFace = 6 * smoothnessMultiplier,
			indicesPerCoverFace = diceConfig.length * 3;

		// top and bottom faces
		new BABYLON.SubMesh(0, 0, totalVertices, totalIndices - 2 * indicesPerCoverFace, 2 * indicesPerCoverFace, dice);

		var dynamicTexture = new BABYLON.DynamicTexture("dynamic texture", {width: 1024, height: 1024}, scene, true);
		dynamicTexture.hasAlpha = true;
		dynamicTexture.wAng = Math.PI/2;
		var size = dynamicTexture.getSize();

		// lateral surface
		for (var i = 0; i < diceConfig.length; i++) {
			var faceMaterial = new BABYLON.StandardMaterial(diceConfig[i].title, scene);
			faceMaterial.specularColor = new BABYLON.Color3(0.3, 0.3, 0.3);
			faceMaterial.diffuseColor = diceConfig[i].color;

			dynamicTexture.drawText(diceConfig[i].title, size.width/2 - diceConfig[i].title.length * 25, 98 * i + i * 30 + 95, "bold 90px Segoe UI", "black", null, false);
			dynamicTexture.drawText(diceConfig[i].title, 2 + size.width/2 - diceConfig[i].title.length * 25, 98 * i + i * 30 + 97, "bold 90px Segoe UI", "#aaaaaa", null, false);

			multiMaterial.subMaterials.push(faceMaterial);
			new BABYLON.SubMesh(i + 1, 0, totalVertices, indicesPerLateralFace * i, indicesPerLateralFace, dice);
		}

		diceFont.material.diffuseTexture = dynamicTexture;

		// PIN
		var pin = BABYLON.MeshBuilder.CreateCylinder("diceCylinder", {
			height: 0.2,
			diameterTop: 0.2,
			diameterBottom: 0.00000001,
			tessellation: 32
		}, scene);
		pin.parent = scene.activeCamera;
		pin.position.z = 3;
		pin.position.y = 1.1;
		pin.material = new BABYLON.StandardMaterial('pinMaterial', scene);
		pin.material.emissiveColor = new BABYLON.Color3(0.08, 0.38, 0.47);
		pin.lookAt(dice.position);

	}];
});