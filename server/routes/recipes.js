const express = require('express');
const router = express.Router();
const multer = require('multer');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });

// Require authentication for creating a recipe
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { 
      id, 
      title, 
      ingredients, 
      instructions, 
      tags, 
      cookingTime, 
      servings,
      category = 'other',
      difficulty = 'beginner',
      prepTime,
      cookTime,
      totalTime
    } = req.body;
    
    // Handle ingredients - it could be an array or a string that needs parsing
    let ingredientsArray = ingredients;
    if (typeof ingredients === 'string') {
      try {
        ingredientsArray = JSON.parse(ingredients);
      } catch (e) {
        // If JSON parsing fails, assume it's a comma-separated string
        ingredientsArray = ingredients.split(',').map(item => item.trim());
      }
    }
    
    // Parse time values
    const timeValue = parseInt(cookingTime) || 30;
    const servingsValue = parseInt(servings) || 4;
    
    // Use req.user._id for createdBy
    const newRecipe = new Recipe({
      id: id || Date.now().toString(),
      title,
      ingredients: ingredientsArray,
      instructions,
      tags: tags || [],
      category,
      difficulty,
      prepTime: prepTime || timeValue,
      cookTime: cookTime || timeValue,
      totalTime: totalTime || timeValue,
      servings: servingsValue,
      image: req.file ? req.file.path : null,
      createdBy: req.user._id
    });
    
    await newRecipe.save();
    res.json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      ingredients,
      tags,
      category,
      dietary,
      difficulty,
      cuisine,
      minRating
    } = req.query;
    let query = {};
    // Ingredients filter (all must be present)
    if (ingredients) {
      const ingArr = Array.isArray(ingredients) ? ingredients : ingredients.split(',');
      query.ingredients = { $all: ingArr.map(i => new RegExp(i, 'i')) };
    }
    // Tags filter (all must be present)
    if (tags) {
      const tagArr = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $all: tagArr.map(t => new RegExp(t, 'i')) };
    }
    // Category filter
    if (category) {
      query.category = category;
    }
    // Dietary filter (all must be true)
    if (dietary) {
      const dietArr = Array.isArray(dietary) ? dietary : dietary.split(',');
      dietArr.forEach(diet => {
        query[`dietary.${diet}`] = true;
      });
    }
    // Difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }
    // Cuisine filter
    if (cuisine) {
      query.cuisine = cuisine;
    }
    // Minimum rating filter
    if (minRating) {
      query['ratings.average'] = { $gte: parseFloat(minRating) };
    }
    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    let recipe;
    
    // Try to find by ObjectId first
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      recipe = await Recipe.findById(req.params.id);
    } else {
      // If not ObjectId, try to find by custom id field
      recipe = await Recipe.findOne({ id: req.params.id });
    }
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, ingredients, instructions, tags, cookingTime, servings } = req.body;
    
    // Handle ingredients - it could be an array or a string that needs parsing
    let ingredientsArray = ingredients;
    if (typeof ingredients === 'string') {
      try {
        ingredientsArray = JSON.parse(ingredients);
      } catch (e) {
        // If JSON parsing fails, assume it's a comma-separated string
        ingredientsArray = ingredients.split(',').map(item => item.trim());
      }
    }
    
    let recipe;
    
    // Try to find by ObjectId first
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        {
          title,
          ingredients: ingredientsArray,
          instructions,
          tags,
          cookingTime,
          servings,
          updatedAt: new Date().toISOString()
        },
        { new: true }
      );
    } else {
      // If not ObjectId, try to find by custom id field
      recipe = await Recipe.findOneAndUpdate(
        { id: req.params.id },
        {
          title,
          ingredients: ingredientsArray,
          instructions,
          tags,
          cookingTime,
          servings,
          updatedAt: new Date().toISOString()
        },
        { new: true }
      );
    }
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

// Add protect middleware to DELETE route and check ownership
router.delete('/:id', protect, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    if (recipe.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You are not authorized to delete this recipe' });
    }
    await recipe.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Upload recipe PDF
router.post('/upload-pdf', upload.single('pdf'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the file URL and original name
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, name: req.file.originalname });
});

// Upload recipe image
router.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return the file URL
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

// AI Recipe Generation (Flexible ANY match)
router.post('/ai-generate', async (req, res) => {
  try {
    console.log('AI Generate Request Body:', req.body); // Log the request body
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'No ingredients provided' });
    }
    // Find recipes that contain ANY of the provided ingredients (case-insensitive)
    const recipes = await Recipe.find({
      ingredients: { $in: ingredients.map(i => new RegExp(i, 'i')) }
    });
    res.json({ recipes });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({ error: 'Failed to generate recipe' });
  }
});

// AI Recipe Rewrite (Mock Example)
router.post('/ai-rewrite', async (req, res) => {
  try {
    const { recipeText, restriction } = req.body;
    if (!recipeText || !restriction) {
      return res.status(400).json({ error: 'Missing recipeText or restriction' });
    }
    // For now, just return a mock rewritten recipe
    const rewritten = `Rewritten for ${restriction}:\n\n${recipeText}\n\n(Ingredients and steps adjusted for ${restriction} diet.)`;
    res.json({ rewritten });
  } catch (error) {
    console.error('AI rewrite error:', error);
    res.status(500).json({ error: 'Failed to rewrite recipe' });
  }
});

module.exports = router;
