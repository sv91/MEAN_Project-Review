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
		templateUrl: 'views/review/note.html',
		controller:'NoteCtrl'
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

.factory('sharedService', function($rootScope, $http){
	var sharedService = {};

		// Functions managing the creation of new entries in the DB ==================
		sharedService.saveProject = function(val){
			console.log('saveProject');
			sharedService.findOrCreate('projects',val)
			.then(function(res){
				console.log('Project Saved :' + res);
			}, function(){
				console.log('Project Not Saved');
			});
		};

		sharedService.findOrCreate = function(model, value){
			return new Promise(function (fulfill, reject){
				if (value != undefined && value != null && value != '' && value != {}){
					sharedService.treatSelect(model,value)
					.then(function(treated){
						sharedService.findId(model, treated)
						.then(function(res){
							// If we found an ID, return the ID.
							fulfill(res);
						},function(){
							// If not we create the element.
							sharedService.createElem(model, treated)
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

		sharedService.findId = function(model,values){
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

		sharedService.treatSelect = function(model,value) {
			return new Promise(function (fulfill, reject){
				switch(model) {
					case 'projects':
					sharedService.treatProject(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'proposals':
					sharedService.treatProposal(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'persons':
					sharedService.treatPerson(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'submissions':
					sharedService.treatSubmission(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'tags':
					sharedService.treatTag(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'requirements':
					sharedService.treatRequirement(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'inputs':
					sharedService.treatInputOutput(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'outputs':
					sharedService.treatInputOutput(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'deliverables':
					sharedService.treatDeliverable(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'hpcressources':
					sharedService.treatHpcCloud(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'cloudressources':
					sharedService.treatHpcCloud(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'hardwares':
					sharedService.treatHardware(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'humanressources':
					sharedService.treatHr(value).then(function(res){
						fulfill(res);
					});
					break;
					case 'reviews':
					sharedService.treatReview().then(function(res){
						fulfill(res);
					});
					break;
					default:
					sharedService.treatOther(value).then(function(res){
						fulfill(res);
					});
				}
			});
		};

		sharedService.createElem = function(model, value) {
			return new Promise(function (fulfill, reject){
				if(value != undefined && value != null && value != "" && value != {} ){
					sharedService.createInDB(model,value)
					.then(function(res){
						fulfill(res);
					});
				} else {
					console.log("Error: createElem: Element not created due to empty value.\nModel: "+model+"\nValue: "+ JSON.stringify(value));
					reject();
				}
			});
		}

		sharedService.createInDB = function(model,value) {
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


		sharedService.findOrCreateTable = function(model,value){
			return new Promise(function (fulfill, reject){
				if(value != undefined && value != "" && value != null && value != [])
				{
					Promise.all(value.map(function(val){
						return sharedService.findOrCreate(model, val);
					})).then(function(res){
						fulfill(res);
					});
				} else {
					fulfill([]);
				}
			});
		}

		sharedService.getIdTable = function(value){
			var temp = [];
			angular.forEach(value, function(val){
				temp.push(val._id);
			});
			return temp;
		};

		sharedService.treatReview = function(){
			return new Promise(function (fulfill, reject){
				var treatedValues = {
					'grade'		: null,
					'status'	: 'submitted',
					'comments'	: [],
					'notes'	: [],
				};
				fulfill(treatedValues);
			});
		}

		sharedService.treatProject = function(value){
			return new Promise(function (fulfill, reject){
				sharedService.findOrCreate('proposals',value)
				.then(function(res){
					var results = {};
					results.proposal = res;
					return results;
				})
				.then(function(res){
					return sharedService.findOrCreate('reviews',value)
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

		sharedService.treatProposal = function(value){
			return new Promise(function (fulfill, reject){
				sharedService.findOrCreate('persons',value.activeUser)
				.then(function(res){
					var results = {};
					results.persons = res;
					return results;
				})
				.then(function(res){
					return sharedService.findOrCreate('submissions',value)
					.then(function(res2){
						var results = res;
						results.submissions = res2;
						return results;
					})
				})
				.then(function(res){
					var treatedValues = {
						'subDate'			: new Date(),
						'author'			: res.persons,
						'submission'	: res.submissions
					};
					fulfill(treatedValues);
				});
			});
		}

		sharedService.treatSubmission = function(value){
			return new Promise(function (fulfill, reject){
				// Promises chain to get the needed information, each step get the new
				// values and stores them in an object passed to the next step.
				sharedService.findOrCreateTable('persons',value.members)
				.then(function(res){
					var results = {};
					results.members = res;
					return results;
				})
				.then(function(res){
					return sharedService.findOrCreateTable('tags',value.tags)
					.then(function(res2){
						var results = res;
						results.tags = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('relatedprojects',value.relatedProjects)
					.then(function(res2){
						var results = res;
						results.relatedProjects = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('shortdeliverables',value.shortDeliverable)
					.then(function(res2){
						var results = res;
						results.shortDeliverable = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('publications',value.publications)
					.then(function(res2){
						var results = res;
						results.publications = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('requirements',value.requirements)
					.then(function(res2){
						var results = res;
						results.requirements = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('deliverables',value.deliverables)
					.then(function(res2){
						var results = res;
						results.deliverables = res2;
						return results;
					})
				})
				.then(function(res){
					var results = res;
					results.teams 	= sharedService.getIdTable(value.teams);
					results.grants	= sharedService.getIdTable(value.grants);
					results.tasks 	= sharedService.getIdTable(value.tasks);
					return results;
				})
				.then(function(res){
					return sharedService.findOrCreate('persons',value.pi)
					.then(function(res2){
						var results = res;
						results.pi = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreate('persons',value.copi)
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

		sharedService.treatPerson = function(value){
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

		sharedService.treatTag = function(value){
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

		sharedService.treatRequirement = function(value){
			return new Promise(function (fulfill, reject){
				sharedService.findOrCreateTable('inputs',value.input)
				.then(function(res){
					var results = {};
					results.input = res;
					return results;
				})
				.then(function(res){
					return sharedService.findOrCreateTable('outputs',value.output)
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

		sharedService.treatInputOutput = function(value){
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

		sharedService.treatDeliverable = function(value){
			return new Promise(function (fulfill, reject){
				sharedService.findOrCreateTable('deliverables',value.dependency)
				.then(function(res){
					var results = {};
					results.dependency = res;
					return results;
				})
				.then(function(res){
					return sharedService.findOrCreateTable('requirements',value.requirement)
					.then(function(res2){
						var results = res;
						results.requirement = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('hpcressources',value.hpc)
					.then(function(res2){
						var results = res;
						results.hpc = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('cloudressources',value.cloud)
					.then(function(res2){
						var results = res;
						results.cloud = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('hardwares',value.hardware)
					.then(function(res2){
						var results = res;
						results.hardware = res2;
						return results;
					})
				})
				.then(function(res){
					return sharedService.findOrCreateTable('humanressources',value.members)
					.then(function(res2){
						var results = res;
						results.hr = res2;
						return results;
					})
				})
				.then(function(res){
					var results = res;
					results.softdev 				= sharedService.getIdTable(value.softdev);
					results.datatransfer 		= sharedService.getIdTable(value.datatransfer);
					results.virtualization	= sharedService.getIdTable(value.virtualization);
					results.devenv 					= sharedService.getIdTable(value.devenv);
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

		sharedService.treatHpcCloud = function(value){
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

		sharedService.treatHardware = function(value){
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

		sharedService.treatHr = function(value){
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

		sharedService.treatOther = function(value){
			return new Promise(function (fulfill, reject){
				var treatedValues = null;
				if(value != undefined && value!=null && value!=''){
					treatedValues = value
				}
				fulfill(treatedValues);
			});
		};

	return sharedService;
})

.controller('reviewAppController', function ($scope, $http, $sessionStorage, sharedService) {

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
	$http.get('/api/reviews')
	.success(function(data) {
		$scope.data.reviews = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Reviews could not be loaded.');
	});

	$http.get('/api/persons')
	.success(function(data) {
		$scope.persons = data;
	})
	.error(function(data) {
		console.log('Error: MainController: Persons could not be loaded.');
	});
	$scope.data.persons = $scope.persons;

	$scope.saveComment = function() {
		sharedService.findOrCreate('persons',$scope.activeUser)
		.then(function(res){
		var sub = {
			'reviewer' 	: res,
			'field' 		: $scope.bubble.field,
			'value'			: $scope.toSubmit.valueTA
		}
		$http.post('/api/comments', sub)
			.success(function(data){
				var comments = $scope.data.select.review.comments;
				comments.push(data);
				$http.post('/api/reviews/'+$scope.data.select.review._id+'/comments',comments)
					.success(function(){
						console.log("Review successfully updated.");
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
					})
					.error(function(data) {
						console.log('Error: Review Update ' + data);
					});
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
		});
	};

	$scope.saveNote = function() {
		sharedService.findOrCreate('persons',$scope.activeUser)
		.then(function(res){
		var sub = {
			'reviewer' 				: res,
			'bbpobjective'    : $scope.data.select.editedNote.bbpobjective,
			'contracted'      : $scope.data.select.editedNote.contracted,
			'impact'          : $scope.data.select.editedNote.impact,
			'criticality'     : $scope.data.select.editedNote.criticality,
			'clear'           : $scope.data.select.editedNote.clear,
			'meaningful'      : $scope.data.select.editedNote.meaningful,
			'achievable'      : $scope.data.select.editedNote.achievable,
			'reqclear'        : $scope.data.select.editedNote.reqclear,
			'skill'           : $scope.data.select.editedNote.skill,
			'trackrecord'     : $scope.data.select.editedNote.trackrecord,
			'funded'          : $scope.data.select.editedNote.funded,
			'human'           : $scope.data.select.editedNote.human,
			'computing'       : $scope.data.select.editedNote.computing,
			'humanpr'         : $scope.data.select.editedNote.humanpr,
			'computingpr'     : $scope.data.select.editedNote.computingpr,
			'risks'           : $scope.data.select.editedNote.risks,
			'total'           : $scope.data.select.editedNote.total,
			'recommandation'  : $scope.data.select.editedNote.recommandation,
			'comment'         : $scope.data.select.editedNote.comment
		}
		$http.post('/api/notes', sub)
			.success(function(data){
				var notes = $scope.data.select.review.notes;
				notes.push(data);
				$http.post('/api/reviews/'+$scope.data.select.review._id+'/notes',notes)
					.success(function(){
						console.log("Review successfully updated.");
					})
					.error(function(data) {
						console.log('Error: Review Update ' + data);
					});
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
		});
	};
})

.controller('MainController', function($scope, $http, sharedService, $sessionStorage) {
	if ($scope.data == undefined){
		$scope.data= $sessionStorage;
		$scope.data.select = {};
		$scope.formData = {};
	}
	$scope.data.select = {};
	$scope.toSubmit = {};
	$scope.toSubmit.valueTA = "";

	$scope.bubble = {
		'show'	: false,
		'title' : '',
		'text' 	: '',
		'field'	: ''
	};
	$scope.activeUser;

	function getActiveUser(){
		return new Promise(function(fulfill,reject){
			$http.get('https://services.humanbrainproject.eu/idm/v1/api/user/me')
			.success(function(data) {
				$scope.activeUser = data;
				fulfill(data);
			})
			.error(function(data) {
				console.log('Error: GetActiveUser: Information could not be retrieved.');
			})
		});
	}

	getActiveUser().then(function(res){
		sharedService.findOrCreate('persons',res)
		.then(function(res2){
			$scope.activeUser.db_id = res2;
		});
	});

	/**
	* @ngdoc function
	* @name updateBubble
	* @description
	* # updateBubble
	* Update the shown information in the bubble and its position.
	* Used by the Proposal part.
	* @param {String} html    The html code that will be in the bubble.
	*/
	$scope.updateBubble = function($event, html){
		$scope.bubble = {
			'show'	: true,
			'title' : '',
			'text' 	: '',
			'field'	: ''
		};
		$scope.toSubmit.valueTA = "";
		var refDiv = $event.currentTarget;
		var txt = html;
		if(html == undefined){
			$scope.bubble.text = '';
			$scope.bubble.field = refDiv.id;
			var label = refDiv.childNodes[1];
			if(label != null && label != undefined && label.tagName == "LABEL"){
				$scope.bubble.title = "on "+label.textContent;
			} else {
					$scope.bubble.title = "";
			}
		} else {
			$scope.bubble.text = txt;
		}
		angular.forEach($scope.data.select.comments, function(val){
			if(val.field == $scope.bubble.field && val.reviewer == $scope.activeUser.db_id){
      	$scope.toSubmit.valueTA = val.value;
		}
		});
		var containerRect = document.getElementById("form-views").getBoundingClientRect();
		var divRect = refDiv.getBoundingClientRect();
		var offset = divRect.top - containerRect.top;

		var div = document.getElementById('bubble');
		if(div.style.display=="none"){
			div.style.display="";
		}
		div.style.marginTop = offset + 'px';
	};

	/**
	* @ngdoc function
	* @name resetBubble
	* @description
	* # resetBubble
	* Hide the bubble.
	*/
	$scope.resetBubble = function(){
		$scope.bubble = {
			'show'	: false,
			'title' : '',
			'text' 	: '',
			'field'	: ''
		};
		$scope.toSubmit = "";
	};
})

.controller('proposalAppController', function($scope, hbpCollabStore, $sessionStorage, $http, $state, sharedService) {
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
	$scope.record.activeUser=$scope.activeUser;

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
		sharedService.saveProject($scope.record);
	};
});
