import React, { useState, useEffect } from 'react';
import styles from '../styles/EnhancedSearchBar.module.css';

const EnhancedSearchBar = ({ onSearch, onFilterChange, recipes = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dietary: [],
    cookingTime: '',
    difficulty: '',
    ingredients: [],
    cuisine: '',
    rating: ''
  });

  // Available filter options
  const dietaryOptions = [
    { value: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
    { value: 'vegan', label: 'Vegan', icon: '🌱' },
    { value: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    { value: 'dairy-free', label: 'Dairy-Free', icon: '🥛' },
    { value: 'keto', label: 'Keto', icon: '🥑' },
    { value: 'paleo', label: 'Paleo', icon: '🥩' }
  ];

  const cookingTimeOptions = [
    { value: 'quick', label: 'Quick (< 15 min)', icon: '⚡' },
    { value: 'medium', label: 'Medium (15-30 min)', icon: '⏱️' },
    { value: 'long', label: 'Long (> 30 min)', icon: '🕐' }
  ];

  const difficultyOptions = [
    { value: 'beginner', label: 'Beginner', icon: '🌱' },
    { value: 'intermediate', label: 'Intermediate', icon: '🔥' },
    { value: 'advanced', label: 'Advanced', icon: '⚡' }
  ];

  const cuisineOptions = [
    { value: 'italian', label: 'Italian', icon: '🍝' },
    { value: 'mexican', label: 'Mexican', icon: '🌮' },
    { value: 'asian', label: 'Asian', icon: '🍜' },
    { value: 'mediterranean', label: 'Mediterranean', icon: '🥗' },
    { value: 'american', label: 'American', icon: '🍔' },
    { value: 'indian', label: 'Indian', icon: '🍛' }
  ];

  const ratingOptions = [
    { value: '4.5', label: '4.5+ Stars', icon: '⭐' },
    { value: '4.0', label: '4.0+ Stars', icon: '⭐' },
    { value: '3.5', label: '3.5+ Stars', icon: '⭐' }
  ];

  // Get unique ingredients from recipes
  const allIngredients = [...new Set(
    recipes.flatMap(recipe => 
      Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : recipe.ingredients?.split(',').map(i => i.trim()) || []
    )
  )].sort();

  useEffect(() => {
    // Debounce search
    const timeoutId = setTimeout(() => {
      onSearch({ query: searchQuery, filters });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, onSearch]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (filterType === 'dietary' || filterType === 'ingredients') {
        if (newFilters[filterType].includes(value)) {
          newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
        } else {
          newFilters[filterType] = [...newFilters[filterType], value];
        }
      } else {
        newFilters[filterType] = newFilters[filterType] === value ? '' : value;
      }
      
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setFilters({
      dietary: [],
      cookingTime: '',
      difficulty: '',
      ingredients: [],
      cuisine: '',
      rating: ''
    });
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value !== ''
    ).length + (searchQuery ? 1 : 0);
  };

  return (
    <div className={styles.enhancedSearchContainer}>
      {/* Main Search Bar */}
      <div className={styles.searchBar}>
        <div className={styles.searchInputContainer}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search recipes, ingredients, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className={styles.clearButton}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <button 
          className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className="fas fa-filter"></i>
          Filters
          {getActiveFiltersCount() > 0 && (
            <span className={styles.filterBadge}>{getActiveFiltersCount()}</span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersHeader}>
            <h3>Advanced Filters</h3>
            <button onClick={clearAllFilters} className={styles.clearAllButton}>
              Clear All
            </button>
          </div>

          <div className={styles.filtersGrid}>
            {/* Dietary Restrictions */}
            <div className={styles.filterSection}>
              <h4>Dietary Restrictions</h4>
              <div className={styles.filterOptions}>
                {dietaryOptions.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.filterOption} ${
                      filters.dietary.includes(option.value) ? styles.active : ''
                    }`}
                    onClick={() => handleFilterChange('dietary', option.value)}
                  >
                    <span className={styles.filterIcon}>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking Time */}
            <div className={styles.filterSection}>
              <h4>Cooking Time</h4>
              <div className={styles.filterOptions}>
                {cookingTimeOptions.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.filterOption} ${
                      filters.cookingTime === option.value ? styles.active : ''
                    }`}
                    onClick={() => handleFilterChange('cookingTime', option.value)}
                  >
                    <span className={styles.filterIcon}>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Level */}
            <div className={styles.filterSection}>
              <h4>Difficulty Level</h4>
              <div className={styles.filterOptions}>
                {difficultyOptions.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.filterOption} ${
                      filters.difficulty === option.value ? styles.active : ''
                    }`}
                    onClick={() => handleFilterChange('difficulty', option.value)}
                  >
                    <span className={styles.filterIcon}>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cuisine Type */}
            <div className={styles.filterSection}>
              <h4>Cuisine Type</h4>
              <div className={styles.filterOptions}>
                {cuisineOptions.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.filterOption} ${
                      filters.cuisine === option.value ? styles.active : ''
                    }`}
                    onClick={() => handleFilterChange('cuisine', option.value)}
                  >
                    <span className={styles.filterIcon}>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className={styles.filterSection}>
              <h4>Minimum Rating</h4>
              <div className={styles.filterOptions}>
                {ratingOptions.map(option => (
                  <button
                    key={option.value}
                    className={`${styles.filterOption} ${
                      filters.rating === option.value ? styles.active : ''
                    }`}
                    onClick={() => handleFilterChange('rating', option.value)}
                  >
                    <span className={styles.filterIcon}>{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div className={styles.filterSection}>
              <h4>Ingredients</h4>
              <div className={styles.ingredientsSearch}>
                <input
                  type="text"
                  placeholder="Search ingredients..."
                  className={styles.ingredientsInput}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      handleFilterChange('ingredients', e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
              </div>
              <div className={styles.selectedIngredients}>
                {filters.ingredients.map(ingredient => (
                  <span key={ingredient} className={styles.selectedIngredient}>
                    {ingredient}
                    <button 
                      onClick={() => handleFilterChange('ingredients', ingredient)}
                      className={styles.removeIngredient}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar; 