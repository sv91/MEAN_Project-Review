// Set up ======================================================================
var express         = require('express');
var app             = express();
var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');

// Configuration ===============================================================
mongoose.connect('mongodb://localhost:27017/proposaldb');

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended':'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

// Defining models =============================================================

  // Project -------------------------------------------------------------------
  var Project = mongoose.model('Project', {
    proposal  : { type: Schema.Types.ObjectId, ref: 'Proposal' },
    review    : { type: Schema.Types.ObjectId, ref: 'GeneralReview' }
  });

  // Proposal ------------------------------------------------------------------
  var Proposal = mongoose.model('Proposal', {
    author      : { type: Schema.Types.ObjectId, ref: 'Person' },
    subDate     : Date,
    submission  : { type: Schema.Types.ObjectId, ref: 'Submission' }
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
    pi                    : { type: Schema.Types.ObjectId, ref: 'Person' },
    copi                  : { type: Schema.Types.ObjectId, ref: 'Person' },
    members               : [{ type: Schema.Types.ObjectId, ref: 'Person' }],
    teams                 : [{ type: Schema.Types.ObjectId, ref: 'Team' }],
    tags                  : [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    relatedProjects       : [{ type: Schema.Types.ObjectId, ref: 'RelatedProject' }],
    shortDeliverable      : [{ type: Schema.Types.ObjectId, ref: 'ShortDeliverable' }],
    publications          : [{ type: Schema.Types.ObjectId, ref: 'Publication' }],
    grants                : [{ type: Schema.Types.ObjectId, ref: 'Grant' }],
    tasks                 : [{ type: Schema.Types.ObjectId, ref: 'Task' }],
    requirements          : [{ type: Schema.Types.ObjectId, ref: 'Requirement' }],
    deliverables          : [{ type: Schema.Types.ObjectId, ref: 'Deliverable' }],
  });

  // Person --------------------------------------------------------------------
  var Person = mongoose.model('Person', {
    id            : Number,
    updatedAt     : Date,
    username      : String,
    givenName     : String,
    familyName    : String,
    displayName   : String,
    title         : String,
    profile       : String,
    picture       : String,
    emails        : [{ type: Schema.Types.ObjectId, ref: 'Email' }],
    phones        : [{ type: Schema.Types.ObjectId, ref: 'Phone' }],
    institutions  : [{ type: Schema.Types.ObjectId, ref: 'Institution' }],
    ims           : [String]
  });

  // Email ---------------------------------------------------------------------
  var Email = mongoose.model('Email',{
    value     : String,
    primary   : Boolean,
    verified  : Boolean
  });

  // Phone ---------------------------------------------------------------------
  var Phone = mongoose.model('Phone', {
    value     : String,
    primary   : Boolean
  });

  // Institution ---------------------------------------------------------------
  var Institution = mongoose.model('Institution', {
    name          : String,
    department    : String,
    postalAdress  : String,
    title         : String,
    primary       : Boolean
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
    grant : { type: Schema.Types.ObjectId, ref: 'Grant' }
  });

  // Tag -----------------------------------------------------------------------
  var Tag = mongoose.model('Tag', {
    name  : String
  });

  // Requirement ---------------------------------------------------------------
  var Requirement = mongoose.model('Requirement', {
    title       : String,
    type        : String,
    requirement : String,
    feature     : String,
    input       : [{ type: Schema.Types.ObjectId, ref: 'Input' }],
    output      : [{ type: Schema.Types.ObjectId, ref: 'Output' }]
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
    dependency      : [{ type: Schema.Types.ObjectId, ref: 'Deliverable' }],
    requirements    : [{ type: Schema.Types.ObjectId, ref: 'Requirement' }],
    softdev         : [{ type: Schema.Types.ObjectId, ref: 'SoftDev' }],
    datatransfer    : [{ type: Schema.Types.ObjectId, ref: 'DataTransfer' }],
    collabs         : [{ type: Schema.Types.ObjectId, ref: 'Collab' }],
    virtualization  : [{ type: Schema.Types.ObjectId, ref: 'Virtualization' }],
    devenv          : [{ type: Schema.Types.ObjectId, ref: 'DevEnv' }],
    hpcRessource    : Boolean,
    cloudRessource  : Boolean,
    hpc             : [{ type: Schema.Types.ObjectId, ref:'Hpc'}],
    cloud           : [{ type: Schema.Types.ObjectId, ref:'Cloud'}],
    hardware        : [{ type: Schema.Types.ObjectId, ref:'Hardware'}],
    hr              : [{ type: Schema.Types.ObjectId, ref:'HumanRessource'}]
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

  // Collab --------------------------------------------------------------------
  var Collab = mongoose.model('Collab', {
    id      : Number,
    created : Date,
    edited  : Date,
    title   : String,
    content : String,
    private : Boolean,
    deleted : String
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
    type : { type: Schema.Types.ObjectId, ref: 'HpcType' },
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
    type : { type: Schema.Types.ObjectId, ref: 'CloudType' },
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
    role        : { type : Schema.Types.ObjectId, ref : 'Role' },
    pm          : { type : Number, min : 0 },
    description : String
  });

  // Role ----------------------------------------------------------------------
  var Role = mongoose.model('Role', {
    name  : String
  });

  // General Review ------------------------------------------------------------
  var GeneralReview = mongoose.model('GeneralReview', {
    grade : Number,
    reviews : [{ type: Schema.Types.ObjectId, ref: 'Review' }]
  });

  // Review --------------------------------------------------------------------
  var Review = mongoose.model('Review', {
    reviewer  : { type: Schema.Types.ObjectId, ref: 'Person' },
    comments  : [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    notes     : [{ type: Schema.Types.ObjectId, ref: 'Note' }]
  });

  // Comment -------------------------------------------------------------------
  var Comment = mongoose.model('Comment', {
    timestamp : Date,
    field     : String,
    value     : String
  });

  // Note -------------------------------------------------------------------
  var Note = mongoose.model('Note', {
    timestamp : Date,
    field     : String,
    value     : String
  });

// Routes ======================================================================

  // API -----------------------------------------------------------------------
    // Project .................................................................

    // Proposal ................................................................

    // Submission ..............................................................

    // Person ..................................................................

    // Email ...................................................................

    // Phone ...................................................................

    // Institution .............................................................

    // Team ....................................................................
    // Get all
    app.get('/api/teams', function(req, res){
      Team.find(function(err, team){
        if(err)
          res.send(err);
        res.json(team);
      });
    });

    // Create new Team
    app.post('/api/teams', function(req, res){
      Team.create({
        name        : req.body.name,
        shortName   : req.body.shortName,
        displayName : 'BBP Team: ' + req.body.shortName
      }, function(err,team){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Team.find(function(err, team){
          if(err)
            res.send(err);
          res.json(team);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/teams/:team_id/delete', function(req,res) {
      Team.remove({
        _id : req.params.team_id
      }, function(err, team) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Team.find(function(err, team){
          if(err)
            res.send(err);
          res.json(team);
        });
      });
    });

    // Related Project .........................................................

    // Short Deliverable .......................................................

    // Publication .............................................................

    // Grant ...................................................................
    // Get all
    app.get('/api/grants', function(req, res){
      Grant.find(function(err, grant){
        if(err)
          res.send(err);
        res.json(grant);
      });
    });

    // Create new Grant
    app.post('/api/grants', function(req, res){
      Grant.create({
        name  : req.body.name
      }, function(err,grant){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Grant.find(function(err, grant){
          if(err)
            res.send(err);
          res.json(grant);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/grants/:grant_id/delete', function(req,res) {
      Grant.remove({
        _id : req.params.grant_id
      }, function(err, grant) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Grant.find(function(err, grant){
          if(err)
            res.send(err);
          res.json(grant);
        });
      });
    });

    // Task ....................................................................
    // Get all
    app.get('/api/tasks', function(req, res){
      Task.find(function(err, task){
        if(err)
          res.send(err);
        res.json(task);
      });
    });

    // Create new Task
    app.post('/api/tasks', function(req, res){
      Task.create({
        name  : req.body.name,
        grant  : req.body.grant
      }, function(err,task){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Task.find(function(err, task){
          if(err)
            res.send(err);
          res.json(task);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/tasks/:task_id/delete', function(req,res) {
      Task.remove({
        _id : req.params.task_id
      }, function(err, task) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Task.find(function(err, task){
          if(err)
            res.send(err);
          res.json(task);
        });
      });
    });

    // Tag .....................................................................
    // Get all
    app.get('/api/tags', function(req, res){
      Tag.find(function(err, tag){
        if(err)
          res.send(err);
        res.json(tag);
      });
    });

    // Create new Tag
    app.post('/api/tags', function(req, res){
      Tag.create({
        name  : req.body.name
      }, function(err,tag){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Tag.find(function(err, tag){
          if(err)
            res.send(err);
          res.json(tag);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/tags/:tag_id/delete', function(req,res) {
      Tag.remove({
        _id : req.params.tag_id
      }, function(err, tag) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Tag.find(function(err, tag){
          if(err)
            res.send(err);
          res.json(tag);
        });
      });
    });

    // Requirement .............................................................

    // Input ...................................................................

    // Output ..................................................................

    // Deliverable .............................................................

    // Software Development ....................................................
    // Get all
    app.get('/api/softdevs', function(req, res){
      SoftDev.find(function(err, softdev){
        if(err)
          res.send(err);
        res.json(softdev);
      });
    });

    // Create new SoftDev
    app.post('/api/softdevs', function(req, res){
      SoftDev.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,softdev){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        SoftDev.find(function(err, softdev){
          if(err)
            res.send(err);
          res.json(softdev);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/softdevs/:softdev_id/delete', function(req,res) {
      SoftDev.remove({
        _id : req.params.softdev_id
      }, function(err, softdev) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        SoftDev.find(function(err, softdev){
          if(err)
            res.send(err);
          res.json(softdev);
        });
      });
    });

    // Data Transfer ...........................................................
    // Get all
    app.get('/api/datatransfers', function(req, res){
      DataTransfer.find(function(err, datatransfer){
        if(err)
          res.send(err);
        res.json(datatransfer);
      });
    });

    // Create new DataTransfer
    app.post('/api/datatransfers', function(req, res){
      DataTransfer.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,datatransfer){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        DataTransfer.find(function(err, datatransfer){
          if(err)
            res.send(err);
          res.json(datatransfer);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/datatransfers/:datatransfer_id/delete', function(req,res) {
      DataTransfer.remove({
        _id : req.params.datatransfer_id
      }, function(err, datatransfer) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        DataTransfer.find(function(err, datatransfer){
          if(err)
            res.send(err);
          res.json(datatransfer);
        });
      });
    });

    // Collab ..................................................................

    // Virtualization ..........................................................
    // Get all
    app.get('/api/virtualizations', function(req, res){
      Virtualization.find(function(err, virtualization){
        if(err)
          res.send(err);
        res.json(virtualization);
      });
    });

    // Create new Virtualization
    app.post('/api/virtualizations', function(req, res){
      Virtualization.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,virtualization){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Virtualization.find(function(err, virtualization){
          if(err)
            res.send(err);
          res.json(virtualization);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/virtualizations/:virtualization_id/delete', function(req,res) {
      Virtualization.remove({
        _id : req.params.virtualization_id
      }, function(err, virtualization) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Virtualization.find(function(err, virtualization){
          if(err)
            res.send(err);
          res.json(virtualization);
        });
      });
    });

    // Development Environment .................................................
    // Get all
    app.get('/api/devenvs', function(req, res){
      DevEnv.find(function(err, devenv){
        if(err)
          res.send(err);
        res.json(devenv);
      });
    });

    // Create new DevEnv
    app.post('/api/devenvs', function(req, res){
      DevEnv.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,devenv){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        DevEnv.find(function(err, devenv){
          if(err)
            res.send(err);
          res.json(devenv);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/devenvs/:devenv_id/delete', function(req,res) {
      DevEnv.remove({
        _id : req.params.devenv_id
      }, function(err, devenv) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        DevEnv.find(function(err, devenv){
          if(err)
            res.send(err);
          res.json(devenv);
        });
      });
    });

    // HPC Ressources ..........................................................

    // HPC Type ................................................................
    // Get all
    app.get('/api/hpctypes', function(req, res){
      HpcType.find(function(err, hpctype){
        if(err)
          res.send(err);
        res.json(hpctype);
      });
    });

    // Create new HpcType
    app.post('/api/hpctypes', function(req, res){
      HpcType.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,hpctype){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        HpcType.find(function(err, hpctype){
          if(err)
            res.send(err);
          res.json(hpctype);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/hpctypes/:hpctype_id/delete', function(req,res) {
      HpcType.remove({
        _id : req.params.hpctype_id
      }, function(err, hpctype) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        HpcType.find(function(err, hpctype){
          if(err)
            res.send(err);
          res.json(hpctype);
        });
      });
    });

    // Cloud Ressources ........................................................

    // Cloud Type ..............................................................
    // Get all
    app.get('/api/cloudtypes', function(req, res){
      CloudType.find(function(err, cloudtype){
        if(err)
          res.send(err);
        res.json(cloudtype);
      });
    });

    // Create new CloudType
    app.post('/api/cloudtypes', function(req, res){
      CloudType.create({
        name  : req.body.name,
        desc  : req.body.desc
      }, function(err,cloudtype){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        CloudType.find(function(err, cloudtype){
          if(err)
            res.send(err);
          res.json(cloudtype);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/cloudtypes/:cloudtype_id/delete', function(req,res) {
      CloudType.remove({
        _id : req.params.cloudtype_id
      }, function(err, cloudtype) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        CloudType.find(function(err, cloudtype){
          if(err)
            res.send(err);
          res.json(cloudtype);
        });
      });
    });

    // Hardware ................................................................

    // Human Ressources ........................................................

    // Role ....................................................................
    // Get all
    app.get('/api/roles', function(req, res){
      Role.find(function(err, role){
        if(err)
          res.send(err);
        res.json(role);
      });
    });

    // Create new Role
    app.post('/api/roles', function(req, res){
      Role.create({
        name  : req.body.name
      }, function(err,role){
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Role.find(function(err, role){
          if(err)
            res.send(err);
          res.json(role);
        });
      });
    });

    // Delete the specified element
    app.delete('/api/roles/:role_id/delete', function(req,res) {
      Role.remove({
        _id : req.params.role_id
      }, function(err, role) {
        if (err)
          res.send(err);
        // Return the whole list after creating new element
        Role.find(function(err, role){
          if(err)
            res.send(err);
          res.json(role);
        });
      });
    });

    // General Review ..........................................................

    // Review ..................................................................

    // Comment .................................................................

    // Note ....................................................................

  // Application ---------------------------------------------------------------
  app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); //load the single view file
  })
// Listen ======================================================================
app.listen(8080);
console.log("App listening on port 8080.");
