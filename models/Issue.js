const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

let IssueSchema = new Schema({});

module.exports = mongoose.model('Issue', IssueSchema);
