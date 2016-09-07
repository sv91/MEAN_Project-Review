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
.module('proposalReviewApp', ['ui.router','ui.select','angular.filter','hbpCommon','bbpOidcClient','ui.bootstrap', 'ngStorage', 'ngMaterial'])
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
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Projects could not be loaded.');
	});

	// when landing on the page, get all the projects and show them
	$http.get('/api/proposals')
	.success(function(data) {
		$scope.data.proposals = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Proposals could not be loaded.');
	});

	// when landing on the page, get all the projects and show them
	$http.get('/api/submissions')
	.success(function(data) {
		$scope.data.submissions = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Submissions could not be loaded.');
	});

	// when landing on the page, get all the projects and show them
	$http.get('/api/generalreviews')
	.success(function(data) {
		$scope.data.generalReviews = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: General Reviews could not be loaded.');
	});

	// when landing on the page, get all the projects and show them
	$http.get('/api/persons')
	.success(function(data) {
		$scope.data.persons = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Persons could not be loaded.');
	});
})

.controller('MainController', function($scope) {
})

.controller('proposalAppController', function($scope, hbpCollabStore, $sessionStorage, $http, $state, $q) {
	// we will store all of our form data in this object
	if($scope.record == undefined | $scope.record == null){
		$scope.record = $sessionStorage;
		$scope.summ = {};
		$scope.faq = '';
		// value of current date
		$scope.today = new Date();

		$scope.membersAndLead = [];

		$scope.good = false;
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
			dateTemp = new Date($scope.record.projectStartDate);
		}
		$scope.minDate.setDate(dateTemp.getDate() + numberOfDaysToAdd);
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
			dateTemp = new Date($scope.record.projectStartDate);
		};
		$scope.maxDate.setDate(dateTemp.getDate() + numberOfDaysToAdd);
	});

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
		return new Promise(function (fulfill, reject){
			if (value != undefined && value != null && value != '' && value != {}){
				treatSelect(model,value)
				.then(function(treated){
					findId(model, treated)
					.then(function(res){
						// If we found an ID, return the ID.
						fulfill(res);
					},function(){
						// If not we create the element.
						createElem(model, treated)
						.then(function(res){
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
				case 'generalreviews':
				treatReview().then(function(res){
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

	function treatReview(){
		return new Promise(function (fulfill, reject){
			var treatedValues = {
				'grade'		: null,
				'status'	: 'submitted',
				'reviews'	: []
			};
			fulfill(treatedValues);
		});
	}

	function treatProject(value){
		return new Promise(function (fulfill, reject){
			findOrCreate('proposals',value)
			.then(function(res){
				var results = {};
				results.proposal = res;
				return results;
			})
			.then(function(res){
				return findOrCreate('generalreviews',value)
				.then(function(res2){
					var results = res;
					results.review = res2;
					return results;
				})
			})
			.then(function(res){
				var treatedValues = {
					'proposal'	: res.proposal,
					'review'		: res.review
				};
				fulfill(treatedValues);
			});
		});
	}

	function treatProposal(value){
		return new Promise(function (fulfill, reject){
			findOrCreate('persons',value.pi)
			.then(function(res){
				var results = {};
				results.persons = res;
				return results;
			})
			.then(function(res){
				return findOrCreate('submissions',value)
				.then(function(res2){
					var results = res;
					results.submissions = res2;
					return results;
				})
			})
			.then(function(res){
				var treatedValues = {
					'subdate'			: new Date(),
					'author'			: res.persons,
					'submission'	: res.submissions
				};
				fulfill(treatedValues);
			});
		});
	}

	function treatSubmission(value){
		return new Promise(function (fulfill, reject){
			// Promises chain to get the needed information, each step get the new
			// values and stores them in an object passed to the next step.
			findOrCreateTable('persons',value.members)
			.then(function(res){
				var results = {};
				results.members = res;
				return results;
			})
			.then(function(res){
				return findOrCreateTable('tags',value.tags)
				.then(function(res2){
					var results = res;
					results.tags = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('relatedprojects',value.relatedProjects)
				.then(function(res2){
					var results = res;
					results.relatedProjects = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('shortdeliverables',value.shortDeliverable)
				.then(function(res2){
					var results = res;
					results.shortDeliverable = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('publications',value.publications)
				.then(function(res2){
					var results = res;
					results.publications = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('requirements',value.requirements)
				.then(function(res2){
					var results = res;
					results.requirements = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('deliverables',value.deliverables)
				.then(function(res2){
					var results = res;
					results.deliverables = res2;
					return results;
				})
			})
			.then(function(res){
				var results = res;
				results.teams 	= getIdTable(value.teams);
				results.grants	= getIdTable(value.grants);
				results.tasks 	= getIdTable(value.tasks);
				return results;
			})
			.then(function(res){
				return findOrCreate('persons',value.pi)
				.then(function(res2){
					var results = res;
					results.pi = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreate('persons',value.copi)
				.then(function(res2){
					var results = res;
					results.copi = res2;
					return results;
				})
			})
			.then(function(res){
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
					'pi'                    : res.pi,
					'copi'                  : res.copi,
					'members'               : res.members,
					'teams'                 : res.teams,
					'tags'                  : res.tags,
					'relatedProjects'       : res.relatedProjects,
					'shortDeliverable'      : res.shortDeliverable,
					'publications'          : res.publications,
					'grants'                : res.grants,
					'tasks'                 : res.tasks,
					'requirements'          : res.requirements,
					'deliverables' 					: res.deliverables
				};
				fulfill(treatedValues);
			});
		});
	}

	function treatPerson(value){
		return new Promise(function (fulfill, reject){
			console.log('Treating :'+ JSON.stringify(value));
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
		return new Promise(function (fulfill, reject){
			findOrCreateTable('inputs',value.input)
			.then(function(res){
				var results = {};
				results.input = res;
				return results;
			})
			.then(function(res){
				return findOrCreateTable('outputs',value.output)
				.then(function(res2){
					var results = res;
					results.output = res2;
					return results;
				})
			})
			.then(function(res){
				var treatedValues = {
					'title'       : value.title,
					'type'        : value.type._id,
					'requirement' : value.requirement,
					'feature'     : value.feature,
					'input'       : res.input,
					'output'      : res.output
				};
				fulfill(treatedValues);
			});
		});
	}

	function treatInputOutput(value){
		return new Promise(function (fulfill, reject){
			var treatedValues = null;
			if(value != undefined && value!=null && value!=''){
				treatedValues = {
					'tag'     : value.tag,
					'format'  : value.format,
					'number'  : value.number,
					'size'    : value.size
				};
			}
			fulfill(treatedValues);
		});
	};

	function treatDeliverable(value){
		return new Promise(function (fulfill, reject){
			findOrCreateTable('deliverables',value.dependency)
			.then(function(res){
				var results = {};
				results.dependency = res;
				return results;
			})
			.then(function(res){
				return findOrCreateTable('requirements',value.requirement)
				.then(function(res2){
					var results = res;
					results.requirement = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('hpcressources',value.hpc)
				.then(function(res2){
					var results = res;
					results.hpc = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('cloudressources',value.cloud)
				.then(function(res2){
					var results = res;
					results.cloud = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('hardwares',value.hardware)
				.then(function(res2){
					var results = res;
					results.hardware = res2;
					return results;
				})
			})
			.then(function(res){
				return findOrCreateTable('humanressources',value.members)
				.then(function(res2){
					var results = res;
					results.hr = res2;
					return results;
				})
			})
			.then(function(res){
				var results = res;
				results.softdev 				= getIdTable(value.softdev);
				results.datatransfer 		= getIdTable(value.datatransfer);
				results.virtualization	= getIdTable(value.virtualization);
				results.devenv 					= getIdTable(value.devenv);
				results.collabs					= [];
				angular.forEach(value.collabs,function(val){
					results.collabs.push(val.id);
				});
				return results;
			}).then(function(res){
				var treatedValues = {
					'name'            : value.name,
					'date'            : value.date,
					'description'     : value.description,
					'risks'           : value.risks,
					'dependency'      : res.dependency,
					'requirements'    : res.requirement,
					'softdev'         : res.softdev,
					'datatransfer'    : res.datatransfer,
					'collabs'         : res.collabs,
					'virtualization'  : res.virtualization,
					'devenv'          : res.devenv,
					'hpcRessource'    : value.hpcRessource,
					'cloudRessource'  : value.cloudRessource,
					'hpc'             : res.hpc,
					'cloud'           : res.cloud,
					'hardware'        : res.hardware,
					'hr'              : res.hr
				};
				fulfill(treatedValues);
			});
		});
	}

	function treatHpcCloud(value){
		return new Promise(function (fulfill, reject){
			var treatedValues = null;
			if(value != undefined && value!=null && value!=''){
				treatedValues = {
					'type' : value.type._id,
					'runs' : value.runs,
					'time' : value.time,
					'part' : value.part,
					'arte' : value.arte,
					'size' : value.size
				};
			}
			fulfill(treatedValues);
		});
	};

	function treatHardware(value){
		return new Promise(function (fulfill, reject){
			var treatedValues = null;
			if(value != undefined && value!=null && value!=''){
				treatedValues = {
					'name'        : value.name,
					'price'       : value.price,
					'link'        : value.link,
					'description' : value.description
				};
			}
			fulfill(treatedValues);
		});
	};

	function treatHr(value){
		return new Promise(function (fulfill, reject){
			var treatedValues = null;
			if(value != undefined && value!=null && value!=''){
				treatedValues = {
					'name'        : value.name,
					'role'        : value.role,
					'pm'          : value.pm,
					'description' : value.description
				};
			}
			fulfill(treatedValues);
		});
	};

	function treatOther(value){
		return new Promise(function (fulfill, reject){
			var treatedValues = null;
			if(value != undefined && value!=null && value!=''){
				treatedValues = value
			}
			fulfill(treatedValues);
		});
	};
});
