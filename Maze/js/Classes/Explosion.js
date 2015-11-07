var Explosion = function (impactInfo, shooter, game, scene) {
	this.impactPosition = impactInfo.pickedPoint;

	console.log('creating explosion');

	var explosion = BABYLON.Mesh.CreateSphere('explosion', 16, 0.1, scene);
	explosion.material = game.materials.fire;
	explosion.position = this.impactPosition;

	var explosionLightPosition = this.impactPosition.add(impactInfo.getNormal());
	var explosionLight = new BABYLON.PointLight("explosionLight", explosionLightPosition, scene);
	explosionLight.diffuse = new BABYLON.Color3(1, 0.5, 0);
	explosionLight.specular = new BABYLON.Color3(1, 0.5, 0);
	explosionLight.range = 7;
	explosionLight.intensity = 0;

	// ANIMATIONS
	// animate intensity of explosion light
	var animationExplosionLight = new BABYLON.Animation("lightAnimation", "intensity", 100, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
	animationExplosionLight.setKeys([
		{frame: 0, value: 0},
		{frame: 25, value: 2},
		{frame: 50, value: 0}
	]);
	explosionLight.animations.push(animationExplosionLight);

	// begin the explosion light animation
	scene.beginAnimation(explosionLight, 0, 50, false, 1, function(){
		explosionLight.dispose();
	});

	// animate scaling of explosion mesh
	var animationExplosion = new BABYLON.Animation("scalingAnimation", "scaling", 100, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE);
	animationExplosion.setKeys([
		{frame: 0, value: explosion.scaling},
		{frame: 25,value: new BABYLON.Vector3(15,15,15)}
	]);
	explosion.animations.push(animationExplosion);

	// animate visibility of explosion mesh
	var visibilityExplosion = new BABYLON.Animation("scalingAnimation", "visibility", 100, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
	visibilityExplosion.setKeys([
		{frame: 25, value: explosion.visibility},
		{frame: 50, value: 0}
	]);
	explosion.animations.push(visibilityExplosion);

	// begin all animations for explosion mesh
	scene.beginAnimation(explosion, 0, 50, false, 1, function(){
		explosion.dispose();
	});

	// sound
	game.sounds.explosion.play();

	console.log('explosion created: ', explosion.position);

	return explosion;
};