$(window).ready(function () {

	var canvas = document.getElementById("renderCanvas");
	var scene, camera;

	console.log('creating scene');
	scene = createScene();
	//scene.debugLayer.show();

	function createScene() {

		var engine = new BABYLON.Engine(canvas, true);
		var scene = new BABYLON.Scene(engine);

		/*var scene = new BABYLON.Scene(engine);
		 var camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 12, BABYLON.Vector3.Zero(), scene);
		 camera.attachControl(canvas, false);
		 */
		function Grad(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}

		Grad.prototype.dot2 = function (x, y) {
			return this.x * x + this.y * y;
		};

		Grad.prototype.dot3 = function (x, y, z) {
			return this.x * x + this.y * y + this.z * z;
		};

		var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
			new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
			new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];

		var p = [151, 160, 137, 91, 90, 15,
			131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
			190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
			88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
			77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
			102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
			135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
			5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
			223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
			129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
			251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
			49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
			138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
		// To remove the need for index wrapping, double the permutation table length
		var perm = new Array(512);
		var gradP = new Array(512);

		// This isn't a very good seeding function, but it works ok. It supports 2^16
		// different seed values. Write something better if you need more seeds.
		var seed = function (seed) {
			if (seed > 0 && seed < 1) {
				// Scale the seed out
				seed *= 65536;
			}

			seed = Math.floor(seed);
			if (seed < 256) {
				seed |= seed << 8;
			}

			for (var i = 0; i < 256; i++) {
				var v;
				if (i & 1) {
					v = p[i] ^ (seed & 255);
				} else {
					v = p[i] ^ ((seed >> 8) & 255);
				}

				perm[i] = perm[i + 256] = v;
				gradP[i] = gradP[i + 256] = grad3[v % 12];
			}
		};

		seed(0);

		/*
		 for(var i=0; i<256; i++) {
		 perm[i] = perm[i + 256] = p[i];
		 gradP[i] = gradP[i + 256] = grad3[perm[i] % 12];
		 }*/

		// Skewing and unskewing factors for 2, 3, and 4 dimensions
		var F2 = 0.5 * (Math.sqrt(3) - 1);
		var G2 = (3 - Math.sqrt(3)) / 6;

		var F3 = 1 / 3;
		var G3 = 1 / 6;


		// 3D simplex noise
		var simplex3 = function (xin, yin, zin) {
			var n0, n1, n2, n3; // Noise contributions from the four corners

			// Skew the input space to determine which simplex cell we're in
			var s = (xin + yin + zin) * F3; // Hairy factor for 2D
			var i = Math.floor(xin + s);
			var j = Math.floor(yin + s);
			var k = Math.floor(zin + s);

			var t = (i + j + k) * G3;
			var x0 = xin - i + t; // The x,y distances from the cell origin, unskewed.
			var y0 = yin - j + t;
			var z0 = zin - k + t;

			// For the 3D case, the simplex shape is a slightly irregular tetrahedron.
			// Determine which simplex we are in.
			var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
			var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
			if (x0 >= y0) {
				if (y0 >= z0) {
					i1 = 1;
					j1 = 0;
					k1 = 0;
					i2 = 1;
					j2 = 1;
					k2 = 0;
				}
				else if (x0 >= z0) {
					i1 = 1;
					j1 = 0;
					k1 = 0;
					i2 = 1;
					j2 = 0;
					k2 = 1;
				}
				else {
					i1 = 0;
					j1 = 0;
					k1 = 1;
					i2 = 1;
					j2 = 0;
					k2 = 1;
				}
			} else {
				if (y0 < z0) {
					i1 = 0;
					j1 = 0;
					k1 = 1;
					i2 = 0;
					j2 = 1;
					k2 = 1;
				}
				else if (x0 < z0) {
					i1 = 0;
					j1 = 1;
					k1 = 0;
					i2 = 0;
					j2 = 1;
					k2 = 1;
				}
				else {
					i1 = 0;
					j1 = 1;
					k1 = 0;
					i2 = 1;
					j2 = 1;
					k2 = 0;
				}
			}
			// A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
			// a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
			// a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
			// c = 1/6.
			var x1 = x0 - i1 + G3; // Offsets for second corner
			var y1 = y0 - j1 + G3;
			var z1 = z0 - k1 + G3;

			var x2 = x0 - i2 + 2 * G3; // Offsets for third corner
			var y2 = y0 - j2 + 2 * G3;
			var z2 = z0 - k2 + 2 * G3;

			var x3 = x0 - 1 + 3 * G3; // Offsets for fourth corner
			var y3 = y0 - 1 + 3 * G3;
			var z3 = z0 - 1 + 3 * G3;

			// Work out the hashed gradient indices of the four simplex corners
			i &= 255;
			j &= 255;
			k &= 255;
			var gi0 = gradP[i + perm[j + perm[k]]];
			var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
			var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
			var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];

			// Calculate the contribution from the four corners
			var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
			if (t0 < 0) {
				n0 = 0;
			} else {
				t0 *= t0;
				n0 = t0 * t0 * gi0.dot3(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
			}
			var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
			if (t1 < 0) {
				n1 = 0;
			} else {
				t1 *= t1;
				n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
			}
			var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
			if (t2 < 0) {
				n2 = 0;
			} else {
				t2 *= t2;
				n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
			}
			var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
			if (t3 < 0) {
				n3 = 0;
			} else {
				t3 *= t3;
				n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
			}
			// Add contributions from each corner to get the final noise value.
			// The result is scaled to return values in the interval [-1,1].
			return 32 * (n0 + n1 + n2 + n3);

		};

		scene.clearColor = new BABYLON.Color4(0, 0, .2, .5);

		// This creates and positions a free camera (non-mesh)
		var camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 20, new BABYLON.Vector3(0, -10, 0), scene);
		camera.attachControl(canvas, true);

		var light = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(-.5, -1, .7), scene);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.intensity = 0.8;

		var light2 = new BABYLON.DirectionalLight("Dir0", new BABYLON.Vector3(.5, -1, -.7), scene);
		light2.diffuse = new BABYLON.Color3(1, 1, 1);
		light2.intensity = 0.8;

		var ground = BABYLON.Mesh.CreateGround('ground1', 10, 15, 15, scene, true);
		ground.material = new BABYLON.StandardMaterial("gmat", scene);
		ground.material.diffuseColor = new BABYLON.Color3(.25, .25, .5);
		ground.material.backFaceCulling = true;
		ground.renderingGroupId = 1;

		var vertexData = ground.getVerticesData(BABYLON.VertexBuffer.PositionKind);
		var indices = ground.getIndices();

		var time = 0;

		var face = 162;
		var arrayIndices = [];
		for (var i = 0; i < indices.length; i++) {
			if (indices[i] == indices[face * 3] || indices[i] == indices[face * 3 + 1] || indices[i] == indices[face * 3 + 2]) {
				arrayIndices = arrayIndices.concat(Math.floor(i / 3));
			}
		}

		var indiceTemp;

		var increment = 0;
		for (var h = 0; h < indices.length; h++) {

			if (arrayIndices[increment] == h) {
				indiceTemp = indices[h * 3];
				indices[h * 3] = indices[h * 3 + 2];
				indices[h * 3 + 2] = indiceTemp;
				increment++;
			}

			ground.setIndices(indices);
		}

		//var spriteManagerPicture = new BABYLON.SpriteManager("picManager","https://upload.wikimedia.org/wikipedia/commons/6/65/SonyCenter_360panorama.jpg", 1, 720, scene );
		//var picture = new BABYLON.Sprite("picture", spriteManagerPicture);
		//picture.size = 5;

		var pictureTexture = new BABYLON.Texture('https://upload.wikimedia.org/wikipedia/commons/6/65/SonyCenter_360panorama.jpg', scene);
		var pictureMaterial = new BABYLON.StandardMaterial('pictureMaterial', scene);
		pictureMaterial.diffuseTexture = pictureTexture;

		var picture = BABYLON.Mesh.CreatePlane('picture', 1, scene);
		picture.scaling = new BABYLON.Vector3(6, 3, 1);
		picture.material = pictureMaterial;

		picture.rotation.y = -Math.PI / 2;
		picture.rotation.x = Math.PI / 2;

		picture.position.x = -0.5;
		picture.position.y = -0.2;
		picture.position.z = 0.8;
		picture.renderingGroupId = 0;

		scene.onPointerDown = function (evt, pickResult) {

			if (pickResult.hit) {
				if (pickResult.getNormal().y < 0) {
					//This is a hole, the click is allowed

					var animationBox = new BABYLON.Animation("tutoAnimation", "fov", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
						BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

					var keys = [];
					keys.push({
						frame: 0,
						value: scene.activeCamera.fov
					});

					keys.push({
						frame: 100,
						value: 0.1
					});

					animationBox.setKeys(keys);
					scene.activeCamera.animations.push(animationBox);

					// aniamting arc rotate camera target
					var animationForCameraTarget = new BABYLON.Animation(
						"cameraTargetAnimation",
						"target",
						30,
						BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
						BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

					var keysCameraTarget = [];
					keysCameraTarget.push({
						frame: 0,
						value: scene.activeCamera.target
					});

					keysCameraTarget.push({
						frame: 100,
						value: pickResult.pickedPoint
					});

					animationForCameraTarget.setKeys(keysCameraTarget);
					scene.activeCamera.animations.push(animationForCameraTarget);

					scene.beginAnimation(scene.activeCamera, 0, 100, false);
				} else {
					console.log('no hole');
					//unauthorized click.
				}

			}
		};


		scene.registerBeforeRender(function () {
			console.log('test');

			var pickResult = scene.pick(scene.pointerX, scene.pointerY);
			if (pickResult.getNormal() && pickResult.getNormal().y < 0) {
				$('canvas').css('cursor', 'pointer');
			}

			time += engine.getDeltaTime();

			ground.updateMeshPositions(function (positions) {

				var offset;
				var frac = 0.13;
				for (var i = 0; i < positions.length; i += 3) {
					positions[i + 1] = 2 * simplex3(positions[i] * frac, time * .0001, positions[i + 2] * frac);
				}

			}, false);

			// recompute the vertices normals based on the faces orientation
			ground.convertToFlatShadedMesh();

		});

		engine.runRenderLoop(function () {
			scene.render();
		});


		return scene;
	}

});