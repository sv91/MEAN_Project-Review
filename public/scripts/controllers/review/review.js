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
  function findByID(list,obj){
    var toReturn;
    angular.forEach(list, function(val){
      if(val._id == obj){
        toReturn = val;
      }
    });
    return toReturn;
  }

  function findAllByID(list,arr){
    var toReturn =[];
    angular.forEach(arr, function(obj){
      toReturn.push(findByID(list,obj));
    });
    return toReturn;
  }

  $scope.refreshReviews = function(){
    $scope.data.select.review = findByID($scope.data.generalReviews, $scope.data.select.project.review);
  }

  $scope.refreshComments = function(){
    refreshReviews();
    $scope.data.select.comments = findAllByID($scope.data.comments, $scope.data.select.project.review.comments);
  }

  $scope.refreshNotes = function(){
    refreshReviews();
    $scope.data.select.notes = findAllByID($scope.data.notes, $scope.data.select.project.review.notes);
  }

  $scope.data.params = $stateParams;
  $scope.data.select.loaded = false;
  if($scope.data.select.projectId != $scope.data.params[Object.keys($scope.data.params)[0]]){
    $scope.data.select.projectId = $scope.data.params[Object.keys($scope.data.params)[0]];
    $scope.data.select.project = findByID($scope.data.projects, $scope.data.select.projectId);
    refreshNotes();
    refreshComments();
    $scope.data.select.loaded = true;
  } else {
    $scope.data.select.loaded = true;
  }
})
