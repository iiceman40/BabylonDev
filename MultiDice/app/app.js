define(['angular', 'diceController'], function (angular, diceController) {
	return angular.module('app',[])
		.controller('diceController', diceController);
});