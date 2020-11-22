// Load Package
var express     = require('express');
var cors        = require('cors');
var bodyParser  = require('body-parser');
var router = require('./routes/vegan');
var app         = express();

// Body Parser
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Port
var API_PORT = process.env.PORT || 8080;

// Router
app.use('/api', router);

// Run
app.listen(API_PORT, () => {
    console.log("Express server has started on port " + API_PORT)
});