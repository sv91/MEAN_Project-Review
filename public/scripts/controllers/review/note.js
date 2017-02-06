'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:NoteCtrl
* @description
* # NoteCtrl
* Controller responsible for the .note page.
*/
angular.module('proposalReviewApp')
.controller('NoteCtrl', function ($scope, $stateParams, $http) {
  // Getting the project ID from the address.
  $scope.data.params = $stateParams;
  $scope.data.menu.project = $scope.data.params[Object.keys($scope.data.params)[0]];

  $scope.data.select.editedNote = {};
  $scope.data.menu.notes = true;
  $scope.data.menu.comments = false;

  /**
  * @ngdoc function
  * @name findByID
  * @description
  * # findByID
  * Look for an Object with a specified ID inside the provided Array.
  * @param {Array} list The array to check for the object.
  * @param {Object} obj The object ID.
  */
  function findByID(list,obj){
    var toReturn;
    angular.forEach(list, function(val){
      if(val._id == obj){
        toReturn = val;
      }
    });
    return toReturn;
  }

  /**
  * @ngdoc function
  * @name loadInfo
  * @description
  * # loadInfo
  * Asynchronous loading of the project informations.
  */
  function loadInfo(){
    return new Promise(function(fulfill, reject){
      $scope.data.select.projectId = $scope.data.params[Object.keys($scope.data.params)[0]];
      $scope.data.select.project = findByID($scope.data.projects, $scope.data.select.projectId);
      fulfill($scope.data.select.project.review);
    });
  }

  // Get the project Info, then use it to fetch the associated review and notes.
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
      // Only keep the Note associated with the project and the user.
      angular.forEach(data,function(val){
        if($scope.data.select.review.notes.indexOf(val._id)>-1 && val.reviewer == $scope.activeUser.db_id){
          $scope.data.select.editedNote=val;
          $scope.data.select.editedNote.loaded = true;
        }
      });
    })
    .error(function(data) {
      console.log('Error: Review/Note.JS: Notes could not be loaded.');
    });
    return res;
  });
});
