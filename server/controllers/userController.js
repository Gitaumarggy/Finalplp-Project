const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Session = require('../models/Session');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('favorites', 'title images category difficulty ratings');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's recipes
  const recipes = await Recipe.find({ createdBy: user._id, status: 'published' })
    .select('title images category difficulty ratings stats')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get user's sessions (if instructor)
  let sessions = await Session.find({ instructor: user._id, status: 'published' })
    .select('title category difficulty ratings schedule')
    .sort({ 'schedule.startDate': 1 })
    .limit(5);

  res.json({
    user,
    recipes,
    sessions
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const {
    profile,
    preferences,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Update profile fields
  if (profile) {
    user.profile = { ...user.profile, ...profile };
  }

  // Update preferences
  if (preferences) {
    user.preferences = { ...user.preferences, ...preferences };
  }

  const updatedUser = await user.save();

  res.json({
    _id: updatedUser._id,
    username: updatedUser.username,
    email: updatedUser.email,
    role: updatedUser.role,
    profile: updatedUser.profile,
    preferences: updatedUser.preferences,
    stats: updatedUser.stats,
    badges: updatedUser.badges
  });
});

// @desc    Add recipe to favorites
// @route   POST /api/users/favorites/:recipeId
// @access  Private
const addToFavorites = asyncHandler(async (req, res) => {
  // Check for valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.recipeId)) {
    return res.status(400).json({ error: 'Invalid recipeId' });
  }
  const recipe = await Recipe.findById(req.params.recipeId);

  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  const user = await User.findById(req.user._id);

  if (user.favorites.includes(req.params.recipeId)) {
    res.status(400);
    throw new Error('Recipe already in favorites');
  }

  user.favorites.push(req.params.recipeId);
  await user.save();

  // Update recipe stats
  await recipe.incrementFavorites();

  res.json({ message: 'Recipe added to favorites' });
});

// @desc    Remove recipe from favorites
// @route   DELETE /api/users/favorites/:recipeId
// @access  Private
const removeFromFavorites = asyncHandler(async (req, res) => {
  // Check for valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.recipeId)) {
    return res.status(400).json({ error: 'Invalid recipeId' });
  }
  const user = await User.findById(req.user._id);

  if (!user.favorites.includes(req.params.recipeId)) {
    res.status(400);
    throw new Error('Recipe not in favorites');
  }

  user.favorites = user.favorites.filter(
    id => id.toString() !== req.params.recipeId
  );
  await user.save();

  // Update recipe stats
  const recipe = await Recipe.findById(req.params.recipeId);
  if (recipe) {
    await recipe.decrementFavorites();
  }

  res.json({ message: 'Recipe removed from favorites' });
});

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'favorites',
      select: 'title description images category difficulty ratings stats tags',
      match: { status: 'published' }
    });

  res.json(user.favorites);
});

// @desc    Mark recipe as completed
// @route   POST /api/users/completed/:recipeId
// @access  Private
const markRecipeCompleted = asyncHandler(async (req, res) => {
  const { rating, notes } = req.body;
  const recipe = await Recipe.findById(req.params.recipeId);

  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  const user = await User.findById(req.user._id);

  // Check if already completed
  const existingCompletion = user.completedRecipes.find(
    completion => completion.recipe.toString() === req.params.recipeId
  );

  if (existingCompletion) {
    res.status(400);
    throw new Error('Recipe already marked as completed');
  }

  // Add to completed recipes
  user.completedRecipes.push({
    recipe: req.params.recipeId,
    rating,
    notes
  });

  // Update stats
  user.stats.recipesCompleted += 1;

  // Check for badges
  await checkAndAwardBadges(user);

  await user.save();

  // Update recipe stats
  await recipe.incrementCompletions();

  res.json({ message: 'Recipe marked as completed' });
});

// @desc    Get user's completed recipes
// @route   GET /api/users/completed
// @access  Private
const getCompletedRecipes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'completedRecipes.recipe',
      select: 'title description images category difficulty ratings',
      match: { status: 'published' }
    });

  res.json(user.completedRecipes);
});

// @desc    Get user progress
// @route   GET /api/users/progress
// @access  Private
const getUserProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('badges')
    .populate({
      path: 'completedRecipes.recipe',
      select: 'title category difficulty'
    });

  // Calculate progress statistics
  const progress = {
    stats: user.stats,
    badges: user.badges,
    completedRecipes: user.completedRecipes,
    achievements: calculateAchievements(user),
    nextMilestones: calculateNextMilestones(user)
  };

  res.json(progress);
});

// @desc    Get all users (for admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { 'profile.firstName': { $regex: search, $options: 'i' } },
      { 'profile.lastName': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    select: '-password',
    sort: { createdAt: -1 }
  };

  const users = await User.paginate(query, options);
  res.json(users);
});

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
const followUser = asyncHandler(async (req, res) => {
  const userToFollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);
  if (!userToFollow) {
    res.status(404);
    throw new Error('User not found');
  }
  if (userToFollow._id.equals(currentUser._id)) {
    res.status(400);
    throw new Error('You cannot follow yourself');
  }
  if (!currentUser.following.includes(userToFollow._id)) {
    currentUser.following.push(userToFollow._id);
    await currentUser.save();
  }
  if (!userToFollow.followers.includes(currentUser._id)) {
    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();
  }
  res.json({ message: 'User followed' });
});

// @desc    Unfollow a user
// @route   POST /api/users/:id/unfollow
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
  const userToUnfollow = await User.findById(req.params.id);
  const currentUser = await User.findById(req.user._id);
  if (!userToUnfollow) {
    res.status(404);
    throw new Error('User not found');
  }
  if (userToUnfollow._id.equals(currentUser._id)) {
    res.status(400);
    throw new Error('You cannot unfollow yourself');
  }
  currentUser.following = currentUser.following.filter(id => !id.equals(userToUnfollow._id));
  await currentUser.save();
  userToUnfollow.followers = userToUnfollow.followers.filter(id => !id.equals(currentUser._id));
  await userToUnfollow.save();
  res.json({ message: 'User unfollowed' });
});

// @desc    Get a user's followers
// @route   GET /api/users/:id/followers
// @access  Public
const getFollowers = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('followers', 'username profile.avatar profile.firstName profile.lastName');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.followers);
});

// @desc    Get a user's following
// @route   GET /api/users/:id/following
// @access  Public
const getFollowing = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('following', 'username profile.avatar profile.firstName profile.lastName');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.following);
});

// @desc    Get user's personal recipes
// @route   GET /api/users/my-recipes
// @access  Private
const getMyRecipes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'myRecipes.recipe',
    select: 'title description images category difficulty ratings stats tags',
  });
  res.json(user.myRecipes);
});

// @desc    Add a recipe to user's personal recipes (copy or reference)
// @route   POST /api/users/my-recipes/:recipeId
// @access  Private
const addRecipeToMyRecipes = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Check if recipe exists
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

  if (user.myRecipes.some(r => r.recipe.toString() === recipeId)) {
    return res.status(400).json({ error: 'Recipe already in your list' });
  }
  user.myRecipes.push({ recipe: recipeId });
  await user.save();
  res.json({ message: 'Recipe added to your recipes' });
});

// @desc    Update a personal recipe (custom fields)
// @route   PUT /api/users/my-recipes/:recipeId
// @access  Private
const updateMyRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const myRecipe = user.myRecipes.find(r => r.recipe.toString() === recipeId);
  if (!myRecipe) return res.status(404).json({ error: 'Recipe not found in your list' });
  myRecipe.custom = { ...myRecipe.custom, ...req.body };
  await user.save();
  res.json({ message: 'Recipe updated in your recipes' });
});

// @desc    Delete a recipe from user's personal recipes
// @route   DELETE /api/users/my-recipes/:recipeId
// @access  Private
const deleteMyRecipe = asyncHandler(async (req, res) => {
  const { recipeId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.myRecipes = user.myRecipes.filter(r => r.recipe.toString() !== recipeId);
  await user.save();
  res.json({ message: 'Recipe removed from your recipes' });
});

// Helper function to check and award badges
const checkAndAwardBadges = async (user) => {
  const badges = [];

  // Recipe completion badges
  if (user.stats.recipesCompleted >= 1 && !user.badges.some(b => b.name === 'First Recipe')) {
    badges.push({ name: 'First Recipe', description: 'Completed your first recipe', icon: '🥇' });
  }
  if (user.stats.recipesCompleted >= 10 && !user.badges.some(b => b.name === 'Recipe Explorer')) {
    badges.push({ name: 'Recipe Explorer', description: 'Completed 10 recipes', icon: '🔍' });
  }
  if (user.stats.recipesCompleted >= 50 && !user.badges.some(b => b.name === 'Master Chef')) {
    badges.push({ name: 'Master Chef', description: 'Completed 50 recipes', icon: '👨‍🍳' });
  }

  // Session badges
  if (user.stats.sessionsAttended >= 1 && !user.badges.some(b => b.name === 'First Session')) {
    badges.push({ name: 'First Session', description: 'Attended your first baking session', icon: '🎓' });
  }
  if (user.stats.sessionsAttended >= 5 && !user.badges.some(b => b.name === 'Dedicated Learner')) {
    badges.push({ name: 'Dedicated Learner', description: 'Attended 5 sessions', icon: '📚' });
  }

  // Add badges to user
  for (const badge of badges) {
    await user.addBadge(badge.name, badge.description, badge.icon);
  }
};

// Helper function to calculate achievements
const calculateAchievements = (user) => {
  const achievements = [];

  // Recipe achievements
  if (user.stats.recipesCompleted >= 1) {
    achievements.push({ name: 'First Recipe', description: 'Completed your first recipe', icon: '🥇' });
  }
  if (user.stats.recipesCompleted >= 10) {
    achievements.push({ name: 'Recipe Explorer', description: 'Completed 10 recipes', icon: '🔍' });
  }
  if (user.stats.recipesCompleted >= 50) {
    achievements.push({ name: 'Master Chef', description: 'Completed 50 recipes', icon: '👨‍🍳' });
  }

  // Session achievements
  if (user.stats.sessionsAttended >= 1) {
    achievements.push({ name: 'First Session', description: 'Attended your first session', icon: '🎓' });
  }
  if (user.stats.sessionsAttended >= 5) {
    achievements.push({ name: 'Dedicated Learner', description: 'Attended 5 sessions', icon: '📚' });
  }

  return achievements;
};

// Helper function to calculate next milestones
const calculateNextMilestones = (user) => {
  const milestones = [];

  // Recipe milestones
  const nextRecipeMilestones = [10, 25, 50, 100];
  for (const milestone of nextRecipeMilestones) {
    if (user.stats.recipesCompleted < milestone) {
      milestones.push({
        type: 'recipes',
        current: user.stats.recipesCompleted,
        target: milestone,
        description: `Complete ${milestone} recipes`
      });
      break;
    }
  }

  // Session milestones
  const nextSessionMilestones = [5, 10, 25, 50];
  for (const milestone of nextSessionMilestones) {
    if (user.stats.sessionsAttended < milestone) {
      milestones.push({
        type: 'sessions',
        current: user.stats.sessionsAttended,
        target: milestone,
        description: `Attend ${milestone} sessions`
      });
      break;
    }
  }

  return milestones;
};

module.exports = {
  getUserProfile,
  updateProfile,
  addToFavorites,
  removeFromFavorites,
  getFavorites,
  markRecipeCompleted,
  getCompletedRecipes,
  getUserProgress,
  getUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getMyRecipes,
  addRecipeToMyRecipes,
  updateMyRecipe,
  deleteMyRecipe,
}; 