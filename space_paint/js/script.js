$(document).ready(function(){

	var canvas = document.getElementById("renderCanvas");
	var engine = new BABYLON.Engine(canvas, true);
	var meshPlayer;

	var scene = createScene();
	//scene.debugLayer.show();

	function createScene() {

		var scene = new BABYLON.Scene(engine);

		var camera = new BABYLON.ArcRotateCamera("camera1", Math.PI/2, -Math.PI/6, 15, new BABYLON.Vector3(0, 0, 0), scene);
		camera.attachControl(canvas, true);

		var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
		light.intensity = 3;

		var shipTexture = new BABYLON.DynamicTexture("dynamic texture", 1024, scene, true);

		var img = new Image();
		img.src = "assets/space_frigate_6_color.png";

		img.onload = function() {

			var dynamicMaterial = new BABYLON.StandardMaterial('mat', scene);
			dynamicMaterial.diffuseTexture = shipTexture;
			dynamicMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
			dynamicMaterial.backFaceCulling = false;

			BABYLON.SceneLoader.ImportMesh("space_frig", "assets/", "space_frigate.babylon", scene, function (newMeshes, particleSystems) {
				meshPlayer = newMeshes[0];
				meshPlayer.position.y = 2;
				//meshPlayer.receiveShadows = true;
				//shadowGenerator.getShadowMap().renderList.push(meshPlayer);

				meshPlayer.checkCollisions = true;
				meshPlayer.ellipsoid = new BABYLON.Vector3(1, 1, 1);
				meshPlayer.ellipsoidOffset = new BABYLON.Vector3(0, 0, 0);

				meshPlayer.scaling.x = meshPlayer.scaling.y = meshPlayer.scaling.z = 0.3;

				meshPlayer.material.diffuseTexture = shipTexture;
				meshPlayer.material.bumpTexture = new BABYLON.Texture('assets/space_frigate_6_bump.png', scene);
				meshPlayer.material.specularTexture = new BABYLON.Texture('assets/space_frigate_6_specular.png', scene);
				meshPlayer.material.emissiveTexture = new BABYLON.Texture('assets/space_frigate_6_illumination.png', scene);
			});

			// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
			var ground = BABYLON.Mesh.CreateGround("ground1", 12, 12, 2, scene);
			ground.material = dynamicMaterial;
			ground.position.y = -1;


			var clearColor = "#555555";
			var invertY = true;
			var context = shipTexture._context;
			var size = shipTexture.getSize();
			var draw = false;

			if (clearColor) {
				context.fillStyle = clearColor;
				context.fillRect(0, 0, size.width, size.height);
			}

			context.drawImage(img, 0, 0);
			shipTexture.update(invertY);

			/**
			 * EVENT FUNCTIONS
			 */
			var onPointerDown = function (evt) {
				if (evt.button == 0) {
					camera.detachControl(canvas);
					draw = true;

					if (draw) {
						drawHere(shipTexture);
					}
				}
			};

			var onPointerUp = function (evt) {
				if (evt.button == 0) {
					camera.attachControl(canvas, true);
					draw = false;
				}
			};

			var onPointerMove = function (evt) {
				if (draw) {
					drawHere(shipTexture);
				}
			};

			function drawHere(texture){
				var pickInfo = scene.pick(scene.pointerX, scene.pointerY);
				var texCoords = pickInfo.getTextureCoordinates();
				var context = texture._context;
				var radius = $('#radius').val();
				var color = $('#color').val();

				if (texCoords) {
					var centerX = texCoords.x * size.width;
					var centerY = size.height - texCoords.y * size.height;

					// draw circle
					context.beginPath();
					context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
					context.fillStyle = color;
					context.fill();
					context.lineWidth = 5;
					context.strokeStyle = color;
					context.stroke();

					texture.update(invertY);
				}
			}

			scene.onDispose = function () {
				window.removeEventListener("mousedown", onPointerDown);
				window.removeEventListener("mouseup", onPointerUp);
				window.removeEventListener("mousemove", onPointerMove);

				window.removeEventListener("pointerdown", onPointerDown);
				window.removeEventListener("pointerup", onPointerUp);
				window.removeEventListener("pointermove", onPointerMove);
			};

			window.addEventListener("resize", function () {
				engine.resize();
			});

			window.addEventListener("mousedown", onPointerDown);
			window.addEventListener("mouseup", onPointerUp);
			window.addEventListener("mousemove", onPointerMove);

			window.addEventListener("pointerdown", onPointerDown);
			window.addEventListener("pointerup", onPointerUp);
			window.addEventListener("pointermove", onPointerMove);

			engine.runRenderLoop(function () {
				scene.render();
			});

			return scene;
		}

	}

});