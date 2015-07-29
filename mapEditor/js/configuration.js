var gridSize = 5; // TODO make gridSize based on the number of tiles
var viewModel = null;
var ramp, companionCube;

// Tools
var tools = [
	{name: 'add'},
	{name: 'remove'},
	{name: 'select'}
];

// Meshes
var basicMeshes = [
	{
		name: 'box',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function(){
			var newBox = new BABYLON.Mesh.CreateBox('box', gridSize, scene);
			return newBox;
		}
	},
	{
		name: 'sphere',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function(){
			var newSphere =  new BABYLON.Mesh.CreateSphere('sphere', 16, gridSize, scene);
			return newSphere;
		}
	},
	{
		name: 'hex cylinder',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function() {
			var hexCylinder = new BABYLON.Mesh.CreateCylinder("hexCylinder", gridSize, gridSize, gridSize, 6, 1, scene);
			hexCylinder.convertToFlatShadedMesh();
			return hexCylinder;
		}
	},
	{
		name: 'hex cone',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function() {
			var hexCone = new BABYLON.Mesh.CreateCylinder("hexCone", gridSize, 0, gridSize, 6, 1, scene);
			hexCone.convertToFlatShadedMesh();
			return hexCone;
		}
	},
	{
		name: 'cylinder',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function() {
			var newCylinder = new BABYLON.Mesh.CreateCylinder("cylinder", gridSize, gridSize, gridSize, 16, 1, scene);
			return newCylinder;
		}
	},
	{
		name: 'cone',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function() {
			var newCone = new BABYLON.Mesh.CreateCylinder("cone", gridSize, 0, gridSize, 32, 1, scene);
			return newCone;
		}
	},
	{
		name: 'plane',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function() {
			var newPlane = new BABYLON.Mesh.CreatePlane("plane", gridSize, scene);
			newPlane.rotation.x = Math.PI/2;
			return newPlane;
		}
	},
	{
		name: 'tiled ground',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function() {
			var newTiledGround = new BABYLON.Mesh.CreateTiledGround('tiledGround', -10*gridSize, -10*gridSize, 10*gridSize, 10*gridSize, subdivisions, precision, scene);

			var verticesCount = newTiledGround.getTotalVertices();
			var tileIndicesLength = newTiledGround.getIndices().length / (subdivisions.w * subdivisions.h);

			newTiledGround.subMeshes = [];
			newTiledGround.indexedGroundSubMeshes = {};
			var base = 0;
			for (var row = 0; row < subdivisions.h; row++) {
				for (var col = 0; col < subdivisions.w; col++) {
					var matIndex = 0; // material index for this tile
					var subMesh = new BABYLON.SubMesh(matIndex, 0, verticesCount, base, tileIndicesLength, newTiledGround);
					newTiledGround.indexedGroundSubMeshes[subMesh._id] = subMesh;
					base += tileIndicesLength;
				}
			}
			return newTiledGround;
		}
	},
	{
		// !! KEEP THIS AS THE LAST MESH !! //
		name: 'clone selected',
		offset: new BABYLON.Vector3(0, 0, 0),
		constructor: function() {
			return viewModel.selectedMesh().mesh().clone();
		}
	}
];
var advancedMeshes = [
	{
		name: 'ramp',
		offset: new BABYLON.Vector3(0, 0, gridSize/2),
		constructor: function() {
			var newRamp = ramp.clone();
			return newRamp;
		}
	},
	{
		name: 'companion cube',
		offset: new BABYLON.Vector3(0, gridSize/2, 0),
		constructor: function() {
			var newCompanion = companionCube.clone();
			return newCompanion;
		}
	}
];

var meshGroups = [
	{
		name: 'Basic',
		meshes: basicMeshes
	},
	{
		name: 'Advanced',
		meshes: advancedMeshes
	}
];

// Textures
var textures = {};

// Materials
var materials = [
	{
		// !! KEEP THIS AS THE FIRST MATERIAL !! //
		name: 'none/default',
		constructor: function(scene){
			return null;
		}
	},
	{
		name: 'gray',
		constructor: function(scene){
			var mat = new BABYLON.StandardMaterial('blueTile', scene);
			mat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.3);
			return mat;
		}
	},
	{
		name: 'blue tile',
		constructor: function(scene){
			var mat = new BABYLON.StandardMaterial('blueTile', scene);
			mat.diffuseTexture = textures.baseTileTexture;
			return mat;
		}
	},
	{
		name: 'red tile',
		constructor: function(scene) {
			var mat = new BABYLON.StandardMaterial('groundMatSelected', scene);
			mat.diffuseTexture = textures.baseTileTexture;
			mat.diffuseColor = new BABYLON.Color3(1, 0, 0);
			return mat;
		}
	},
	{
		name: 'tiled ground',
		constructor: function(scene) {
			// Materials
			groundMaterial = materials[2].constructor(scene);
			groundMaterialSelected = materials[3].constructor(scene);

			groundMultiMaterial = new BABYLON.MultiMaterial("multi", scene);
			groundMultiMaterial.subMaterials.push(groundMaterial);
			groundMultiMaterial.subMaterials.push(groundMaterialSelected);

			return groundMultiMaterial;
		}
	},
	{
		name: 'cobble',
		constructor: function(scene) {
			var mat = new BABYLON.StandardMaterial('cobble', scene);
			mat.diffuseTexture = textures.cobbleTexture;
			mat.bumpTexture = textures.cobbleTextureNormal;
			return mat;
		}
	},
	{
		name: 'portal tile',
		constructor: function(scene) {
			var mat = new BABYLON.StandardMaterial('portalTile', scene);
			mat.diffuseTexture = textures.portalTile;
			mat.diffuseTexture.uOffset = 0.5;
			mat.diffuseTexture.vOffset = 0.5;
			mat.bumpTexture = textures.portalTileNormal;
			mat.bumpTexture.uOffset = 0.5;
			mat.bumpTexture.vOffset = 0.5;
			return mat;
		}
	},
	{
		name: 'portal tile dark',
		constructor: function(scene) {
			var mat = new BABYLON.StandardMaterial('portalTileDark', scene);
			mat.diffuseTexture = textures.portalTileDark;
			mat.diffuseTexture.uOffset = 0.5;
			mat.diffuseTexture.vOffset = 0.5;
			mat.bumpTexture = textures.portalTileNormal;
			mat.bumpTexture.uOffset = 0.5;
			mat.bumpTexture.vOffset = 0.5;
			return mat;
		}
	},
	{
		name: 'SciFi Wall',
		constructor: function (scene) {

			var sciFiWall = new BABYLON.StandardMaterial('sciFiWall', scene);
			sciFiWall.alpha = 1;
			sciFiWall.backFaceCulling = true;
			sciFiWall.specularPower = 64;
			sciFiWall.useSpecularOverAlpha = true;
			sciFiWall.useAlphaFromDiffuseTexture = false;

			// diffuse definitions;
			sciFiWall.diffuseColor = new BABYLON.Color3(1.00, 1.00, 1.00);
			var sciFiWall_diffuseTexture = new BABYLON.Texture('textures/sciFiWall_diffuse.jpg', scene);
			sciFiWall_diffuseTexture.uScale = 1;
			sciFiWall_diffuseTexture.vScale = 1;
			sciFiWall_diffuseTexture.coordinatesMode = 0;
			sciFiWall_diffuseTexture.uOffset = 0;
			sciFiWall_diffuseTexture.vOffset = 0;
			sciFiWall_diffuseTexture.uAng = 0;
			sciFiWall_diffuseTexture.vAng = 0;
			sciFiWall_diffuseTexture.level = 1;
			sciFiWall_diffuseTexture.coordinatesIndex = 0;
			sciFiWall_diffuseTexture.hasAlpha = false;
			sciFiWall_diffuseTexture.getAlphaFromRGB = false;

			sciFiWall.diffuseTexture = sciFiWall_diffuseTexture;
			sciFiWall.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			sciFiWall.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			sciFiWall.specularColor = new BABYLON.Color3(0.48, 0.48, 0.48);

			// bump definitions;
			var sciFiWall_bumpTexture = new BABYLON.Texture('textures/sciFiWall_bump.png', scene);
			sciFiWall_bumpTexture.uScale = 1;
			sciFiWall_bumpTexture.vScale = 1;
			sciFiWall_bumpTexture.coordinatesMode = 0;
			sciFiWall_bumpTexture.uOffset = 0;
			sciFiWall_bumpTexture.vOffset = 0;
			sciFiWall_bumpTexture.uAng = 0;
			sciFiWall_bumpTexture.vAng = 0;
			sciFiWall_bumpTexture.level = 1;
			sciFiWall_bumpTexture.coordinatesIndex = 0;
			sciFiWall_bumpTexture.hasAlpha = false;
			sciFiWall_bumpTexture.getAlphaFromRGB = false;

			sciFiWall.bumpTexture = sciFiWall_bumpTexture;

			return sciFiWall;
		}
	},
	{
		name: 'Simple Container',
		constructor: function(scene) {

			var simpleContainer = new BABYLON.StandardMaterial('simpleContainer', scene);
			simpleContainer.alpha = 1;
			simpleContainer.backFaceCulling = true;
			simpleContainer.specularPower = 64;
			simpleContainer.useSpecularOverAlpha = true;
			simpleContainer.useAlphaFromDiffuseTexture = false;

			// diffuse definitions;
			simpleContainer.diffuseColor = new BABYLON.Color3(1.00, 1.00, 1.00);
			var simpleContainer_diffuseTexture = new BABYLON.Texture('textures/simpleContainer_diffuse.jpg', scene);
			simpleContainer_diffuseTexture.uScale = 1;
			simpleContainer_diffuseTexture.vScale = 1;
			simpleContainer_diffuseTexture.coordinatesMode = 0;
			simpleContainer_diffuseTexture.uOffset = 0;
			simpleContainer_diffuseTexture.vOffset = 0;
			simpleContainer_diffuseTexture.uAng = 0;
			simpleContainer_diffuseTexture.vAng = 0;
			simpleContainer_diffuseTexture.level = 1;
			simpleContainer_diffuseTexture.coordinatesIndex = 0;
			simpleContainer_diffuseTexture.hasAlpha = false;
			simpleContainer_diffuseTexture.getAlphaFromRGB = false;

			simpleContainer.diffuseTexture = simpleContainer_diffuseTexture;
			simpleContainer.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			simpleContainer.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			simpleContainer.specularColor = new BABYLON.Color3(0.48, 0.48, 0.48);

			// bump definitions;
			var simpleContainer_bumpTexture = new BABYLON.Texture('textures/simpleContainer_bump.png', scene);
			simpleContainer_bumpTexture.uScale = 1;
			simpleContainer_bumpTexture.vScale = 1;
			simpleContainer_bumpTexture.coordinatesMode = 0;
			simpleContainer_bumpTexture.uOffset = 0;
			simpleContainer_bumpTexture.vOffset = 0;
			simpleContainer_bumpTexture.uAng = 0;
			simpleContainer_bumpTexture.vAng = 0;
			simpleContainer_bumpTexture.level = 1;
			simpleContainer_bumpTexture.coordinatesIndex = 0;
			simpleContainer_bumpTexture.hasAlpha = false;
			simpleContainer_bumpTexture.getAlphaFromRGB = false;

			simpleContainer.bumpTexture = simpleContainer_bumpTexture;

			return simpleContainer;
		}
	},
	{
		name: 'Hex Field Yellow',
		constructor: function(scene) {

			var hexFieldYellow = new BABYLON.StandardMaterial('hexFieldYellow', scene);
			hexFieldYellow.alpha = 1;
			hexFieldYellow.backFaceCulling = true;
			hexFieldYellow.specularPower = 64;
			hexFieldYellow.useSpecularOverAlpha = true;
			hexFieldYellow.useAlphaFromDiffuseTexture = false;

			// diffuse definitions;
			hexFieldYellow.diffuseColor = new BABYLON.Color3(1.00, 1.00, 1.00);
			var hexFieldYellow_diffuseTexture = new BABYLON.Texture('textures/hexFieldYellow_diffuse.png', scene);
			hexFieldYellow_diffuseTexture.uScale = 1;
			hexFieldYellow_diffuseTexture.vScale = 1;
			hexFieldYellow_diffuseTexture.coordinatesMode = 0;
			hexFieldYellow_diffuseTexture.uOffset = 0;
			hexFieldYellow_diffuseTexture.vOffset = 0;
			hexFieldYellow_diffuseTexture.uAng = 0;
			hexFieldYellow_diffuseTexture.vAng = 0;
			hexFieldYellow_diffuseTexture.level = 1;
			hexFieldYellow_diffuseTexture.coordinatesIndex = 0;
			hexFieldYellow_diffuseTexture.hasAlpha = false;
			hexFieldYellow_diffuseTexture.getAlphaFromRGB = false;

			hexFieldYellow.diffuseTexture = hexFieldYellow_diffuseTexture;
			hexFieldYellow.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			hexFieldYellow.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			hexFieldYellow.specularColor = new BABYLON.Color3(0.48, 0.48, 0.48);

			// bump definitions;
			var hexFieldYellow_bumpTexture = new BABYLON.Texture('textures/hexFieldYellow_bump.png', scene);
			hexFieldYellow_bumpTexture.uScale = 1;
			hexFieldYellow_bumpTexture.vScale = 1;
			hexFieldYellow_bumpTexture.coordinatesMode = 0;
			hexFieldYellow_bumpTexture.uOffset = 0;
			hexFieldYellow_bumpTexture.vOffset = 0;
			hexFieldYellow_bumpTexture.uAng = 0;
			hexFieldYellow_bumpTexture.vAng = 0;
			hexFieldYellow_bumpTexture.level = 1;
			hexFieldYellow_bumpTexture.coordinatesIndex = 0;
			hexFieldYellow_bumpTexture.hasAlpha = false;
			hexFieldYellow_bumpTexture.getAlphaFromRGB = false;

			hexFieldYellow.bumpTexture = hexFieldYellow_bumpTexture;

			return hexFieldYellow;
		}
	},
	{
		name: 'Green Tech',
		constructor: function(scene) {

			var greenTech = new BABYLON.StandardMaterial('coordinatesMode', scene);
			greenTech.alpha = 1;
			greenTech.backFaceCulling = true;
			greenTech.specularPower = 128;
			greenTech.useSpecularOverAlpha = true;
			greenTech.useAlphaFromDiffuseTexture = false;

			// diffuse definitions;
			greenTech.diffuseColor = new BABYLON.Color3(1.00, 1.00, 1.00);
			var greenTech_diffuseTexture = new BABYLON.Texture('textures/greenTech_diffuse.gif', scene);
			greenTech_diffuseTexture.uScale = 1;
			greenTech_diffuseTexture.vScale = 1;
			greenTech_diffuseTexture.coordinatesMode = 0;
			greenTech_diffuseTexture.uOffset = 0;
			greenTech_diffuseTexture.vOffset = 0;
			greenTech_diffuseTexture.uAng = 0;
			greenTech_diffuseTexture.vAng = 0;
			greenTech_diffuseTexture.level = 1;
			greenTech_diffuseTexture.coordinatesIndex = 0;
			greenTech_diffuseTexture.hasAlpha = false;
			greenTech_diffuseTexture.getAlphaFromRGB = false;

			greenTech.diffuseTexture = greenTech_diffuseTexture;
			greenTech.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			greenTech.ambientColor = new BABYLON.Color3(1.00, 1.00, 1.00);
			greenTech.specularColor = new BABYLON.Color3(0.13, 0.25, 0.12);

			// bump definitions;
			var greenTech_bumpTexture = new BABYLON.Texture('textures/greenTech_bump.png', scene);
			greenTech_bumpTexture.uScale = 1;
			greenTech_bumpTexture.vScale = 1;
			greenTech_bumpTexture.coordinatesMode = 0;
			greenTech_bumpTexture.uOffset = 0;
			greenTech_bumpTexture.vOffset = 0;
			greenTech_bumpTexture.uAng = 0;
			greenTech_bumpTexture.vAng = 0;
			greenTech_bumpTexture.level = 0.47;
			greenTech_bumpTexture.coordinatesIndex = 0;
			greenTech_bumpTexture.hasAlpha = false;
			greenTech_bumpTexture.getAlphaFromRGB = false;

			greenTech.bumpTexture = greenTech_bumpTexture;

			return greenTech;
		}
	},
	{
		name: 'Grass',
		constructor: function(scene) {

			var grass = new BABYLON.StandardMaterial('grass', scene);
			grass.alpha = 1;
			grass.backFaceCulling = true;
			grass.specularPower = 512;
			grass.useSpecularOverAlpha = true;
			grass.useAlphaFromDiffuseTexture = false;

			// diffuse definitions;
			grass.diffuseColor = new BABYLON.Color3(1.00, 1.00, 1.00);
			var grass_diffuseTexture = new BABYLON.Texture('textures/grass_diffuse.jpg', scene);
			grass_diffuseTexture.uScale = 1;
			grass_diffuseTexture.vScale = 1;
			grass_diffuseTexture.coordinatesMode = 0;
			grass_diffuseTexture.uOffset = 0;
			grass_diffuseTexture.vOffset = 0;
			grass_diffuseTexture.uAng = 0;
			grass_diffuseTexture.vAng = 0;
			grass_diffuseTexture.level = 1;
			grass_diffuseTexture.coordinatesIndex = 0;
			grass_diffuseTexture.hasAlpha = false;
			grass_diffuseTexture.getAlphaFromRGB = false;

			grass.diffuseTexture = grass_diffuseTexture;
			grass.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			grass.ambientColor = new BABYLON.Color3(1.00, 1.00, 1.00);
			grass.specularColor = new BABYLON.Color3(0.37, 0.37, 0.37);

			// bump definitions;
			var grass_bumpTexture = new BABYLON.Texture('textures/grass_bump.png', scene);
			grass_bumpTexture.uScale = 1;
			grass_bumpTexture.vScale = 1;
			grass_bumpTexture.coordinatesMode = 0;
			grass_bumpTexture.uOffset = 0;
			grass_bumpTexture.vOffset = 0;
			grass_bumpTexture.uAng = 0;
			grass_bumpTexture.vAng = 0;
			grass_bumpTexture.level = 1;
			grass_bumpTexture.coordinatesIndex = 0;
			grass_bumpTexture.hasAlpha = false;
			grass_bumpTexture.getAlphaFromRGB = false;

			grass.bumpTexture = grass_bumpTexture;

			return grass;
		}
	},
	{
		name: 'Panel Render',
		constructor: function(scene) {

			var panelRender = new BABYLON.StandardMaterial('panelRender', scene);
			panelRender.alpha = 1;
			panelRender.backFaceCulling = true;
			panelRender.specularPower = 128;
			panelRender.useSpecularOverAlpha = true;
			panelRender.useAlphaFromDiffuseTexture = false;

			// diffuse definitions;
			panelRender.diffuseColor = new BABYLON.Color3(1.00, 1.00, 1.00);
			var panelRender_diffuseTexture = new BABYLON.Texture('textures/panelRender_diffuse.jpg', scene);
			panelRender_diffuseTexture.uScale = 1;
			panelRender_diffuseTexture.vScale = 1;
			panelRender_diffuseTexture.coordinatesMode = 0;
			panelRender_diffuseTexture.uOffset = 0;
			panelRender_diffuseTexture.vOffset = 0;
			panelRender_diffuseTexture.uAng = 0;
			panelRender_diffuseTexture.vAng = 0;
			panelRender_diffuseTexture.level = 1;
			panelRender_diffuseTexture.coordinatesIndex = 0;
			panelRender_diffuseTexture.hasAlpha = false;
			panelRender_diffuseTexture.getAlphaFromRGB = false;

			panelRender.diffuseTexture = panelRender_diffuseTexture;
			panelRender.emissiveColor = new BABYLON.Color3(0.00, 0.00, 0.00);
			panelRender.ambientColor = new BABYLON.Color3(0.00, 0.00, 0.00);

			// specular definitions;
			panelRender.specularColor = new BABYLON.Color3(0.81, 0.81, 0.81);
			var panelRender_specularTexture = new BABYLON.Texture('textures/panelRender_specular.png', scene);
			panelRender_specularTexture.uScale = 1;
			panelRender_specularTexture.vScale = 1;
			panelRender_specularTexture.coordinatesMode = 0;
			panelRender_specularTexture.uOffset = 0;
			panelRender_specularTexture.vOffset = 0;
			panelRender_specularTexture.uAng = 0;
			panelRender_specularTexture.vAng = 0;
			panelRender_specularTexture.level = 1;
			panelRender_specularTexture.coordinatesIndex = 0;
			panelRender_specularTexture.hasAlpha = false;
			panelRender_specularTexture.getAlphaFromRGB = false;

			panelRender.specularTexture = panelRender_specularTexture;

			// bump definitions;
			var panelRender_bumpTexture = new BABYLON.Texture('textures/panelRender_bump.png', scene);
			panelRender_bumpTexture.uScale = 1;
			panelRender_bumpTexture.vScale = 1;
			panelRender_bumpTexture.coordinatesMode = 0;
			panelRender_bumpTexture.uOffset = 0;
			panelRender_bumpTexture.vOffset = 0;
			panelRender_bumpTexture.uAng = 0;
			panelRender_bumpTexture.vAng = 0;
			panelRender_bumpTexture.level = 1;
			panelRender_bumpTexture.coordinatesIndex = 0;
			panelRender_bumpTexture.hasAlpha = false;
			panelRender_bumpTexture.getAlphaFromRGB = false;

			panelRender.bumpTexture = panelRender_bumpTexture;

			return panelRender;
		}
	}
];

// Options for Tiles Ground
var precision = {
	"w" : 1,
	"h" : 1
};
var subdivisions = {
	'h' : 20,
	'w' : 20
};