window.addEventListener("DOMContentLoaded", function () {

	var canvas = document.getElementById("game");
	var engine = new BABYLON.Engine(canvas, true);
	var scene = new BABYLON.Scene(engine);

	new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

	var camera = new BABYLON.ArcRotateCamera("gameCam", 0, 0, 10, BABYLON.Vector3.Zero(), scene);
	camera.attachControl(canvas);

	var spinning = BABYLON.Mesh.CreateBox("box", 2.0, scene);

	var gui = new bGUI.GUISystem(scene);
	var text = new bGUI.GUIText("helpText", 128, 128, {
		font: "20px Open Sans",
		textAlign: "center",
		text: "Flip",
		color: "#FF530D"
	}, gui);
	text.relativePosition(new BABYLON.Vector3(0.1, 0.3, 0));
	text.onClick = function () {
		text.flip(500);
	};


	gui.enableClick();
	gui.updateCamera();

	scene.onPointerDown = function (evt, pr) {
		if (pr.hit) {
			console.log(pr.pickedMesh.name);
		}
	};

	engine.runRenderLoop(function () {
		scene.render();
	});
});
