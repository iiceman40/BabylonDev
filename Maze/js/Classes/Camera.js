// fix for missing camera ellipsoid offset
BABYLON.FreeCamera.prototype._collideWithWorld = function (velocity) {
	var cameraOffsetY = 0.6; // custom camera offset
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