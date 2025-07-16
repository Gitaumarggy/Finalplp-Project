const Collection = require('../models/Collection');
const Recipe = require('../models/Recipe');

// Create a new collection
exports.createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    const owner = req.user._id;
    const collection = await Collection.create({ name, owner });
    res.status(201).json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Rename a collection
exports.renameCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    const update = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (isPublic !== undefined) update.isPublic = isPublic;
    const collection = await Collection.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      update,
      { new: true }
    );
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a collection
exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findOneAndDelete({ _id: id, owner: req.user._id });
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add a recipe to a collection
exports.addRecipeToCollection = async (req, res) => {
  try {
    const { id } = req.params; // collection id
    const { recipeId } = req.body;
    const collection = await Collection.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { $addToSet: { recipes: recipeId } },
      { new: true }
    );
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Remove a recipe from a collection
exports.removeRecipeFromCollection = async (req, res) => {
  try {
    const { id } = req.params; // collection id
    const { recipeId } = req.body;
    const collection = await Collection.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { $pull: { recipes: recipeId } },
      { new: true }
    );
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all collections for a user
exports.getUserCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user._id }).populate('recipes');
    res.json(collections);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get a single collection by ID (with recipes)
exports.getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await Collection.findOne({ _id: id, owner: req.user._id }).populate('recipes');
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 