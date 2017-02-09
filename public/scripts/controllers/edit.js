'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:EditController
* @description
* # EditController
* Controller responsible for the .edit page that access and manages some part of the DB.
*/
angular.module('proposalReviewApp')
.controller('EditController', function ($scope, $http) {
  $scope.edit = {};
  $scope.check = {};
  // Database tables where information can be edited, deleted and added.
  $scope.edit.tables = [
    {'name':'requirementtypes','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'softdevs','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'datatransfers','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'virtualizations','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'hpctypes','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'cloudtypes','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'devenvs','fields':[{'name':'name'},{'name':'desc'}]},
    {'name':'roles','fields':[{'name':'name'}]},
    {'name':'grants','fields':[{'name':'name'}]},
    {'name':'teams','fields':[{'name':'name'},{'name':'shortName'},{'name':'displayName'}]}
  ];

  // Database tables where information can be edited and deleted.
  $scope.check.tables = [
    {'name':'projects'},
    {'name':'proposals'},
    {'name':'submissions'},
    {'name':'persons'},
    {'name':'requirements'},
    {'name':'reviews'}
  ];

  $scope.formData = [];
  angular.forEach($scope.edit.tables,function(val){
    $scope.formData[val.name] = {};
    // When landing on the page, get all "edit" values
    $http.get('/api/'+ val.name)
    .success(function(data) {
      $scope.edit[val.name] = data;
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });
  });

  angular.forEach($scope.check.tables,function(val){
    // When landing on the page, get all "check" values
    $http.get('/api/'+ val.name)
    .success(function(data) {
      $scope.check[val.name] = data;
      console.log(val.name);
      console.log(data);
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });
  });


  /**
  * @ngdoc function
  * @name createElement
  * @description
  * # createElement
  * Add an element to the specified table of the DB.
  * @param {Object} type The table in which the element is added.
  */
  $scope.createElement = function(type) {
    $http.post('/api/'+type, $scope.formData[type])
    .success(function(data){
      $scope.formData = {};
      $scope.edit[type.name] = data;
      console.log(data);
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });
  };

  /**
  * @ngdoc function
  * @name deleteElement
  * @description
  * # deleteElement
  * Delete an element from the specified table of the DB.
  * @param {Object} type The table in which the element is deleted.
  * @param {int} id ID of the element to delete.
  */
  $scope.deleteElement = function(type,id) {
    console.log('In the function');
    $http.delete('/api/'+type+'/'+id+'/delete')
    .success(function(data){
      console.log('Deleted');
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });
  }

});
