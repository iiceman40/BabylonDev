/*
 * View Models for User Interface
 */
var SelectedMeshViewModel = function (mesh) {
	var self = this;

	// observables
	this.positionX = ko.observable(mesh.position.x);
	this.positionY = ko.observable(mesh.position.y);
	this.positionZ = ko.observable(mesh.position.z);

	this.rotationX = ko.observable(mesh.rotation.x);
	this.rotationY = ko.observable(mesh.rotation.y);
	this.rotationZ = ko.observable(mesh.rotation.z);

	this.scalingX = ko.observable(mesh.scaling.x);
	this.scalingY = ko.observable(mesh.scaling.y);
	this.scalingZ = ko.observable(mesh.scaling.z);

	this.material = ko.observable();

	this.mesh = ko.observable(mesh);

	// init
	for(var i=0; i<materials.length; i++){
		if(materials[i].material == mesh.material){
			self.material(materials[i]);
		}
	}

	// subscriptions
	this.material.subscribe(function(){
		//console.log('updating mesh because material changed');
		self.update();
	});

	// methods
	this.rotateX = function(){
		self.rotationX( self.add90degrees(self.rotationX()) );
	};
	this.rotateY = function(){
		self.rotationY( self.add90degrees(self.rotationY()) );
	};
	this.rotateZ = function(){
		self.rotationZ( self.add90degrees(self.rotationZ()) );
	};

	this.add90degrees = function(oldRotation){
		var newRotation = parseFloat(oldRotation) + Math.PI/4;
		if(newRotation >= 2*Math.PI) {
			newRotation = newRotation - 2*Math.PI;
		}
		if(newRotation <= -2*Math.PI) {
			newRotation = newRotation + 2*Math.PI;
		}
		return newRotation;
	};

	this.update = function(){
		//console.log('updating mesh');
		self.mesh().position = new BABYLON.Vector3(self.positionX(), self.positionY(), self.positionZ());
		self.mesh().rotation = new BABYLON.Vector3(self.rotationX(), self.rotationY(), self.rotationZ());
		self.mesh().scaling = new BABYLON.Vector3(self.scalingX(), self.scalingY(), self.scalingZ());
		self.mesh().material = self.material().material;
	};

	// computed observables
	ko.computed(function() {
		//console.log('updating mesh because values changed');
		self.positionX();
		self.positionY();
		self.positionZ();
		self.rotationX();
		self.rotationY();
		self.rotationZ();
		self.scalingX();
		self.scalingY();
		self.scalingZ();

		if(self.material()) {
			self.update();
		}
	});
};

var ViewModel = function (meshGroups, materials) {
	var self = this;

	// observables
	this.selectedMeshBlueprint = ko.observable(basicMeshes[0]);
	this.selectedMaterial = ko.observable(materials[0]);
	this.selectedTool = ko.observable(tools[0]);

	this.selectedMesh = ko.observable();

	// observable arrays
	this.meshGroups = ko.observableArray(meshGroups);
	this.basicMeshes = ko.observableArray(meshGroups[0].meshes);
	this.advancedMeshes = ko.observableArray(meshGroups[1].meshes);
	this.materials = ko.observableArray(materials);
	this.tools = ko.observableArray(tools);

	// methods
	this.selectMeshBlueprint = function(mesh){
		self.selectedMeshBlueprint(mesh);
	};

	this.selectMaterial = function(material){
		self.selectedMaterial(material);
	};

	this.selectTool = function(tool){
		self.selectedTool(tool);
	};

	this.updateSelectedMesh = function(){
		self.selectedMesh().update();
	};

	this.removeSelectedMesh = function(){
		self.selectedMesh().mesh().dispose();
		self.selectedMesh(null);
	};

	this.deselectMesh = function(){
		self.selectedMesh().mesh().showBoundingBox = false;
		self.selectedMesh(null);
	};

	this.focusOnSelectedMesh = function(){
		var camera = self.selectedMesh().mesh()._scene.cameras[0];
		camera.target = self.selectedMesh().mesh().clone();
	};

	this.cloneSelectedMesh = function(){
		self.selectedMeshBlueprint(self.basicMeshes()[self.basicMeshes().length-1]);
	};

	// File Methods
	this.newScene = function(){
		scene.dispose();
		createScene();
	};

	this.loadScene = function(){
		$.post('php/load.php', function(returnedData){
			BABYLON.SceneLoader.Load("", "data:" + returnedData, engine, function (newScene) {
				scene.dispose();
				scene = newScene;
				scene.cameras[0].attachControl(canvas, true);
			});
		});
	};

	this.saveScene = function(){
		var serializedScene = BABYLON.SceneSerializer.Serialize(scene);
		serializedScene.cameras.forEach(function(c) { c.tags = null; });
		var strScene = JSON.stringify(serializedScene);

		$.post('php/save.php', {scene: strScene}, function(returnedData){
			//console.log(returnedData);
		})
	}
};

function initUi(){
	viewModel = new ViewModel(meshGroups, materials, tools);
	ko.applyBindings(viewModel);
}