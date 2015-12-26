var Player = function (mazeMesh, position, game, scene) {
	this.self = this;
	this.scene = scene;

	// CAMERA
	this.camera = new BABYLON.FreeCamera("playerFreeCamera", new BABYLON.Vector3(0, 0, 0), scene);
	this.camera.inertiaRotation = 0.5;
	this.camera.angularSensibility = 750;
	this.camera.ellipsoid = new BABYLON.Vector3(1, 1, 1);
	this.camera.checkCollisions = true;
	this.camera.speed = 0.5;
	this.camera.layerMask = 2; // 010 in binary
	this.camera.position = position;
	// the camera acts as the this.camera
	this.camera.keysUp.push(87);
	this.camera.keysDown.push(83);
	this.camera.keysLeft.push(65);
	this.camera.keysRight.push(68);
	// attach controls and set as active camera
	this.camera.attachControl(canvas, true);
	this.scene.activeCameras.push(this.camera);
	this.scene.cameraToUseForPointers = this.camera;

	// GENERAL
	this.mazeMesh = mazeMesh;
	this.game = game;
	this.position = this.camera.position;

	// FLASHLIGHT
	this.flashlight = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0), 1.3, 2, scene);
	this.flashlight.intensity = 0.5;
	this.flashlight.range = 50;

	// COCKPIT HUD
	this.energyLevel = 100;
	this.health = 100;

	this.energyBar = BABYLON.MeshBuilder.CreateBox('energyBar', {size: 0.02, width: 0.45}, scene);
	this.energyBar.parent = this.camera;
	this.energyBar.position = new BABYLON.Vector3(0, -0.37, 1);
	this.energyBar.renderingGroupId = 2;
	this.energyBar.layerMask = 2;
	this.energyBar.material = new EnergyBarMaterial(scene);

	this.healthBar = BABYLON.MeshBuilder.CreateBox('energyBar', {size: 0.02, width: 0.45}, scene);
	this.healthBar.parent = this.camera;
	this.healthBar.position = new BABYLON.Vector3(0, -0.4, 1);
	this.healthBar.renderingGroupId = 2;
	this.healthBar.layerMask = 2;
	this.healthBar.material = new HealthBarMaterial(scene);

	this.statusBarsLight = new BABYLON.PointLight("energyBarLight", new BABYLON.Vector3(1, 10, 1), scene);
	this.statusBarsLight.diffuse = new BABYLON.Color3(1, 1, 1);
	this.statusBarsLight.specular = new BABYLON.Color3(1, 1, 1);
	this.statusBarsLight.parent = this.camera;
	this.statusBarsLight.includedOnlyMeshes = [this.camera.energyBar, this.camera.healthBar];

	// SHOOTING
	this.projectiles = [];
	this.impactDecals = [];
	this.currentCannon = 1;

	// init cannons
	this.cannonMaterial = new CannonMaterial(scene);
	this.cannonLeft = new Cannon(new BABYLON.Vector3(-0.3, -0.3, 0), this.camera, this.cannonMaterial, scene);
	this.cannonRight = new Cannon(new BABYLON.Vector3(0.3, -0.3, 0), this.camera, this.cannonMaterial, scene);
	this.rocketLauncher = new Cannon(new BABYLON.Vector3(0, -0.4, -0.5), this.camera, this.cannonMaterial, scene);

	// shooting light effect
	this.cannonLight = new BABYLON.PointLight("cannonLight", new BABYLON.Vector3(1, 10, 1), scene);
	this.cannonLight.diffuse = game.materials.brightBlue.emissiveColor;
	this.cannonLight.specular = game.materials.brightBlue.emissiveColor;
	this.cannonLight.position = this.camera.position.clone();
	this.cannonLight.includedOnlyMeshes = [this.cannonLeft, this.cannonRight];
	this.cannonLight.intensity = 1.5;
	this.cannonLight.setEnabled(false);

	// mouse events for shooting
	this.keepShooting = false;
	this.cannonReady = true;
	this.rocktLauncherReady = true;

	return this;
};

/**
 *
 */
Player.prototype.initStatusBarUpdateInterval = function () {
	var self = this;
	// recharge bars
	this.statusBarUpdateInterval = setInterval(function () {
		self.energyLevel += 1;
		if (self.energyLevel > 100) {
			self.energyLevel = 100;
		}
		self.updateBar(self.energyBar, self.energyLevel);
	}, 100);
};

/**
 *
 */
Player.prototype.useTerminal = function () {
	var ray = new BABYLON.Ray(this.camera.position, this.camera.getTarget().subtract(this.camera.position), 5);
	var pickingInfo = this.scene.pickWithRay(ray, function (mesh) {
		return mesh.name == 'terminalScreen';
	});
	if (pickingInfo.hit && !this.miniMap.isVisible) {
		var terminal = pickingInfo.pickedMesh.terminal;
		terminal.activateTerminal();
		terminal.isActive = true;
	} else if (this.miniMap.isVisible) {
		this.miniMap.hideMiniMap();
	}
};

/**
 *
 */
Player.prototype.shootRocket = function () {
	var self = this;

	// shoot rocket
	if (this.rocktLauncherReady) {
		this.rocktLauncherReady = false;
		this.game.rocketStatusDiv.removeClass('ready');

		// pick rocket impact position
		var ray = new BABYLON.Ray(this.position, this.camera.getTarget().subtract(this.position));
		var pickInfo = this.scene.pickWithRay(ray, function (mesh) {
			return mesh == self.mazeMesh;
		});

		if (pickInfo.hit) {
			//this.impactPoint = BABYLON.MeshBuilder.CreateBox('impact', {size: 0.5}, scene);
			//impactPoint.position = pickInfo.pickedPoint;

			var newRocket = new Projectile(this, pickInfo, this.rocketLauncher.outputEnd.absolutePosition, Projectile.PROJECTILETYPE_ROCKET, 'gray', this.game, this.scene);

			this.projectiles.push(newRocket);
			this.game.sounds.rocket.play();

			setTimeout(function () {
				self.game.rocketStatusDiv.addClass('ready');
				self.rocktLauncherReady = true;
			}, 1000);

		}

	}
};

/**
 *
 */
Player.prototype.syncFlashlight = function () {
	this.flashlight.position = this.position.clone();
	this.flashlight.direction = this.camera.getTarget().subtract(this.position);
};

/**
 *
 * @param damage
 */
Player.prototype.hit = function (damage) {
	var self = this;
	// shake effect and window tinting on the sides
	$('.hud').addClass('hit');
	setTimeout(function () {
		$('.hud').removeClass('hit');
	}, 300);
	// update health bar
	this.health -= damage;
	this.updateBar(this.healthBar, this.health);
	///////////////////////
	// Player destroyed! //
	///////////////////////
	if (this.camera.health <= 0) {
		this.scene.activeCamera.detachControl(canvas);
		engine.stopRenderLoop();
		setTimeout(function () {
			self.scene.dispose();
			self.menuScope = getScope('MenuCtrl');
			self.menuScope.playerDied(self.game.level);
			// release mouse pointer
			document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
			document.exitPointerLock();
		});
	}

};

/**
 *
 * @param bar
 * @param value
 */
Player.prototype.updateBar = function (bar, value) {
	bar.scaling.x = value / 100;
};

/**
 *
 * @param canvas
 */
Player.prototype.initPointerLock = function (canvas) {
	var self = this;

	// On click event, request pointer lock
	canvas.addEventListener("click", function (evt) {
		canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
		if (canvas.requestPointerLock) {
			canvas.requestPointerLock();
		}
	}, false);

	// Event listener when the pointerlock is updated (or removed by pressing ESC for example).
	this.pointerlockchange = function (event) {
		this.controlEnabled = (
		document.mozPointerLockElement === canvas
		|| document.webkitPointerLockElement === canvas
		|| document.msPointerLockElement === canvas
		|| document.pointerLockElement === canvas);
		// If the user is already locked
		if (!this.controlEnabled) {
			self.camera.detachControl(canvas);
		} else {
			self.camera.attachControl(canvas);
		}
	};

	// Attach events to the document
	document.addEventListener("pointerlockchange", this.pointerlockchange, false);
	document.addEventListener("mspointerlockchange", this.pointerlockchange, false);
	document.addEventListener("mozpointerlockchange", this.pointerlockchange, false);
	document.addEventListener("webkitpointerlockchange", this.pointerlockchange, false);
};

/**
 *
 */
Player.prototype.shooting = function () {
	var self = this;

	for (var i = this.projectiles.length - 1; i >= 0; i--) {
		self.projectiles[i].updatePosition(i, this.mazeMesh, this.game.enemies, null);
	}

	// shooting laser
	if (this.keepShooting && this.cannonReady && this.energyLevel >= 10) {
		this.cannonReady = false;
		this.energyLevel -= 7;

		if (this.energyLevel <= 0) {
			this.energyLevel = 1;
		}

		// fire laser bullet from this.camera in the direction the this.camera is currently looking
		var newBullet;
		var bulletStartPosition;

		// pick laser impact position
		var ray = new BABYLON.Ray(this.position, this.camera.getTarget().subtract(this.position));
		var pickInfo = this.scene.pickWithRay(ray, function (mesh) {
			return mesh == self.mazeMesh;
		});

		if (pickInfo.hit) {
			this.cannonLight.setEnabled(true);

			if (this.currentCannon == 1) {
				bulletStartPosition = this.cannonLeft.outputEnd.absolutePosition;
				newBullet = new Projectile(this, pickInfo, bulletStartPosition, Projectile.PROJECTILETYPE_BULLET, 'blue', this.game, this.scene);
				this.currentCannon = 2;
				this.cannonLight.position = bulletStartPosition;
			} else {
				bulletStartPosition = this.cannonRight.outputEnd.absolutePosition;
				newBullet = new Projectile(this, pickInfo, bulletStartPosition, Projectile.PROJECTILETYPE_BULLET, 'blue', this.game, this.scene);
				this.currentCannon = 1;
				this.cannonLight.position = bulletStartPosition;
			}
			self.projectiles.push(newBullet);
			self.game.sounds.laser.play();

			setTimeout(function () {
				self.cannonReady = true;
				self.cannonLight.setEnabled(false);
			}, 200);
		}
	}

};