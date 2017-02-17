'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:AcceptCtrl
* @description
* # AcceptCtrl
* Controller responsible for the .accept page of the Review.
*/
angular.module('proposalReviewApp')
.controller('AcceptCtrl', function ($scope, $stateParams, $http, sharedService) {
  $scope.data.select = {};
  $scope.data.groups={};

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
      $scope.data.select.project = sharedService.findByID($scope.data.projects, $scope.data.select.projectId);
      $scope.data.select.proposal = sharedService.findByID($scope.data.submissions, sharedService.findByID($scope.data.proposals, $scope.data.select.project.proposal).submission);
      $scope.data.select.proposal.pi = sharedService.findByID($scope.data.persons, $scope.data.select.proposal.pi);
      $scope.data.select.proposal.copi = sharedService.findByID($scope.data.persons, $scope.data.select.proposal.copi);
      $scope.data.select.proposal.members = sharedService.findAllByID($scope.data.persons, $scope.data.select.proposal.members);
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
  * @name go_back
  * @description
  * # go_back
  * Goes back to the previous page.
  */
  $scope.go_back = function($window){
    window.location.href = '/#/review/'+$scope.data.select.projectId;
  }

  /**
  * @ngdoc function
  * @name finalizeProject
  * @description
  * # finalizeProject
  * Creates EPFL groups, generate a Jira ticket with the requirements and
  * notifies the needed persons.
  */
  $scope.finalizeProject = function(){
    sharedService.loadWholeProject($scope.data.select.proposal);

    // Create the data for the Post request to create a Jira issue
    var jira = {};
    jira.fields = {};
    jira.fields.project = {"key":"HELP2"};
    jira.fields.summary = "[Project Requirements]" ;
    jira.fields.description = JSON.stringify($scope.data.select.proposal);
    console.log(JSON.stringify(jira));

    $scope.data.select.loaded = true;


    $http.get("https://bbp.epfl.ch/api/wallet/group/v1/bbp-dev-proj01")
    .success(function(res){
      console.log(JSON.stringify(res));
    })
    .error(function() {
      console.log('Error: Loading groups');
    });

  }

});
