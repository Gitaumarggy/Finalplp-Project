const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    sparse: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  instructions: {
    type: String,
    required: true
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  videoUrl: String, // YouTube or other video tutorial link
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['bread', 'pastry', 'cake', 'cookie', 'dessert', 'savory', 'breakfast', 'lunch', 'dinner', 'snack', 'other'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  prepTime: {
    type: Number, // in minutes
    required: true
  },
  cookTime: {
    type: Number, // in minutes
    required: true
  },
  totalTime: {
    type: Number, // in minutes
    required: true
  },
  servings: {
    type: Number,
    required: true
  },
  yield: String, // e.g., "2 loaves", "24 cookies"
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number
  },
  tags: [String],
  dietary: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    dairyFree: { type: Boolean, default: false },
    nutFree: { type: Boolean, default: false },
    keto: { type: Boolean, default: false },
    paleo: { type: Boolean, default: false }
  },
  equipment: [String], // Required equipment
  tips: [String], // Cooking tips
  variations: [{
    name: String,
    description: String,
    modifications: [String]
  }],
  relatedRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  stats: {
    views: { type: Number, default: 0 },
    favorites: { type: Number, default: 0 },
    completions: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  featuredAt: Date,
  featuredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resources: [{
    type: {
      type: String, // 'link' or 'pdf'
      enum: ['link', 'pdf'],
      required: true
    },
    url: { type: String, required: true },
    name: { type: String, required: true }
  }]
}, { 
  timestamps: true 
});

// Indexes for better query performance
RecipeSchema.index({ createdBy: 1, status: 1 });
RecipeSchema.index({ category: 1, difficulty: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ 'ratings.average': -1 });
RecipeSchema.index({ 'stats.views': -1 });
RecipeSchema.index({ featured: 1, featuredAt: -1 });

// Virtual for total time
RecipeSchema.virtual('totalTimeMinutes').get(function() {
  return this.prepTime + this.cookTime;
});

// Method to update ratings
RecipeSchema.methods.updateRatings = function() {
  return this.model('Review').getAverageRating('recipe', this._id)
    .then(result => {
      if (result.length > 0) {
        this.ratings.average = Math.round(result[0].average * 10) / 10;
        this.ratings.count = result[0].count;
        this.ratings.total = result[0].average * result[0].count;
      } else {
        this.ratings.average = 0;
        this.ratings.count = 0;
        this.ratings.total = 0;
      }
      return this.save();
    });
};

// Method to increment views
RecipeSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Method to increment favorites
RecipeSchema.methods.incrementFavorites = function() {
  this.stats.favorites += 1;
  return this.save();
};

// Method to decrement favorites
RecipeSchema.methods.decrementFavorites = function() {
  this.stats.favorites = Math.max(0, this.stats.favorites - 1);
  return this.save();
};

// Method to increment completions
RecipeSchema.methods.incrementCompletions = function() {
  this.stats.completions += 1;
  return this.save();
};

// Static method to get featured recipes
RecipeSchema.statics.getFeatured = function(limit = 10) {
  return this.find({ 
    featured: true, 
    status: 'published',
    isPublic: true 
  })
  .sort({ featuredAt: -1 })
  .limit(limit)
  .populate('createdBy', 'username profile.firstName profile.lastName');
};

// Static method to get trending recipes
RecipeSchema.statics.getTrending = function(limit = 10) {
  return this.find({ 
    status: 'published',
    isPublic: true 
  })
  .sort({ 'stats.views': -1, 'ratings.average': -1 })
  .limit(limit)
  .populate('createdBy', 'username profile.firstName profile.lastName');
};

// Static method to search recipes
RecipeSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    status: 'published',
    isPublic: true
  };

  // Text search
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  // Apply filters
  if (filters.category) searchQuery.category = filters.category;
  if (filters.difficulty) searchQuery.difficulty = filters.difficulty;
  if (filters.dietary) {
    Object.keys(filters.dietary).forEach(key => {
      if (filters.dietary[key]) {
        searchQuery[`dietary.${key}`] = true;
      }
    });
  }

  return this.find(searchQuery)
    .sort({ createdAt: -1 })
    .populate('createdBy', 'username profile.firstName profile.lastName');
};

module.exports = mongoose.model('Recipe', RecipeSchema);
