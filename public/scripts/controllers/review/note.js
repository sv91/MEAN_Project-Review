'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:ReviewCtrl
* @description
* # ReviewCtrl
* Controller responsible for the .review page.
*/
angular.module('proposalReviewApp')
.controller('NoteCtrl', function ($scope, $stateParams, $http) {
  $scope.data.params = $stateParams;
  $scope.data.select.editedNote = {};

  $scope.data.menu.project = $scope.data.params[Object.keys($scope.data.params)[0]];
  $scope.data.menu.notes = true;
  $scope.data.menu.comments = false;

  function findByID(list,obj){
    var toReturn;
    angular.forEach(list, function(val){
      if(val._id == obj){
        toReturn = val;
      }
    });
    return toReturn;
  }
  function loadInfo(){
    return new Promise(function(fulfill, reject){
      $scope.data.select.projectId = $scope.data.params[Object.keys($scope.data.params)[0]];
      $scope.data.select.project = findByID($scope.data.projects, $scope.data.select.projectId);
      fulfill($scope.data.select.project.review);
    });
  }

  loadInfo()
  .then(function(res){
    return $http.get('/api/reviews/'+ res)
    .success(function(data) {
      $scope.data.select.review = data;
      return data._id;
    })
    .error(function(data) {
      console.log('Error: Review/Note.JS: Reviews could not be loaded.');
    });
  })
  .then(function(res){
    $http.get('/api/notes/')
    .success(function(data) {
      $scope.data.select.editedNote = {};
      angular.forEach(data,function(val){
        console.log("VAL: "+ JSON.stringify(val));
        console.log("index: "+ JSON.stringify($scope.data.select.review.notes.indexOf(val._id)));
        console.log("id: "+ JSON.stringify($scope.activeUser));
        if($scope.data.select.review.notes.indexOf(val._id)>-1 && val.reviewer == $scope.activeUser.db_id){
          console.log("IN: "+ JSON.stringify(val));
          $scope.data.select.editedNote=val;
          $scope.data.select.editedNote.loaded = true;
        }
      });
      console.log(JSON.stringify($scope.data.select.editedNote));
    })
    .error(function(data) {
      console.log('Error: Review/Note.JS: Notes could not be loaded.');
    });
    return res;
  });

});
