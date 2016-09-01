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

.controller('proposalAppController', function($scope, hbpCollabStore, $sessionStorage, $http, $state, $q) {
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
		$scope.created = {};
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
	function saveProject(){
		console.log('saveProject');
		findOrCreate('projects',$scope.record)
		.then(function(res){
			console.log('Project Saved :' + res);
		}, function(){
			console.log('Project Not Saved');
		});
	};

	function findOrCreate(model, value){
		console.log('IN: findOrCreate: Model: '+model+' Value:'+JSON.stringify(value));
		return new Promise(function (fulfill, reject){
			if (value != undefined && value != null && value != '' && value != {}){
				treatSelect(model,value)
				.then(function(treated){
					findId(model, treated)
					.then(function(res){
						console.log('ID_FOUND: Model: '+model+' Value:'+JSON.stringify(treated)+' ID:' +res);
						// If we found an ID, return the ID.
						fulfill(res);
					},function(){
						// If not we create the element.
						createElem(model, treated)
						.then(function(res){
							console.log('ID_CREATE: Model: '+model+' Value:'+JSON.stringify(treated)+' ID:' +res);
							//Return the ID of the created element if successful.
							fulfill(res);
						},function(){
							// Otherwise reject.
							console.log("Error: findOrCreate: \nElement not created:\nModel: "+ model+"\nValue: "+ JSON.stringify(treated));
							reject();
						});
					});
				});
			} else {
				// If the value is empty, return null.
				fulfill(null);
			}
		});
	}



function findId(model,values){
	return new Promise(function (fulfill, reject){
		$http.get('/api/'+ model)
		.success(function(res){
				var found = false;
				angular.forEach(res, function(val){
					var good = true;
					var id;
					angular.forEach(val,function(value,key){
						if(key == '_id'){
							id = value;
						} else if (key != '__v') {
							good = good & (value == values[key]);
						}
					});
					if(good){
						found = true;
						fulfill(id);
					}
				});
				if(!found){
					reject();
				}
			})
		.error(function() {
			console.log('Error: FindId: Table not found: '+model);
			reject();
		});
	});
}

function treatSelect(model,value) {
	return new Promise(function (fulfill, reject){
		switch(model) {
			case 'projects':
			treatProject(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'proposals':
			treatProposal(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'persons':
			treatPerson(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'submissions':
			treatSubmission(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'tags':
			treatTag(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'requirements':
			treatRequirement(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'inputs':
			treatInputOutput(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'outputs':
			treatInputOutput(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'deliverables':
			treatDeliverable(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'hpcressources':
			treatHpcCloud(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'cloudressources':
			treatHpcCloud(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'hardwares':
			treatHardware(value).then(function(res){
				fulfill(res);
			});
			break;
			case 'humanressources':
			treatHr(value).then(function(res){
				fulfill(res);
			});
			break;
			default:
			treatOther(value).then(function(res){
				fulfill(res);
			});
		}
	});
};

function createElem(model, value) {
	return new Promise(function (fulfill, reject){
		if(value != undefined && value != null && value != "" && value != {} ){
				createInDB(model,value)
				.then(function(res){
					fulfill(res);
				});
		} else {
			console.log("Error: createElem: Element not created due to empty value.\nModel: "+model+"\nValue: "+ JSON.stringify(value));
			reject();
		}
	});
}

function createInDB(model,value) {
	return new Promise(function (fulfill, reject){
		if(value != undefined && value != null && value != "" && value != {} ){
			$http.post('/api/'+model, value)
			.success(function(res){
				console.log('Created : '+model+' : ' + JSON.stringify(res));
				fulfill(res);
			})
			.error(function(data) {
				console.log("Error: createInDB: Element not created.\nModel: "+model+"\nValue: "+ JSON.stringify(value));
				reject();
			});
		} else {
			console.log("Error: createInDB: Element not created due to empty value.\nModel: "+model+"\nValue: "+ JSON.stringify(value));
			reject();
		}
	});
};


function findOrCreateTable(model,value){
	return new Promise(function (fulfill, reject){
		if(value != undefined && value != "" && value != null && value != [])
		{
			Promise.all(value.map(function(val){
			return findOrCreate(model, val);
		})).then(function(res){
			fulfill(res);
		});
	} else {
		fulfill([]);
	}
	});
}

function getIdTable(value){
	var temp = [];
	angular.forEach(value, function(val){
		temp.push(val._id);
	});
	return temp;
};

function treatProject(value){
	return new Promise(function (fulfill, reject){
		findOrCreate('proposals',value)
		.then(function(id){
			var treatedValues = {
				'proposal'	: id,
				'review'		: null
			};
			fulfill(treatedValues);
		});
	});
}

function treatProposal(value){
	return new Promise(function (fulfill, reject){
		var persons;
		var submissions;
		findOrCreate('persons',value.pi)
		.then(function(res){
			persons = res;
		})
		.then(findOrCreate('submissions',value)
		.then(function(res){
			submissions = res;
		})
		.then(function(){
			var treatedValues = {
				'subdate'			: $scope.today,
				'author'			: persons,
				'submission'	: submissions
			};
			fulfill(treatedValues);
		}));
	});
}

function treatSubmission(value){
	return new Promise(function (fulfill, reject){
		var teams;
		var grants;
		var tasks;
		var members;
		var tags;
		var relatedProjects;
		var shortDeliverable;
		var publications;
		var requirements;
		var deliverables;
		var pi;
		var copi;

		findOrCreateTable('persons',value.members)
		.then(function(res){
			members = res;
		})
		.then(findOrCreateTable('tags',value.tags)
		.then(function(res){
			tags = res;
		}))
		.then(findOrCreateTable('relatedprojects',value.relatedProjects)
		.then(function(res){
			relatedProjects = res;
		}))
		.then(findOrCreateTable('shortdeliverables',value.shortDeliverable)
		.then(function(res){
			shortDeliverable = res;
		}))
		.then(findOrCreateTable('publications',value.publications)
		.then(function(res){
			publications = res;
		}))
		.then(findOrCreateTable('requirements',value.requirements)
		.then(function(res){
			requirements = res;
		}))
		.then(findOrCreateTable('deliverables',value.deliverables)
		.then(function(res){
			deliverables = res;
		}))
		.then(function(){
			teams 	= getIdTable(value.teams);
			grants	= getIdTable(value.grants);
			tasks 	= getIdTable(value.tasks);
		})
		.then(findOrCreate('persons',value.pi)
		.then(function(res){
			pi = res;
		}))
		.then(findOrCreate('persons',value.copi)
		.then(function(res){
			copi = res;
		}))
		.then(function(){
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
			'pi'                    : pi,
			'copi'                  : copi,
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
			fulfill(treatedValues);
		});
	});
}

function treatPerson(value){
	return new Promise(function (fulfill, reject){
		var treatedValues = null;
		if(value != undefined && value!=null && value!=''){
			treatedValues = {
				'id'					: value.id,
				'displayName'	: value.displayName
			};
		}
		fulfill(treatedValues);
	});
}

function treatTag(value){
	return new Promise(function (fulfill, reject){
		var treatedValues = {};
		if(value._id != undefined){
			treatedValues = value;
		} else {
			treatedValues = {
				'name'	: value,
				'use' 	: 1
			}
		}
		fulfill(treatedValues);
	});
}

function treatRequirement(value){
	var inputs 	= findOrCreateTable('inputs',value.input);
	var outputs	= findOrCreateTable('outputs',value.output);
	findOrCreateTable('persons',value.input)
	.then(function(res){
		inputs = res;
	})
	.then(findOrCreateTable('tags',value.output)
	.then(function(res){
		outputs = res;
	})
	.then(function(){
		var treatedValues = {
			'title'       : value.title,
			'type'        : value.type._id,
			'requirement' : value.requirement,
			'feature'     : value.feature,
			'input'       : inputs,
			'output'      : outputs
		};
		fulfill(treatedValues);
	}));
	}

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
