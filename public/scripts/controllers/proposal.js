'use strict';

angular.module('projectReviewApp')
.controller('ProposalCtrl', function ($scope, $stateParams) {
  $scope.data.params = $stateParams;
  $scope.data.select.loaded = false;
  var projectName = $scope.data.params[Object.keys($scope.data.params)[0]];
  angular.forEach($scope.data.proposals,function(prop){
    if(prop.proposal != undefined && prop.proposal.projectTitle != undefined ){
      if(projectName == prop.proposal.projectTitle.replace(/\s+/g, '')){
      $scope.data.select = prop.proposal;
      $scope.data.select.loaded = true;
    }
    }
  });
});
