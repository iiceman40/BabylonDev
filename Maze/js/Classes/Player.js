var Player = function (mazeMesh, position, game, scene) {
	var enemies = game.enemies;
	var sounds = game.sounds;
	var player = new BABYLON.FreeCamera("playerFreeCamera", new BABYLON.Vector3(0, 0, 0), scene);
	player.attachControl(canvas, true);

	var gizmo = BABYLON.Mesh.CreateBox('gizmo', 0.01, scene);
	gizmo.parent = player;
	gizmo.isVisible = false;
	gizmo.position.z = 1;

	player.ellipsoid = new BABYLON.Vector3(1, 1, 1);
	player.checkCollisions = true;
	player.speed = 0.4;
	player.layerMask = 2; // 010 in binary
	player.angularSensibility = 2000;

	scene.activeCameras.push(player);
	scene.cameraToUseForPointers = player;

	// the camera acts as the player
	player.keysUp.push(87);
	player.keysDown.push(83);
	player.keysLeft.push(65);
	player.keysRight.push(68);
	player.position = position;

	// fix for missing camera ellipsoid offset
	var cameraOffsetY = 0.6;
	player._collideWithWorld = function (velocity) {
		var globalPosition;
		if (this.parent) {
			globalPosition = BABYLON.Vector3.TransformCoordinates(this.position, this.parent.getWorldMatrix());
		}
		else {
			globalPosition = this.position;
		}
		globalPosition.subtractFromFloatsToRef(0, this.ellipsoid.y - cameraOffsetY, 0, this._oldPosition);
		this._collider.radius = this.ellipsoid;
		//no need for clone, as long as gravity is not on.
		var actualVelocity = velocity;
		//add gravity to the velocity to prevent the dual-collision checking
		if (this.applyGravity) {
			//this prevents mending with cameraDirection, a global variable of the free camera class.
			actualVelocity = velocity.add(this.getScene().gravity);
		}
		this.getScene().collisionCoordinator.getNewPosition(this._oldPosition, actualVelocity, this._collider, 3, null, this._onCollisionPositionChange, this.uniqueId);
	};

	BABYLON.TargetCamera.prototype._checkInputs = function () {
		var needToMove = this._decideIfNeedsToMove();
		var needToRotate = Math.abs(this.cameraRotation.x) > 0 || Math.abs(this.cameraRotation.y) > 0;
		// Move
		if (needToMove) {
			this._updatePosition();
		}
		// Rotate
		if (needToRotate) {
			this.rotation.x += this.cameraRotation.x;
			this.rotation.y += this.cameraRotation.y;
			if (!this.noRotationConstraint) {
				var limit = (Math.PI / 2 * 0.99);
				if (this.rotation.x > limit)
					this.rotation.x = limit;
				if (this.rotation.x < -limit)
					this.rotation.x = -limit;
			}
		}
		// Inertia
		if (needToMove) {
			if (Math.abs(this.cameraDirection.x) < BABYLON.Engine.Epsilon) {
				this.cameraDirection.x = 0;
			}
			if (Math.abs(this.cameraDirection.y) < BABYLON.Engine.Epsilon) {
				this.cameraDirection.y = 0;
			}
			if (Math.abs(this.cameraDirection.z) < BABYLON.Engine.Epsilon) {
				this.cameraDirection.z = 0;
			}
			this.cameraDirection.scaleInPlace(this.inertia);
		}
		if (needToRotate) {
			if (Math.abs(this.cameraRotation.x) < BABYLON.Engine.Epsilon) {
				this.cameraRotation.x = 0;
			}
			if (Math.abs(this.cameraRotation.y) < BABYLON.Engine.Epsilon) {
				this.cameraRotation.y = 0;
			}
			this.cameraRotation.scaleInPlace(this.inertia);
		}
		BABYLON.Camera.prototype._checkInputs.call(this);
	};

	player.flashlight = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0), 1.8, 2, scene);
	player.flashlight.intensity = 0.5;
	player.flashlight.range = 35;

	// COCKPIT HUD
	player.energyLevel = 100;
	player.health = 100;

	player.energyBar = BABYLON.MeshBuilder.CreateBox('energyBar', {size: 0.02, width: 0.45}, scene);
	player.energyBar.parent = player;
	player.energyBar.position = new BABYLON.Vector3(0, -0.37, 1);
	player.energyBar.renderingGroupId = 2;
	player.energyBar.material = new EnergyBarMaterial(scene);

	player.healthBar = BABYLON.MeshBuilder.CreateBox('energyBar', {size: 0.02, width: 0.45}, scene);
	player.healthBar.parent = player;
	player.healthBar.position = new BABYLON.Vector3(0, -0.4, 1);
	player.healthBar.renderingGroupId = 2;
	player.healthBar.material = new HealthBarMaterial(scene);

	setInterval(function(){
		// recharge bars
		player.energyLevel += 1;
		if (player.energyLevel > 100) {
			player.energyLevel = 100;
		}
		updateBar(player.energyBar, player.energyLevel);
	}, 100);

	player.hit = function(damage){
		// TODO add shake effect and window tinting on the sides

		player.health -= damage;
		updateBar(player.healthBar, player.health); // TODO use class function

		//////////////////////////////////
		// Player destroyed!
		//////////////////////////////////
		if (player.health <= 0) {
			engine.stopRenderLoop();
			setTimeout(function() {
				scene.dispose();
				var modal = new Modal(game);
				document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
				document.exitPointerLock();
				speakPart([$('.modal-body .destroyed-message').text()], 0, null);
			});
		}

	};


	var statusBarsLight = new BABYLON.PointLight("energyBarLight", new BABYLON.Vector3(1, 10, 1), scene);
	statusBarsLight.diffuse = new BABYLON.Color3(1, 1, 1);
	statusBarsLight.specular = new BABYLON.Color3(1, 1, 1);
	statusBarsLight.parent = player;
	statusBarsLight.includedOnlyMeshes = [player.energyBar, player.healthBar];

	// SHOOTING
	player.bullets = [];
	var bulletMaterial = new PlayerBulletMaterial(scene);
	var bulletMaterialOutside = new PlayerBulletMaterialOutside(scene);
	var currentCannon = 1;

	// init cannons
	var cannonMaterial = new CannonMaterial(scene);
	var cannonLeft = new Cannon(new BABYLON.Vector3(-0.3, -0.3, 0), player, cannonMaterial, scene);
	var cannonRight = new Cannon(new BABYLON.Vector3(0.3, -0.3, 0), player, cannonMaterial, scene);

	// shooting light effect
	var cannonLight = new BABYLON.PointLight("cannonLight", new BABYLON.Vector3(1, 10, 1), scene);
	cannonLight.diffuse = bulletMaterialOutside.emissiveColor;
	cannonLight.specular = bulletMaterialOutside.emissiveColor;
	cannonLight.position = player.position.clone();
	cannonLight.includedOnlyMeshes = [cannonLeft, cannonRight];
	cannonLight.intensity = 1.5;
	cannonLight.setEnabled(false);

	// mouse events for shooting
	player.keepShooting = false;
	player.cannonReady = true;
	window.addEventListener("mousedown", function (evt) {
		// left click to start fire
		if (evt.button === 0 && !player.miniMap.isVisible) {
			player.keepShooting = true;
		}
	});
	window.addEventListener("mouseup", function (evt) {
		player.keepShooting = false;
	});

	// terminal interaction event listener
	window.addEventListener("mouseup", function (evt) {
		// right click to interact with terminal
		if (evt.button === 2) {
			var ray = new BABYLON.Ray(player.position, player.getTarget().subtract(player.position), 5);
			var pickingInfo = scene.pickWithRay(ray, function(mesh){
				return mesh.name == 'terminalScreen';
			});
			if(pickingInfo.hit && !player.miniMap.isVisible) {
				var terminal = pickingInfo.pickedMesh.terminal;
				terminal.activateTerminal();
				terminal.isActive = true;
			} else if(player.miniMap.isVisible){
				player.miniMap.hideMiniMap();
			}
		}
		return false;
	});

	// REGISTER BEFORE RENDER FOR SHOOTING
	scene.registerBeforeRender(function () {

		// sync flashlight
		player.flashlight.position = player.position.clone();
		player.flashlight.position.y += 1;
		player.flashlight.direction = player.getTarget().subtract(player.position);
		player.flashlight.direction.y -= 0.2;

		// update bullets
		for (var i = player.bullets.length - 1; i >= 0; i--) {
			player.bullets[i].updatePosition(i, mazeMesh, enemies, null);
		}

		// shooting
		if (player.keepShooting && player.cannonReady && player.energyLevel >= 10) {
			player.cannonReady = false;
			player.energyLevel -= 7;
			if (player.energyLevel <= 0) {
				player.energyLevel = 1;
			}
			// fire laser bullet from player in the direction the player is currently looking
			var newBullet = new Bullet(bulletMaterial, bulletMaterialOutside, player, gizmo.absolutePosition, scene);
			cannonLight.setEnabled(true);
			if (currentCannon == 1) {
				newBullet.mainMesh.position = cannonLeft.outputEnd.absolutePosition;
				currentCannon = 2;
				cannonLight.position = cannonLeft.outputEnd.absolutePosition;
			} else {
				newBullet.mainMesh.position = cannonRight.outputEnd.absolutePosition;
				currentCannon = 1;
				cannonLight.position = cannonRight.outputEnd.absolutePosition;
			}
			player.bullets.push(newBullet);
			sounds.laser.play();

			setTimeout(function () {
				player.cannonReady = true;
				cannonLight.setEnabled(false);
			}, 200);
		}

	});

	return player;
};