const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Create a new collection
router.post('/', collectionController.createCollection);

// Rename a collection
router.patch('/:id/rename', collectionController.renameCollection);

// Delete a collection
router.delete('/:id', collectionController.deleteCollection);

// Add a recipe to a collection
router.post('/:id/add', collectionController.addRecipeToCollection);

// Remove a recipe from a collection
router.post('/:id/remove', collectionController.removeRecipeFromCollection);

// Get all collections for the authenticated user
router.get('/', collectionController.getUserCollections);

// Get a single collection by ID
router.get('/:id', collectionController.getCollectionById);

module.exports = router; 