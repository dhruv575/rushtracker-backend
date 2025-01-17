const mongoose = require('mongoose');
const { BROTHER_POSITIONS } = require('./types');

const brotherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: String,
  major: String,
  year: Number,
  frat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Frat',
    required: true
  },
  position: {
    type: String,
    enum: Object.values(BROTHER_POSITIONS),
    default: BROTHER_POSITIONS.BROTHER
  },
  pledgeSem: {
    semester: String,
    year: Number
  },
  eventsAttended: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Brother', brotherSchema);