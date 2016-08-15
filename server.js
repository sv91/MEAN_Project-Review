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
    tags                  : [String],
    projectType           : { type: Number, min: 0, max: 2 },
    pi                    : { type: Schema.ObjectId, ref: 'Person' },
    copi                  : { type: Schema.ObjectId, ref: 'Person' },
    members               : [{ type: Schema.ObjectId, ref: 'Person' }],
    teams                 : [{ type: Schema.ObjectId, ref: 'Team' }],
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
    emails        : [{ type: Schema.ObjectId, ref: 'Email'}],
    phones        : [{ type: Schema.ObjectId, ref: 'Phone'}],
    institutions  : [{ type: Schema.ObjectId, ref: 'Institution'}],
    ims           : [String]
  });
