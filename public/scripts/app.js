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
.module('proposalReviewApp', ['ui.router','ui.select','angular.filter','hbpCommon','bbpOidcClient','ui.bootstrap','ngMaterial', 'ngMessages', 'ngStorage'])
.config(function ($stateProvider, $urlRouterProvider) {
	// link adresses to views and controllers
	$stateProvider
	.state('main', {
		url: '/',
	  templateUrl: 'views/main.html',
		controller: 'MainController'
	})
// Review App states
  .state('main.reviewApp', {
	  templateUrl: 'views/review/form.html',
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
	})
// Proposal App states
	.state('main.proposalApp', {
			url: '/form',
			templateUrl: 'views/proposal/form.html',
			controller:'proposalAppController'
		})
		.state('main.proposalApp.type', {
			url: '/type',
			templateUrl: 'views/proposal/type.html'
		})
		.state('main.proposalApp.members', {
			url: '/members',
			templateUrl: 'views/proposal/members.html',
			controller: 'MembersCtrl'
		})
		.state('main.proposalApp.summary', {
			url: '/summary',
			templateUrl: 'views/proposal/summary.html',
			controller: 'SummaryCtrl'
		})
		.state('main.proposalApp.requirements', {
			url: '/requirements',
			templateUrl: 'views/proposal/requirements.html',
			controller: 'RequirementsCtrl'
		})
		.state('main.proposalApp.deliverables', {
			url: '/deliverables',
			templateUrl: 'views/proposal/deliverables.html',
			controller: 'DeliverablesCtrl'
		})
		.state('main.proposalApp.review', {
			url: '/review',
			templateUrl: 'views/proposal/review.html',
			controller: 'ReviewCtrl'
		})
		.state('main.proposalApp.help', {
			url: '/help',
			templateUrl: 'views/proposal/help.html'
		})
		.state('main.proposalApp.updates', {
			url: '/updates',
			templateUrl: 'views/proposal/updates.html'
		})
		.state('main.proposalApp.finalize', {
			url: '/finalize',
			templateUrl: 'views/proposal/finalize.html',
			controller: 'FinalizeCtrl'
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
})

.controller('proposalAppController', function($scope, hbpCollabStore, $sessionStorage) {
	// we will store all of our form data in this object
	if($scope.record == undefined | $scope.record == null){
		console.log('scope');
		$scope.record = $sessionStorage;
		$scope.summ = {};
		$scope.faq = '';
		// value of current date
		$scope.today = new Date();

		$scope.membersAndLead = [];
		$scope.log = [];

		$scope.good = false;
		$scope.log=[];
		$scope.minDate = new Date();
		$scope.maxDate = new Date();
	}


	// Check if all the required values were filled
	$scope.$watch('record', function(attrs) {
		var level = $scope.record.projectType;
		var temp = true;
		angular.forEach($scope.fields,function(elem){
			if( elem.required >= level ){
				var iter = $scope.record[elem.name];
				if(iter == undefined || iter == '' || iter == null){
					temp = false;
				}
			}
		})
		$scope.good = temp;
	}, true);

	// Activate or disactivate the submit button
	$scope.$watch('good', function() {
		var classes = 'finalN';
		if(!$scope.good){
			classes += ' disabled';
		}
		document.getElementById('final').className = classes;
	});


	// Change the minimum date of the projects depending on the type of projects
	$scope.$watchGroup(['record.projectType', 'record.projectStartDate'], function() {
		$scope.minDate= new Date();
		var numberOfDaysToAdd = 0;
		if($scope.record.projectType == 2){
			numberOfDaysToAdd = 365;
		}
		var dateTemp = new Date();
		if($scope.record.projectStartDate!=undefined ){
			dateTemp = $scope.record.projectStartDate;
		}
		$scope.minDate.setDate(dateTemp.getDate() + numberOfDaysToAdd);
	});

	// Change the maximum date of the projects depending on the type of projects
	$scope.$watchGroup(['record.projectType', 'record.projectStartDate'], function() {
		$scope.maxDate= new Date();
		var numberOfDaysToAdd = 3650;
		if($scope.record.projectType == 0){
			numberOfDaysToAdd = 90;
		}
		if($scope.record.projectType == 1){
			numberOfDaysToAdd = 183;
		}
		var dateTemp = new Date();
		if($scope.record.projectStartDate!=undefined ){
			dateTemp = $scope.record.projectStartDate;
		};
		$scope.maxDate.setDate(dateTemp.getDate() + numberOfDaysToAdd);
	});

	// Load the Collabs informations
	function loadCollabs() {
		hbpCollabStore.list().then(function(rs) {return rs.toArray();})
		.then(function(arr){
			$scope.availableCollab = arr;
		})
	}
	loadCollabs();


	// function to process the form
	$scope.processForm = function() {
	};
});
