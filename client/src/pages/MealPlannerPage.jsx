import React, { useState, useEffect } from 'react';
import WeeklyMealPlanner from '../components/WeeklyMealPlanner';
import styles from '../styles/PageWrapper.module.css';

const MealPlannerPage = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('/api/recipes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          setRecipes(data);
        } else {
          console.warn('API returned non-OK status:', response.status);
          // Fallback to localStorage if API fails
          loadLocalRecipes();
        }
      } catch (error) {
        console.warn('Error fetching recipes from API:', error.message);
        // For demo purposes, load from localStorage if API fails
        loadLocalRecipes();
      } finally {
        setLoading(false);
      }
    };

    const loadLocalRecipes = () => {
      try {
        const localRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
        setRecipes(localRecipes);
      } catch (error) {
        console.error('Error loading local recipes:', error);
        setRecipes([]);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading your meal planning tools...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <WeeklyMealPlanner recipes={recipes} />
    </div>
  );
};

export default MealPlannerPage; 