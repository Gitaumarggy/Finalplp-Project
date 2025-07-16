import React, { useState, useEffect } from 'react';
import styles from '../styles/RecipeForm.module.css';

const COMMON_TAGS = [
  'vegetarian', 'vegan', 'gluten-free', 'healthy', 'comfort', 'quick', 'dairy-free', 'keto', 'breakfast', 'lunch', 'dinner', 'dessert', 'snack'
];

const RecipeForm = ({ onAddRecipe, onSubmit, initialData }) => {
  const [title, setTitle] = useState('');
  // Removed: description
  const [category, setCategory] = useState('other');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  // Removed: tags, tagInput, and all tag-related logic
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState('');
  // Removed: resources, images, videoUrl, and related handlers
  // Add tags state
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      // Removed: setDescription
      setCategory(initialData.category || 'other');
      setIngredients(initialData.ingredients || '');
      setInstructions(initialData.instructions || '');
      // Removed: setTags, setTagInput
      setCookingTime(initialData.cookingTime || '');
      setServings(initialData.servings || '');
      // Removed: resources, images, videoUrl
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  // Add resource handler
  // Removed: handleAddResource, handleRemoveResource, handlePdfUpload

  // Handle image upload
  // Removed: handleImageUpload, handleRemoveImage, handlePrimaryImage
  const validateYouTubeUrl = (url) => {
    return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(url);
  };

  // Add tag handler
  const handleAddTag = (e) => {
    e.preventDefault();
    const newTag = tagInput.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setTagInput('');
  };

  // Remove tag handler
  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Add common tag handler
  const handleCommonTagClick = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !category || !ingredients || !instructions || !cookingTime || !servings) {
      alert('Please fill all required fields');
      return;
    }
    // Removed: videoUrl validation
    const newRecipe = {
      id: initialData ? initialData.id : Date.now(),
      title,
      // Removed: description
      category,
      ingredients: typeof ingredients === 'string' ? ingredients.split(',').map(item => item.trim()) : ingredients,
      instructions,
      tags,
      cookingTime: parseInt(cookingTime) || 30,
      prepTime: parseInt(cookingTime) || 30,
      cookTime: parseInt(cookingTime) || 30,
      totalTime: parseInt(cookingTime) || 30,
      servings: parseInt(servings) || 4,
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Removed: resources, images, videoUrl
    };
    if (onSubmit) {
      onSubmit(newRecipe);
    } else if (onAddRecipe) {
      onAddRecipe(newRecipe);
    }
    // Clear form if adding new recipe
    if (!initialData) {
      setTitle('');
      // Removed: setDescription
      setCategory('other');
      setIngredients('');
      setInstructions('');
      // Removed: setTags, setTagInput
      setCookingTime('');
      setServings('');
      // Removed: resources, images, videoUrl
      setTags([]);
      setTagInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.recipeForm}>
      <div className={styles.formGroup}>
        <label htmlFor="title">Recipe Title *</label>
        <input 
          type="text" 
          id="title"
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Enter recipe title" 
          required 
          className={styles.input}
        />
      </div>
      {/* Removed: Description field UI */}
      <div className={styles.formGroup}>
        <label htmlFor="category">Category *</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className={styles.input}
        >
          <option value="other">Other</option>
          <option value="bread">Bread</option>
          <option value="pastry">Pastry</option>
          <option value="cake">Cake</option>
          <option value="cookie">Cookie</option>
          <option value="dessert">Dessert</option>
          <option value="savory">Savory</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="cookingTime">Cooking Time</label>
          <input 
            type="text" 
            id="cookingTime"
            value={cookingTime} 
            onChange={(e) => setCookingTime(e.target.value)} 
            placeholder="e.g. 30 minutes" 
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="servings">Servings</label>
          <input 
            type="text" 
            id="servings"
            value={servings} 
            onChange={(e) => setServings(e.target.value)} 
            placeholder="e.g. 4 servings" 
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="ingredients">Ingredients * (comma separated)</label>
        <textarea 
          id="ingredients"
          value={ingredients} 
          onChange={(e) => setIngredients(e.target.value)} 
          placeholder="e.g. flour, sugar, eggs, milk" 
          required 
          className={styles.textarea}
          rows="3"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="instructions">Instructions *</label>
        <textarea 
          id="instructions"
          value={instructions} 
          onChange={(e) => setInstructions(e.target.value)} 
          placeholder="Enter step-by-step instructions" 
          required 
          className={styles.textarea}
          rows="6"
        />
      </div>

      {/* Tags input */}
      <div className={styles.formGroup}>
        <label htmlFor="tags">Tags (optional)</label>
        <div className={styles.tagsInputRow}>
          <input
            type="text"
            id="tags"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            placeholder="Add a tag and press Enter"
            onKeyDown={e => { if (e.key === 'Enter') handleAddTag(e); }}
            className={styles.input}
          />
          <button onClick={handleAddTag} className={styles.addTagButton} type="button">Add</button>
        </div>
        <div className={styles.tagsList}>
          {tags.map(tag => (
            <span key={tag} className={styles.tag}>
              {tag}
              <button type="button" className={styles.removeTagButton} onClick={() => handleRemoveTag(tag)}>&times;</button>
            </span>
          ))}
        </div>
        {/* Removed: Common tags suggestion buttons */}
      </div>

      {/* Removed: Resource Attachments */}
      {/* Removed: Image Upload */}
      {/* Removed: Video/YouTube Link */}

      <button type="submit" className={styles.submitButton}>
        {initialData ? 'Update Recipe' : 'Add Recipe'}
      </button>
    </form>
  );
};

export default RecipeForm;
