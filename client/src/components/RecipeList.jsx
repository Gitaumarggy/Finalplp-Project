import React from "react";
import RecipeCard from "./RecipeCard";
import SearchBar from "./SearchBar";
import EnhancedSearchBar from './EnhancedSearchBar';
import styles from "../styles/RecipeList.module.css";

function RecipeList({ recipes, handleDelete, handleEdit }) {
  const [filteredRecipes, setFilteredRecipes] = React.useState(recipes);

  // Advanced search/filter handler
  const handleAdvancedSearch = ({ query, filters }) => {
    let result = recipes;
    // Text search
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(recipe =>
        recipe.title.toLowerCase().includes(q) ||
        (Array.isArray(recipe.ingredients)
          ? recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(q))
          : recipe.ingredients?.toLowerCase().includes(q)) ||
        (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }
    // Ingredients filter
    if (filters.ingredients && filters.ingredients.length > 0) {
      result = result.filter(recipe =>
        filters.ingredients.every(ing =>
          (Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map(i => i.toLowerCase())
            : (recipe.ingredients || '').toLowerCase().split(',')
          ).includes(ing.toLowerCase())
        )
      );
    }
    // Tags filter (if you want to support multi-tag)
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(recipe =>
        recipe.tags && filters.tags.every(tag => recipe.tags.includes(tag))
      );
    }
    // Category filter
    if (filters.category) {
      result = result.filter(recipe => recipe.category === filters.category);
    }
    // Dietary filter
    if (filters.dietary && filters.dietary.length > 0) {
      result = result.filter(recipe =>
        filters.dietary.every(diet => recipe.dietary && recipe.dietary[diet])
      );
    }
    // Difficulty filter
    if (filters.difficulty) {
      result = result.filter(recipe => recipe.difficulty === filters.difficulty);
    }
    // Cuisine filter
    if (filters.cuisine) {
      result = result.filter(recipe => recipe.cuisine === filters.cuisine);
    }
    // Rating filter
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      result = result.filter(recipe => (recipe.ratings?.average || 0) >= minRating);
    }
    setFilteredRecipes(result);
  };

  React.useEffect(() => {
    setFilteredRecipes(recipes);
  }, [recipes]);

  if (recipes.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🍽️</div>
        <h3>No recipes yet</h3>
        <p>Start by adding your first recipe!</p>
      </div>
    );
  }

  return (
    <div className={styles.recipeListContainer}>
      <EnhancedSearchBar onSearch={handleAdvancedSearch} recipes={recipes} />
      {filteredRecipes.length === 0 ? (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h3>No recipes found</h3>
          <p>Try adjusting your search or filters</p>
          <button 
            onClick={() => setFilteredRecipes(recipes)}
            className={styles.clearFiltersButton}
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className={styles.resultsInfo}>
            <span>Showing {filteredRecipes.length} of {recipes.length} recipes</span>
          </div>
          <div className={styles.recipeGrid}>
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default RecipeList;
