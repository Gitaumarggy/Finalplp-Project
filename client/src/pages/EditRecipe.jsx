import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import styles from '../styles/App.module.css';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to check for valid MongoDB ObjectId
  function isValidObjectId(id) {
    return /^[a-fA-F0-9]{24}$/.test(id);
  }

  useEffect(() => {
    const loadRecipe = async () => {
      if (isValidObjectId(id)) {
        try {
          const response = await fetch(`/api/recipes/${id}`);
          if (response.ok) {
            const recipe = await response.json();
            setInitialData(recipe);
            setIsLoading(false);
            return;
          }
        } catch (error) {
          // fall through to localStorage
        }
      }
      // Fallback to localStorage for local recipes or failed API
      const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
      const found = recipes.find((r) => String(r.id) === String(id) || String(r._id) === String(id));
      if (found) {
        setInitialData(found);
      } else {
        alert('Recipe not found!');
        navigate('/');
      }
      setIsLoading(false);
    };

    loadRecipe();
  }, [id, navigate]);

  const handleSubmit = async (updatedRecipe) => {
    setIsSubmitting(true);
    const recipeId = initialData._id || initialData.id;
    if (isValidObjectId(recipeId)) {
      try {
        // Try to update via API first
        const response = await fetch(`/api/recipes/${recipeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedRecipe),
        });

        if (response.ok) {
          navigate('/');
        } else {
          throw new Error('API update failed');
        }
      } catch (error) {
        console.error('Error updating recipe:', error);
        // Fallback to localStorage
        const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        const updatedList = recipes.map((r) =>
          String(r.id) === String(recipeId) || String(r._id) === String(recipeId)
            ? { ...r, ...updatedRecipe }
            : r
        );
        localStorage.setItem('recipes', JSON.stringify(updatedList));
        navigate('/');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Local recipe: update in localStorage only
      try {
        const recipes = JSON.parse(localStorage.getItem('recipes')) || [];
        const updatedList = recipes.map((r) =>
          String(r.id) === String(recipeId) || String(r._id) === String(recipeId)
            ? { ...r, ...updatedRecipe }
            : r
        );
        localStorage.setItem('recipes', JSON.stringify(updatedList));
        navigate('/');
      } catch (error) {
        console.error('Error updating local recipe:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading recipe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.editRecipeContainer}>
      {/* Hero Section */}
      <section className={`${styles.editRecipeHero} ${styles.fadeIn}`}>
        <div className={styles.heroContent}>
          <h1 className={`${styles.editRecipeTitle} ${styles.slideDown}`}>Edit Your Recipe</h1>
          <p className={`${styles.editRecipeSubtitle} ${styles.slideUp}`}>
            Update your recipe details and make it even better!
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className={`${styles.formSection} ${styles.fadeIn}`}>
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>Update Recipe Details</h2>
          <div className={styles.formWrapper}>
            {initialData && (
              <RecipeForm 
                onSubmit={handleSubmit} 
                initialData={initialData} 
              />
            )}
            {isSubmitting && (
              <div className={styles.loadingMessage}>
                <i className="fas fa-spinner fa-spin"></i>
                Updating your recipe...
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditRecipe;
