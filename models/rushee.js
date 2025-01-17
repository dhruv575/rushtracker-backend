const mongoose = require('mongoose');
const { RUSHEE_STATUS } = require('./types');

// Schema for Notes
const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brother',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Schema for Vouches
const vouchSchema = new mongoose.Schema({
  brother: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brother',
    required: true
  },
  comment: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Main Rushee Schema
const rusheeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  fraternity: {
    type: mongoose.Schema.Types.ObjectId, // Reference to Fraternity
    ref: 'Fraternity',
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  major: {
    type: String,
    default: ''
  },
  tags: [String],
  year: {
    type: String,
    default: ''
  },
  gpa: {
    type: Number,
    default: null
  },
  picture: {
    type: String, // URL to stored image
    default: ''
  },
  resume: {
    type: String, // URL to stored resume
    default: ''
  },
  eventsAttended: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  rushCycle: {
    semester: {
      type: String,
      default: ''
    },
    year: {
      type: Number,
      default: null
    }
  },
  notes: [noteSchema],
  summary: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: Object.values(RUSHEE_STATUS),
    default: RUSHEE_STATUS.ACTIVE
  },
  vouches: [vouchSchema]
}, { timestamps: true });

// Adding compound index for unique constraint by email and fraternity
rusheeSchema.index({ email: 1, fraternity: 1 }, { unique: true });

module.exports = mongoose.model('Rushee', rusheeSchema);
