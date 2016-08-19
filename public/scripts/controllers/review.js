'use strict';

/**
* @ngdoc function
* @name projectReviewApp.controller:ReviewCtrl
* @description
* # ReviewCtrl
* Controller responsible for the .review page.
*/
angular.module('projectReviewApp')
.controller('ReviewCtrl', function ($scope, $stateParams) {
    $scope.data.params = $stateParams;
});
