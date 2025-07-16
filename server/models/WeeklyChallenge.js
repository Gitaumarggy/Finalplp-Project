const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photo: { type: String, required: true }, // URL to uploaded photo
  notes: { type: String },
  submittedAt: { type: Date, default: Date.now }
});

const WeeklyChallengeSchema = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  submissions: [SubmissionSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('WeeklyChallenge', WeeklyChallengeSchema); 