const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

let SequenceSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
let sequence = mongoose.model('sequence', SequenceSchema);

let IssueSchema = new Schema({
  seq: {
    type: Number
  },
  title: {
    type: String,
    required: true
  },
  contents: {
    type: String,
    required: true
  },
  solutions: {
    type: String
  },
  tags: [{
    type: String
  }],
  state: {
    type: String,
    default: 'secondary'
  },
  inputDt: {
    type: Date,
    default: Date.now
  }
});

IssueSchema.pre('save', function (next) {
  if (this.isNew) {
    let doc = this;
    sequence.findByIdAndUpdate({_id: 'issueSeq'}, { $inc: { seq: 1 } }, { upsert: true, new: true})
      .then(function (seqDoc) {
        doc.seq = seqDoc.seq;
        next();
      })
      .catch(function (err) {
        throw err;
      });
  } else {
    next();
  }
});

module.exports = mongoose.model('Issue', IssueSchema);
