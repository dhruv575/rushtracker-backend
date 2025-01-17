const mongoose = require('mongoose');
const { QUESTION_TYPES } = require('./types');

const formQuestionSchema = new mongoose.Schema({
  questionType: {
    type: String,
    enum: Object.values(QUESTION_TYPES),
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [String], // For multiple choice questions
  required: {
    type: Boolean,
    default: false
  }
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  fraternity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Frat',
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  location: String,
  brotherForm: {
    questions: [{
      questionType: {
        type: String,
        enum: Object.values(QUESTION_TYPES),
        required: true
      },
      question: {
        type: String,
        required: true
      },
      options: [String],
      required: Boolean
    }]
  },
  rusheeForm: {
    questions: [{
      questionType: {
        type: String,
        enum: Object.values(QUESTION_TYPES),
        required: true
      },
      question: {
        type: String,
        required: true
      },
      options: [String],
      required: Boolean
    }]
  },
  brotherSubmissions: [{
    brother: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brother'
    },
    responses: String // JSON string of responses
  }],
  rusheeSubmissions: [{
    rushee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rushee'
    },
    responses: String // JSON string of responses
  }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);