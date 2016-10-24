'use strict';

angular.module('proposalReviewApp')
.controller('ProposalCtrl', function ($scope, $stateParams, $http) {
  $scope.whole  = true;
  $scope.s      = true;
  $scope.r      = true;
  $scope.comp   = true;
  $scope.hr     = true;

  $scope.data.menu.project = $scope.data.params[Object.keys($scope.data.params)[0]];
  $scope.data.menu.notes = false;
  $scope.data.menu.comments = true;

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
    if(list != undefined && list != "" && list != null && list != [] && list != {} && list.constructor === Array)
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



function getAllGrandChildById(list,child,grand,type){
  return new Promise(function (fulfill, reject){
    if(list != undefined && list != "" && list != null && list != [] && list != {} && list.constructor === Array)
    {
      return Promise.all(list.map(function(val){
        getAllChildByID(val[child],grand,type);
      })).then(function(res){
        fulfill(res);
      });
    } else {
      fulfill([]);
    }
  });
}

$scope.data.params = $stateParams;

function loadInfo(){
  return new Promise(function(fulfill, reject){
    $scope.data.select.projectId = $scope.data.params[Object.keys($scope.data.params)[0]];
    $scope.data.select.project = findByID($scope.data.projects, $scope.data.select.projectId);
    $scope.data.select.proposal = findByID($scope.data.submissions, findByID($scope.data.proposals, $scope.data.select.project.proposal).submission);
    $scope.data.select.proposal.pi = findByID($scope.data.persons, $scope.data.select.proposal.pi);
    $scope.data.select.proposal.copi = findByID($scope.data.persons, $scope.data.select.proposal.copi);
    $scope.data.select.proposal.members = findAllByID($scope.data.persons, $scope.data.select.proposal.members);
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
    console.log('Error: Review/Proposal.JS: Reviews could not be loaded.');
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
    console.log('Error: Review/Proposal.JS: Comments could not be loaded.');
  });
  return res;
});

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
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.tasks,'grant','grants');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'dependency','deliverables');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'requirements','requirements');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'softdev','softdevs');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'datatransfer','datatransfers');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'virtualization','virtualizations');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'devenv','devenvs');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'hpc','hpcressources');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'cloud','cloudressources');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'hardware','hardwares');
}).then(function(res){
  return getAllChildById($scope.data.select.proposal.deliverables,'hr','humanressources');
}).then(function(res){
  return getAllGrandChildById($scope.data.select.proposal.deliverables,'hpc','type','hpctypes');
}).then(function(res){
  return getAllGrandChildById($scope.data.select.proposal.deliverables,'cloud','type','cloudtypes');
}).then(function(res){
  return getAllGrandChildById($scope.data.select.proposal.deliverables,'hr','role','roles');
});

  $scope.data.select.loaded = true;

});
