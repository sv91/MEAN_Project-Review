var testSoftDev = angular.module('testSoftDev',[]);

function mainController($scope, $http) {
  $scope.formData = {};

  // when landing on the page, get all todos and show them
  $http.get('/api/softdevs')
    .success(function(data) {
      $scope.softdevs = data;
      console.log(data);
    })
    .error(function(data) {
      console.log('Error: ' + data);
    });

  // when submitting the add form, send the text to the node API
  $scope.createSoftDev = function() {
    $http.post('/api/softdevs', $scope.formData)
      .success(function(data){
        $scope.formData = {};
        $scope.softdevs = data;
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

  // delete a todo after checking it
  $scope.deleteSoftDev = function(id) {
    $http.delete('/api/softdevs/'+ id + '/delete')
      .success(function(data) {
        $scope.softdevs = data;
        console.log(data);
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };

}
