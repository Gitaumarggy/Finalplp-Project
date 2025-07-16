import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import styles from '../styles/AddRecipe.module.css';

const AddRecipe = () => {
  const [recipes, setRecipes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleAddRecipe = async (newRecipe) => {
    setIsSubmitting(true);
    try {
      // Get user token for authentication
      const token = localStorage.getItem('token');
      let user = {};
      const userRaw = localStorage.getItem('user');
      if (userRaw && userRaw !== 'undefined') {
        user = JSON.parse(userRaw);
      }
      // If logged in, try to save to API
      if (token && user._id) {
        // Prepare recipe data with required fields
        const recipeData = {
          ...newRecipe,
          createdBy: user._id || 'anonymous',
          category: 'other',
          difficulty: 'beginner',
          prepTime: parseInt(newRecipe.cookingTime) || 30,
          cookTime: parseInt(newRecipe.cookingTime) || 30,
          totalTime: parseInt(newRecipe.cookingTime) || 30,
          servings: parseInt(newRecipe.servings) || 4
        };
        const response = await fetch('/api/recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(recipeData),
        });
        if (response.ok) {
          const savedRecipe = await response.json();
          setRecipes(prev => [...prev, savedRecipe]);
          return;
        } else {
          let errorMsg = 'API save failed';
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorData.message || errorMsg;
          } catch {}
          console.error('API Error:', errorMsg);
          alert('Failed to add recipe: ' + errorMsg);
          setIsSubmitting(false);
          return;
        }
      }
      // If not logged in, or API fails, save to localStorage
      const existingRecipesRaw = localStorage.getItem('recipes');
      let existingRecipes = [];
      if (existingRecipesRaw && existingRecipesRaw !== 'undefined') {
        existingRecipes = JSON.parse(existingRecipesRaw);
      }
      const updatedRecipes = [...existingRecipes, newRecipe];
      try {
        localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
        setRecipes(prev => [...prev, newRecipe]);
      } catch (storageError) {
        console.error('localStorage Error:', storageError);
        alert('Failed to save recipe locally: ' + storageError.message);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Unexpected error: ' + (error.message || error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.addRecipeContainer}>
      {/* Hero Section */}
      <section className={`${styles.addRecipeHero} ${isVisible ? styles.fadeIn : ''}`}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.addRecipeTitle} ${isVisible ? styles.slideDown : ''}`}>Share Your Culinary Creation</h1>
          <p className={`${styles.addRecipeSubtitle} ${isVisible ? styles.slideUp : ''}`}>
            Add your special recipe to our collection and inspire other food enthusiasts!
          </p>
          <button 
            className={styles.submitButton}
            onClick={scrollToForm}
            style={{
              marginTop: '2rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
            }}
          >
            Start Creating
          </button>
        </div>
      </section>

      {/* Form Section */}
      <section ref={formRef} className={`${styles.formSection} ${isVisible ? styles.fadeIn : ''}`}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Recipe Details</h2>
          <div className={styles.formWrapper}>
            <RecipeForm onAddRecipe={handleAddRecipe} />
            {isSubmitting && (
              <div className={styles.loadingMessage}>
                <i className="fas fa-spinner fa-spin"></i>
                Saving your recipe...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Preview Section */}
    </div>
  );
};

export default AddRecipe;