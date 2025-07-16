import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/RecipeRecommendations.module.css';

const RecipeRecommendations = ({ userPreferences = {}, userHistory = [], allRecipes = [] }) => {
  const navigate = useNavigate();
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [availableRecipes, setAvailableRecipes] = useState([]);
  const [favoritedIds, setFavoritedIds] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Recipes', icon: '🍽️', description: 'Browse all recipes' },
    { id: 'breakfast', name: 'Breakfast', icon: '🥞', description: 'Start your day right' },
    { id: 'lunch', name: 'Lunch', icon: '🥪', description: 'Midday meals' },
    { id: 'dinner', name: 'Dinner', icon: '🍝', description: 'Evening favorites' },
    { id: 'quick', name: 'Quick & Easy', icon: '⚡', description: '30 minutes or less' },
    { id: 'vegetarian', name: 'Vegetarian', icon: '🥬', description: 'Plant-based meals' }
  ];

  // Fetch recipes from API and localStorage
  const fetchAllRecipes = async () => {
    try {
      // Try to fetch from API first
      const token = localStorage.getItem('token');
      const response = await fetch('/api/recipes', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      
      let recipes = [];
      if (response.ok) {
        recipes = await response.json();
      } else {
        // Fallback to localStorage
        recipes = JSON.parse(localStorage.getItem('recipes')) || [];
      }

      // Add sample recipes if none exist
      if (recipes.length === 0) {
        recipes = [
          {
            id: '1',
            title: 'Spaghetti Carbonara',
            ingredients: ['spaghetti', 'eggs', 'bacon', 'parmesan cheese', 'black pepper'],
            instructions: 'Cook pasta, mix with eggs and cheese, add crispy bacon.',
            cookingTime: 25,
            difficulty: 'intermediate',
            category: 'dinner',
            tags: ['italian', 'pasta', 'dinner', 'quick'],
            rating: 4.5,
            reviewCount: 12
          },
          {
            id: '2',
            title: 'Chicken Stir Fry',
            ingredients: ['chicken breast', 'broccoli', 'soy sauce', 'garlic', 'ginger'],
            instructions: 'Stir fry chicken with vegetables and Asian seasonings.',
            cookingTime: 20,
            difficulty: 'beginner',
            category: 'dinner',
            tags: ['asian', 'chicken', 'healthy', 'quick'],
            rating: 4.2,
            reviewCount: 8
          },
          {
            id: '3',
            title: 'Vegetarian Buddha Bowl',
            ingredients: ['quinoa', 'sweet potato', 'kale', 'chickpeas', 'tahini'],
            instructions: 'Layer quinoa with roasted vegetables and tahini dressing.',
            cookingTime: 35,
            difficulty: 'beginner',
            category: 'lunch',
            tags: ['vegetarian', 'healthy', 'bowl', 'mediterranean'],
            rating: 4.7,
            reviewCount: 15
          },
          {
            id: '4',
            title: 'Chocolate Lava Cake',
            ingredients: ['dark chocolate', 'butter', 'eggs', 'flour', 'sugar'],
            instructions: 'Bake chocolate cakes with molten centers.',
            cookingTime: 15,
            difficulty: 'intermediate',
            category: 'dessert',
            tags: ['dessert', 'chocolate', 'romantic', 'quick'],
            rating: 4.8,
            reviewCount: 20
          },
          {
            id: '5',
            title: 'Mediterranean Salad',
            ingredients: ['cucumber', 'tomatoes', 'olives', 'feta cheese', 'olive oil'],
            instructions: 'Mix fresh vegetables with Mediterranean ingredients.',
            cookingTime: 10,
            difficulty: 'beginner',
            category: 'lunch',
            tags: ['mediterranean', 'vegetarian', 'salad', 'healthy', 'quick'],
            rating: 4.3,
            reviewCount: 6
          },
          {
            id: '6',
            title: 'Beef Tacos',
            ingredients: ['ground beef', 'tortillas', 'lettuce', 'tomatoes', 'cheese'],
            instructions: 'Cook seasoned beef and assemble tacos with toppings.',
            cookingTime: 30,
            difficulty: 'beginner',
            category: 'dinner',
            tags: ['mexican', 'tacos', 'dinner', 'comfort'],
            rating: 4.1,
            reviewCount: 9
          },
          {
            id: '7',
            title: 'Avocado Toast',
            ingredients: ['bread', 'avocado', 'eggs', 'salt', 'pepper'],
            instructions: 'Toast bread, mash avocado, top with poached eggs.',
            cookingTime: 10,
            difficulty: 'beginner',
            category: 'breakfast',
            tags: ['breakfast', 'vegetarian', 'healthy', 'quick'],
            rating: 4.0,
            reviewCount: 5
          },
          {
            id: '8',
            title: 'Pasta Primavera',
            ingredients: ['pasta', 'broccoli', 'carrots', 'zucchini', 'cream sauce'],
            instructions: 'Cook pasta with fresh spring vegetables in cream sauce.',
            cookingTime: 25,
            difficulty: 'intermediate',
            category: 'dinner',
            tags: ['italian', 'vegetarian', 'pasta', 'spring'],
            rating: 4.4,
            reviewCount: 11
          },
          {
            id: '9',
            title: 'Blueberry Pancakes',
            ingredients: ['flour', 'milk', 'eggs', 'blueberries', 'maple syrup'],
            instructions: 'Mix batter, add blueberries, cook on griddle until golden.',
            cookingTime: 20,
            difficulty: 'beginner',
            category: 'breakfast',
            tags: ['breakfast', 'sweet', 'quick', 'comfort'],
            rating: 4.6,
            reviewCount: 14
          },
          {
            id: '10',
            title: 'Greek Yogurt Parfait',
            ingredients: ['greek yogurt', 'honey', 'granola', 'berries', 'nuts'],
            instructions: 'Layer yogurt with honey, granola, and fresh berries.',
            cookingTime: 5,
            difficulty: 'beginner',
            category: 'breakfast',
            tags: ['breakfast', 'healthy', 'vegetarian', 'quick'],
            rating: 4.2,
            reviewCount: 7
          },
          {
            id: '11',
            title: 'Caesar Salad',
            ingredients: ['romaine lettuce', 'croutons', 'parmesan', 'caesar dressing'],
            instructions: 'Toss lettuce with dressing, top with croutons and cheese.',
            cookingTime: 10,
            difficulty: 'beginner',
            category: 'lunch',
            tags: ['lunch', 'salad', 'vegetarian', 'quick'],
            rating: 4.1,
            reviewCount: 8
          },
          {
            id: '12',
            title: 'Chicken Caesar Wrap',
            ingredients: ['tortilla', 'chicken', 'lettuce', 'caesar dressing', 'cheese'],
            instructions: 'Fill tortilla with chicken, lettuce, and dressing.',
            cookingTime: 15,
            difficulty: 'beginner',
            category: 'lunch',
            tags: ['lunch', 'chicken', 'quick', 'healthy'],
            rating: 4.3,
            reviewCount: 10
          },
          {
            id: '13',
            title: 'Grilled Salmon',
            ingredients: ['salmon fillet', 'lemon', 'herbs', 'olive oil', 'garlic'],
            instructions: 'Season salmon, grill until flaky, serve with lemon.',
            cookingTime: 20,
            difficulty: 'intermediate',
            category: 'dinner',
            tags: ['dinner', 'fish', 'healthy', 'grill'],
            rating: 4.7,
            reviewCount: 16
          },
          {
            id: '14',
            title: 'Beef Stir Fry',
            ingredients: ['beef strips', 'vegetables', 'soy sauce', 'garlic', 'ginger'],
            instructions: 'Stir fry beef with vegetables and Asian seasonings.',
            cookingTime: 25,
            difficulty: 'intermediate',
            category: 'dinner',
            tags: ['dinner', 'beef', 'asian', 'quick'],
            rating: 4.4,
            reviewCount: 12
          },
          {
            id: '15',
            title: 'Chocolate Chip Cookies',
            ingredients: ['flour', 'butter', 'chocolate chips', 'sugar', 'eggs'],
            instructions: 'Mix dough, add chocolate chips, bake until golden.',
            cookingTime: 30,
            difficulty: 'beginner',
            category: 'dessert',
            tags: ['dessert', 'chocolate', 'cookies', 'comfort'],
            rating: 4.9,
            reviewCount: 25
          },
          {
            id: '16',
            title: 'Apple Pie',
            ingredients: ['pie crust', 'apples', 'cinnamon', 'sugar', 'butter'],
            instructions: 'Fill crust with spiced apples, bake until golden.',
            cookingTime: 60,
            difficulty: 'advanced',
            category: 'dessert',
            tags: ['dessert', 'pie', 'fruit', 'comfort'],
            rating: 4.8,
            reviewCount: 18
          },
          {
            id: '17',
            title: 'Popcorn',
            ingredients: ['popcorn kernels', 'oil', 'salt', 'butter'],
            instructions: 'Heat oil, add kernels, pop until done, season.',
            cookingTime: 10,
            difficulty: 'beginner',
            category: 'snack',
            tags: ['snack', 'quick', 'vegetarian'],
            rating: 4.0,
            reviewCount: 4
          },
          {
            id: '18',
            title: 'Hummus with Pita',
            ingredients: ['chickpeas', 'tahini', 'lemon', 'garlic', 'pita bread'],
            instructions: 'Blend chickpeas with tahini and seasonings, serve with pita.',
            cookingTime: 15,
            difficulty: 'beginner',
            category: 'snack',
            tags: ['snack', 'vegetarian', 'mediterranean', 'healthy'],
            rating: 4.5,
            reviewCount: 11
          }
        ];
        localStorage.setItem('recipes', JSON.stringify(recipes));
      }

      // Combine with passed recipes
      const combinedRecipes = [...recipes, ...allRecipes];
      setAvailableRecipes(combinedRecipes);
      
      return combinedRecipes;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      const localRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      setAvailableRecipes(localRecipes);
      return localRecipes;
    }
  };

  // Filter recipes based on category and search
  const filterRecipes = (recipes) => {
    return recipes.filter(recipe => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const titleMatch = recipe.title?.toLowerCase().includes(query);
        const ingredientMatch = recipe.ingredients?.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        );
        const tagMatch = recipe.tags?.some(tag => 
          tag.toLowerCase().includes(query)
        );
        
        if (!titleMatch && !ingredientMatch && !tagMatch) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'vegetarian' && !recipe.tags?.includes('vegetarian')) return false;
        if (selectedCategory === 'vegan' && !recipe.tags?.includes('vegan')) return false;
        if (selectedCategory === 'gluten-free' && !recipe.tags?.includes('gluten-free')) return false;
        if (selectedCategory === 'quick' && (parseInt(recipe.cookingTime) || 30) > 30) return false;
        if (selectedCategory === 'healthy' && !recipe.tags?.includes('healthy')) return false;
        if (selectedCategory === 'comfort' && !recipe.tags?.includes('comfort')) return false;
        if (['breakfast', 'lunch', 'dinner', 'dessert', 'snack'].includes(selectedCategory)) {
          if (recipe.category?.toLowerCase() !== selectedCategory) return false;
        }
      }

      return true;
    });
  };

  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoading(true);
      const recipes = await fetchAllRecipes();
      const filtered = filterRecipes(recipes);
      setFilteredRecipes(filtered);
      setIsLoading(false);
    };

    loadRecipes();
  }, []);

  useEffect(() => {
    const filtered = filterRecipes(availableRecipes);
    setFilteredRecipes(filtered);
  }, [searchQuery, selectedCategory, availableRecipes]);

  // Load user's favorites on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.token) return;
      try {
        const res = await fetch('/api/users/favorites', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFavoritedIds(data.map(r => r._id || r.id));
        }
      } catch (e) {}
    };
    fetchFavorites();
  }, []);

  // Save/Like handler
  const handleFavorite = async (recipe) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) return;
    const id = recipe._id || recipe.id;
    const isFavorited = favoritedIds.includes(id);
    try {
      const res = await fetch(`/api/users/favorites/${id}`, {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setFavoritedIds(favs => isFavorited ? favs.filter(f => f !== id) : [...favs, id]);
      }
    } catch (e) {}
  };

  // Delete handler
  const handleDelete = async (recipe) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    setDeletingId(recipe._id || recipe.id);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const id = recipe._id || recipe.id;
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: user?.token ? `Bearer ${user.token}` : '' }
      });
      if (res.ok) {
        setFilteredRecipes(recipes => recipes.filter(r => (r._id || r.id) !== id));
      }
    } catch (e) {}
    setDeletingId(null);
  };

  const handleCategoryClick = (categoryId, e) => {
    // Prevent default behavior to stop page movement
    if (e) e.preventDefault();
    
    if (categoryId === 'all') {
      setSelectedCategory(categoryId);
      setSearchQuery(''); // Clear search when changing category
      // Keep the page at the same position
      window.scrollTo(0, window.scrollY);
    } else {
      // Navigate to category page
      navigate(`/category/${categoryId}`);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Keep the page at the same position when searching
    setTimeout(() => {
      window.scrollTo(0, window.scrollY);
    }, 0);
  };

  const getCurrentCategory = () => {
    return categories.find(cat => cat.id === selectedCategory) || categories[0];
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
    <div className={styles.recommendationsContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            <i className="fas fa-th-large"></i>
            Recipe Categories
          </h2>
          <p className={styles.subtitle}>
            Browse recipes by category to find exactly what you're looking for
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className={styles.categoryGrid}>
        {categories.map(category => (
          <button
            key={category.id}
            className={`${styles.categoryCard} ${selectedCategory === category.id ? styles.active : ''}`}
            onClick={(e) => handleCategoryClick(category.id, e)}
          >
            <div className={styles.categoryIcon}>{category.icon}</div>
            <h3 className={styles.categoryName}>{category.name}</h3>
            <p className={styles.categoryDescription}>{category.description}</p>
            <div className={styles.categoryCount}>
              {filterRecipes(availableRecipes.filter(recipe => {
                if (category.id === 'all') return true;
                if (category.id === 'vegetarian') return recipe.tags?.includes('vegetarian');
                if (category.id === 'vegan') return recipe.tags?.includes('vegan');
                if (category.id === 'gluten-free') return recipe.tags?.includes('gluten-free');
                if (category.id === 'quick') return (parseInt(recipe.cookingTime) || 30) <= 30;
                if (category.id === 'healthy') return recipe.tags?.includes('healthy');
                if (category.id === 'comfort') return recipe.tags?.includes('comfort');
                return recipe.category?.toLowerCase() === category.id;
              })).length} recipes
            </div>
          </button>
        ))}
      </div>

      {/* Current Category Section */}
      {selectedCategory !== 'all' && (
        <div className={styles.currentCategorySection}>
          <div className={styles.categoryHeader}>
            <h3 className={styles.currentCategoryTitle}>
              {getCurrentCategory().icon} {getCurrentCategory().name}
            </h3>
            <p className={styles.currentCategoryDescription}>
              {getCurrentCategory().description}
            </p>
          </div>

          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className={styles.searchContainer}>
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder={`Search ${getCurrentCategory().name.toLowerCase()} recipes...`}
                value={searchQuery}
                onChange={handleSearch}
                className={styles.searchInput}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
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
        </div>
      )}

      {/* Recipes Grid */}
      {selectedCategory !== 'all' && (
        <div className={styles.recipesGrid}>
          {filteredRecipes.map((recipe) => (
            <div key={recipe.id} className={styles.recipeCard}>
              <div className={styles.cardImage}>
                <div className={styles.imagePlaceholder}>
                  <i className="fas fa-utensils"></i>
                </div>
                <div className={styles.overlay}>
                  <Link to={`/recipe/${recipe.id}`} className={styles.viewButton}>
                    <i className="fas fa-eye"></i>
                    View Recipe
                  </Link>
                </div>
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.recipeTitle}>
                  <Link to={`/recipe/${recipe.id}`}>
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
                  <Link to={`/recipe/${recipe.id}`} className={styles.primaryButton}>
                    <i className="fas fa-eye"></i>
                    View Recipe
                  </Link>
                  <button 
                    className={`${styles.secondaryButton} ${favoritedIds.includes(recipe._id || recipe.id) ? styles.favorited : ''}`}
                    onClick={() => handleFavorite(recipe)}
                    title={favoritedIds.includes(recipe._id || recipe.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                  >
                    <i className={favoritedIds.includes(recipe._id || recipe.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                    {favoritedIds.includes(recipe._id || recipe.id) ? 'Saved' : 'Save'}
                  </button>
                  {/* Show Delete button if user owns the recipe */}
                  {(() => {
                    const user = JSON.parse(localStorage.getItem('user'));
                    if (user && (recipe.createdBy === user.id || recipe.createdBy === user._id)) {
                      return (
                        <button 
                          className={styles.deleteButton}
                          onClick={() => handleDelete(recipe)}
                          disabled={deletingId === (recipe._id || recipe.id)}
                          title="Delete Recipe"
                        >
                          <i className="fas fa-trash"></i>
                          {deletingId === (recipe._id || recipe.id) ? 'Deleting...' : 'Delete'}
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {selectedCategory !== 'all' && filteredRecipes.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fas fa-search"></i>
          </div>
          <h3>No recipes found</h3>
          <p>Try adjusting your search or browse a different category.</p>
          <button className={styles.clearFilters} onClick={clearFilters}>
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeRecommendations; 