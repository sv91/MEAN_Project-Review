'use strict';

/**
 * @ngdoc overview
 * @name jsApp
 * @description
 * # jsApp
 *
 * Main module of the application.
 */
angular
.module('proposalReviewApp', ['ui.router','ui.select','angular.filter','hbpCommon','bbpOidcClient','ui.bootstrap','ngMaterial', 'ngMessages'])
.config(function ($stateProvider, $urlRouterProvider) {
	// link adresses to views and controllers
	$stateProvider
	.state('main', {
	  templateUrl: 'views/form.html',
		controller: 'MainController'
	})
  .state('main.reviewApp', {
    controller:'reviewAppController'
  })
  .state('main.reviewApp.review', {
		url: '/review',
		templateUrl: 'views/review/review.html'
	})
  .state('main.reviewApp.reviewing', {
		url: '/review/:param',
		templateUrl: 'views/review/reviewing.html',
		controller:'ReviewCtrl'
	})
  .state('main.reviewApp.proposal', {
		url: '/review/:param/proposal',
		templateUrl: 'views/review/proposal.html',
    controller:'ProposalCtrl'
	})
  .state('main.reviewApp.note', {
		url: '/review/:param/note',
		templateUrl: 'views/review/note.html'
	})
  .state('summary', {
		url: '/review/:param/summary',
		templateUrl: 'views/review/summary.html'
	});
	$urlRouterProvider.otherwise('/');
})

.controller('reviewAppController', function ($scope) {
	$scope.data= {};
  $scope.data.select = {};
	$scope.formData = {};

  // when landing on the page, get all the projects and show them
  $http.get('/api/projects')
    .success(function(data) {
      $scope.data.projects = data;
      console.log(data);
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });
});
