'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:AcceptCtrl
* @description
* # AcceptCtrl
* Controller responsible for the .accept page of the Review.
*/
angular.module('proposalReviewApp')
.controller('AcceptCtrl', function ($scope, $stateParams, $http) {
  // Limit grade to be accepted
  var passingGrade = 70;
  $scope.good_grade = false;

  // Getting the project ID from the address.
  $scope.data.params = $stateParams;
  $scope.data.menu.project = $scope.data.params[Object.keys($scope.data.params)[0]];

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


  // Loading the project information, then the associated review, comments and notes.
  loadInfo()
  .then(function(res){
    return $http.get('/api/reviews/'+ res)
    .success(function(data) {
      $scope.data.select.review = data;
      return data.id;
    })
    .error(function(data) {
      console.log('Error: Review/Accept.JS: Reviews could not be loaded.');
    });
  })
  .then(function(res){
    $http.get('/api/notes/')
    .success(function(data) {
      $scope.data.select.notes = [];
      angular.forEach(data,function(val){
        if($scope.data.select.review.notes.indexOf(val._id)>-1){
          $scope.data.select.notes.push(val);
        }
      });
      computeGrade();
      // Checking if the grade is good enough:
      if($scope.grade>=passingGrade){
        $scope.good_grade = true;
      }
    })
    .error(function(data) {
      console.log('Error: Review/Accept.JS: Notes could not be loaded.');
    });
    return res;
  })

  /**
  * @ngdoc function
  * @name computeGrade
  * @description
  * # computeGrade
  * Computes the average grade.
  */
  function computeGrade(){
    var counter = 0;
    var sum = 0;
    angular.forEach($scope.data.select.notes, function(val){
      // Only takes in account the notes with a grade.
      if(val.total!= null && val.total!= undefined && val.total!= ''){
        sum += val.total;
        counter ++;
      }
    });
    if (counter>0){
      $scope.grade = Math.round(sum/counter);
    }
  }

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
  * @name go_back
  * @description
  * # go_back
  * Goes back to the previous page..
  */
  $scope.go_back = function($window){
    window.location.href = '/#/review/'+$scope.data.select.projectId;
  }

});
