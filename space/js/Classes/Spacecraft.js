var Spacecraft = function(scene){
	var self = this;

	self.spacecraftAvatar = null;

	BABYLON.SceneLoader.ImportMesh("space_frig", "assets/", "space_frigate.babylon", scene, function (newMeshes, particleSystems) {
		self.spacecraftAvatar = newMeshes[0];

		self.spacecraftAvatar.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
		self.spacecraftAvatar.material.specularColor = new BABYLON.Color3(1, 1, 1);

		self.spacecraftAvatar.receiveShadows = true;

		self.spacecraftAvatar.checkCollisions = true;
		self.spacecraftAvatar.ellipsoid = new BABYLON.Vector3(1, 1, 1);
		self.spacecraftAvatar.ellipsoidOffset = new BABYLON.Vector3(0, 5, 0);

		self.spacecraftAvatar.material.bumpTexture = new BABYLON.Texture('assets/space_frigate_6_normalmap.png', scene);
		self.spacecraftAvatar.material.specularTexture = new BABYLON.Texture('assets/space_frigate_6_specular.png', scene);
		self.spacecraftAvatar.material.emissiveTexture = new BABYLON.Texture('assets/space_frigate_6_illumination.png', scene);

		createSpacecraftEngine(self.spacecraftAvatar, scene);
		createSpacecraftLaserEmitter(self.spacecraftAvatar, scene);

		scene.activeCamera.target = self.spacecraftAvatar;
	});


	/**
	 * @param pointToRotateTo
	 * @returns {boolean}
	 */
	self.facePoint = function(pointToRotateTo) {
		var rotatingObject = self.spacecraftAvatar;

		// a directional vector from one object to the other one
		var direction = pointToRotateTo.subtract(rotatingObject.position);
		var distanceToTargetPoint = direction.length();

		if(distanceToTargetPoint > 0.5) {
			// TODO calculate angels only based on the values for a certain axis?

			var axisVectorY = new BABYLON.Vector3(0, 0, 1);
			var directionAxisForY = 'x';
			var deltaY = calculateRotationDeltaForAxis(rotatingObject, 'y', axisVectorY, direction, directionAxisForY);

			var axisVectorZ = new BABYLON.Vector3(0, 1, 0);
			var directionAxisForZ = 'z';
			var deltaZ = calculateRotationDeltaForAxis(rotatingObject, 'z', axisVectorZ, direction, directionAxisForZ);

			var turnAroundYAxisDone = applyRotationForAxis(rotatingObject, 'y', deltaY);
			//var turnAroundZAxisDone = applyRotationForAxis(rotatingObject, 'z', deltaZ);
			var turnAroundZAxisDone = true;

			return !!(turnAroundYAxisDone && turnAroundZAxisDone);

		}
	};

	self.targetPoint = function(pointToRotateTo){
		var rotatingObject = self.spacecraftAvatar;

		// a directional vector from one object to the other one
		var direction = pointToRotateTo.subtract(rotatingObject.position);
		var distanceToTargetPoint = direction.length();

		if(distanceToTargetPoint > 0.5) {
			var newRotation = self.calculateNewRotation(pointToRotateTo);

			deltaX = rotatingObject.rotation.x - newRotation.x;
			deltaY = rotatingObject.rotation.y - newRotation.y;
			deltaZ = rotatingObject.rotation.z - newRotation.z;

			var turnAroundXAxisDone = applyRotationForAxis(rotatingObject, 'x', deltaX);
			var turnAroundYAxisDone = applyRotationForAxis(rotatingObject, 'y', deltaY);
			var turnAroundZAxisDone = applyRotationForAxis(rotatingObject, 'z', deltaZ);

			return !!(turnAroundYAxisDone && turnAroundZAxisDone && turnAroundXAxisDone);
		}
		return false;
	};

	/**
	 * @param pointToRotateTo
	 */
	this.calculateNewRotation = function(pointToRotateTo) {
		var rotatingObject = self.spacecraftAvatar;

		var axis1 = (rotatingObject.position).subtract(pointToRotateTo);
		var axis3 = BABYLON.Vector3.Cross(axis1, new BABYLON.Vector3(0, 1, 0));
		var axis2 = BABYLON.Vector3.Cross(axis1, axis3);

		return BABYLON.Vector3.RotationFromAxis(axis1, axis2, axis3);
	};

	/**
	 * @param target
	 * @returns {boolean}
	 */
	self.faceTarget = function(target){
		return self.facePoint(target.position);
	};

	/**
	 * @param rotatingObject
	 * @param axis
	 * @param axisVector
	 * @param direction
	 * @param directionAxis
	 * @returns {number}
	 */
	function calculateRotationDeltaForAxis(rotatingObject, axis, axisVector, direction, directionAxis){
		var axisVectorNormalized = axisVector.normalize();
		var directionVectorNormalized = direction.normalize();

		// calculate the angel for the new direction
		var angle = Math.acos(BABYLON.Vector3.Dot(axisVectorNormalized, directionVectorNormalized));

		if (directionAxis == 'x') {
			// decide it the angle has to be positive or negative
			if (direction[directionAxis] < 0) angle *= -1;
			// compensate initial rotation of imported spaceship mesh
			angle += Math.PI / 2;
		} else {
			angle -= Math.PI / 2;
		}

		// calculate both angles in degrees
		var playerRotationOnAxis = rotatingObject.rotation[axis];
		// calculate and return the delta
		return playerRotationOnAxis - angle;
	}

	/**
	 * @param rotatingObject
	 * @param axis
	 * @param delta
	 * @returns {boolean}
	 */
	function applyRotationForAxis(rotatingObject, axis, delta){
		var pi = Math.PI;

		// check what direction to turn to take the shortest turn
		if (delta > pi) {
			delta -= pi*2;
		} else if (delta < -pi) {
			delta += pi*2;
		}

		var absDelta = Math.abs(delta);
		// rotate if the difference between the object angle and the target angle is no more than 1 degrees
		if (absDelta > pi/180) {

			var rotationSpeed = Math.max(0.2, Math.min(absDelta*absDelta, 1));

			if (delta > 0) {
				rotatingObject.rotation[axis] -= rotationSpeed * 0.1;
				if (rotatingObject.rotation[axis] < -pi) {
					rotatingObject.rotation[axis] = pi;
				}
			}
			if (delta < 0) {
				rotatingObject.rotation[axis] += rotationSpeed * 0.1;
				if (rotatingObject.rotation[axis] > pi) {
					rotatingObject.rotation[axis] = -pi;
				}
			}

			// turn not done yet
			return false;

		} else {

			// turn done
			return true;

		}
	}

	/**
	 * @param pointToMoveTo
	 * @param scene
	 */
	self.moveForward = function(pointToMoveTo, scene) {
		var objectToMove = self.spacecraftAvatar;
		var distanceToTargetPoint = pointToMoveTo.subtract(objectToMove.position).length();

		if(distanceToTargetPoint > 0.5) {
			var angle = objectToMove.rotation.y;

			// compensate initial rotation of imported spaceship mesh
			angle -= Math.PI/2;

			// convert rotation to vector
			var x = Math.sin(angle);
			var z = Math.cos(angle);
			var moveVector = new BABYLON.Vector3(x, 0, z);

			var speed = Math.min(0.4, Math.sqrt(distanceToTargetPoint / 500));

			moveVector = moveVector.normalize();
			moveVector = moveVector.scale(speed);
			objectToMove.moveWithCollisions(moveVector);

			// show target position
			if(targetIndicatorLine) {
				targetIndicatorLine.dispose();
			}
			var currentPosition = objectToMove.position.clone();
			var targetPosition = pointToMoveTo.clone();
			targetIndicatorLine = BABYLON.Mesh.CreateLines('targetIndicator', [
				currentPosition,
				targetPosition
			], scene);
			targetIndicatorLine.color = targetIndicatorColor;
		} else {
			self.clearTargetIndicator();
			pointToMoveTo = null;
		}

	};

	self.clearTargetIndicator = function(){
		if(targetIndicatorLine) {
			targetIndicatorLine.dispose();
			targetIndicatorLine = null;
		}
		if(targetIndicator) {
			targetIndicator.dispose();
			targetIndicator = null;
		}
	};

	/**
	 * @param target
	 * @param scene
	 */
	self.shootLaser = function(target, scene){
		var spacecraft = self.spacecraftAvatar;
		var laserMaterial = new BABYLON.StandardMaterial('laserMaterial', scene);
		laserMaterial.emissiveColor = new BABYLON.Color3(1, 0.7, 0.7);
		laserMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
		laserMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		laserMaterial.alpha = 1;

		var outerLaserMaterial = new BABYLON.StandardMaterial('laserMaterial', scene);
		outerLaserMaterial.emissiveColor = new BABYLON.Color3(1, 0.4, 0.4);
		outerLaserMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
		outerLaserMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		outerLaserMaterial.alpha = 0.67;

		var laser = BABYLON.Mesh.CreateBox('laser', 1, scene);
		laser.material = laserMaterial;

		var outerLaser = BABYLON.Mesh.CreateBox('laser', 1, scene, false, BABYLON.Mesh.BACKSIDE);
		outerLaser.material = outerLaserMaterial;

		var laserEmitterPosition = spacecraft.position;
		if(spacecraft.laserEmitter){
			laserEmitterPosition = spacecraft.laserEmitter.getAbsolutePosition();
		}

		var axis1 = laserEmitterPosition.subtract(target.position);
		var axis2 = BABYLON.Vector3.Cross(axis1, new BABYLON.Vector3(0, 1, 0));
		var axis3 = BABYLON.Vector3.Cross(axis1, axis2);

		laser.rotation = BABYLON.Vector3.RotationFromAxis(axis1, axis2, axis3);
		laser.scaling.x = axis1.length();
		laser.scaling.y = laser.scaling.z = 0.04;
		laser.position = target.position.add(laserEmitterPosition).scale(0.48);

		outerLaser.position = laser.position;
		outerLaser.rotation = laser.rotation;
		outerLaser.scaling = laser.scaling.clone();
		outerLaser.scaling.y = outerLaser.scaling.z = 0.07;


		// Create a particle system for emitting the laser
		var particleSystemEmit = new BABYLON.ParticleSystem("particles", 1000, scene);
		//Texture of each particle
		particleSystemEmit.particleTexture = new BABYLON.Texture("textures/star.png", scene);
		// Where the particles come from
		particleSystemEmit.emitter = laserEmitterPosition; // the starting object, the emitter
		particleSystemEmit.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
		particleSystemEmit.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...
		// Colors of all particles
		particleSystemEmit.color1 = new BABYLON.Color4(1, 0.5, 0.5, 1.0);
		particleSystemEmit.color2 = new BABYLON.Color4(1, 0, 0, 1.0);
		particleSystemEmit.colorDead = new BABYLON.Color4(0, 0, 0, 0.0);
		// Size of each particle (random between...
		particleSystemEmit.minSize = 0.1;
		particleSystemEmit.maxSize = 0.3;
		// Life time of each particle (random between...
		particleSystemEmit.minLifeTime = 0.3;
		particleSystemEmit.maxLifeTime = 0.4;
		// Emission rate
		particleSystemEmit.emitRate = 100;
		// manually emit
		//particleSystem.manualEmitCount = 3000;
		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		particleSystemEmit.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
		// Direction of each particle after it has been emitted
		var baseEmitDirection = target.position.subtract(spacecraft.position).normalize().scale(5);
		particleSystemEmit.direction1 = baseEmitDirection.add(new BABYLON.Vector3(5, 5, 5));
		particleSystemEmit.direction2 = baseEmitDirection.subtract(new BABYLON.Vector3(5, 5, 5));
		// Angular speed, in radians
		particleSystemEmit.minAngularSpeed = 0;
		particleSystemEmit.maxAngularSpeed = Math.PI;
		// Speed
		particleSystemEmit.minEmitPower = 0.1;
		particleSystemEmit.maxEmitPower = 0.2;
		particleSystemEmit.updateSpeed = 0.04;
		// Start the particle system
		particleSystemEmit.start();

		// Create a particle system for hit
		var impactPoint = target.position.add(axis1.normalize().scale(0.8));

		var particleSystemHit = new BABYLON.ParticleSystem("particles", 1000, scene);
		//Texture of each particle
		particleSystemHit.particleTexture = new BABYLON.Texture("textures/flare.png", scene);
		// Where the particles come from
		particleSystemHit.emitter = impactPoint; // the starting object, the emitter
		particleSystemHit.minEmitBox = new BABYLON.Vector3(0, 0, 0); // Starting all from
		particleSystemHit.maxEmitBox = new BABYLON.Vector3(0, 0, 0); // To...
		// Colors of all particles
		particleSystemHit.color1 = new BABYLON.Color4(1, 0, 0, 1.0);
		particleSystemHit.color2 = new BABYLON.Color4(1, 0.5, 0, 0.8);
		particleSystemHit.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
		// Size of each particle (random between...
		particleSystemHit.minSize = 0.1;
		particleSystemHit.maxSize = 0.3;
		// Life time of each particle (random between...
		particleSystemHit.minLifeTime = 0.3;
		particleSystemHit.maxLifeTime = 1;
		// Emission rate
		particleSystemHit.emitRate = 300;
		// manually emit
		//particleSystemHit.manualEmitCount = 3000;
		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		particleSystemHit.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
		// Direction of each particle after it has been emitted
		var baseImpactReactionDirection = spacecraft.position.subtract(target.position).normalize().scale(5);
		particleSystemHit.direction1 = baseImpactReactionDirection.add(new BABYLON.Vector3(5, 5, 5));
		particleSystemHit.direction2 = baseImpactReactionDirection.subtract(new BABYLON.Vector3(5, 5, 5));
		// Angular speed, in radians
		particleSystemHit.minAngularSpeed = 0;
		particleSystemHit.maxAngularSpeed = Math.PI;
		// Speed
		particleSystemHit.minEmitPower = 0.3;
		particleSystemHit.maxEmitPower = 0.7;
		particleSystemHit.updateSpeed = 0.01;
		// Start the particle system
		particleSystemHit.start();

		setTimeout(function(){
			laser.dispose();
			outerLaser.dispose();
			particleSystemHit.stop();
			particleSystemEmit.stop();

			makeAsteroidExplode(target, scene);
		}, 500);

		return laser;
	};

	/**
	 * @param emitter
	 * @param scene
	 */
	function createSpacecraftEngine(emitter, scene){
		// Create a particle system
		var particleSystem = new BABYLON.ParticleSystem("particles", 10000, scene);

		//Texture of each particle
		particleSystem.particleTexture = new BABYLON.Texture("textures/flare.png", scene);

		// Where the particles come from
		particleSystem.emitter = emitter; // the starting object, the emitter
		particleSystem.minEmitBox = new BABYLON.Vector3(17, -1.3, 0); // Starting all from
		particleSystem.maxEmitBox = new BABYLON.Vector3(17, -1.3, 0); // To...

		// Colors of all particles
		particleSystem.color1 = new BABYLON.Color4(0.1, 0.1, 1.0, 1.0);
		particleSystem.color2 = new BABYLON.Color4(0.1, 0.1, 1.0, 1.0);
		particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.5, 0.0);

		// Size of each particle (random between...
		particleSystem.minSize = 0.5;
		particleSystem.maxSize = 0.6;

		// Life time of each particle (random between...
		particleSystem.minLifeTime = 0.005;
		particleSystem.maxLifeTime = 0.02;

		// Emission rate
		particleSystem.emitRate = 10000;

		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

		// Set the gravity of all particles
		//particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

		// Direction of each particle after it has been emitted
		particleSystem.direction1 = new BABYLON.Vector3(5, 0, 0);
		particleSystem.direction2 = new BABYLON.Vector3(-2, 0, 0);

		// Angular speed, in radians
		particleSystem.minAngularSpeed = 0;
		particleSystem.maxAngularSpeed = Math.PI;

		// Speed
		particleSystem.minEmitPower = 10;
		particleSystem.maxEmitPower = 50;
		particleSystem.updateSpeed = 0.001;

		// Start the particle system
		particleSystem.start();
	}

	/**
	 * @param spacecraft
	 * @param scene
	 */
	function createSpacecraftLaserEmitter(spacecraft, scene){
		spacecraft.laserEmitter = BABYLON.Mesh.CreateBox('laserEmitter', 0.1, scene);
		spacecraft.laserEmitter.parent = spacecraft;
		spacecraft.laserEmitter.position = new BABYLON.Vector3(-17, -3.5, 0);
	}
};