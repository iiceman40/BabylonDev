console.log('MAIN JS');

require.config({
	paths: {
		angular:        '../node_modules/angular/angular.min',
		bootstrap:      '../node_modules/bootstrap/dist/js/bootstrap.min',
		pepJs:          '../node_modules/pepjs/dist/pep.min',
		handJs:         '../node_modules/handjs/hand.min',
		babylonJs:      '../../libs/babylon/preview-2.5/babylon.noworker',
		diceConfig:     'data/diceConfig',
		diceController: 'controllers/diceController',
		sceneFactory:   'factories/sceneFactory'
	},
	shim: {
		angular: {
			exports: "angular"
		},
		handJs: {
			deps: ['babylonJs']
		}
	}
});

require(['app', 'angular'], function(app, angular) {
	angular.bootstrap(document, ['app']);
});
