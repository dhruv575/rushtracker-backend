// models/frat.js
const mongoose = require('mongoose');

const fratSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  university: {
    type: String,
    required: true
  },
  tags: [String],
  chapterDesignation: String,
  contactEmail: String,
  contactPhone: String,
  brothers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brother'
  }],
  president: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brother'
  }
}, { timestamps: true });

// Add method to schema for formatted name
fratSchema.methods.getFormattedName = function() {
  return `${this.name} - ${this.university}`;
};

module.exports = mongoose.model('Frat', fratSchema);