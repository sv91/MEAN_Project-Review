'use strict';

/**
* @ngdoc function
* @name proposalReviewApp.controller:SummaryCtrl
* @description
* # DefinitionsCtrl
* Controller responsible for the .summary page.
*/
angular.module('proposalReviewApp')
.controller('SummaryCtrl', function ($scope, $http) {
  // Default value for the 'New Project' field.
  $scope.record.newproject = 'true';
  $scope.record.projectStartDateMD = new Date();
  $scope.record.projectStartDate = new Date($scope.record.projectStartDate);
  $scope.record.projectEndDate = new Date($scope.record.projectEndDate);

  // Loading available values from DB.
  // Grants.
  $http.get('/api/grants')
  .success(function(data) {
    $scope.availableGrants = data;
  })
  .error(function(data) {
    console.log('Error: Loading Grants: ' + data);
  });

  // Tasks.
  $http.get('/api/tasks')
  .success(function(data) {
    $scope.availableTasks = data;
  })
  .error(function(data) {
    console.log('Error: Loading Tasks: ' + data);
  });

  // Tags.
  $http.get('/api/tags')
  .success(function(data) {
    $scope.availableTags = data;
  })
  .error(function(data) {
    console.log('Error: Loading Tags: ' + data);
  });
})

/**
* @ngdoc directive
* @name proposalReviewApp.directive:publicationPicker
* @description
* # publicationPicker
* Directive managing the selection of one or more publication for the
* .definitions page.
*/
.directive('publicationPicker', function () {
  return {
    scope: true,
    templateUrl: 'views/proposal/publicationPicker.html',
    link: function postLink(scope) {
      // Verify that the JSON part exists.
      if (!scope.record.publications) {
        scope.record.publications = [];
      }
      /**
      * @ngdoc function
      * @name deletePublication
      * @description
      * # deletePublication
      * Delete the specified publication.
      * If it is the only publication, reset it.
      * @param {Object} item The publication to delete.
      */
      scope.deletePublication = function (item) {
        resetBubble();
        // If only one publication, reset it instead of deleting.
        if (scope.record.publications.length < 1) {
          scope.record.publications = [];
          return;
        }
        var index = scope.record.publications.indexOf(item);
        scope.record.publications.splice(index, 1);
      };

      /**
      * @ngdoc function
      * @name addPublication
      * @description
      * # addPublication
      * Add an additional form for a publication.
      */
      scope.addPublication = function () {
        scope.record.publications.push({'name': '', 'link': ''});
      };
    }
  };
})

/**
* @ngdoc filter
* @name proposalReviewApp.filter:taskFilter
* @description
* # taskFilter
* Filter used by the Tags field to show tasks related to the selected grants.
* @param {Array} input List of tasks to filter.
* @param {Array} list List of selected grants.
*/
.filter('taskFilter', function() {
  return function(input, list) {
    // If no selected grants, return the list unfiltered.
    if(list == undefined){
      return input;
    }

    var output=[];
    angular.forEach(input,function(val){
      if (list.indexOf(val.grant)>-1){
        output.push(val);
      }
    })
    return output;
  }
})

/**
* @ngdoc directive
* @name proposalReviewApp.directive:relatedProjectPicker
* @description
* # relatedProjectPicker
* Directive managing the selection of one or more related projects for the
* .definitions page.
*/
.directive('relatedProjectPicker', function () {
  return {
    scope: true,
    templateUrl: 'views/proposal/relatedProjectPicker.html',
    link: function postLink(scope) {
      // Verify that the JSON part exists.
      if (!scope.record.relatedProjects) {
        scope.record.relatedProjects = [];
      }

      angular.forEach(scope.record.relatedProjects,function(val){
        val.startDate = new Date(val.startDate);
        val.endDate = new Date(val.endDate);
      });

      /**
      * @ngdoc function
      * @name deleteProject
      * @description
      * # deleteProject
      * Delete the specified project references.
      * If it is the only project, reset its references.
      * @param {Object} item The project to delete.
      */
      scope.deleteProject = function (item) {
        resetBubble();
        // If only one project, reset it instead of deleting.
        if (scope.record.relatedProjects.length < 1) {
          scope.record.relatedProjects = [];
          return;
        }
        var index = scope.record.relatedProjects.indexOf(item);
        scope.record.relatedProjects.splice(index, 1);

      };

      /**
      * @ngdoc function
      * @name addProject
      * @description
      * # addProject
      * Add an additional form for a related project.
      */
      scope.addProject = function () {
        scope.record.relatedProjects.push({'name': '', 'startDate': '', 'endDate': '', 'description': '','open':true});
      };
    }
  };
})


/**
* @ngdoc directive
* @name proposalReviewApp.directive:shortDeliverablePicker
* @description
* # shortDeliverablePicker
* Directive managing the selection of one or more deliverables for the
* .definitions page.
*/
.directive('shortDeliverablePicker', function () {
  return {
    scope: true,
    templateUrl: 'views/proposal/shortDeliverablePicker.html',
    link: function postLink(scope) {
      // Verify that the JSON part exists.
      if (!scope.record.shortDeliverable) {
        scope.record.shortDeliverable = [];
      }

      angular.forEach(scope.record.shortDeliverable,function(val){
        val.deliveryDate = new Date(val.deliveryDate);
      });

      /**
      * @ngdoc function
      * @name deleteDeliverable
      * @description
      * # deleteDeliverable
      * Delete the specified deliverable.
      * @param {Object} item The deliverable to delete.
      */
      scope.deleteDeliverable = function (item) {
        resetBubble();
        if (scope.record.shortDeliverable.length < 1) {
          scope.record.shortDeliverable = [];
          return;
        }
        var index = scope.record.shortDeliverable.indexOf(item);
        scope.record.shortDeliverable.splice(index, 1);

      };

      /**
      * @ngdoc function
      * @name addProject
      * @description
      * # addProject
      * Add an additional form for a deliverable.
      */
      scope.addDeliverable = function () {
        scope.record.shortDeliverable.push({'name': '', 'deliveryDate': '', 'description': '','pm':'','open':true});
      };
    }
  };
});
