// Load Package
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mongoose    = require('mongoose');
var path        = require('path');

// MongoDB
// var db = mongoose.connection;
// db.on('error', console.error);
// db.once('open', function(){
//     // CONNECTED TO MONGODB SERVER
//     console.log("Connected to mongod server");
// });

// mongoose.connect('mongodb://localhost/mongo_exam', {useNewUrlParser: true});

// Model
var examModel = require('./models/exam');

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('node_modules', express.static(path.join(__dirname + '/node_modules')))

// Port
var port = process.env.PORT || 8080;

// Router
// router = require('./routes')(app, examModel);
require('./routes/create.js')(app, examModel);
require('./routes/read.js')(app, examModel);
require('./routes/update.js')(app, examModel);
require('./routes/delete.js')(app, examModel);


// Run
var server = app.listen(22047, function(){
    console.log("Express server has started on port " + port)
});