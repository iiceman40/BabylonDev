var app = angular.module('mazeApp', []);
app.controller('MenuCtrl', function ($scope, $http) {

	$scope.versionNumber = config.version;
	$scope.selectedEntry = null;

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
				{name: "Shooter Mode"},
				{name: "Speed Mode"}
			]
		},
		{name: "Options"},
		{name: "Highscores", action: 'showHighscores'}
	];

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

	$scope.showMenuModal = function () {
		$('#menuModal').modal('show');
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

	$scope.restart = function () {
		$scope.highscoreData = {
			name: '',
			level: 1,
			entryId: null,
			submitted: false
		};
		$('.level').fadeIn(500, function () {
			config = clone(originalConfig);
			scene = createScene();
			console.log('restarting scene');
			engine.runRenderLoop(function () {
				scene.render();
			});
		});
	};

	$scope.playerDied = function(level){
		$scope.showModal();
		$scope.$apply(function(){
			$scope.highscoreData.level = level;
			$scope.gameData.playerIsDead = true;
		});
		setTimeout(function(){
			speakPart([$('.destroyed-message').text()], 0, null);
		});

	};

	$scope.showModal = function(){
		$('#menuModal').modal('show');
	};
});