'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:ReviewCtrl
* @description
* # ReviewCtrl
* Controller responsible for the .review page.
*/
angular.module('proposalReviewApp')
.controller('ReviewerCtrl', function ($scope, $stateParams, $http) {
  $scope.data.params = $stateParams;
  $scope.data.select.loaded = false;
  $scope.data.menu.project = $scope.data.params[Object.keys($scope.data.params)[0]];
  $scope.data.menu.notes = false;
  $scope.data.menu.comments = false;
  $scope.reviewing = [];
  $scope.grade = "Not deffined yet";

  $scope.$watch('grade', function(attrs) {
		var div = document.getElementById('grade');
    var r = 0;
    var g = 0;
    var b = 0;
    var grade = parseInt($scope.grade);
    if(grade <40){
      r = grade * 3;
    }
    if (40<= grade <60) {
      r = 120 + (grade-40)*6;
      g = 8 * (grade-40);
    }
    if (60<=grade < 80) {
      r = 240 - (grade-60)*9;
      g = 160 - (grade-60);
    }
    if (80<=grade){
      r = 60 - (grade-80)*3;
      b = 7 * (grade-80);
    }
    div.style.backgroundColor = "rgb("+r+","+g+","+b+")";
	}, true);

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
      return data.id;
  	})
  	.error(function(data) {
  		console.log('Error: Review/Review.JS: Reviews could not be loaded.');
  	});
  })
  .then(function(res){
    $http.get('/api/comments/')
  	.success(function(data) {
      $scope.data.select.comments = [];
      angular.forEach(data,function(val){
        if($scope.data.select.review.comments.indexOf(val._id)>-1){
          $scope.data.select.comments.push(val);
        }
      });
  	})
  	.error(function(data) {
  		console.log('Error: Review/Review.JS: Comments could not be loaded.');
  	});
    return res;
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
      countReviewers();
      computeGrade();
  	})
  	.error(function(data) {
  		console.log('Error: Review/Review.JS: Notes could not be loaded.');
  	});
    return res;
  })

  $scope.data.select.loaded = true;

  function countReviewers(){
    angular.forEach($scope.data.select.comments, function(val){
      if($scope.reviewing.indexOf(val.reviewer)==-1 && val.reviewer!= null){
        $scope.reviewing.push(val.reviewer);
      }
    });
      angular.forEach($scope.data.select.notes, function(val){
        if($scope.reviewing.indexOf(val.reviewer)==-1 && val.reviewer!= null){
          $scope.reviewing.push(val.reviewer);
        }
      });
  }

  function computeGrade(){
    var counter = 0;
    var sum = 0;
    angular.forEach($scope.data.select.notes, function(val){
      if(val.total!= null && val.total!= undefined && val.total!= ''){
        sum += val.total;
        counter ++;
      }
    });
    if (counter>0){
      $scope.grade = Math.round(sum/counter);
    }
  }
})
