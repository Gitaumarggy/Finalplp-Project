const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  description: {
    type: String,
    trim: true,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

CollectionSchema.index({ owner: 1, name: 1 }, { unique: true }); // Each user can't have duplicate collection names

module.exports = mongoose.model('Collection', CollectionSchema); 