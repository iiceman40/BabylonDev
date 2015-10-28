$(document).ready(function(){
	var canvas = document.getElementById("renderCanvas");
	var engine = new BABYLON.Engine(canvas, true);
	var scene = createScene();
	engine.runRenderLoop(function () {
		scene.render();
	});
	window.addEventListener("resize", function () { engine.resize();});

	function createScene() {
		var scene = new BABYLON.Scene(engine);

		var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, -5), scene);
		camera.attachControl(canvas, true);
		scene.activeCameras.push(camera);

		// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
		var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

		var box = BABYLON.Mesh.CreateBox('box', 1, scene);

		var assets = [];
		var loader = new BABYLON.AssetsManager(scene);

		var toLoad = [
			{name : "testTexture", src : "img/baseTile.png" }
		];

		toLoad.forEach(function(obj) {
			var img = loader.addTextureTask(obj.name, obj.src);
			img.onSuccess = function(t) {
				assets[t.name] = t.texture;
			};
		});

		loader.onFinish = function() {

			setTimeout(function() {
				/* GUI CREATION when all texture are loaded*/
				var gui = new bGUI.GUISystem(scene);
				var text = new bGUI.GUIText("helpText", 128, 128, {
					font: "20px Verdana",
					textAlign: "center",
					text: "Flip",
					color: "#FF530D"
				}, gui);
				text.relativePosition(new BABYLON.Vector3(0.1, 0.3, 0));
				text.onClick = function () {
					text.flip(500);
				};

				// bGUI logo
				var testPanel = new bGUI.GUIPanel("bgui", assets["testTexture"], null, gui);
				testPanel.relativePosition(new BABYLON.Vector3(0.05, 0.9, 0));

				box.material = new BABYLON.StandardMaterial('mat', scene);
				box.material.diffuseTexture = assets['testTexture'];

				gui.enableClick();
				gui.updateCamera();

			}, 10);
		};

		loader.load();


		return scene;
	}

});