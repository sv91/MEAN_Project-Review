'use strict';

angular.module('proposalReviewApp')
.controller('ProposalCtrl', function ($scope, $stateParams, $http) {
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

  function getById(val,type){
    return new Promise(function (fulfill, reject){
      $http.get('/api/'+type+'/'+val)
      .success(function(data) {
        fulfill(data);
      })
      .error(function(data) {
        console.log('Error: findAllByID: Values could not be loaded.');
        reject(data);
      });
    });
  }

  function getAllByID(list,type){
    return new Promise(function (fulfill, reject){
      if(list != undefined && list != "" && list != null && list != [])
      {
        if(list.constructor !== Array){
        return getById(list,type)
        .then(function(res){
          fulfill(res);
        });
      } else {
        return Promise.all(list.map(function(val){
          return getById(val,type);
        })).then(function(res){
          console.log("Found "+JSON.stringify(res));
          fulfill(res);
        });
      }
    } else {
      fulfill({});
    }
  });
}

function getAllChildById(list,child,type){
  return new Promise(function (fulfill, reject){
    if(list != undefined && list != "" && list != null && list != [] && list != {} )
    {
      return Promise.all(list.map(function(val){
        getAllByID(val[child],type).then(function(res){
          val[child] = res;
        });
      })).then(function(res){
        fulfill(res);
      });
    } else {
      fulfill([]);
    }
  });
}

$scope.data.params = $stateParams;
if($scope.data.select.projectId != $scope.data.params[Object.keys($scope.data.params)[0]]){
  $scope.data.select.projectId = $scope.data.params[Object.keys($scope.data.params)[0]];
  $scope.data.select.project = findByID($scope.data.projects, $scope.data.select.projectId);
  $scope.data.select.review = findByID($scope.data.generalReviews, $scope.data.select.project.review);
  $scope.data.select.notes = findAllByID($scope.data.notes, $scope.data.select.project.review.notes);
  $scope.data.select.comments = findAllByID($scope.data.comments, $scope.data.select.project.review.comments);    $scope.data.select.loaded = true;
} else {
  $scope.data.select.loaded = true;
}
$scope.data.select.proposal = findByID($scope.data.submissions, findByID($scope.data.proposals, $scope.data.select.project.proposal).submission);
$scope.data.select.proposal.pi = findByID($scope.data.persons, $scope.data.select.proposal.pi);
$scope.data.select.proposal.copi = findByID($scope.data.persons, $scope.data.select.proposal.copi);
$scope.data.select.proposal.members = findAllByID($scope.data.persons, $scope.data.select.proposal.members);

getAllByID($scope.data.select.proposal.teams,'teams')
.then(function(res){
  $scope.data.select.proposal.teams = res;
  return res
}).then(function(res){
  return getAllByID($scope.data.select.proposal.tags,'tags').then(function(res){$scope.data.select.proposal.tags = res; return res});
}).then(function(res){
  return getAllByID($scope.data.select.proposal.relatedProjects,'relatedprojects').then(function(res){$scope.data.select.proposal.relatedProjects = res; return res});
}).then(function(res){
  return getAllByID($scope.data.select.proposal.shortDeliverable,'shortdeliverables').then(function(res){$scope.data.select.proposal.shortDeliverable = res; return res});
}).then(function(res){
  return getAllByID($scope.data.select.proposal.publications,'publications').then(function(res){$scope.data.select.proposal.publications = res; return res});
}).then(function(res){
  return getAllByID($scope.data.select.proposal.grants,'grants').then(function(res){$scope.data.select.proposal.grants = res; return res});
}).then(function(res){
  return getAllByID($scope.data.select.proposal.tasks,'tasks').then(function(res){$scope.data.select.proposal.tasks = res; return res});
}).then(function(res){
  return getAllByID($scope.data.select.proposal.requirements,'requirements').then(function(res){$scope.data.select.proposal.requirements = res; return res});
}).then(function(res){
  return getAllByID($scope.data.select.proposal.deliverables,'deliverables').then(function(res){$scope.data.select.proposal.deliverables = res; return res});
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.requirements,'input','inputs');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.requirements,'output','outputs');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.requirements,'type','requirementtypes');
})

});
