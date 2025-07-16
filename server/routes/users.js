const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
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
  deleteMyRecipe
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Basic auth routes (existing)
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    // Always set role to 'user'
    const user = new User({ 
      username, 
      email, 
      password: hashed,
      role: 'user'
    });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ 
      token, 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Enhanced user routes
router.get('/profile/:id', getUserProfile);
router.get('/users', protect, getUsers);

// Protected routes
router.use(protect);

router.put('/profile', updateProfile);
router.get('/favorites', getFavorites);
router.post('/favorites/:recipeId', addToFavorites);
router.delete('/favorites/:recipeId', removeFromFavorites);
router.post('/completed/:recipeId', markRecipeCompleted);
router.get('/completed', getCompletedRecipes);
router.get('/progress', getUserProgress);

// Follow/unfollow routes
router.post('/:id/follow', protect, followUser);
router.post('/:id/unfollow', protect, unfollowUser);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

// My Recipes routes
router.get('/my-recipes', protect, getMyRecipes);
router.post('/my-recipes/:recipeId', protect, addRecipeToMyRecipes);
router.put('/my-recipes/:recipeId', protect, updateMyRecipe);
router.delete('/my-recipes/:recipeId', protect, deleteMyRecipe);

module.exports = router;
