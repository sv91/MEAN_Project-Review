// Set up ======================================================================
var express         = require('express');
var app             = express();
var mongoose        = require('mongoose');
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
    proposal  : { type: Schema.ObjectId, ref: 'Proposal' },
    review    : { type: Schema.ObjectId, ref: 'Review' }
  });

  // Proposal ------------------------------------------------------------------
  var Proposal = mongoose.model('Proposal', {
    author      : { type: Schema.ObjectId, ref: 'Person' },
    subDate     : Date,
    submission  : { type: Schema.ObjectId, ref: 'Submission' }
  });

  // Submission ----------------------------------------------------------------
  var Submission = mangoose.model('Submission', {
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
    pi                    : { type: Schema.ObjectId, ref: 'Person' },
    copi                  : { type: Schema.ObjectId, ref: 'Person' },
    members               : [{ type: Schema.ObjectId, ref: 'Person' }],
    teams                 : [{ type: Schema.ObjectId, ref: 'Team' }],
    tags                  : [{ type: Schema.ObjectId, ref: 'Tag' }],
    relatedProjects       : [{ type: Schema.ObjectId, ref: 'RelatedProject' }],
    shortDeliverable      : [{ type: Schema.ObjectId, ref: 'ShortDeliverable' }],
    publications          : [{ type: Schema.ObjectId, ref: 'Publication' }],
    grants                : [{ type: Schema.ObjectId, ref: 'Grant' }],
    tasks                 : [{ type: Schema.ObjectId, ref: 'Task' }],
    requirements          : [{ type: Schema.ObjectId, ref: 'Requirement' }],
    deliverables          : [{ type: Schema.ObjectId, ref: 'Deliverable' }],
  });

  // Person --------------------------------------------------------------------
  var Person = mongoose.model('Person', {
    id            : Number,
    updatedAt     : Date,
    username      : String,
    givenName     : String,
    familyName    : String,
    displayName   : String,
    title:        : String,
    profile       : String,
    picture       : String,
    emails        : [{ type: Schema.ObjectId, ref: 'Email' }],
    phones        : [{ type: Schema.ObjectId, ref: 'Phone' }],
    institutions  : [{ type: Schema.ObjectId, ref: 'Institution' }],
    ims           : [String]
  });

  // Email ---------------------------------------------------------------------
  var Email = mongoose.model('Email',{
    value     : String,
    primary   : Boolean,
    verified  : Boolean
  });

  // Phone ---------------------------------------------------------------------
  var Phone = mangoose.model('Phone', {
    value     : String,
    primary   : Boolean
  });

  // Institution ---------------------------------------------------------------
  var Institution = mangoose.model('Institution', {
    name          : String,
    department    : String,
    postalAdress  : String,
    title         : String,
    primary       : Boolean
  });

  // Team ----------------------------------------------------------------------
  var Team = mangoose.model('Team', {
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
    grant : { type: Schema.ObjectId, ref: 'Grant' }
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
    input       : [{ type: Schema.ObjectId, ref: 'Input' }],
    output      : [{ type: Schema.ObjectId, ref: 'Output' }]
  });

  // Input ---------------------------------------------------------------------
  var Input = mongoose.model('Input', {
    tag : String,
    format : String,
    number : { type: Number, min:0 },
    size : { type: Number, min:0 }
  });

  // Output --------------------------------------------------------------------
  var Output = mongoose.model('Output', {
    tag : String,
    format : String,
    number : { type: Number, min:0 },
    size : { type: Number, min:0 }
  });

  // Deliverable ---------------------------------------------------------------
  var Deliverable = mongoose.model('Deliverable', {
    name : String,
    date : Date,
    description : String,
    risks : String,
    dependency : [{ type: Schema.ObjectId, ref:'Deliverable'}],
    requirements : [{ type: Schema.ObjectId, ref:'Requirement'}],
    softdev:[{ type: Schema.ObjectId, ref:'SoftDev'}],
    datatransfer:[{ type: Schema.ObjectId, ref:'DataTransfer'}],
    collabs:[{ type: Schema.ObjectId, ref:'Collab'}],
    virtualization:[{ type: Schema.ObjectId, ref:'Virtualization'}],
    devenv:[{ type: Schema.ObjectId, ref:'DevEnv'}],
    hpcRessource: Boolean,
    cloudRessource: Boolean,
    hpc:[{ type: Schema.ObjectId, ref:'Hpc'}],
    cloud:[{ type: Schema.ObjectId, ref:'Cloud'}],
    hardware:[{ type: Schema.ObjectId, ref:'Hadrware'}],
    hr:[{ type: Schema.ObjectId, ref:'HumanRessource'}]
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
  })
