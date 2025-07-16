const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['live', 'pre-recorded'],
    required: true
  },
  category: {
    type: String,
    enum: ['bread', 'pastry', 'cake', 'cookie', 'dessert', 'savory', 'other'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  maxParticipants: {
    type: Number,
    default: 10
  },
  price: {
    type: Number,
    default: 0, // 0 for free sessions
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    startTime: String, // HH:MM format
    timezone: {
      type: String,
      default: 'UTC'
    },
    recurring: {
      type: Boolean,
      default: false
    },
    recurringDays: [String] // ['monday', 'wednesday', etc.]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  materials: [{
    name: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'document', 'image', 'link']
    },
    url: String,
    description: String
  }],
  requirements: [String], // What participants need to bring
  learningOutcomes: [String], // What participants will learn
  tags: [String],
  thumbnail: String,
  videoUrl: String, // For pre-recorded sessions
  meetingLink: String, // For live sessions
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'no-show', 'cancelled'],
      default: 'registered'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    reviewDate: Date
  }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add pagination plugin
SessionSchema.plugin(mongoosePaginate);

// Index for better query performance
SessionSchema.index({ instructor: 1, status: 1 });
SessionSchema.index({ category: 1, difficulty: 1 });
SessionSchema.index({ 'schedule.startDate': 1 });

// Method to calculate average rating
SessionSchema.methods.updateAverageRating = function() {
  const validRatings = this.participants
    .filter(p => p.rating && p.rating > 0)
    .map(p => p.rating);
  
  if (validRatings.length > 0) {
    this.ratings.average = validRatings.reduce((a, b) => a + b, 0) / validRatings.length;
    this.ratings.count = validRatings.length;
    this.ratings.total = validRatings.reduce((a, b) => a + b, 0);
  }
  
  return this.save();
};

// Method to add participant
SessionSchema.methods.addParticipant = function(userId) {
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('Session is full');
  }
  
  if (this.participants.some(p => p.user.toString() === userId.toString())) {
    throw new Error('User already registered');
  }
  
  this.participants.push({
    user: userId,
    status: 'registered',
    registeredAt: new Date()
  });
  
  return this.save();
};

// Method to remove participant
SessionSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(
    p => p.user.toString() !== userId.toString()
  );
  
  return this.save();
};

module.exports = mongoose.model('Session', SessionSchema); 