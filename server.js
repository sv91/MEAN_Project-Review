// Set up ======================================================================
var express         = require('express');
var app             = express();
var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var nodemailer      = require('nodemailer');
var request         = require('request');

// Configuration ===============================================================
mongoose.connect('mongodb://localhost:27017/proposaldb');

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended':'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
  // create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://review.proposal.app%40gmail.com:Supp0rt123@smtp.gmail.com');

// Defining models =============================================================

  // Project -------------------------------------------------------------------
  var Project = mongoose.model('Project', {
    proposal  : { type: String, ref: 'Proposal' },
    review    : { type: String, ref: 'Review' }
  });

  // Proposal ------------------------------------------------------------------
  var Proposal = mongoose.model('Proposal', {
    author      : { type: String, ref: 'Person' },
    subDate     : Date,
    submission  : { type: String, ref: 'Submission' }
  });

  // Submission ----------------------------------------------------------------
  var Submission = mongoose.model('Submission', {
    projectStartDate      : Date,
    projectEndDate        : Date,
    projectTitle          : String,
    executiveSummary      : String,
    impactStatement       : String,
    benefitToCommunity    : String,
    scientificSummary     : String,
    technologicalSummary  : String,
    usecase               : String,
    newproject            : Boolean,
    projectType           : { type: Number, min: 0, max: 2 },
    pi                    : { type: String, ref: 'Person' },
    copi                  : { type: String, ref: 'Person' },
    members               : [{ type: String, ref: 'Person' }],
    teams                 : [{ type: String, ref: 'Team' }],
    tags                  : [{ type: String, ref: 'Tag' }],
    relatedProjects       : [{ type: String, ref: 'RelatedProject' }],
    shortDeliverable      : [{ type: String, ref: 'ShortDeliverable' }],
    publications          : [{ type: String, ref: 'Publication' }],
    grants                : [{ type: String, ref: 'Grant' }],
    tasks                 : [{ type: String, ref: 'Task' }],
    requirements          : [{ type: String, ref: 'Requirement' }],
    deliverables          : [{ type: String, ref: 'Deliverable' }],
  });

  // Person --------------------------------------------------------------------
  var Person = mongoose.model('Person', {
    id            : Number,
    displayName   : String,
    username      : String
  });

  // Team ----------------------------------------------------------------------
  var Team = mongoose.model('Team', {
    name        : String,
    shortName   : String,
    displayName : String
  });

  // Related Project -----------------------------------------------------------
  var RelatedProject = mongoose.model('RelatedProject', {
    name          : String,
    startDate     : Date,
    endDate       : Date,
    description   : String
  });

  // Short Deliverable ---------------------------------------------------------
  var ShortDeliverable = mongoose.model('ShortDeliverable', {
    name          : String,
    deliveryDate  : Date,
    pm            : { type: Number, min: 0 }
  });

  // Publication ---------------------------------------------------------------
  var Publication = mongoose.model('Publication', {
    name  : String,
    link  : String
  });

  // Grant ---------------------------------------------------------------------
  var Grant = mongoose.model('Grant', {
    name  : String
  });

  // Task ----------------------------------------------------------------------
  var Task = mongoose.model('Task', {
    name  : String,
    grant : { type: String, ref: 'Grant' }
  });

  // Tag -----------------------------------------------------------------------
  var Tag = mongoose.model('Tag', {
    name  : String,
    use   : { type: Number, min: 0 }
  });

  // Requirement ---------------------------------------------------------------
  var Requirement = mongoose.model('Requirement', {
    title       : String,
    type        : { type: String, ref: 'RequirementType' },
    requirement : String,
    feature     : String,
    input       : [{ type: String, ref: 'Input' }],
    output      : [{ type: String, ref: 'Output' }]
  });

  // RequirementType -----------------------------------------------------------
  var RequirementType = mongoose.model('RequirementType', {
    name  : String,
    desc  : String
  });

  // Input ---------------------------------------------------------------------
  var Input = mongoose.model('Input', {
    tag     : String,
    format  : String,
    number  : { type: Number, min:0 },
    size    : { type: Number, min:0 }
  });

  // Output --------------------------------------------------------------------
  var Output = mongoose.model('Output', {
    tag     : String,
    format  : String,
    number  : { type: Number, min:0 },
    size    : { type: Number, min:0 }
  });

  // Deliverable ---------------------------------------------------------------
  var Deliverable = mongoose.model('Deliverable', {
    name            : String,
    date            : Date,
    description     : String,
    risks           : String,
    dependency      : [{ type: String, ref: 'Deliverable' }],
    requirements    : [{ type: String, ref: 'Requirement' }],
    softdev         : [{ type: String, ref: 'SoftDev' }],
    datatransfer    : [{ type: String, ref: 'DataTransfer' }],
    collabs         : [String],
    virtualization  : [{ type: String, ref: 'Virtualization' }],
    devenv          : [{ type: String, ref: 'DevEnv' }],
    hpcRessource    : Boolean,
    cloudRessource  : Boolean,
    hpc             : [{ type: String, ref:'Hpc'}],
    cloud           : [{ type: String, ref:'Cloud'}],
    hardware        : [{ type: String, ref:'Hardware'}],
    hr              : [{ type: String, ref:'HumanRessource'}]
  });

  // Software Development ------------------------------------------------------
  var SoftDev = mongoose.model('SoftDev', {
    name : String,
    desc : String
  });

  // Data Transfer -------------------------------------------------------------
  var DataTransfer = mongoose.model('DataTransfer', {
    name : String,
    desc : String
  });

  // Virtualization ------------------------------------------------------------
  var Virtualization = mongoose.model('Virtualization',{
    name : String,
    desc : String
  });

  // Development Environment ---------------------------------------------------
  var DevEnv = mongoose.model('DevEnv',{
    name : String,
    desc : String
  });

  // HPC Ressources ------------------------------------------------------------
  var Hpc = mongoose.model('Hpc', {
    type : { type: String, ref: 'HpcType' },
    runs : { type: Number, min: 0 },
    time : { type: Number, min: 0 },
    part : { type: Number, min: 0 },
    arte : { type: Number, min: 0 },
    size : { type: Number, min: 0 }
  });

  // HPC Type ------------------------------------------------------------------
  var HpcType = mongoose.model('HpcType', {
    name : String,
    desc : String
  });

  // Cloud Ressources ----------------------------------------------------------
  var Cloud = mongoose.model('Cloud', {
    type : { type: String, ref: 'CloudType' },
    runs : { type: Number, min: 0 },
    time : { type: Number, min: 0 },
    part : { type: Number, min: 0 },
    arte : { type: Number, min: 0 },
    size : { type: Number, min: 0 }
  });

  // Cloud Type ----------------------------------------------------------------
  var CloudType = mongoose.model('HCloudType', {
    name : String,
    desc : String
  });

  // Hardware ------------------------------------------------------------------
  var Hardware = mongoose.model('Hardware', {
    name        : String,
    price       : Number,
    link        : String,
    description : String
  });

  // Human Ressources ----------------------------------------------------------
  var HumanRessource = mongoose.model('HumanRessource', {
    name        : String,
    role        : { type : String, ref : 'Role' },
    pm          : { type : Number, min : 0 },
    description : String
  });

  // Role ----------------------------------------------------------------------
  var Role = mongoose.model('Role', {
    name  : String
  });

  // General Review ------------------------------------------------------------
  var Review = mongoose.model('Review', {
    grade   : Number,
    status  : String,
    comments  : [{ type: String, ref: 'Comment' }],
    notes     : [{ type: String, ref: 'Note' }]
  });

  // Comment -------------------------------------------------------------------
  var Comment = mongoose.model('Comment', {
    reviewer  : { type: String, ref: 'Person' },
    timestamp : Date,
    field     : String,
    value     : String
  });

  // Note -------------------------------------------------------------------
  var Note = mongoose.model('Note', {
    reviewer  : { type: String, ref: 'Person' },
    timestamp       : Date,
    bbpobjective    : Boolean,
    contracted      : Boolean,
    impact          : Number,
    criticality     : Number,
    clear           : Number,
    meaningful      : Number,
    achievable      : Number,
    reqclear        : Number,
    skill           : Number,
    trackrecord     : Number,
    funded          : Boolean,
    human           : Boolean,
    computing       : Boolean,
    humanpr         : String,
    computingpr     : String,
    risks           : Number,
    total           : Number,
    recommandation  : Number,
    comment         : String
  });

// Routes ======================================================================

  // API -----------------------------------------------------------------------
    // Needed functions ........................................................
    // HandleError
    // Manage what to do in case of errors.
    function HandleError(err, res){
      res.send(err);
    }

    // findAll
    // Get all the element from a model
    //    target : Model from where the data should be get.
    function findAll(res,target){
      target.find(function(err, tar){
        if(err)
          HandleError(err,res);
        res.json(tar);
      });
    };

    // findOne
    // Get one of the element from a model by getting the id through route params.
    //    target : Model from where the data should be get.
    function findOne(req,res,target){
      target.findOne({
        _id : req.params.target_id
      },function(err, tar){
        if(err)
          HandleError(err,res);
        res.json(tar);
      });
    };

    // deleteOne
    // Delete an element from a model by getting the id through route params.
    //    target : Model wher the element should be deleted.
    function deleteOne(req,res,target){
      target.remove({
        _id : req.params.target_id
      }, function(err, tar) {
        if (err)
          HandleError(err,res);
        res.json(tar);
      });
    };

    // Project .................................................................
    // Get all
    app.get('/api/projects', function(req, res){
      findAll(res, Project);
    });

    // Get one
    app.get('/api/projects/:target_id', function(req, res){
      findOne(req,res, Project);
    });

    // Create new Project
    app.post('/api/projects', function(req, res){
      Project.create({
        proposal  : req.body.proposal,
        review    : req.body.review,
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/projects/:target_id/delete', function(req,res) {
      deleteOne(req,res,Project);
    });

    // Proposal ................................................................
    // Get all
    app.get('/api/proposals', function(req, res){
      findAll(res, Proposal);
    });

    // Get one
    app.get('/api/proposals/:target_id', function(req, res){
      findOne(req,res, Proposal);
    });

    // Create new Proposal
    app.post('/api/proposals', function(req, res){
      Proposal.create({
        author      : req.body.author,
        subDate     : req.body.subDate,
        submission  : req.body.submission
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/proposals/:target_id/delete', function(req,res) {
      deleteOne(req,res,Proposal);
    });

    // Submission ..............................................................
    // Get all
    app.get('/api/submissions', function(req, res){
      findAll(res, Submission);
    });

    // Get one
    app.get('/api/submissions/:target_id', function(req, res){
      findOne(req,res, Submission);
    });

    // Create new Proposal
    app.post('/api/submissions', function(req, res){
      Submission.create({
        projectStartDate      : req.body.projectStartDate,
        projectEndDate        : req.body.projectEndDate,
        projectTitle          : req.body.projectTitle,
        executiveSummary      : req.body.executiveSummary,
        impactStatement       : req.body.impactStatement,
        benefitToCommunity    : req.body.benefitToCommunity,
        scientificSummary     : req.body.scientificSummary,
        technologicalSummary  : req.body.technologicalSummary,
        usecase               : req.body.usecase,
        newproject            : req.body.newproject,
        projectType           : req.body.projectType,
        pi                    : req.body.pi,
        copi                  : req.body.copi,
        members               : req.body.members,
        teams                 : req.body.teams,
        tags                  : req.body.tags,
        relatedProjects       : req.body.relatedProjects,
        shortDeliverable      : req.body.shortDeliverable,
        publications          : req.body.publications,
        grants                : req.body.grants,
        tasks                 : req.body.tasks,
        requirements          : req.body.requirements,
        deliverables          : req.body.deliverables
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/submissions/:target_id/delete', function(req,res) {
      deleteOne(req,res,Submission);
    });

    // Person ..................................................................
    // Get all
    app.get('/api/persons', function(req, res){
      findAll(res, Person);
    });

    // Get one
    app.get('/api/persons/:target_id', function(req, res){
      findOne(req,res, Person);
    });

    // Create new Person
    app.post('/api/persons', function(req, res){
      Person.create({
        id            : req.body.id,
        displayName   : req.body.displayName,
        username      : req.body.username
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/persons/:target_id/delete', function(req,res) {
      deleteOne(req,res,Person);
    });

    // Team ....................................................................
    // Get all
    app.get('/api/teams', function(req, res){
      findAll(res, Team);
    });

    // Get one
    app.get('/api/teams/:target_id', function(req, res){
      findOne(req,res, Team);
    });

    // Create new Team
    app.post('/api/teams', function(req, res){
      Team.create({
        name        : req.body.name,
        shortName   : req.body.shortName,
        displayName : 'BBP Team: ' + req.body.name
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/teams/:target_id/delete', function(req,res) {
      deleteOne(req,res,Team);
    });

    // Related Project .........................................................
    // Get all
    app.get('/api/relatedprojects', function(req, res){
      findAll(res, RelatedProject);
    });

    // Get one
    app.get('/api/relatedprojects/:target_id', function(req, res){
      findOne(req,res, RelatedProject);
    });

    // Create new Related Project
    app.post('/api/relatedprojects', function(req, res){
      RelatedProject.create({
        name          : req.body.name,
        startDate     : req.body.startDate,
        endDate       : req.body.endDate,
        description   : req.body.description
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/relatedprojects/:target_id/delete', function(req,res) {
      deleteOne(req,res,RelatedProject);
    });

    // Short Deliverable .......................................................
    // Get all
    app.get('/api/shortdeliverables', function(req, res){
      findAll(res, ShortDeliverable);
    });

    // Get one
    app.get('/api/shortdeliverables/:target_id', function(req, res){
      findOne(req,res, ShortDeliverable);
    });

    // Create new Short Deliverable
    app.post('/api/shortdeliverables', function(req, res){
      ShortDeliverable.create({
        name          : req.body.name,
        deliveryDate  : req.body.deliveryDate,
        pm            : req.body.pm
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/shortdeliverables/:target_id/delete', function(req,res) {
      deleteOne(req,res,ShortDeliverable);
    });

    // Publication .............................................................
    // Get all
    app.get('/api/publications', function(req, res){
      findAll(res, Publication);
    });

    // Get one
    app.get('/api/publications/:target_id', function(req, res){
      findOne(req,res, Publication);
    });

    // Create new Publication
    app.post('/api/publications', function(req, res){
      Publication.create({
        name  : req.body.name,
        link  : req.body.link
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/publications/:target_id/delete', function(req,res) {
      deleteOne(req,res,Publication);
    });

    // Grant ...................................................................
    // Get all
    app.get('/api/grants', function(req, res){
      findAll(res, Grant);
    });

    // Get one
    app.get('/api/grants/:target_id', function(req, res){
      findOne(req,res, Grant);
    });

    // Create new Grant
    app.post('/api/grants', function(req, res){
      Grant.create({
        name  : req.body.name
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/grants/:target_id/delete', function(req,res) {
      deleteOne(req,res,Grant)
    });

    // Task ....................................................................
    // Get all
    app.get('/api/tasks', function(req, res){
      findAll(res, Task);
    });

    // Get one
    app.get('/api/tasks/:target_id', function(req, res){
      findOne(req,res, Task);
    });

    // Create new Task
    app.post('/api/tasks', function(req, res){
      Task.create({
        name  : req.body.name,
        grant  : req.body.grant
      }, function(err,task){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/tasks/:target_id/delete', function(req,res) {
      deleteOne(req,res,Task);
    });

    // Tag .....................................................................
    // Get all
    app.get('/api/tags', function(req, res){
      findAll(res, Tag);
    });

    // Get one
    app.get('/api/tags/:target_id', function(req, res){
      findOne(req,res, Tag);
    });

    // Create new Tag
    app.post('/api/tags', function(req, res){
      Tag.create({
        name  : req.body.name,
        use   : 1
      }, function(err,tag){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/tags/:target_id/delete', function(req,res) {
      deleteOne(req,res,Tag);
    });

    // Requirement .............................................................
    // Get all
    app.get('/api/requirements', function(req, res){
      findAll(res, Requirement);
    });

    // Get one
    app.get('/api/requirements/:target_id', function(req, res){
      findOne(req,res, Requirement);
    });

    // Create new Requirement
    app.post('/api/requirements', function(req, res){
      Requirement.create({
        title       : req.body.title,
        type        : req.body.type,
        requirement : req.body.requirement,
        feature     : req.body.feature,
        input       : req.body.input,
        output      : req.body.output
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/requirements/:target_id/delete', function(req,res) {
      deleteOne(req,res,Requirement);
    });

    // RequirementType .............................................................
    // Get all
    app.get('/api/requirementtypes', function(req, res){
      findAll(res, RequirementType);
    });

    // Get one
    app.get('/api/requirementtypes/:target_id', function(req, res){
      findOne(req,res, RequirementType);
    });

    // Create new Requirement
    app.post('/api/requirementtypes', function(req, res){
      RequirementType.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/requirementtypes/:target_id/delete', function(req,res) {
      deleteOne(req,res,RequirementType);
    });

    // Input ...................................................................
    // Get all
    app.get('/api/inputs', function(req, res){
      findAll(res, Input);
    });

    // Get one
    app.get('/api/inputs/:target_id', function(req, res){
      findOne(req,res, Input);
    });

    // Create new Input
    app.post('/api/inputs', function(req, res){
      Input.create({
        tag     : req.body.tag,
        format  : req.body.format,
        number  : req.body.number,
        size    : req.body.size
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/inputs/:target_id/delete', function(req,res) {
      deleteOne(req,res,Input);
    });

    // Output ..................................................................
    // Get all
    app.get('/api/outputs', function(req, res){
      findAll(res, Output);
    });

    // Get one
    app.get('/api/outputs/:target_id', function(req, res){
      findOne(req,res, Output);
    });

    // Create new Output
    app.post('/api/outputs', function(req, res){
      Output.create({
        tag     : req.body.tag,
        format  : req.body.format,
        number  : req.body.number,
        size    : req.body.size
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/outputs/:target_id/delete', function(req,res) {
      deleteOne(req,res,Output);
    });

    // Deliverable .............................................................
    // Get all
    app.get('/api/deliverables', function(req, res){
      findAll(res, Deliverable);
    });

    // Get one
    app.get('/api/deliverables/:target_id', function(req, res){
      findOne(req,res, Deliverable);
    });

    // Create new Deliverable
    app.post('/api/deliverables', function(req, res){
      Deliverable.create({
        name            : req.body.name,
        date            : req.body.date,
        description     : req.body.description,
        risks           : req.body.risks,
        dependency      : req.body.dependency,
        requirements    : req.body.requirements,
        softdev         : req.body.softdev,
        datatransfer    : req.body.datatransfer,
        collabs         : req.body.collabs,
        virtualization  : req.body.virtualization,
        devenv          : req.body.devenv,
        hpcRessource    : req.body.hpcRessource,
        cloudRessource  : req.body.cloudRessource,
        hpc             : req.body.hpc,
        cloud           : req.body.cloud,
        hardware        : req.body.hardware,
        hr              : req.body.hr
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/deliverables/:target_id/delete', function(req,res) {
      deleteOne(req,res,Deliverable);
    });

    // Software Development ....................................................
    // Get all
    app.get('/api/softdevs', function(req, res){
      findAll(res,SoftDev);
    });

    // Get one
    app.get('/api/softdevs/:target_id', function(req, res){
      findOne(req,res, SoftDev);
    });

    // Create new SoftDev
    app.post('/api/softdevs', function(req, res){
      SoftDev.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/softdevs/:target_id/delete', function(req,res) {
      deleteOne(req,res,SoftDev);
    });

    // Data Transfer ...........................................................
    // Get all
    app.get('/api/datatransfers', function(req, res){
      findAll(res,DataTransfer);
    });

    // Get one
    app.get('/api/datatransfers/:target_id', function(req, res){
      findOne(req,res, DataTransfer);
    });

    // Create new DataTransfer
    app.post('/api/datatransfers', function(req, res){
      DataTransfer.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/datatransfers/:target_id/delete', function(req,res) {
      deleteOne(req,res,DataTransfer);
    });

    // Virtualization ..........................................................
    // Get all
    app.get('/api/virtualizations', function(req, res){
      findAll(res, Virtualization);
    });

    // Get one
    app.get('/api/virtualizations/:target_id', function(req, res){
      findOne(req,res, Virtualization);
    });

    // Create new Virtualization
    app.post('/api/virtualizations', function(req, res){
      Virtualization.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/virtualizations/:target_id/delete', function(req,res) {
      deleteOne(res, Virtualization);
    });

    // Development Environment .................................................
    // Get all
    app.get('/api/devenvs', function(req, res){
      findAll(res, DevEnv);
    });

    // Get one
    app.get('/api/devenvs/:target_id', function(req, res){
      findOne(req,res, DevEnv);
    });

    // Create new DevEnv
    app.post('/api/devenvs', function(req, res){
      DevEnv.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/devenvs/:target_id/delete', function(req,res) {
      deleteOne(res, DevEnv);
    });

    // HPC Ressources ..........................................................
    // Get all
    app.get('/api/hpcressources', function(req, res){
      findAll(res, Hpc);
    });

    // Get one
    app.get('/api/hpcressources/:target_id', function(req, res){
      findOne(req,res, Hpc);
    });

    // Create new HPC Ressource
    app.post('/api/hpcressources', function(req, res){
      Hpc.create({
        type : req.body.type,
        runs : req.body.runs,
        time : req.body.time,
        part : req.body.part,
        arte : req.body.arte,
        size : req.body.size
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/hpcressources/:target_id/delete', function(req,res) {
      deleteOne(req,res,Hpc);
    });

    // HPC Type ................................................................
    // Get all
    app.get('/api/hpctypes', function(req, res){
      findAll(res, HpcType);
    });

    // Get one
    app.get('/api/hpctypes/:target_id', function(req, res){
      findOne(req,res, HpcType);
    });

    // Create new HpcType
    app.post('/api/hpctypes', function(req, res){
      HpcType.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/hpctypes/:target_id/delete', function(req,res) {
      deleteOne(res, HpcType);
    });

    // Cloud Ressources ........................................................
    // Get all
    app.get('/api/cloudressources', function(req, res){
      findAll(res, Cloud);
    });

    // Get one
    app.get('/api/cloudressources/:target_id', function(req, res){
      findOne(req,res, Cloud);
    });

    // Create new Cloud Ressource
    app.post('/api/cloudressources', function(req, res){
      Cloud.create({
        type : req.body.type,
        runs : req.body.runs,
        time : req.body.time,
        part : req.body.part,
        arte : req.body.arte,
        size : req.body.size
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/cloudressources/:target_id/delete', function(req,res) {
      deleteOne(req,res,Cloud);
    });

    // Cloud Type ..............................................................
    // Get all
    app.get('/api/cloudtypes', function(req, res){
      findAll(res, CloudType);
    });

    // Get one
    app.get('/api/cloudtypes/:target_id', function(req, res){
      findOne(req,res, CloudType);
    });

    // Create new CloudType
    app.post('/api/cloudtypes', function(req, res){
      CloudType.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/cloudtypes/:target_id/delete', function(req,res) {
      deleteOne(res, CloudType);
    });

    // Hardware ................................................................
    // Get all
    app.get('/api/hardwares', function(req, res){
      findAll(res, Hardware);
    });

    // Get one
    app.get('/api/hardwares/:target_id', function(req, res){
      findOne(req,res, Hardware);
    });

    // Create new Hardware
    app.post('/api/hardwares', function(req, res){
      Hardware.create({
        name        : req.body.name,
        price       : req.body.price,
        link        : req.body.link,
        description : req.body.description
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/hardwares/:target_id/delete', function(req,res) {
      deleteOne(req,res,Hardware);
    });

    // Human Ressources ........................................................
    // Get all
    app.get('/api/humanressources', function(req, res){
      findAll(res, HumanRessource);
    });

    // Get one
    app.get('/api/humanressources/:target_id', function(req, res){
      findOne(req,res, HumanRessource);
    });

    // Create new HumanRessource
    app.post('/api/humanressources', function(req, res){
      HumanRessource.create({
        name        : req.body.name,
        role        : req.body.role,
        pm          : req.body.pm,
        description : req.body.description
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/humanressources/:target_id/delete', function(req,res) {
      deleteOne(req,res,HumanRessource);
    });

    // Role ....................................................................
    // Get all
    app.get('/api/roles', function(req, res){
      findAll(res, Role);
    });

    // Get one
    app.get('/api/roles/:target_id', function(req, res){
      findOne(req,res, Role);
    });

    // Create new Role
    app.post('/api/roles', function(req, res){
      Role.create({
        name  : req.body.name
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/roles/:target_id/delete', function(req,res) {
      delteOne(res, Role);
    });

    // Review ..................................................................
    // Get all
    app.get('/api/reviews', function(req, res){
      findAll(res, Review);
    });

    // Get one
    app.get('/api/reviews/:target_id', function(req, res){
      findOne(req,res, Review);
    });

    // Create new Cloud Ressource
    app.post('/api/reviews', function(req, res){
      Review.create({
        comments  : req.body.comments,
        notes     : req.body.notes,
        status    : 'submitted'
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    app.post('/api/reviews/:target_id/comments', function(req, res){
        Review.findOneAndUpdate({
          _id : req.params.target_id
        },{
            comments : req.body
        },function(err, tar){
          if(err)
            HandleError(err,res);
          res.json(tar);
        });
      });

    app.post('/api/reviews/:target_id/notes', function(req, res){
        Review.findOneAndUpdate({
          _id : req.params.target_id
        },{
            notes : req.body
        },function(err, tar){
          if(err)
            HandleError(err,res);
          res.json(tar);
        });
      });

    app.post('/api/reviews/:target_id/status', function(req, res){
        Review.findOneAndUpdate({
          _id : req.params.target_id
        },{
          status : req.body
        },function(err, tar){
          if(err)
            HandleError(err,res);
          res.json(tar);
        });
    });

    // Delete the specified element
    app.delete('/api/reviews/:target_id/delete', function(req,res) {
      deleteOne(req,res,Review);
    });

    // Comment .................................................................
    // Get all
    app.get('/api/comments', function(req, res){
      findAll(res, Comment);
    });

    // Get one
    app.get('/api/comments/:target_id', function(req, res){
      findOne(req,res, Comment);
    });

    // Create new Cloud Ressource
    app.post('/api/comments', function(req, res){
      Comment.create({
        reviewer  : req.body.reviewer,
        timestamp : new Date(),
        field     : req.body.field,
        value     : req.body.value
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/comments/:target_id/delete', function(req,res) {
      deleteOne(req,res,Comment);
    });

    // Note ....................................................................
    // Get all
    app.get('/api/notes', function(req, res){
      findAll(res, Note);
    });

    // Get one
    app.get('/api/notes/:target_id', function(req, res){
      findOne(req,res, Note);
    });

    // Create new Note
    app.post('/api/notes', function(req, res){
      Note.create({
        reviewer        : req.body.reviewer,
        timestamp       : new Date(),
        bbpobjective    : req.body.bbpobjective,
        contracted      : req.body.contracted,
        impact          : req.body.impact,
        criticality     : req.body.criticality,
        clear           : req.body.clear,
        meaningful      : req.body.meaningful,
        achievable      : req.body.achievable,
        reqclear        : req.body.reqclear,
        skill           : req.body.skill,
        trackrecord     : req.body.trackrecord,
        funded          : req.body.funded,
        human           : req.body.human,
        humanpr         : req.body.humanpr,
        computing       : req.body.computing,
        computingpr     : req.body.computingpr,
        risks           : req.body.risks,
        total           : req.body.total,
        recommandation  : req.body.recommandation,
        comment         : req.body.comment
      }, function(err,project){
        if (err)
          HandleError(err,res);
        res.json(project._id);
      });
    });

    // Delete the specified element
    app.delete('/api/notes/:target_id/delete', function(req,res) {
      deleteOne(req,res,Note);
    });

  // Groups EPFL

  // Get group list ------------------------------------------------------------------
  app.get('/groups', function(req, res){
    request('https://bbp.epfl.ch/api/wallet/group/v1/', function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      res.send(body);
    });
  });

  // Create a group ------------------------------------------------------------------
  app.put('/groups', function(req, res){
    request({
      method: 'PUT',
      uri: 'https://bbp.epfl.ch/api/wallet/group/v1/bbp-dev-proj' + req.params.target_id
    }, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      res.json(body);
    });
  });

  // Add a member to a group ------------------------------------------------------------------
  app.put('/groups/:target_id', function(req, res){
    request({
      method: 'PUT',
      uri: 'https://bbp.epfl.ch/api/wallet/group/v1/bbp-dev-proj' + req.params.target_id + '/'+req.body.type+'/'+req.body.name
    }, function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      res.json(body);
    });
  });


  // Application ---------------------------------------------------------------
  app.get('*', function(req, res) {
    res.sendFile('./public/index.html'); //load the single view file
  });


  // Api send ------------------------------------------------------------------
  app.post('/api/email/submission', function(req,res){
    // setup e-mail data with unicode symbols
    var mailOptions = {
      to: 'alexander.vostriakov@epfl.ch', // list of receivers
      subject: req.body.title, // Subject line
      text: req.body.text, // plaintext body
      html: req.body.html
    };
    switch(req.body.to) {
    case 'onlyone':
        mailOptions.to = 'alexander.vostriakov@epfl.ch';
        break;
    case 'twotesting':
        mailOptions.to = 'alexander.vostriakov@epfl.ch, fabien.delalondre@epfl.ch';
        break;
    case 'reviewingteam':
        mailOptions.to = '';
        break;
    default:
        mailOptions.to = '';
    }


// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
  res.json("Good");
  });

// Listen ======================================================================
app.listen(63001);
console.log("App listening on port 63001.");
