const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user'],
    default: 'user'
  },
  profile: {
    firstName: String,
    lastName: String,
    bio: String,
    avatar: String,
    location: String
  },
  preferences: {
    dietaryRestrictions: [String],
    favoriteCuisines: [String],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    }
  },
  stats: {
    recipesCreated: { type: Number, default: 0 },
    recipesCompleted: { type: Number, default: 0 },
    sessionsAttended: { type: Number, default: 0 },
    totalRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  completedRecipes: [{
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe'
    },
    completedAt: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 5 },
    notes: String
  }],
  myRecipes: [{
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: true
    },
    custom: {
      // Optional: user-edited version of the recipe
      title: String,
      description: String,
      ingredients: [String],
      instructions: String,
      images: [{ url: String, caption: String, isPrimary: Boolean }],
      tags: [String],
      notes: String,
      // Add more fields as needed
    }
  }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { 
  timestamps: true 
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to calculate average rating
UserSchema.methods.getAverageRating = function() {
  return this.stats.reviewCount > 0 ? this.stats.totalRating / this.stats.reviewCount : 0;
};

// Method to add badge
UserSchema.methods.addBadge = function(badgeName, description, icon) {
  const badge = {
    name: badgeName,
    description: description,
    icon: icon,
    earnedAt: new Date()
  };
  
  if (!this.badges.some(b => b.name === badgeName)) {
    this.badges.push(badge);
  }
  
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);
