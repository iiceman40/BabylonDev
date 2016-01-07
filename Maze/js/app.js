var app = angular.module('mazeApp', []);
app.controller('MenuCtrl', function ($scope, $http) {

	$scope.config = config;
	$scope.versionNumber = config.version;
	$scope.selectedEntry = null;
	$scope.menuOpen = false;

	$scope.gameData = {
		playerIsDead: false
	};
	$scope.highscores = {};

	$scope.highscoreData = {
		name: '',
		level: 1,
		entryId: null,
		submitted: false
	};

	$scope.menu = [
		{
			name: "New Game",
			subMenu: [
				{
					name: "Shooter Mode",
					action: function(){
						$scope.stopAndRestart({mode: 'shooter'});
					}
				},
				{
					name: "Speed Mode",
					action: function(){
						$scope.stopAndRestart({mode: 'speed'});
					}
				}
			]
		},
		{name: "Options"},
		{name: "Highscores", action: 'showHighscores'}
	];

	$scope.$watch('config.mobileCamera', function(newValue, oldValue){
		if(scene) {
			console.log('switch cam');
			scene.player.switchCameraType();
		}
	});

	// methods
	$scope.selectEntry = function (entry) {
		$scope.selectedEntry = entry;
		if (entry && entry.hasOwnProperty('action') && entry.action) {
			if (typeof $scope[entry.action] === 'function') {
				$scope[entry.action]();
			}
		}
		console.log('new selected entry: ', $scope.selectedEntry);
	};

	$scope.showMenu = function () {
		$scope.menuOpen = true;
	};

	$scope.hideMenu = function () {
		$scope.menuOpen = false;
	};

	$scope.toggleMenu = function () {
		$scope.menuOpen = !$scope.menuOpen;
	};

	$scope.saveHighscore = function () {
		$http.post('db/add_highscore.php', $scope.highscoreData).then(function (highscoresResponse) {
			if (highscoresResponse.data.success) {
				$scope.highscoreData.entryId = highscoresResponse.data.id;
				$scope.highscoreData.submitted = true;
			}
			$scope.showHighscores();
		});
	};

	$scope.showHighscores = function () {
		$http.get('db/get_highscores.php').then(function (highscoresResponse) {
			if (highscoresResponse.data.success) {
				$scope.highscores = highscoresResponse.data.list;
			}
			console.log(highscoresResponse);
		});
	};

	$scope.stopAndRestart = function(options){
		if(scene.activeCamera) {
			scene.activeCamera.detachControl(canvas);
		}
		engine.stopRenderLoop();
		setTimeout(function() {
			scene.dispose();
			$scope.restart(options);
		});
	};

	$scope.restart = function (options) {
		$scope.highscoreData = {
			name: '',
			level: 1,
			entryId: null,
			submitted: false
		};
		$scope.gameData = {
			playerIsDead: false
		};
		$scope.hideMenu();
		$('.level').fadeIn(500, function () {
			config = clone(originalConfig);
			config.mode = options.mode || 'shooter';
			scene = createScene();
			console.log('restarting scene');
			engine.runRenderLoop(function () {
				scene.render();
			});
		});
	};

	$scope.playerDied = function (level) {
		$scope.showMenu();
		$scope.$apply(function () {
			$scope.highscoreData.level = level;
			$scope.gameData.playerIsDead = true;
		});
		setTimeout(function () {
			speakPart([$('.destroyed-message').text()], 0, null);
		});

	};

});