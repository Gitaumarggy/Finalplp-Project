import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../styles/CategoryPage.module.css';

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState([]); // Track liked recipes

  // Category definitions
  const categories = {
    breakfast: { name: 'Breakfast', icon: '🥞', description: 'Start your day right' },
    lunch: { name: 'Lunch', icon: '🥪', description: 'Midday meals' },
    dinner: { name: 'Dinner', icon: '🍝', description: 'Evening favorites' },
    dessert: { name: 'Dessert', icon: '🍰', description: 'Sweet treats' },
    snack: { name: 'Snacks', icon: '🍿', description: 'Quick bites' },
    vegetarian: { name: 'Vegetarian', icon: '🥬', description: 'Plant-based meals' },
    vegan: { name: 'Vegan', icon: '🌱', description: '100% plant-based' },
    'gluten-free': { name: 'Gluten-Free', icon: '🌾', description: 'No gluten ingredients' },
    quick: { name: 'Quick & Easy', icon: '⚡', description: '30 minutes or less' },
    healthy: { name: 'Healthy', icon: '💚', description: 'Nutritious options' },
    comfort: { name: 'Comfort Food', icon: '🫂', description: 'Soul-warming dishes' }
  };

  const currentCategory = categories[category] || { name: 'All Recipes', icon: '🍽️', description: 'Browse all recipes' };

  // Fetch recipes from API and localStorage
  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      // Try to fetch from API first
      const token = localStorage.getItem('token');
      const response = await fetch('/api/recipes', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      let allRecipes = [];
      if (response.ok) {
        allRecipes = await response.json();
      } else {
        // Fallback to localStorage
        allRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      }
      // Always merge with localStorage recipes for guests
      let localRecipes = [];
      const localRecipesRaw = localStorage.getItem('recipes');
      if (localRecipesRaw && localRecipesRaw !== 'undefined') {
        localRecipes = JSON.parse(localRecipesRaw);
      }
      // Merge, avoiding duplicates (by id or title)
      localRecipes.forEach(localRecipe => {
        if (!allRecipes.some(r => (r.id && localRecipe.id && r.id === localRecipe.id) || (r.title === localRecipe.title))) {
          allRecipes.push(localRecipe);
        }
      });
      setRecipes(allRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      const localRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      setRecipes(localRecipes);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter recipes based on category and search
  const filterRecipes = (allRecipes) => {
    return allRecipes.filter(recipe => {
      // Normalize fields
      const recipeCategory = recipe.category ? String(recipe.category).toLowerCase().trim() : '';
      const recipeTags = Array.isArray(recipe.tags)
        ? recipe.tags.map(tag => String(tag).toLowerCase().trim())
        : [];
      const cookingTime = recipe.cookingTime ? parseInt(recipe.cookingTime) : 30;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = recipe.title?.toLowerCase().includes(query);
        const ingredientMatch = Array.isArray(recipe.ingredients)
          ? recipe.ingredients.some(ingredient => String(ingredient).toLowerCase().includes(query))
          : false;
        const tagMatch = recipeTags.some(tag => tag.includes(query));
        if (!titleMatch && !ingredientMatch && !tagMatch) {
          return false;
        }
      }
      // Category filter
      if (category !== 'all') {
        // Tag-based categories
        if (category === 'vegetarian' && !recipeTags.includes('vegetarian')) return false;
        if (category === 'vegan' && !recipeTags.includes('vegan')) return false;
        if (category === 'gluten-free' && !recipeTags.includes('gluten-free')) return false;
        if (category === 'quick' && (!cookingTime || cookingTime > 30)) return false;
        if (category === 'healthy' && !recipeTags.includes('healthy')) return false;
        if (category === 'comfort' && !recipeTags.includes('comfort')) return false;
        // Main meal categories
        if ([
          'breakfast', 'lunch', 'dinner', 'dessert', 'snack'
        ].includes(category)) {
          if (recipeCategory !== category) return false;
        }
      }
      return true;
    });
  };

  // Fetch user's liked recipes (for logged-in users)
  useEffect(() => {
    const fetchLiked = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.token) {
        try {
          const res = await fetch('/api/users/favorites', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setLikedIds(data.map(r => r._id || r.id));
          }
        } catch {}
      } else {
        // For guests, use localStorage
        const localLiked = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
        setLikedIds(localLiked);
      }
    };
    fetchLiked();
  }, []);

  // Helper to check for valid MongoDB ObjectId
  function isValidObjectId(id) {
    return /^[a-fA-F0-9]{24}$/.test(id);
  }

  // Like/Unlike handler
  const handleLike = async (recipe) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const id = recipe._id || recipe.id;
    const isLiked = likedIds.includes(id);
    // Optimistically update UI
    setLikedIds(prev => isLiked ? prev.filter(x => x !== id) : [...prev, id]);
    if (user && user.token && isValidObjectId(id)) {
      try {
        const res = await fetch(`/api/users/favorites/${id}`, {
          method: isLiked ? 'DELETE' : 'POST',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!res.ok) {
          // Revert UI if API fails
          setLikedIds(prev => !isLiked ? prev.filter(x => x !== id) : [...prev, id]);
          console.error('Failed to update like status on server');
        }
      } catch (err) {
        // Revert UI if error
        setLikedIds(prev => !isLiked ? prev.filter(x => x !== id) : [...prev, id]);
        console.error('Error updating like status:', err);
      }
    } else {
      // Guest or local recipe: store in localStorage
      let localLiked = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
      if (isLiked) {
        localLiked = localLiked.filter(x => x !== id);
      } else {
        localLiked.push(id);
      }
      localStorage.setItem('likedRecipes', JSON.stringify(localLiked));
      // UI already updated optimistically
    }
  };

  // Delete handler
  const handleDelete = async (recipe) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    const id = recipe._id || recipe.id;
    const user = JSON.parse(localStorage.getItem('user'));
    let deleted = false;
    if (user && user.token) {
      try {
        const res = await fetch(`/api/recipes/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) deleted = true;
      } catch {}
    }
    // Remove from localStorage (for guests or fallback)
    let localRecipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    localRecipes = localRecipes.filter(r => (r.id || r._id) !== id);
    localStorage.setItem('recipes', JSON.stringify(localRecipes));
    // Remove from UI
    setRecipes(prev => prev.filter(r => (r.id || r._id) !== id));
    setFilteredRecipes(prev => prev.filter(r => (r.id || r._id) !== id));
  };

  useEffect(() => {
    fetchRecipes();
  }, [category]);

  useEffect(() => {
    const filtered = filterRecipes(recipes);
    setFilteredRecipes(filtered);
  }, [searchQuery, recipes, category]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Keep the page at the same position when searching
    setTimeout(() => {
      window.scrollTo(0, window.scrollY);
    }, 0);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <i className="fas fa-utensils fa-spin"></i>
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.categoryPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button 
            onClick={() => navigate('/')}
            className={styles.backButton}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </button>
          
          <div className={styles.categoryInfo}>
            <h1 className={styles.categoryTitle}>
              {currentCategory.icon} {currentCategory.name}
            </h1>
            <p className={styles.categoryDescription}>
              {currentCategory.description}
            </p>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={`Search ${currentCategory.name.toLowerCase()} recipes...`}
            value={searchQuery}
            onChange={handleSearch}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className={styles.clearSearch}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Recipe Count */}
      <div className={styles.recipeCount}>
        {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
      </div>

      {/* Recipes Grid */}
      <div className={styles.recipesGrid}>
        {filteredRecipes.map((recipe) => {
          const id = recipe._id || recipe.id;
          const isLiked = likedIds.includes(id);
          return (
            <div key={id} className={styles.recipeCard}>
              <div className={styles.cardImage}>
                <div className={styles.imagePlaceholder}>
                  <i className="fas fa-utensils"></i>
                </div>
                <div className={styles.overlay}>
                  <Link to={`/recipe/${id}`} className={styles.viewButton}>
                    <i className="fas fa-eye"></i>
                    View Recipe
                  </Link>
                </div>
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.recipeTitle}>
                  <Link to={`/recipe/${id}`}>
                    {recipe.title}
                  </Link>
                </h3>

                <div className={styles.recipeMeta}>
                  <span className={styles.metaItem}>
                    <i className="fas fa-clock"></i>
                    {recipe.cookingTime || '30 min'}
                  </span>
                  <span className={styles.metaItem}>
                    <i className="fas fa-signal"></i>
                    {recipe.difficulty || 'Beginner'}
                  </span>
                  {recipe.rating && (
                    <span className={styles.metaItem}>
                      <i className="fas fa-star"></i>
                      {recipe.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className={styles.tagsContainer}>
                  {recipe.tags?.slice(0, 3).map((tag, tagIndex) => (
                    <span key={tagIndex} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                  {recipe.tags?.length > 3 && (
                    <span className={styles.moreTags}>+{recipe.tags.length - 3}</span>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <Link to={`/recipe/${id}`} className={styles.primaryButton}>
                    <i className="fas fa-eye"></i>
                    View Recipe
                  </Link>
                  <button 
                    className={`${styles.secondaryButton} ${isLiked ? styles.favorited : ''}`}
                    onClick={() => handleLike(recipe)}
                    title={isLiked ? 'Remove from Favorites' : 'Add to Favorites'}
                  >
                    <i className={isLiked ? 'fas fa-heart' : 'far fa-heart'}></i>
                    {isLiked ? 'Saved' : 'Save'}
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(recipe)}
                    title="Delete Recipe"
                  >
                    <i className="fas fa-trash"></i>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredRecipes.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🍽️</div>
          <h3>No recipes found</h3>
          <p>Try adjusting your search or browse other categories</p>
          <button 
            onClick={() => navigate('/')}
            className={styles.browseButton}
          >
            Browse All Recipes
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryPage; 