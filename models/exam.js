var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var examSchema = new Schema({
    stringA : String,
    stringB : String
});

module.exports = mongoose.model('exam', examSchema);