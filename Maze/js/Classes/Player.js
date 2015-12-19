var Player = function (mazeMesh, position, game, scene) {
	var enemies = game.enemies;
	var sounds = game.sounds;
	var player = new BABYLON.FreeCamera("playerFreeCamera", new BABYLON.Vector3(0, 0, 0), scene);
	player.inertiaRotation = 0.5;
	player.angularSensibility = 750;

	player.impactDecals = [];

	player.attachControl(canvas, true);

	player.ellipsoid = new BABYLON.Vector3(1, 1, 1);
	player.checkCollisions = true;
	player.speed = 0.5;
	player.layerMask = 2; // 010 in binary

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
			this.cameraRotation.scaleInPlace(this.inertiaRotation);
		}
		BABYLON.Camera.prototype._checkInputs.call(this);
	};

	player.flashlight = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0), 1.3, 2, scene);
	player.flashlight.intensity = 0.5;
	player.flashlight.range = 50;

	// COCKPIT HUD
	player.energyLevel = 100;
	player.health = 100;

	player.energyBar = BABYLON.MeshBuilder.CreateBox('energyBar', {size: 0.02, width: 0.45}, scene);
	player.energyBar.parent = player;
	player.energyBar.position = new BABYLON.Vector3(0, -0.37, 1);
	player.energyBar.renderingGroupId = 2;
	player.energyBar.layerMask = 2;
	player.energyBar.material = new EnergyBarMaterial(scene);

	player.healthBar = BABYLON.MeshBuilder.CreateBox('energyBar', {size: 0.02, width: 0.45}, scene);
	player.healthBar.parent = player;
	player.healthBar.position = new BABYLON.Vector3(0, -0.4, 1);
	player.healthBar.renderingGroupId = 2;
	player.healthBar.layerMask = 2;
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
		$('.hud').addClass('hit');
		setTimeout(function(){
			$('.hud').removeClass('hit');
		}, 300);

		player.health -= damage;
		updateBar(player.healthBar, player.health); // TODO use class function

		//////////////////////////////////
		// Player destroyed!
		//////////////////////////////////
		if (player.health <= 0) {
			scene.activeCamera.detachControl(canvas);
			engine.stopRenderLoop();
			setTimeout(function() {
				scene.dispose();
				var menuScope = getScope('MenuCtrl');
				menuScope.playerDied(game.level);
				// release mouse pointer
				document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
				document.exitPointerLock();
			});
		}

	};


	var statusBarsLight = new BABYLON.PointLight("energyBarLight", new BABYLON.Vector3(1, 10, 1), scene);
	statusBarsLight.diffuse = new BABYLON.Color3(1, 1, 1);
	statusBarsLight.specular = new BABYLON.Color3(1, 1, 1);
	statusBarsLight.parent = player;
	statusBarsLight.includedOnlyMeshes = [player.energyBar, player.healthBar];

	// SHOOTING
	player.projectiles = [];
	var currentCannon = 1;

	// init cannons
	var cannonMaterial = new CannonMaterial(scene);
	var cannonLeft = new Cannon(new BABYLON.Vector3(-0.3, -0.3, 0), player, cannonMaterial, scene);
	var cannonRight = new Cannon(new BABYLON.Vector3(0.3, -0.3, 0), player, cannonMaterial, scene);
	var rocketLauncher = new Cannon(new BABYLON.Vector3(0, -0.4, -0.5), player, cannonMaterial, scene);

	// shooting light effect
	var cannonLight = new BABYLON.PointLight("cannonLight", new BABYLON.Vector3(1, 10, 1), scene);
	cannonLight.diffuse = game.materials.brightBlue.emissiveColor;
	cannonLight.specular = game.materials.brightBlue.emissiveColor;
	cannonLight.position = player.position.clone();
	cannonLight.includedOnlyMeshes = [cannonLeft, cannonRight];
	cannonLight.intensity = 1.5;
	cannonLight.setEnabled(false);

	// mouse events for shooting
	player.keepShooting = false;
	player.cannonReady = true;
	player.rocktLauncherReady = true;
	canvas.addEventListener("mousedown", function (evt) {
		// left click to start fire
		if (evt.button === 0 && !player.miniMap.isVisible) {
			player.keepShooting = true;
		}
		// left click to start fire
		if (evt.button === 2 && !player.miniMap.isVisible) {
			// shoot rocket
			if(player.rocktLauncherReady) {
				game.rocketStatusDiv.removeClass('ready');
				player.rocktLauncherReady = false;

				// pick rocket impact position
				var ray = new BABYLON.Ray(player.position, player.getTarget().subtract(player.position));
				var pickInfo = scene.pickWithRay(ray, function(mesh){
					return mesh == mazeMesh;
				});

				if(pickInfo.hit){
					//var impactPoint = BABYLON.MeshBuilder.CreateBox('impact', {size: 0.5}, scene);
					//impactPoint.position = pickInfo.pickedPoint;

					var newRocket = new Projectile(player, pickInfo, rocketLauncher.outputEnd.absolutePosition, Projectile.PROJECTILETYPE_ROCKET, 'gray', game, scene);

					player.projectiles.push(newRocket);
					sounds.rocket.play();
					setTimeout(function () {
						game.rocketStatusDiv.addClass('ready');
						player.rocktLauncherReady = true;
					}, 1000);
				}

			}
		}
	});
	canvas.addEventListener("mouseup", function (evt) {
		if (evt.button === 0) {
			player.keepShooting = false;
		}
	});

	// terminal interaction event listener
	window.addEventListener("keydown", function (event) {
		event = event || window.event;
		// right click to interact with terminal
		if (event.keyCode === 32) {
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

	scene.beforeCameraRender = function(){
		// sync flashlight
		player.flashlight.position = player.position.clone();
		player.flashlight.direction = player.getTarget().subtract(player.position);
	};

	// REGISTER BEFORE RENDER FOR SHOOTING
	scene.registerBeforeRender(function () {

		for (var i = player.projectiles.length - 1; i >= 0; i--) {
			player.projectiles[i].updatePosition(i, mazeMesh, enemies, null);
		}

		// shooting laser
		if (player.keepShooting && player.cannonReady && player.energyLevel >= 10) {
			player.cannonReady = false;
			player.energyLevel -= 7;
			if (player.energyLevel <= 0) {
				player.energyLevel = 1;
			}
			// fire laser bullet from player in the direction the player is currently looking
			var newBullet;

			// pick laser impact position // TODO move out of registerBeforeRender ?
			var ray = new BABYLON.Ray(player.position, player.getTarget().subtract(player.position));
			var pickInfo = scene.pickWithRay(ray, function(mesh){
				return mesh == mazeMesh;
			});

			if(pickInfo.hit) {
				cannonLight.setEnabled(true);
				if (currentCannon == 1) {
					newBullet = new Projectile(player, pickInfo, cannonLeft.outputEnd.absolutePosition, Projectile.PROJECTILETYPE_BULLET, 'blue', game, scene);
					currentCannon = 2;
					cannonLight.position = cannonLeft.outputEnd.absolutePosition;
				} else {
					newBullet = new Projectile(player, pickInfo, cannonRight.outputEnd.absolutePosition, Projectile.PROJECTILETYPE_BULLET, 'blue', game, scene);
					currentCannon = 1;
					cannonLight.position = cannonRight.outputEnd.absolutePosition;
				}
				player.projectiles.push(newBullet);
				sounds.laser.play();

				setTimeout(function () {
					player.cannonReady = true;
					cannonLight.setEnabled(false);
				}, 200);
			}
		}

	});

	return player;
};