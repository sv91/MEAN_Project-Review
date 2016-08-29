'use strict';

/**
* @ngdoc overview
* @name jsApp
* @description
* # jsApp
*
* Main module of the application.
*/
angular
.module('proposalReviewApp', ['ui.router','ui.select','angular.filter','hbpCommon','bbpOidcClient','ui.bootstrap', 'ngStorage'])
.config(function ($stateProvider, $urlRouterProvider) {
	// link adresses to views and controllers
	$stateProvider
	.state('main', {
		templateUrl: 'views/main.html',
		controller: 'MainController'
	})
	.state('main.welcome', {
		url: '/',
		templateUrl: 'views/welcome.html'
	})

	// Database edit state
	.state('edit', {
		url: '/setup',
		templateUrl: 'views/edit.html',
		controller: 'EditController'
	})

	// Review App states
	.state('main.reviewApp', {
		templateUrl: 'views/review/form.html',
		controller:'reviewAppController'
	})
	.state('main.reviewApp.review', {
		url: '/review',
		templateUrl: 'views/review/review.html'
	})
	.state('main.reviewApp.reviewing', {
		url: '/review/:param',
		templateUrl: 'views/review/reviewing.html',
		controller:'ReviewerCtrl'
	})
	.state('main.reviewApp.proposal', {
		url: '/review/:param/proposal',
		templateUrl: 'views/review/proposal.html',
		controller:'ProposalCtrl'
	})
	.state('main.reviewApp.note', {
		url: '/review/:param/note',
		templateUrl: 'views/review/note.html'
	})
	.state('summary', {
		url: '/review/:param/summary',
		templateUrl: 'views/review/summary.html'
	})

	// Proposal App states
	.state('main.proposalApp', {
		url: '/proposal',
		templateUrl: 'views/proposal/form.html',
		controller:'proposalAppController'
	})
	.state('main.proposalApp.type', {
		url: '/type',
		templateUrl: 'views/proposal/type.html'
	})
	.state('main.proposalApp.members', {
		url: '/members',
		templateUrl: 'views/proposal/members.html',
		controller: 'MembersCtrl'
	})
	.state('main.proposalApp.summary', {
		url: '/summary',
		templateUrl: 'views/proposal/summary.html',
		controller: 'SummaryCtrl'
	})
	.state('main.proposalApp.requirements', {
		url: '/requirements',
		templateUrl: 'views/proposal/requirements.html',
		controller: 'RequirementsCtrl'
	})
	.state('main.proposalApp.deliverables', {
		url: '/deliverables',
		templateUrl: 'views/proposal/deliverables.html',
		controller: 'DeliverablesCtrl'
	})
	.state('main.proposalApp.review', {
		url: '/review',
		templateUrl: 'views/proposal/review.html',
		controller: 'ReviewCtrl'
	})
	.state('main.proposalApp.help', {
		url: '/help',
		templateUrl: 'views/proposal/help.html'
	})
	.state('main.proposalApp.updates', {
		url: '/updates',
		templateUrl: 'views/proposal/updates.html'
	})
	.state('main.proposalApp.finalize', {
		url: '/finalize',
		templateUrl: 'views/proposal/finalize.html',
		controller: 'FinalizeCtrl'
	});

	$urlRouterProvider.otherwise('/');
})

.controller('reviewAppController', function ($scope, $http) {
	$scope.data= {};
	$scope.data.select = {};
	$scope.formData = {};

	// when landing on the page, get all the projects and show them
	$http.get('/api/projects')
	.success(function(data) {
		$scope.data.projects = data;
		console.log(data);
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});
})

.controller('MainController', function($scope) {
})

.controller('proposalAppController', function($scope, hbpCollabStore, $sessionStorage, $http, $state) {
	// we will store all of our form data in this object
	if($scope.record == undefined | $scope.record == null){
		console.log('scope');
		$scope.record = $sessionStorage;
		$scope.summ = {};
		$scope.faq = '';
		// value of current date
		$scope.today = new Date();

		$scope.membersAndLead = [];
		$scope.log = [];

		$scope.good = false;
		$scope.log=[];
		$scope.minDate = new Date();
		$scope.maxDate = new Date();
		$scope.toCompare = [];
	}

	// Check if all the required values were filled
	$scope.$watch('record', function(attrs) {
		var level = $scope.record.projectType;
		var temp = true;
		angular.forEach($scope.fields,function(elem){
			if( elem.required >= level ){
				var iter = $scope.record[elem.name];
				if(iter == undefined || iter == '' || iter == null){
					temp = false;
				}
			}
		})
		$scope.good = temp;
	}, true);

	// Activate or disactivate the submit button
	$scope.$watch('good', function() {
		var classes = 'finalN';
		if(!$scope.good){
			classes += ' disabled';
		}
		document.getElementById('final').className = classes;
	});


	// Change the minimum date of the projects depending on the type of projects
	$scope.$watchGroup(['record.projectType', 'record.projectStartDate'], function() {
		$scope.minDate= new Date();
		var numberOfDaysToAdd = 0;
		if($scope.record.projectType == 2){
			numberOfDaysToAdd = 365;
		}
		var dateTemp = new Date();
		if($scope.record.projectStartDate!=undefined ){
			dateTemp = $scope.record.projectStartDate;
		}
		$scope.minDate.setDate(dateTemp + numberOfDaysToAdd);
	});

	// Change the maximum date of the projects depending on the type of projects
	$scope.$watchGroup(['record.projectType', 'record.projectStartDate'], function() {
		$scope.maxDate= new Date();
		var numberOfDaysToAdd = 3650;
		if($scope.record.projectType == 0){
			numberOfDaysToAdd = 90;
		}
		if($scope.record.projectType == 1){
			numberOfDaysToAdd = 183;
		}
		var dateTemp = new Date();
		if($scope.record.projectStartDate!=undefined ){
			dateTemp = $scope.record.projectStartDate;
		};
		$scope.maxDate.setDate(dateTemp + numberOfDaysToAdd);
	});

	// Load the Collabs informations
	function loadCollabs() {
		hbpCollabStore.list().then(function(rs) {return rs.toArray();})
		.then(function(arr){
			$scope.availableCollab = arr;
		})
	}
	loadCollabs();

	// State order
	var stateTransition = [
		{'current':'type', 					'previous':'', 							'previousOpt':'', 						'next' : 'members', 			'nextOpt':''},
		{'current':'members', 			'previous':'type', 					'previousOpt':'', 						'next' : 'summary', 			'nextOpt':''},
		{'current':'summary', 			'previous':'members', 			'previousOpt':'', 						'next' : 'requirements',	'nextOpt':''},
		{'current':'requirements',	'previous':'summary', 			'previousOpt':'', 						'next' : 'deliverables', 	'nextOpt':'review'},
		{'current':'deliverables', 	'previous':'requirements',	'previousOpt':'', 						'next' : 'review', 				'nextOpt':''},
		{'current':'review', 				'previous':'deliverables', 	'previousOpt':'requirements',	'next' : '', 							'nextOpt':''},
		{'current':'help', 					'previous':'', 							'previousOpt':'', 						'next' : '', 							'nextOpt':''}
	];

	// Process to the next or previous step
	function changeState(direction){
		var stat = "main.proposalApp.";
		var toReturn = '';
		angular.forEach(stateTransition, function(val){
			if (stat.concat(val.current) == $state.current.name){
				var toState = '';
				var key = direction;
				if (($scope.record.projectType != undefined && $scope.record.projectType != null)& $scope.record.projectType<1){
					key += 'Opt';
					if (val[key] != ''){
						toState = val[key];
					} else {
						toState = val[direction];
					}
				} else {
					toState = val[direction];
				}
				toReturn = stat.concat(toState);
			}
		});
		return toReturn;
	};

// Go to the needed state
	function goToState(direction){
		var goTo = changeState(direction);
		if (goTo != undefined & goTo != null & goTo !='main.proposalApp.'){
			$state.go(goTo);
		}
	}

// Go to the next state
	$scope.nextStep = function(){
		goToState('next');
	};

// Go to the previous state
	$scope.previousStep = function(){
		goToState('previous');
	};

	// function to process the form
	$scope.processForm = function() {
		saveProject();
	};

	// Functions managing the creation of new entries in the DB ==================
	function findOrCreate(model, value){
		console.log('findOrCreate('+model+','+JSON.stringify(value)+')');
		var id = null;
		if (value != undefined){
		id = findId(model, value);
		if (id == undefined || id == null){
			id = createElem(model,value);
		}
		}
		console.log('Created Elem: '+model+' : ' + id);
		return id;
	};

	function findId(model,values){
		console.log('findId('+model+','+JSON.stringify(values)+')');
		var toReturn = null;
		$http.get('/api/'+ model)
		.success(function(data) {
			$scope.toCompare[model] = data;
			console.log('Found '+model+': '+ data);
		})
		.error(function(data) {
			console.log('Error finding '+ '/api/'+ model  +': ' + data);
		});
		angular.forEach($scope.toCompare[model], function(val){
			var id = 0;
			var good = true;
			var treatedValues = treatValue(model,val);
			angular.forEach(treatedValues, function(value,key){
				if(key == '_id'){
					id = value;
				} else if(key == '__v'){

				} else {
					console.log('Comparing values : ' + key + ':"'+value+'" and "'+values[key]+'"');
					good = good & (value == findId(key+'s',values[key]));
				}
			});
			if(good){
			console.log('Good');
				toReturn = id;
			}
		});
		return toReturn;
	};

	function treatValue(model, value) {
	console.log('Treating values');
		var treatedValues = {};
		switch(model) {
			case 'projects':
			treatedValues = treatProject(value);
			break;
			case 'proposals':
			treatedValues = treatProposal(value);
			break;
			case 'persons':
			treatedValues = treatPerson(value);
			break;
			case 'submissions':
			treatedValues = treatSubmission(value);
			break;
			case 'tags':
			treatedValues = treatTag(value);
			break;
			case 'requirements':
			treatedValues = treatRequirement(value);
			break;
			case 'inputs':
			treatedValues = treatInputOutput(value);
			break;
			case 'outputs':
			treatedValues = treatInputOutput(value);
			break;
			case 'deliverables':
			treatedValues = treatDeliverable(value);
			break;
			case 'hpcressources':
			treatedValues = treatHpcCloud(value);
			break;
			case 'cloudressources':
			treatedValues = treatHpcCloud(value);
			break;
			case 'hardwares':
			treatedValues = treatHardware(value);
			break;
			case 'humanressources':
			treatedValues = treatHr(value);
			break;
			default:
			treatedValues = value;
		}
		console.log("treatedValues "+JSON.stringify(treatedValues));
		return treatedValues;
	}

	function createElem(model, value) {
		console.log('createElem('+model+','+JSON.stringify(value)+')');
		var treatedValues = treatValue(model, value);
		var toReturn = null;
		if(treatedValues != '' & treatedValues != null  & treatedValues != {} ){
			toReturn = createInDB(model,treatedValues);
		}
		console.log('Created Elem: '+model+' : ' + toReturn);
		return toReturn;
	};

	function createInDB(model,value) {
		console.log('createInDB('+model+','+JSON.stringify(value)+')');
		var toReturn = null;
		$http.post('/api/'+model, value)
		.success(function(data){
			console.log('Created Creating: '+model+' : ' + JSON.stringify(data));
			toReturn = data;
		})
		.error(function(data) {
			console.log('Error Creating: ' + data);
		});
		return toReturn;
	};

	function saveProject(){
		console.log('saveProject');
		findOrCreate('projects',$scope.record);
	};

	function findOrCreateTable(model,value){
		console.log('findOrCreateTable('+model+','+JSON.stringify(value)+')');
		var temp = [];
		angular.forEach(value, function(val){
			temp.push(findOrCreate(model,val));
		});
		return temp;
	};

	function getIdTable(value){
		console.log('getIdTable('+JSON.stringify(value)+')');
		var temp = [];
		angular.forEach(value, function(val){
			temp.push(val._id);
		});
		return temp;
	};

	function treatProject(value){
		console.log('TreatingProject:' + value);
		var proposal = findOrCreate('proposals',value);
		var treatedValues = {
			'proposal'	: proposal,
			'review'		: null
		};
			console.log('Treated:' + value);
		return treatedValues;
	};

	function treatProposal(value){
		var treatedValues = {
			'subdate'			: $scope.today,
			'author'			: findOrCreate('persons',value.pi),
			'submission'	: findOrCreate('submissions',value)
		};
		return treatedValues;
	};

	function treatSubmission(value){
		var teams 	= getIdTable(value.teams);
		var grants	= getIdTable(value.grants);
		var tasks 	= getIdTable(value.tasks);

		var members 					= findOrCreateTable('persons',value.members);
		var tags 							= findOrCreateTable('tags',value.tags);
		var relatedProjects 	= findOrCreateTable('relatedprojects',value.relatedProjects);
		var shortDeliverable	= findOrCreateTable('shortdeliverables',value.shortDeliverable);
		var publications 			= findOrCreateTable('publications',value.publications);
		var requirements 			= findOrCreateTable('requirements',value.requirements);
		var deliverables 			= findOrCreateTable('deliverables',value.deliverables);

		var treatedValues = {
			'projectStartDate'   		: value.projectStartDate,
			'projectEndDate'        : value.projectEndDate,
			'projectTitle'          : value.projectTitle,
			'executiveSummary'      : value.executiveSummary,
			'impactStatement'       : value.impactStatement,
			'benefitToCommunity'    : value.benefitToCommunity,
			'scientificSummary'     : value.scientificSummary,
			'technologicalSummary'  : value.technologicalSummary,
			'usecase'               : value.usecase,
			'newproject'            : value.newproject,
			'projectType'           : value.projectType,
			'pi'                    : findOrCreate('persons',value.pi),
			'copi'                  : findOrCreate('persons',value.copi),
			'members'               : members,
			'teams'                 : teams,
			'tags'                  : tags,
			'relatedProjects'       : relatedProjects,
			'shortDeliverable'      : shortDeliverable,
			'publications'          : publications,
			'grants'                : grants,
			'tasks'                 : tasks,
			'requirements'          : requirements,
			'deliverables' 					: deliverables
		};

		return treatedValues;
	};

	function treatPerson(value){
		var treatedValues = {};
		if(value != undefined){
			treatedValues = {
				'id'					: value.id,
				'displayName'	: value.displayName
			};
		}

		return treatedValues;
	};

	function treatTag(value){
		var treatedValues = {};
		if(value._id != undefined){
			treatedValues = value;
		} else {
			treatedValues = {
				'name'	: value,
				'use' 	: 1
			}
		}

		return treatedValues;
	};

	function treatRequirement(value){
		var inputs 	= findOrCreateTable('persons',value.input);
		var outputs	= findOrCreateTable('persons',value.output);

		var treatedValues = {
			'title'       : value.title,
			'type'        : value.type._id,
			'requirement' : value.requirement,
			'feature'     : value.feature,
			'input'       : inputs,
			'output'      : outputs
		};

		return treatedValues;
	};

	function treatInputOutput(value){
		var treatedValues = {
			'tag'     : value.tag,
			'format'  : value.format,
			'number'  : value.number,
			'size'    : value.size
		};

		return treatedValues;
	};

	function treatDeliverable(value){
		var softdev 				= getIdTable(value.softdev);
		var datatransfer 		= getIdTable(value.datatransfer);
		var virtualization	= getIdTable(value.virtualization);
		var devenv 					= getIdTable(value.devenv);

		var dependencies	= findOrCreateTable('deliverables',value.dependency);
		var requirements 	= findOrCreateTable('requirements',value.requirement);
		var hpc 					= findOrCreateTable('hpcressources',value.hpc);
		var cloud 				= findOrCreateTable('deliverables',value.cloud);
		var hardware 			= findOrCreateTable('hardwares',value.hardware);
		var hr 						= findOrCreateTable('humanressources',value.members);

		var collabs = [];
		angular.forEach(value.collabs,function(val){
			collabs.push(val.id);
		});

		var treatedValues = {
			'name'            : value.name,
			'date'            : value.date,
			'description'     : value.description,
			'risks'           : value.risks,
			'dependency'      : dependencies,
			'requirements'    : requirements,
			'softdev'         : softdev,
			'datatransfer'    : datatransfer,
			'collabs'         : [String],
			'virtualization'  : virtualization,
			'devenv'          : devenv,
			'hpcRessource'    : value.hpcRessource,
			'cloudRessource'  : value.cloudRessource,
			'hpc'             : hpc,
			'cloud'           : cloud,
			'hardware'        : hardware,
			'hr'              : hr
		};

		return treatedValues;
	};

	function treatHpcCloud(value){
		var treatedValues = {
			'type' : value.type._id,
			'runs' : value.runs,
			'time' : value.time,
			'part' : value.part,
			'arte' : value.arte,
			'size' : value.size
		};

		return treatedValues;
	};

	function treatHardware(value){
		var treatedValues = {
			'name'        : value.name,
			'price'       : value.price,
			'link'        : value.link,
			'description' : value.description
		};

		return treatedValues;
	};

	function treatHr(value){
		console.log("Treating HR: "+JSON.stringify(value));

		var treatedValues = {
			'name'        : value.name,
			'role'        : value.role,
			'pm'          : value.pm,
			'description' : value.description
		};

		console.log("Treated HR: "+ JSON.stringify(treatedValues));
		return treatedValues;
	};

});
