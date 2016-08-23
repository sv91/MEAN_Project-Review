'use strict';

angular.module('proposalReviewApp')
.controller('EditController', function ($scope, $http) {
  $scope.edit = {};
  $scope.edit.tables = [
    {'name':'requirementtypes','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'softdevs','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'datatransfers','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'virtualizations','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'hpctypes','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'cloudtypes','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'roles','fields':[{'name':'name'}]},
    {'name':'grants','fields':[{'name':'name'}]},
    {'name':'teams','fields':[{'name':'name'},{'name':'shortName'},{'name':'displayName'}]}
  ];

  $scope.formData = [];
  angular.forEach($scope.edit.tables,function(val){
    $scope.formData[val.name] = {};

    // when landing on the page, get all todos and show them
    $http.get('/api/'+ val.name)
      .success(function(data) {
        $scope.edit[val.name] = data;
        console.log(val.name);
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  });



  // when submitting the add form, send the text to the node API
  $scope.createElement = function(type) {
    $http.post('/api/'+type, $scope.formData[type])
      .success(function(data){
        $scope.formData = {};
        $scope.edit[val.name] = data;
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

});
