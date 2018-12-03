const mongoose = require('mongoose'),
      Schema = mongoose.Schema;

let SequenceSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
let sequence = mongoose.model('sequence', SequenceSchema);

let GeoSchema = new Schema({
  _id: false,
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  },
  adress: {
    type: String,
    required: true
  }
});

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
  isAnswer: {
    type: Boolean,
    default: false
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
  },
  geoLocation: {
    type: GeoSchema
  }
});

IssueSchema.pre('save', function (next) {
  let doc = this;
  doc.isAnswer = (doc.solutions || '').length > 0 ? true : false;
  if (this.isNew) {
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
