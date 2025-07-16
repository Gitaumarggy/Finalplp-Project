const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['recipe', 'session', 'instructor'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  photos: [{
    url: String,
    caption: String
  }],
  tips: [String], // Cooking tips or suggestions
  difficulty: {
    type: String,
    enum: ['too easy', 'just right', 'too hard'],
    default: 'just right'
  },
  wouldMakeAgain: {
    type: Boolean,
    default: true
  },
  modifications: String, // Any changes made to the recipe
  helpful: {
    count: { type: Number, default: 0 },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    editedAt: { type: Date, default: Date.now },
    previousRating: Number,
    previousComment: String
  }]
}, {
  timestamps: true
});

// Add pagination plugin
ReviewSchema.plugin(mongoosePaginate);

// Indexes for better query performance
ReviewSchema.index({ targetType: 1, targetId: 1 });
ReviewSchema.index({ user: 1, targetType: 1 });
ReviewSchema.index({ rating: 1 });
ReviewSchema.index({ createdAt: -1 });

// Ensure one review per user per target
ReviewSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// Method to mark review as helpful
ReviewSchema.methods.markHelpful = function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count = this.helpful.users.length;
  }
  return this.save();
};

// Method to unmark review as helpful
ReviewSchema.methods.unmarkHelpful = function(userId) {
  this.helpful.users = this.helpful.users.filter(id => id.toString() !== userId.toString());
  this.helpful.count = this.helpful.users.length;
  return this.save();
};

// Method to edit review
ReviewSchema.methods.editReview = function(newData) {
  // Store edit history
  this.editHistory.push({
    editedAt: new Date(),
    previousRating: this.rating,
    previousComment: this.comment
  });
  
  // Update fields
  if (newData.rating) this.rating = newData.rating;
  if (newData.title) this.title = newData.title;
  if (newData.comment) this.comment = newData.comment;
  if (newData.photos) this.photos = newData.photos;
  if (newData.tips) this.tips = newData.tips;
  if (newData.difficulty) this.difficulty = newData.difficulty;
  if (newData.wouldMakeAgain !== undefined) this.wouldMakeAgain = newData.wouldMakeAgain;
  if (newData.modifications) this.modifications = newData.modifications;
  
  this.isEdited = true;
  return this.save();
};

// Static method to get average rating for a target
ReviewSchema.statics.getAverageRating = function(targetType, targetId) {
  return this.aggregate([
    { $match: { targetType, targetId } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
};

// Static method to get rating distribution
ReviewSchema.statics.getRatingDistribution = function(targetType, targetId) {
  return this.aggregate([
    { $match: { targetType, targetId } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('Review', ReviewSchema); 