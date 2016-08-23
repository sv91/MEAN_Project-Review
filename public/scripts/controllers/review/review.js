'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:ReviewCtrl
* @description
* # ReviewCtrl
* Controller responsible for the .review page.
*/
angular.module('proposalReviewApp')
.controller('ReviewerCtrl', function ($scope, $stateParams) {
    $scope.data.params = $stateParams;
});
