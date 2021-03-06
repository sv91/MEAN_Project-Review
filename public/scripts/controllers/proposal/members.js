'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:DefinitionsCtrl
* @description
* # DefinitionsCtrl
* Controller responsible for the .members page.
*/
angular.module('proposalReviewApp')
.controller('MembersCtrl', function ($scope, $http) {
  // Loading the list of BBP teams.
  // TODO: Perhaps only do it if needed (depending of the project type).
  $http.get('/api/teams')
  .success(function(data) {
    $scope.availableTeams = data;
  })
  .error(function(data) {
    console.log('Error: Loading Teams: ' + data);
  });
})


/**
* @ngdoc directive
* @name proposalReviewApp.directive:selectPi
* @description
* # selectPi
* Input form to select an user as the project leader.
*/
.directive('selectPi', function(hbpIdentityUserDirectory, $window, $timeout) {
  return {
    scope: true,
    template: '<hbp-user-selector hbp-on-select="handleUserSelection(user)"></hbp-user-selector><hbp-usercard hbp-user="record.pi" ></hbp-usercard></pre>',
    link: function(scope, elt, attr) {
      /**
      * @ngdoc function
      * @name handleUserSelection
      * @description
      * # handleUserSelection
      * Manage the user selection by checking if the input is not repeated in other fields.
      * @param {Object} options The selected user.
      */
      scope.handleUserSelection = function(options) {
        var copi = false;
        if(scope.record.copi != undefined){
          copi = (scope.record.copi.id == options.id);
        }
        var member = false;
        angular.forEach(scope.record.members,function(mem){
          if (mem.id === options.id){
            member = true;
          }
        });
        // Checking if the person is from BBP if the project is BBP only.
        var bbp = 0;
        if(scope.record.bbpProject == 1){
          bbp = 2;
          angular.forEach(options.institutions, function(val){
            if(val.department == "Blue Brain Project"){
              bbp = 1;
            }
          });
        }
        if(bbp == 2) {
          $timeout(function(){
            $window.alert("You have selected previously that the project is a BBP project but "+options.displayName + " is not part of Blue Brain Project.");
          });
        } else {
          // Verify if the selected pi is not yet selected as co-pi or member.
          if(!copi && !member){
            // If not, add the user as pi.
            console.log('select', arguments);
            scope.record.pi = options;
            // Otherwise provide a corresponding message.
          } else if(copi){
            $timeout(function(){
              $window.alert(options.displayName + " is already defined as Co-Project Leader.");
            });
          } else if(member){
            $timeout(function(){
              $window.alert(options.displayName + " is already defined as Member.");
            });
          }
        }
      }
    }
  }
})


/**
* @ngdoc directive
* @name proposalReviewApp.directive:selectCopi
* @description
* # selectCopi
* Input form to select an user as the project co-leader.
*/
.directive('selectCopi', function($window, $timeout) {
  return {
    scope: true,
    template: '<hbp-user-selector hbp-on-select="handleUserSelection(user)"></hbp-user-selector><hbp-usercard hbp-user="record.copi" ></hbp-usercard></pre>',
    link: function(scope, elt, attr) {
      /**
      * @ngdoc function
      * @name handleUserSelection
      * @description
      * # handleUserSelection
      * Manage the user selection by checking if the input is not repeated in other fields.
      * @param {Object} options The selected user.
      */
      scope.handleUserSelection = function(options) {
        var pi = false;
        if(scope.record.pi != undefined){
          pi = (scope.record.pi.id == options.id);
        }
        var member = false;
        angular.forEach(scope.record.members,function(mem){
          if (mem.id === options.id){
            member = true;
          }
        });
        // Checking if the person is from BBP if the project is BBP only.
        var bbp = 0;
        if(scope.record.bbpProject == 1){
          bbp = 2;
          angular.forEach(options.institutions, function(val){
            if(val.department == "Blue Brain Project"){
              bbp = 1;
            }
          });
        }
        if(bbp == 2) {
          $timeout(function(){
            $window.alert("You have selected previously that the project is a BBP project but "+options.displayName + " is not part of Blue Brain Project.");
          });
        } else {
          // Verify if the selected co-pi is not yet selected as pi or member.
          if(!pi && !member){
            // If not, add the user as pi.
            console.log('select', arguments);
            scope.record.copi = options;
            // Otherwise provide a corresponding message.
          } else if(pi){
            $timeout(function(){
              $window.alert(options.displayName + " is already defined as Project Leader.");
            });
          } else if(member){
            $timeout(function(){
              $window.alert(options.displayName + " is already defined as Member.");
            });
          }
        }
      }
    }
  }
})


/**
* @ngdoc directive
* @name proposalReviewApp.directive:multiUserSelect
* @description
* # multiUserSelect
* Input form to select multiple user.
*/
.directive('multiUserSelect', function($window, $timeout) {
  return {
    scope: true,
    template: '<hbp-user-selector hbp-on-select="handleUserSelection(user)"></hbp-user-selector><hbp-usercard ng-repeat="u in record.members" hbp-user="u" ></hbp-usercard></pre>',
    link: function(scope, elt, attr) {
      /**
      * @ngdoc function
      * @name handleUserSelection
      * @description
      * # handleUserSelection
      * Manage the user selection by checking if the input is not repeated in other fields.
      * @param {Object} options The selected user.
      */
      scope.handleUserSelection = function(options) {
        if(scope.record.members==undefined ||scope.record.members==null){
          scope.record.members = [];
        }
        var pi = false;
        if(scope.record.pi != undefined){
          pi = (scope.record.pi.id == options.id);
        }
        var copi = false;
        if(scope.record.copi != undefined){
          copi = (scope.record.copi.id == options.id);
        }
        // Checking if the person is from BBP if the project is BBP only.
        var bbp = 0;
        if(scope.record.bbpProject == 1){
          bbp = 2;
          angular.forEach(options.institutions, function(val){
            if(val.department == "Blue Brain Project"){
              bbp = 1;
            }
          });
        }
        if(bbp == 2) {
          $timeout(function(){
            $window.alert("You have selected previously that the project is a BBP project but "+options.displayName + " is not part of Blue Brain Project.");
          });
        } else {
          // Verify if the selected member is not yet selected as pi or co-pi.
          if(!pi && !copi){
            // Verify if the selected user is not selected yet.
            var present = false;
            angular.forEach(scope.record.members,function(val){
              if (val.id == options.id){
                present = true;
              }
            });
            if(!present){
              // If not, add the user as pi.
              scope.record.members.push(options);
            } else {
              $window.alert(options.displayName + " is already selected as member.");
            }
            // Otherwise provide a corresponding message.
          } else if(pi){
            $timeout(function(){
              $window.alert(options.displayName + " is already defined as Project Leader.");
            });
          } else if(copi){
            $timeout(function(){
              $window.alert(options.displayName + " is already defined as Co-Project Leader.");
            });
          }
        }
      }
    }
  }
})





/**
* @ngdoc directive
* @name proposalReviewApp.directive:twoUserSelect
* @description
* # twoUserSelect
* Input form to select two users max.
*/
.directive('twoUserSelect', function($window, $timeout) {
  return {
    scope: true,
    template: '<hbp-user-selector hbp-on-select="handleUserSelection(user)"></hbp-user-selector><hbp-usercard ng-repeat="u in record.members" hbp-user="u" ></hbp-usercard></pre>',
    link: function(scope, elt, attr) {
      /**
      * @ngdoc function
      * @name handleUserSelection
      * @description
      * # handleUserSelection
      * Manage the user selection by checking if the input is not repeated in other fields.
      * @param {Object} options The selected user.
      */
      scope.handleUserSelection = function(options) {
        if(scope.record.members==undefined ||scope.record.members==null){
          scope.record.members = [];
        }
        if (scope.record.members.length<2){
          var pi = false;
          if(scope.record.pi != undefined){
            pi = (scope.record.pi.id == options.id);
          }
          var copi = false;
          if(scope.record.copi != undefined){
            copi = (scope.record.copi.id == options.id);
          }
          // Checking if the person is from BBP if the project is BBP only.
          var bbp = 0;
          if(scope.record.bbpProject == 1){
            bbp = 2;
            angular.forEach(options.institutions, function(val){
              if(val.department == "Blue Brain Project"){
                bbp = 1;
              }
            });
          }
          if(bbp == 2) {
            $timeout(function(){
              $window.alert("You have selected previously that the project is a BBP project but "+options.displayName + " is not part of Blue Brain Project.");
            });
          } else {
            // Verify if the selected member is not yet selected as pi or co-pi.
            if(!pi && !copi){
              // Verify if the selected user is not selected yet.
              var present = false;
              angular.forEach(scope.record.members,function(val){
                if (val.id == options.id){
                  present = true;
                }
              });
              if(!present){
                // If not, add the user as pi
                scope.record.members.push(options);
              } else {
                $window.alert(options.displayName + " is already selected as member.");
              }
              // Otherwise provide a corresponding message.
            } else if(pi){
              $timeout(function(){
                $window.alert(options.displayName + " is already defined as Project Leader.");
              });
            } else if(copi){
              $timeout(function(){
                $window.alert(options.displayName + " is already defined as Co-Project Leader.");
              });
            }
          }
        }
        else {
          $timeout(function(){
            $window.alert("The members are limited to two users.");
          });
        }
      }
    }
  }
});
