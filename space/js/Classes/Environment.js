var Environment = function(scene){
	var self = this;

	self.asteroids = [];

	/**
	 * @param amount
	 * @param scene
	 */
	self.createStars = function(amount, scene){
		// Create a particle system
		var particleSystem = new BABYLON.ParticleSystem("particles", amount, scene);
		//Texture of each particle
		particleSystem.particleTexture = new BABYLON.Texture("textures/star.png", scene);
		// Where the particles come from
		particleSystem.emitter = BABYLON.Vector3.Zero(); // the starting object, the emitter
		particleSystem.minEmitBox = new BABYLON.Vector3(-1000, -1000, -1000); // Starting all from
		particleSystem.maxEmitBox = new BABYLON.Vector3(1000, -500, 1000); // To...
		// Colors of all particles
		particleSystem.color1 = new BABYLON.Color4(0.8, 0.8, 0.8, 0.8);
		particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 0.7, 1.0);
		particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
		// Size of each particle (random between...
		particleSystem.minSize = 1;
		particleSystem.maxSize = 5;
		// Life time of each particle (random between...
		particleSystem.minLifeTime = 1000;
		particleSystem.maxLifeTime = 10000;
		// Emission rate
		particleSystem.emitRate = 1500;
		// Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
		particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;
		// Angular speed, in radians
		particleSystem.minAngularSpeed = 0;
		particleSystem.maxAngularSpeed = Math.PI;
		// Start the particle system
		particleSystem.start();
	};

	/**
	 * @param scene
	 */
	self.createNebula = function(scene){
		var nebulaTexture = new BABYLON.Texture('textures/nebula.png', scene);
		var nebulaMaterial = new BABYLON.StandardMaterial('nebulaMaterial', scene);
		nebulaMaterial.diffuseTexture = nebulaTexture;
		nebulaMaterial.diffuseTexture.hasAlpha = true;
		nebulaMaterial.opacityTexture = nebulaTexture;
		nebulaMaterial.opacityTexture.hasAlpha = true;
		nebulaMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

		var nebulaPlane = BABYLON.Mesh.CreatePlane('nebulaPlane', 2000, scene);
		nebulaPlane.material = nebulaMaterial;
		nebulaPlane.rotation.x = Math.PI/2;
		nebulaPlane.position.y = -1000;
		nebulaPlane.position.x = 1000;
		nebulaPlane.position.z = 1000;
		nebulaPlane.visibility = 0.7;

		var nebulaTexture2 = new BABYLON.Texture('textures/nebula2.png', scene);
		var nebulaMaterial2 = new BABYLON.StandardMaterial('nebulaMaterial', scene);
		nebulaMaterial2.diffuseTexture = nebulaTexture2;
		nebulaMaterial2.diffuseTexture.hasAlpha = true;
		nebulaMaterial2.opacityTexture = nebulaTexture2;
		nebulaMaterial2.opacityTexture.hasAlpha = true;
		nebulaMaterial2.specularColor = new BABYLON.Color3(0, 0, 0);

		var nebulaPlane2 = BABYLON.Mesh.CreatePlane('nebulaPlane2', 2000, scene);
		nebulaPlane2.material = nebulaMaterial2;
		nebulaPlane2.rotation.x = Math.PI/2;
		nebulaPlane2.scaling.x = 2;
		nebulaPlane2.position.y = -800;
		nebulaPlane2.position.x = 750;
		nebulaPlane2.position.z = -1000;
		nebulaPlane2.visibility = 0.5;
	};

	/**
	 * @param scene
	 */
	self.createPlanets = function(scene) {
		var planetTexture = new BABYLON.Texture('textures/planet_2_d.jpg', scene);
		var planetBumpTexture = new BABYLON.Texture('textures/planet_2_d_normal.jpg', scene);

		var planetMaterial = new BABYLON.StandardMaterial('planetMaterial', scene);
		//planetMaterial.diffuseColor = new BABYLON.Color3(0.8, 1, 0.6);
		//planetMaterial.emissiveColor = new BABYLON.Color3(0.15, 0.05, 0.05);
		planetMaterial.diffuseTexture = planetTexture;
		planetMaterial.bumpTexture = planetBumpTexture;
		planetMaterial.bumpTexture.level = 2;
		planetMaterial.specularColor = new BABYLON.Color3(0.6, 0.5, 0.6);
		planetMaterial.specularPower = 256;

		var planet = BABYLON.Mesh.CreateSphere('planet', 24, 300, scene);
		planet.material = planetMaterial;
		planet.position = new BABYLON.Vector3(-50, -300, 300);
		//planet.applyDisplacementMap("textures/planet_1_d_displacement.jpg", 0, 1.5);



		var fireTexture = new BABYLON.FireProceduralTexture("fire", 256, scene);
		fireTexture.fireColors = [
			new BABYLON.Color3(1,0.1,0),
			new BABYLON.Color3(1,0.4,0),
			new BABYLON.Color3(1,0,0),
			new BABYLON.Color3(1,0.5,0.4),
			new BABYLON.Color3(1,0.1,0),
			new BABYLON.Color3(1,0,0)
		];
		fireTexture.speed = {x: 0.1, y: 0.1};

		var fresnelMaterial = new BABYLON.StandardMaterial('athmosphereMaterial', scene);

		//fresnelMaterial.reflectionTexture = fireTexture;
		fresnelMaterial.diffuseTexture = fireTexture;
		//fresnelMaterial.emissiveTexture = fireTexture;
		fresnelMaterial.opacityTexture = fireTexture;

		//fresnelMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		fresnelMaterial.emissiveColor = new BABYLON.Color3(0, 0, 0.5);
		//fresnelMaterial.specularColor = new BABYLON.Color3(0.4, 0.4, 0.2);

		fresnelMaterial.alpha = 0;
		fresnelMaterial.specularPower = 8;

		// Fresnel
		//fresnelMaterial.emissiveFresnelParameters = new BABYLON.FresnelParameters();
		//fresnelMaterial.emissiveFresnelParameters.bias = 0.6;
		//fresnelMaterial.emissiveFresnelParameters.power = 1;

		fresnelMaterial.opacityFresnelParameters = new BABYLON.FresnelParameters();
		fresnelMaterial.opacityFresnelParameters.bias = 0.7;
		fresnelMaterial.opacityFresnelParameters.power = 4;
		fresnelMaterial.opacityFresnelParameters.leftColor = BABYLON.Color3.White();
		fresnelMaterial.opacityFresnelParameters.rightColor = BABYLON.Color3.Black();

		//fresnelMaterial.reflectionFresnelParameters = new BABYLON.FresnelParameters();
		//fresnelMaterial.reflectionFresnelParameters.bias = 0.1;
		//fresnelMaterial.reflectionFresnelParameters.power = 100;
		//fresnelMaterial.reflectionFresnelParameters.leftColor = BABYLON.Color3.White();
		//fresnelMaterial.reflectionFresnelParameters.rightColor = BABYLON.Color3.Black();

		//fresnelMaterial.emissiveFresnelParameters = new BABYLON.FresnelParameters();
		//fresnelMaterial.emissiveFresnelParameters.bias = 0.2;
		//fresnelMaterial.emissiveFresnelParameters.power = 4;
		//fresnelMaterial.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
		//fresnelMaterial.emissiveFresnelParameters.rightColor = BABYLON.Color3.Black();

		var atmosphere = BABYLON.Mesh.CreateSphere('athmosphere', 24, 330, scene);
		atmosphere.position = planet.position;
		atmosphere.material = fresnelMaterial;

		scene.registerBeforeRender(function () {
			atmosphere.rotation.z += 0.002;
			atmosphere.rotation.x += 0.002;
			planet.rotation.y += 0.0002;
		});
	};

	/**
	 * @param scene
	 */
	self.createSun = function(scene){
		var fireTexture = new BABYLON.FireProceduralTexture("fire", 256, scene);
		fireTexture.speed = new BABYLON.Vector2(0.00001, 0.00001);
		fireTexture.fireColors = [
			new BABYLON.Color3(1,0.1,0),
			new BABYLON.Color3(1,0.1,0),
			new BABYLON.Color3(1,0,0),
			new BABYLON.Color3(1,0.5,0.4),
			new BABYLON.Color3(1,0.1,0),
			new BABYLON.Color3(1,0,0)
		];

		var sunLight = new BABYLON.PointLight("Omni", new BABYLON.Vector3(20, 20, 100), scene);
		var sun = BABYLON.Mesh.CreateSphere('sun', 16, 1500, scene);
		sun.rotation.y = Math.PI;
		sun.rotation.x = -Math.PI/8;
		var sunMaterial = new BABYLON.StandardMaterial('sunMaterial', scene);
		sunMaterial.diffuseTexture = fireTexture;
		sun.material = sunMaterial;

		var godrays = new BABYLON.VolumetricLightScatteringPostProcess('godrays', 1.0, scene.activeCamera, sun, 100, BABYLON.Texture.BILINEAR_SAMPLINGMODE, scene._engine, false);
		godrays.mesh.position = new BABYLON.Vector3(-3500, -1500, 3500);

		sunLight.position = godrays.mesh.position;
	};

	/**
	 * @param scene
	 */
	self.createGround = function(scene){
		var precision = {
			"w" : 1,
			"h" : 1
		};
		var subdivisions = {
			'h' : 100,
			'w' : 100
		};
		self.ground = BABYLON.Mesh.CreateTiledGround("ground1", -500, -500, 500, 500, subdivisions, precision, scene);
		self.ground.material = new BABYLON.StandardMaterial('mat', scene);
		self.ground.material.specularColor = BABYLON.Color3.Black();
		//self.ground.material.alpha = 0;
		//self.ground.visibility = 0;
	};

	/**
	 * @param scene
	 */
	self.createStarBox = function(scene){
		var starbox = BABYLON.Mesh.CreateBox("starbox", 10000, scene);
		var starboxMaterial = new BABYLON.StandardMaterial("starbox material", scene);
		starboxMaterial.backFaceCulling = false;
		starboxMaterial.reflectionTexture = new BABYLON.CubeTexture("starbox/stars", scene);
		starboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
		starboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
		starboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
		starbox.material = starboxMaterial;
	};

	/**
	 * @param scene
	 */
	self.createAsteroids = function(scene){
		BABYLON.SceneLoader.ImportMesh("Asteroid", "assets/", "asteroid.babylon", scene, function (newMeshes, particleSystems) {
			var asteroid = newMeshes[0];
			var numberOfAsteroid = 500;

			asteroid.material.bumpTexture = new BABYLON.Texture('textures/asteroid_normalmap.jpg', scene);
			asteroid.material.bacFaceCulling = false;
			asteroid.material.specularColor = new BABYLON.Color3(0.2, 0.2, 0.2);
			asteroid.position.x = -10;
			asteroid.isTargetable = false;
			asteroid.isVisible = false;

			asteroid.customOutline = asteroid.clone('customAsteroidOutline');
			asteroid.customOutline.isVisible = false;
			asteroid.customOutline.isOutline = true;
			asteroid.customOutline.scaling = new BABYLON.Vector3(1.1, 1.1, 1.1);
			asteroid.customOutline.material = new BABYLON.StandardMaterial('outlineMaterial', scene);
			asteroid.customOutline.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
			asteroid.customOutline.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
			asteroid.customOutline.material.specularColor = new BABYLON.Color3(0,0,0);
			asteroid.customOutline.material.alpha = 0.7;

			asteroid.isTargetable = true;
			initTargetableActions(asteroid, asteroid.customOutline, scene);

			for(var i = 0; i < numberOfAsteroid; i++) {
				var asteroidInstance = asteroid.createInstance('Asteroid-' + i);
				asteroidInstance.position = new BABYLON.Vector3(
					Math.round(Math.random() * 1000) - 500,
					Math.round(Math.random() * 30) - 15,
					Math.round(Math.random() * 1000) - 500
				);
				asteroidInstance.rotationSpeed = Math.random() * 0.03;
				asteroidInstance.rotationDirection = Math.ceil(Math.random()*6);

				asteroidInstance.isTargetable = true;
				asteroidInstance.isVisible = true;
				asteroidInstance.outline = asteroid.customOutline;
				initTargetableActions(asteroidInstance, asteroid.customOutline, scene);

				self.asteroids.push(asteroidInstance);
			}

		});
	};


	self.createSun(scene);
	self.createGround(scene); // for spaceship navigation
	self.createStarBox(scene);
	self.createAsteroids(scene);
	self.createNebula(scene);
	self.createPlanets(scene);
	self.createStars(2000, scene);

};

makeAsteroidExplode = function(asteroid, scene){
	// TODO create an explosion animation
	asteroid.outline.isVisible = false;
	asteroid.dispose();
};