'use strict';

/**
* @ngdoc overview
* @name proposalReviewApp
* @description
* # proposalReviewApp
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
	.state('main.reviewApp.accept', {
		url: '/review/:param/accept',
		templateUrl: 'views/review/accept.html',
		controller:'AcceptCtrl'
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

// Factory for the submitting of values to the database.
.factory('sharedService', function($rootScope, $http, $timeout, $window){
	var sharedService = {};
	/**
	* @ngdoc function
	* @name findByID
	* @description
	* # findByID
	* Look for an Object with a specified ID inside the provided Array.
	* @param {Array} list The array to check for the object.
	* @param {Object} obj The object ID.
	*/
	sharedService.findByID = function(list,obj){
		var toReturn;
		angular.forEach(list, function(val){
			if(val._id == obj){
				toReturn = val;
			}
		});
		return toReturn;
	}

	/**
	* @ngdoc function
	* @name findAllByID
	* @description
	* # findAllByID
	* Look for all the Objects corresponding to a list of IDs inside the provided Array.
	* @param {Array} list The array to check for the object.
	* @param {Array} arr  The array of IDs.
	*/
	sharedService.findAllByID = function(list,arr){
		var toReturn =[];
		angular.forEach(arr, function(obj){
			toReturn.push(sharedService.findByID(list,obj));
		});
		return toReturn;
	}

	sharedService.checkEPFLGroups = function(id){
		return new Promise(function (fulfill, reject){
		$http.get("/groups/"+id)
    .success(function(res){
      console.log(JSON.stringify(res));
			if(res.data == [] | res.data == undefined | res.data == "" ){
				fulfill(sharedService.checkEPFLGroups(id+1));
			} else {
				fulfill(id);
			}
    })
    .error(function() {
      console.log('Error: Loading groups at group '+id);
    });
	});
	}

	/**
	* @ngdoc function
	* @name getById
	* @description
	* # getById
	* Fetch an Object of a certain type and ID from the corresponding table.
	* @param {Object} val The ID of the object.
	* @param {Object} type  The type of object.
	*/
	sharedService.getById = function(val,type){
		return new Promise(function (fulfill, reject){
			if(typeof val == "object"){
				fulfill();
			} else {
				$http.get('/api/'+type+'/'+val)
				.success(function(data) {
					fulfill(data);
				})
				.error(function(data) {
					console.log('Error: findAllByID: Values could not be loaded.');
					reject(data);
				});
			}
		});
	}

	/**
	* @ngdoc function
	* @name getAllByID
	* @description
	* # getAllByID
	* Fetch a set of Objects of a certain type from the corresponding table.
	* @param {Array} list The list of object IDs.
	* @param {Object} type The type of object.
	*/
	sharedService.getAllByID = function(list,type){
		return new Promise(function (fulfill, reject){
			if(list != undefined && list != "" && list != null && list != [])
			{
				// Checking if the list is an array or a simple element.
				// If the later, call getById.
				if(list.constructor !== Array){
					return sharedService.getById(list,type)
					.then(function(res){
						fulfill(res);
					});
				} else {
					return Promise.all(list.map(function(val){
						return sharedService.getById(val,type);
					})).then(function(res){
						console.log("Found "+JSON.stringify(res));
						fulfill(res);
					});
				}
			} else {
				fulfill({});
			}
		});
	}

	/**
	* @ngdoc function
	* @name getAllChildById
	* @description
	* # getAllChildById
	* Get a set of IDs from a sub-element of an Object and fetch the associated
	* Objects from the corresponding table.
	* @param {Array} list The list of object IDs.
	* @param {Object} child The name of the sub-element.
	* @param {Object} type The type of object.
	*/
	sharedService.getAllChildById = function(list,child,type){
		return new Promise(function (fulfill, reject){
			if(list != undefined && list != "" && list != null && list != [] && list != {} && list.constructor === Array)
			{
				return Promise.all(list.map(function(val){
					sharedService.getAllByID(val[child],type).then(function(res){
						val[child] = res;
					});
				})).then(function(res){
					fulfill(res);
				});
			} else {
				fulfill([]);
			}
		});
	}

	/**
	* @ngdoc function
	* @name getAllGrandChildById
	* @description
	* # getAllGrandChildById
	* Get a set of IDs from a sub-sub-element of an Object and fetch the associated
	* Objects from the corresponding table.
	* @param {Array} list The list of object IDs.
	* @param {Object} child The name of the sub-element.
	* @param {Object} grand The name of the sub-sub-element.
	* @param {Object} type The type of object.
	*/
	sharedService.getAllGrandChildById = function(list,child,grand,type){
		return new Promise(function (fulfill, reject){
			if(list != undefined && list != "" && list != null && list != [] && list != {} && list.constructor === Array)
			{
				return Promise.all(list.map(function(val){
					sharedService.getAllChildByID(val[child],grand,type);
				})).then(function(res){
					fulfill(res);
				});
			} else {
				fulfill([]);
			}
		});
	}


		/**
		* @ngdoc function
		* @name saveProject
		* @description
		* # saveProject
		* Save the project in the DB and signals it to the user.
		* @param {Object} val The project in JSON format.
		*/
		sharedService.saveProject = function(val){
			return new Promise(function (fulfill, reject){
			console.log('saveProject');
			sharedService.findOrCreate('projects',val)
			.then(function(res){
				console.log('Project Saved :' + res);
				$timeout(function(){
					$window.alert('Project Saved.');
				});
				fulfill(res);
			}, function(){
				$window.alert('Some Errors appeared. The project was not saved.');
				console.log('Project Not Saved');
				fulfill(false);
			});
		});
		};


		/**
		* @ngdoc function
		* @name findOrCreate
		* @description
		* # findOrCreate
		* Check if an element exists already in the DB and if not creates it.
		* @param {string} model The DB table to check.
		* @param {Object} val The element in JSON format.
		* @returns {int} The ID of the existing or created element.
		*/
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
							sharedService.createInDB(model, treated)
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


				/**
				* @ngdoc function
				* @name findId
				* @description
				* # findId
				* Check if an element exists already in the DB and if not creates it.
				* @param {string} model The DB table to check.
				* @param {Object} values The element in JSON format.
				* @returns {int} The ID of the existing or created element.
				*/
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


		/**
		* @ngdoc function
		* @name treatSelect
		* @description
		* # treatSelect
		* Call the right treatment method coresponding to the given DB table.
		* @param {string} model The DB table to check.
		* @param {Object} values The element in JSON format to be treated.
		* @returns {Promise} The promise of the values treated according to its model.
		*/
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


		/**
		* @ngdoc function
		* @name createInDB
		* @description
		* # createInDB
		* Create an element in a specified DB table with the provided values.
		* @param {string} model The DB table to check.
		* @param {Object} values The element in JSON format to be treated.
		* @returns {Promise} The promise of the ID of the newly created value in the DB.
		*/
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


		/**
		* @ngdoc function
		* @name findOrCreateTable
		* @description
		* # findOrCreateTable
		* Equivalent of findOrCreate but for multiple inputs.
		* Check for each of its input values if they exists in a provided DB table,
		* if not create it.
		* @param {string} model The DB table to check.
		* @param {Object} values The elements in JSON format to be treated.
		* @returns {Promise} The promise of an array of ID of the found or created elements.
		*/
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


		/**
		* @ngdoc function
		* @name getIdTable
		* @description
		* # getIdTable
		* Take an array of objects and returns and array of those objects IDs.
		* @param {Array} value The input array.
		* @returns {Array} IDs .
		*/
		sharedService.getIdTable = function(value){
			var temp = [];
			angular.forEach(value, function(val){
				temp.push(val._id);
			});
			return temp;
		};


		/**
		* @ngdoc function
		* @name treatReview
		* @description
		* # treatReview
		* Creates a Review object with default values.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatProject
		* @description
		* # treatProject
		* Treat the input values to correspond to the fields of the Project table in the DB..
		* @param {Object} value The values to adapt to the Project table.
		* @returns {Promise} Promise of the treated values.
		*/
		sharedService.treatProject = function(value){
			return new Promise(function (fulfill, reject){
				// Get the ID of the Proposal Object and of the Review Object.
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


		/**
		* @ngdoc function
		* @name treatProposal
		* @description
		* # treatProposal
		* Treat the input values to correspond to the fields of the Proposal table in the DB.
		* Get the ID of the submitter and of the submission and adds the current date.
		* @param {Object} value The values to adapt to the Proposal table.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatSubmission
		* @description
		* # treatSubmission
		* Treat the input values to correspond to the fields of the Submission table in the DB.
		* Get all the required values.
		* @param {Object} value The values to adapt to the Submission table.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatPerson
		* @description
		* # treatPerson
		* Treat the input values to correspond to the fields of the Person table in the DB.
		* @param {Object} value The values to adapt to the Person table.
		* @returns {Promise} Promise of the treated values.
		*/
		sharedService.treatPerson = function(value){
			return new Promise(function (fulfill, reject){
				var treatedValues = null;
				if(value != undefined && value!=null && value!=''){
					console.log("Treated :" +JSON.stringify(value));
					treatedValues = {
						'id'					: value.id,
						'displayName'	: value.displayName,
						'username'		: value.username
					};
						console.log("Treated :" +JSON.stringify(treatedValues));
				}
				fulfill(treatedValues);
			});
		}


		/**
		* @ngdoc function
		* @name treatTag
		* @description
		* # treatTag
		* Treat the input values to correspond to the fields of the Tag table in the DB.
		*	If no _id property is provided in the input (so for new tags), set the
		* field "use" to 1. It have been done in prevision of sorting tags by their use.
		* @param {Object} value The values to adapt to the Tag table.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatRequirement
		* @description
		* # treatRequirement
		* Treat the input values to correspond to the fields of the Requirement table in the DB.
		* @param {Object} value The values to adapt to the Requirement table.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatInputOutput
		* @description
		* # treatInputOutput
		* Treat the input values to correspond to the fields of the Input or Output tables in the DB.
		* @param {Object} value The values to adapt to the Input or Output tables.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatDeliverable
		* @description
		* # treatDeliverable
		* Treat the input values to correspond to the fields of the Deliverable table in the DB.
		* @param {Object} value The values to adapt to the Deliverable table.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatHpcCloud
		* @description
		* # treatHpcCloud
		* Treat the input values to correspond to the fields of the Hpc or Cloud tables in the DB.
		* @param {Object} value The values to adapt to the Project table.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatHardware
		* @description
		* # treatHardware
		* Treat the input values to correspond to the fields of the Hardware table in the DB.
		* @param {Object} value The values to adapt to the Hardware table.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatHr
		* @description
		* # treatHr
		* Treat the input values to correspond to the fields of the HumanRessources table in the DB.
		* @param {Object} value The values to adapt to the HumanRessources table.
		* @returns {Promise} Promise of the treated values.
		*/
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


		/**
		* @ngdoc function
		* @name treatOther
		* @description
		* # treatOther
		* Check if the input is not empty, if it is returns null.
		* @param {Object} value The values to check.
		* @returns {Promise} Promise of the treated values.
		*/
		sharedService.treatOther = function(value){
			return new Promise(function (fulfill, reject){
				var treatedValues = null;
				if(value != undefined && value!=null && value!=''){
					treatedValues = value
				}
				fulfill(treatedValues);
			});
		};

		/**
		* @ngdoc function
		* @name loadWholeProject
		* @description
		* # loadWholeProject
		* For each property of the project that is an ID, replace the ID by the actual Object.
		* @param {Object} value The values to check.
		*/
		sharedService.loadWholeProject = function(value){
		// For each property of the project that is an ID, replace the ID by the actual Object.
	  sharedService.getAllByID(value.teams,'teams')
	  .then(function(res){
	    value.teams = res;
	    return res
	  }).then(function(res){
	    return sharedService.getAllByID(value.tags,'tags').then(function(res){value.tags = res; return res});
	  }).then(function(res){
	    return sharedService.getAllByID(value.relatedProjects,'relatedprojects').then(function(res){value.relatedProjects = res; return res});
	  }).then(function(res){
	    return sharedService.getAllByID(value.shortDeliverable,'shortdeliverables').then(function(res){value.shortDeliverable = res; return res});
	  }).then(function(res){
	    return sharedService.getAllByID(value.publications,'publications').then(function(res){value.publications = res; return res});
	  }).then(function(res){
	    return sharedService.getAllByID(value.grants,'grants').then(function(res){value.grants = res; return res});
	  }).then(function(res){
	    return sharedService.getAllByID(value.tasks,'tasks').then(function(res){value.tasks = res; return res});
	  }).then(function(res){
	    return sharedService.getAllByID(value.requirements,'requirements').then(function(res){value.requirements = res; return res});
	  }).then(function(res){
	    return sharedService.getAllByID(value.deliverables,'deliverables').then(function(res){value.deliverables = res; return res});
	  }).then(function(res){
	    return sharedService.getAllChildById(value.requirements,'input','inputs');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.requirements,'output','outputs');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.requirements,'type','requirementtypes');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.tasks,'grant','grants');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'dependency','deliverables');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'requirements','requirements');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'softdev','softdevs');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'datatransfer','datatransfers');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'virtualization','virtualizations');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'devenv','devenvs');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'hpc','hpcressources');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'cloud','cloudressources');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'hardware','hardwares');
	  }).then(function(res){
	    return sharedService.getAllChildById(value.deliverables,'hr','humanressources');
	  }).then(function(res){
	    return sharedService.getAllGrandChildById(value.deliverables,'hpc','type','hpctypes');
	  }).then(function(res){
	    return sharedService.getAllGrandChildById(value.deliverables,'cloud','type','cloudtypes');
	  }).then(function(res){
	    return sharedService.getAllGrandChildById(value.deliverables,'hr','role','roles');
	  });
	};

	return sharedService;
})

/**
* @ngdoc function
* @name reviewAppController
* @description
* # reviewAppController
* Controller responsible for the whole Review part of the app.
*/
.controller('reviewAppController', function ($scope, $http, $sessionStorage, sharedService, $timeout, $window) {
	$scope.data.menu ={};
  $scope.data.menu.project = '';
  $scope.data.menu.notes = false;
  $scope.data.menu.comments = false;


	/**
	* @ngdoc function
	* @name goToMenu
	* @description
	* # goToMenu
	* Resets values and goes to the specified page.
	* @param {string} address The DB table to check.
	*/
	$scope.goToMenu = function(address, $window){
		$scope.data.menu.project = '';
	  $scope.data.menu.notes = false;
	  $scope.data.menu.comments = false;
	  var _open = window.open('/#/review'+address, "_self");
	}

	// when landing on the page, get all the projects and show them
	$http.get('/api/projects')
	.success(function(data) {
		$scope.data.projects = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Projects could not be loaded.');
	});

	// when landing on the page, get all the proposals and show them
	$http.get('/api/proposals')
	.success(function(data) {
		$scope.data.proposals = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Proposals could not be loaded.');
	});

	// when landing on the page, get all the submissions and show them
	$http.get('/api/submissions')
	.success(function(data) {
		$scope.data.submissions = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Submissions could not be loaded.');
	});

	// when landing on the page, get all the reviews and show them
	$http.get('/api/reviews')
	.success(function(data) {
		$scope.data.reviews = data;
	})
	.error(function(data) {
		console.log('Error: reviewAppController: Reviews could not be loaded.');
	});

	// when landing on the page, get all the persons and show them
	$http.get('/api/persons')
	.success(function(data) {
		$scope.persons = data;
		$scope.data.persons =data;
	})
	.error(function(data) {
		console.log('Error: MainController: Persons could not be loaded.');
	});


	/**
	* @ngdoc function
	* @name saveComment
	* @description
	* # saveComment
	* Save the current comment in the DB and updates the Review table.
	*/
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
								// Update the page with the new values
						    $scope.data.select.comments = [];
						    angular.forEach(data,function(val){
						      if($scope.data.select.review.comments.indexOf(val._id)>-1){
						        $scope.data.select.comments.push(val);
						      }
						    });
								var c = confirm("Your comment has been saved. \nDo you want to continue commenting the proposal?");
								if (c != true) {
									window.location.href = '/#/review/'+$scope.data.select.projectId;
								}
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


	/**
	* @ngdoc function
	* @name saveNote
	* @description
	* # saveNote
	* Save the current Note in the DB and updates the Review table.
	*/
	$scope.saveNote = function() {
		var c = confirm("Your notes will be saved and you will notbe able to change it. \nAre you sure you finished?");
		if (c == true) {
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
							$timeout(function(){
								$window.alert('Notes Saved.');
							});
							// Go back to the Review page of the current project.
							window.location.href = '/#/review/'+$scope.data.select.projectId;
						})
						.error(function(data) {
							console.log('Error: Review Update ' + data);
						});
				})
				.error(function(data) {
					console.log('Error: ' + data);
				});
			});
		}
	};
})

/**
* @ngdoc function
* @name MainController
* @description
* # MainController
* Main controller of the App.
*/
.controller('MainController', function($scope, $http, sharedService, $sessionStorage) {
	if ($scope.data == undefined){
		$scope.data = $sessionStorage;
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


	/**
	* @ngdoc function
	* @name getActiveUser
	* @description
	* # getActiveUser
	* Get the information of the current user of the app.
	* @returns {Promise} Promise of the information of the current user.
	*/
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

	// Get the ID of the actuveUser from the DB.
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
			if(label != null && label != undefined && (label.tagName == "LABEL" || label.tagName == "U")){
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
		$scope.toSubmit.valueTA = "";
	};
})

/**
* @ngdoc function
* @name proposalAppController
* @description
* # proposalAppController
* Controller responsible for the proposal part of the App.
*/
.controller('proposalAppController', function($scope, hbpCollabStore, $sessionStorage, $http, $state, sharedService) {
	// we will store all of our form data in this object
	if($scope.record == undefined | $scope.record == null){
		$scope.record = $sessionStorage;
		$scope.summ = {};
		$scope.faq = '';
		// value of current date
		$scope.today = new Date();

		$scope.membersAndLead = [];

		$scope.record.good = false;
		$scope.minDate = new Date();
		$scope.maxDate = new Date();
		$scope.created = {};
		$scope.record.good = false;
	}
	$scope.record.activeUser=$scope.activeUser;

	// Check if all the required values were filled
	$scope.$watch('record', function(attrs) {
		var classes = 'finalN';
		$scope.record.good = checkValues();
		if(!$scope.record.good){
			classes += ' notready';
			document.getElementById('final').href = "";
		} else {
		document.getElementById('final').href = '#/';
		}
		document.getElementById('final').className = classes;
	}, true);


	/**
	* @ngdoc function
	* @name checkValues
	* @description
	* # checkValues
	* Call the right treatment method coresponding to the chosen project type.
	*/
	function checkValues(){
		switch($scope.record.projectType){
			case '0':
				return checkBronze();
				break;
			case '1':
				return checkSilver();
				break;
			case '2':
				return checkGold();
				break;
			default:
				return false;
		}
	}


	/**
	* @ngdoc function
	* @name checkInput
	* @description
	* # checkInput
	* Check if the given value is part of a provided set of values.
	* @param {string} field The value to check.
	* @param {Array} acceptedValues The set of accepted values.
	*/
	function checkInput(field,acceptedValues){
		if(acceptedValues.indexOf(field)== -1){
			return false;
		}
		else {
			return true;
		}
	}


	/**
	* @ngdoc function
	* @name checkNotEmpty
	* @description
	* # checkNotEmpty
	* Check if a field is empty or part of a list of values to avoid.
	* @param {Object} field The field to check.
	* @param {Array} avoid The values to avoid.
	*/
	function checkNotEmpty(field,avoid){
		if (typeof field === 'undefined'){
			return false;
		}
		if (typeof avoid === 'undefined'){
			avoid = "";
		}
		if(typeof field != 'object' && field.toString().replace(" ","").length > 0){
			return true;
		} else if(typeof field == 'object'){
			var isGood = true;
			angular.forEach(field,function(val,key){
				if(avoid.indexOf(key)!=-1){
				}
				if(avoid.indexOf(key)==-1){
					isGood = isGood && checkNotEmpty(val,avoid);
				}
			});
			return isGood;
		} else {
			return false;
		}
	}


	/**
	* @ngdoc function
	* @name checkBasic
	* @description
	* # checkBasic
	* Default checks of the filling of the fields.
	* @returns {bool} Are the required fields properly filled.
	*/
	function checkBasic(){
		var pi = checkNotEmpty($scope.record.pi.displayName); // some fields from a person can be empty
		return checkInput($scope.record.bbpProject,['0','1']) &&
					 pi &&
					 checkInput($scope.record.newproject,['true','false']) &&
					 checkNotEmpty($scope.record.executiveSummary) &&
					 checkNotEmpty($scope.record.impactStatement) &&
					 checkNotEmpty($scope.record.projectTitle) &&
					 checkNotEmpty($scope.record.projectStartDate) &&
					 checkNotEmpty($scope.record.projectEndDate) &&
					 checkNotEmpty($scope.record.usecase);
	}


	/**
	* @ngdoc function
	* @name checkBasic
	* @description
	* # checkBasic
	* Checks of the filling of the fields corresponding to a Bronze proposal.
	* @returns {bool} Are the required fields properly filled.
	*/
	function checkBronze(){
		return checkBasic() && checkNotEmpty($scope.record.shortDeliverable) &&
					 checkNotEmpty($scope.record.requirements,["feature","input","output"]);
	}


	/**
	* @ngdoc function
	* @name checkBasic
	* @description
	* # checkBasic
	* Checks of the filling of the fields corresponding to a Silver proposal.
	* @returns {bool} Are the required fields properly filled.
	*/
	function checkSilver(){
		return checkBasic() &&
		       checkNotEmpty($scope.record.technologicalSummary) &&
			 		 checkNotEmpty($scope.record.deliverables,["hpc","cloud","requirement","dependency","hardware"]) &&
			 		 checkNotEmpty($scope.record.requirements);
	}


	/**
	* @ngdoc function
	* @name checkBasic
	* @description
	* # checkBasic
	* Checks of the filling of the fields corresponding to a Gold proposal.
	* @returns {bool} Are the required fields properly filled.
	*/
	function checkGold(){
		return checkBasic() &&
		       checkNotEmpty($scope.record.technologicalSummary) &&
			 		 checkNotEmpty($scope.record.benefitToCommunity) &&
					 checkNotEmpty($scope.record.scientificSummary) &&
			 		 checkNotEmpty($scope.record.deliverables,["hpc","cloud","requirement","dependency","hardware"]) &&
			 		 checkNotEmpty($scope.record.requirements);
	}

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


	/**
	* @ngdoc function
	* @name changeState
	* @description
	* # changeState
	* Return which states are previous or next.
	* @param {string} direction "previous" or "next".
	* @returns {string} values The state for the given direction.
	*/
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


	/**
	* @ngdoc function
	* @name goToState
	* @description
	* # goToState
	* Go to the next state in the provided direction.
	* @param {string} direction "previous" or "next".
	*/
	function goToState(direction){
		var goTo = changeState(direction);
		if (goTo != undefined & goTo != null & goTo !='main.proposalApp.'){
			$state.go(goTo);
		}
	}


	/**
	* @ngdoc function
	* @name nextStep
	* @description
	* # nextStep
	* Go to the next state forward.
	*/
	$scope.nextStep = function(){
		goToState('next');
	};


	/**
	* @ngdoc function
	* @name previousStep
	* @description
	* # previousStep
	* Go to the previous step.
	*/
	$scope.previousStep = function(){
		goToState('previous');
	};


	/**
	* @ngdoc function
	* @name sendEmail
	* @description
	* # sendEmail
	* Function to send email.
	* @param {string} project The project ID.
	*/
	function sendEmail(project){
    var val = {
			'to' : 'twotesting',
      'title' 	: "New submission",
      'text': "Dear Reviewer, \nA new proposal has been submitted by " + $scope.activeUser.displayName + ". \nYou can access it by clicking on the following link:\n<a href='http://bbpca031.epfl.ch:63001/#/review/"+project+"'>http://bbpca031.epfl.ch:63001/#/review/"+project+"</a>",
      'html': "Dear Reviewer,<br />A new proposal has been submitted by " + $scope.activeUser.displayName + ". <br />You can access it by clicking on the following link:\n<a href='http://bbpca031.epfl.ch:63001/#/review/"+project+"'>http://bbpca031.epfl.ch:63001/#/review/"+project+"</a>"
    };
    $http.post('/api/email/submission',val)
      .success(function(data) {
        console.log("Email send.");
      })
      .error(function(data) {
        console.log('Error: ' + data);
      });
  };



	/**
	* @ngdoc function
	* @name processForm
	* @description
	* # processForm
	* Save the proposal and send an email.
	*/
	$scope.processForm = function() {
		if($scope.record.good){
			sharedService.saveProject($scope.record)
		.then(function(res){
			//During test
			sendEmail(res);
			sessionStorage.clear();
			$scope.record = $sessionStorage;
		});
	}
	};
});
