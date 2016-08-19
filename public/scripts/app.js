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
.module('projectReviewApp', ['ui.router','ui.select','angular.filter','hbpCommon','bbpOidcClient','ui.bootstrap','ngMaterial', 'ngMessages'])
.config(function ($stateProvider, $urlRouterProvider) {
	// link adresses to views and controllers
	$stateProvider
  .state('form', {
    templateUrl: 'views/form.html',
    controller:'formController'
  })
  .state('form.review', {
		url: '/',
		templateUrl: 'views/review.html'
	})
  .state('form.reviewing', {
		url: '/review/:param',
		templateUrl: 'views/reviewing.html',
		controller:'ReviewCtrl'
	})
  .state('form.proposal', {
		url: '/review/:param/proposal',
		templateUrl: 'views/proposal.html',
    controller:'ProposalCtrl'
	})
  .state('form.note', {
		url: '/review/:param/note',
		templateUrl: 'views/note.html'
	})
  .state('summary', {
		url: '/review/:param/summary',
		templateUrl: 'views/summary.html'
	});
	$urlRouterProvider.otherwise('/');
})

.controller('formController', function ($scope) {
	$scope.data= {};
  $scope.data.select = {};
	$scope.formData = {};

  // when landing on the page, get all the proposals and show them
  $http.get('/api/projects')
    .success(function(data) {
      $scope.data.projects = data;
      console.log(data);
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });
});
