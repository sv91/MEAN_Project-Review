'use strict';

angular.module('proposalReviewApp')
.controller('EditController', function ($scope, $http) {
  $scope.edit = {};
  $scope.edit.tables = [
    {'name':'requirementtypes'},
    {'name':'softdevs'},
    {'name':'datatransfers'},
    {'name':'virtualizations'},
    {'name':'hpctypes'},
    {'name':'cloudtypes'}
  ];

  $scope.formData = [];
  angular.forEach($scope.edit.tables,function(val){
    $scope.formData[val.name] = {};
  });

  // when submitting the add form, send the text to the node API
  $scope.createElement = function(type) {
    $http.post('/api/'+type, $scope.formData[type])
      .success(function(data){
        $scope.formData = {};
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

});
