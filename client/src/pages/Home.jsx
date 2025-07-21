import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeList from '../components/RecipeList';
import RecipeRecommendations from '../components/RecipeRecommendations';
import styles from '../styles/Home.module.css';

const Home = () => {
  const [recipes, setRecipes] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [userPreferences, setUserPreferences] = useState({});
  const [userHistory, setUserHistory] = useState([]);
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const recipeSectionRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch('/api/recipes', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
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
      }
    };

    const loadLocalRecipes = () => {
      try {
        let localRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
        
        // Add sample recipes if none exist
        if (localRecipes.length === 0) {
          localRecipes = [
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
            }
          ];
          localStorage.setItem('recipes', JSON.stringify(localRecipes));
        }
        
        setRecipes(localRecipes);
      } catch (error) {
        console.error('Error loading local recipes:', error);
        setRecipes([]);
      }
    };

    // Mock user preferences for recommendations
    const mockUserPreferences = {
      dietaryRestrictions: ['vegetarian'],
      cuisinePreferences: ['italian', 'mediterranean', 'asian'],
      skillLevel: 'intermediate',
      maxCookingTime: 45
    };

    // Mock user cooking history
    const mockUserHistory = [
      { recipeId: '1', cookedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { recipeId: '3', cookedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
    ];

    setUserPreferences(mockUserPreferences);
    setUserHistory(mockUserHistory);

    fetchRecipes();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/recipes/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setRecipes(recipes.filter(r => r._id !== id));
      } else {
        console.warn('Delete API returned non-OK status:', response.status);
        // Fallback to localStorage update
        const updatedRecipes = recipes.filter(r => r.id !== id);
        setRecipes(updatedRecipes);
        localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
      }
    } catch (error) {
      console.warn('Error deleting recipe:', error.message);
      // For demo purposes, update localStorage if API fails
      const updatedRecipes = recipes.filter(r => r.id !== id);
      setRecipes(updatedRecipes);
      localStorage.setItem('recipes', JSON.stringify(updatedRecipes));
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleAddRecipe = () => {
    navigate('/add');
  };

  // Category definitions (same as CategoryPage)
  const categories = {
    breakfast: { name: 'Breakfast', icon: '🥞' },
    lunch: { name: 'Lunch', icon: '🥪' },
    dinner: { name: 'Dinner', icon: '🍝' },
    dessert: { name: 'Dessert', icon: '🍰' },
    snack: { name: 'Snacks', icon: '🍿' },
    vegetarian: { name: 'Vegetarian', icon: '🥬' },
    vegan: { name: 'Vegan', icon: '🌱' },
    'gluten-free': { name: 'Gluten-Free', icon: '🌾' },
    quick: { name: 'Quick & Easy', icon: '⚡' },
    healthy: { name: 'Healthy', icon: '💚' },
    comfort: { name: 'Comfort Food', icon: '🫂' }
  };

  // Category count logic (same as CategoryPage)
  const getCategoryCount = (catKey) => {
    return recipes.filter(recipe => {
      if (catKey === 'vegetarian' && recipe.tags?.includes('vegetarian')) return true;
      if (catKey === 'vegan' && recipe.tags?.includes('vegan')) return true;
      if (catKey === 'gluten-free' && recipe.tags?.includes('gluten-free')) return true;
      if (catKey === 'quick' && (parseInt(recipe.cookingTime) || 30) <= 30) return true;
      if (catKey === 'healthy' && recipe.tags?.includes('healthy')) return true;
      if (catKey === 'comfort' && recipe.tags?.includes('comfort')) return true;
      if (['breakfast', 'lunch', 'dinner', 'dessert', 'snack'].includes(catKey)) {
        return recipe.category?.toLowerCase() === catKey;
      }
      return false;
    }).length;
  };

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`${styles.hero} ${isVisible ? styles.fadeIn : ''}`}
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: 1 - (scrollY * 0.0008)
        }}
      >
        <div className={styles.heroContent}>
          <h1 className={isVisible ? styles.slideDown : ''}>Your Kitchen Companion Awaits</h1>
          <p className={isVisible ? styles.slideUp : ''}>
            Carey's Recipe App is your digital cookbook—crafted with love. Explore simple, tasty, and unforgettable meals.
            Whether you're cooking for yourself or those you love, every recipe is a memory in the making.
            Let's turn everyday ingredients into extraordinary experiences.
          </p>
          <div className={styles.heroButtons}>
            {/* Removed browse recipe section */}
            <button 
              className={styles.secondaryButton} 
              onClick={handleAddRecipe}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
              }}
            >
              Add Your Own
            </button>
          </div>
        </div>
      </section>

      {/* Smart Recommendations Section */}
      <section className={`${styles.recommendationsSection} ${isVisible ? styles.fadeIn : ''}`}>
        <RecipeRecommendations 
          userPreferences={userPreferences}
          userHistory={userHistory}
          allRecipes={recipes}
        />
      </section>

      {/* Footer Section */}
      <footer className={`${styles.footer} ${isVisible ? styles.fadeIn : ''}`}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>Connect With Me</h3>
            <div className={styles.socialLinks}>
              <a 
                href="https://www.instagram.com/margg.y" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
                }}
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://github.com/Gitaumarggy" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
                }}
              >
                <i className="fab fa-github"></i>
              </a>
              <a 
                href="https://www.linkedin.com/in/margaret-gitau" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
                }}
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a 
                href="https://twitter.com/MargaretGitau1" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.15)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
                }}
              >
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h3>Quick Links</h3>
            <ul className={styles.footerLinks}>
              <li><a href="/about">About Us</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/contact">Contact Support</a></li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h3>Contact Information</h3>
            <div className={styles.contactInfo}>
              <div 
                className={styles.contactItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <i className="fas fa-user"></i>
                <span>Margaret Gitau</span>
              </div>
              <div 
                className={styles.contactItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <i className="fas fa-envelope"></i>
                <span>gitaumarggy@gmail.com</span>
              </div>
              <div 
                className={styles.contactItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <i className="fas fa-phone"></i>
                <span>+254 742 617804</span>
              </div>
              <div 
                className={styles.contactItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(8px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }}
              >
                <i className="fas fa-map-marker-alt"></i>
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} Carey's Recipe App. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;