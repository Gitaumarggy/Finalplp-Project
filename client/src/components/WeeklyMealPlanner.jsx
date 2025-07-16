import React, { useState, useEffect } from 'react';
import styles from '../styles/WeeklyMealPlanner.module.css';

const WeeklyMealPlanner = ({ recipes = [] }) => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({});
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [showGroceryList, setShowGroceryList] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Meal types
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get week dates
  const getWeekDates = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay() + 1);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDates.push(day);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedWeek);

  // Load meal plan from localStorage
  useEffect(() => {
    const savedMealPlan = localStorage.getItem('weeklyMealPlan');
    if (savedMealPlan) {
      setMealPlan(JSON.parse(savedMealPlan));
    }
  }, []);

  // Save meal plan to localStorage
  useEffect(() => {
    localStorage.setItem('weeklyMealPlan', JSON.stringify(mealPlan));
  }, [mealPlan]);

  // Generate grocery list from meal plan
  const generateGroceryList = () => {
    const ingredients = {};
    
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipe => {
        if (recipe && recipe.ingredients) {
          const recipeIngredients = Array.isArray(recipe.ingredients) 
            ? recipe.ingredients 
            : recipe.ingredients.split(',').map(i => i.trim());
          
          recipeIngredients.forEach(ingredient => {
            const cleanIngredient = ingredient.trim().toLowerCase();
            ingredients[cleanIngredient] = (ingredients[cleanIngredient] || 0) + 1;
          });
        }
      });
    });

    const groceryItems = Object.entries(ingredients).map(([ingredient, count]) => ({
      id: Date.now() + Math.random(),
      name: ingredient,
      quantity: count > 1 ? `${count}x` : '1x',
      category: categorizeIngredient(ingredient),
      checked: false
    }));

    // Sort by category
    const categoryOrder = ['produce', 'dairy', 'meat', 'pantry', 'spices', 'other'];
    groceryItems.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      return aIndex - bIndex;
    });

    setGroceryList(groceryItems);
    setShowGroceryList(true);
  };

  const categorizeIngredient = (ingredient) => {
    const produce = ['tomato', 'onion', 'garlic', 'lettuce', 'spinach', 'carrot', 'potato', 'apple', 'banana', 'orange', 'lemon', 'lime', 'cucumber', 'bell pepper', 'mushroom', 'broccoli', 'cauliflower', 'zucchini', 'eggplant', 'avocado'];
    const dairy = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'heavy cream', 'half and half'];
    const meat = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'bacon', 'ham', 'turkey', 'lamb'];
    const pantry = ['flour', 'sugar', 'oil', 'pasta', 'rice', 'beans', 'bread', 'tortilla', 'cereal', 'nuts', 'seeds'];
    const spices = ['salt', 'pepper', 'oregano', 'basil', 'thyme', 'rosemary', 'cumin', 'paprika', 'cinnamon', 'nutmeg', 'ginger', 'garlic powder', 'onion powder'];

    const lowerIngredient = ingredient.toLowerCase();
    
    if (produce.some(item => lowerIngredient.includes(item))) return 'produce';
    if (dairy.some(item => lowerIngredient.includes(item))) return 'dairy';
    if (meat.some(item => lowerIngredient.includes(item))) return 'meat';
    if (pantry.some(item => lowerIngredient.includes(item))) return 'pantry';
    if (spices.some(item => lowerIngredient.includes(item))) return 'spices';
    return 'other';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      produce: '🥬',
      dairy: '🥛',
      meat: '🥩',
      pantry: '🥫',
      spices: '🧂',
      other: '📦'
    };
    return icons[category] || '📦';
  };

  const getCategoryName = (category) => {
    const names = {
      produce: 'Produce',
      dairy: 'Dairy & Eggs',
      meat: 'Meat & Fish',
      pantry: 'Pantry',
      spices: 'Spices & Herbs',
      other: 'Other'
    };
    return names[category] || 'Other';
  };

  const handleSlotClick = (day, mealType) => {
    setSelectedSlot({ day, mealType });
    setShowRecipeSelector(true);
  };

  const handleRecipeSelect = (recipe) => {
    if (selectedSlot) {
      setMealPlan(prev => ({
        ...prev,
        [selectedSlot.day]: {
          ...prev[selectedSlot.day],
          [selectedSlot.mealType]: recipe
        }
      }));
    }
    setShowRecipeSelector(false);
    setSelectedSlot(null);
  };

  const removeMeal = (day, mealType) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: null
      }
    }));
  };

  const getSuggestedRecipes = (mealType) => {
    return recipes.filter(recipe => {
      const tags = recipe.tags || [];
      const category = recipe.category || '';
      
      switch (mealType) {
        case 'breakfast':
          return tags.includes('breakfast') || category === 'breakfast';
        case 'lunch':
          return tags.includes('lunch') || category === 'lunch';
        case 'dinner':
          return tags.includes('dinner') || category === 'dinner';
        case 'snack':
          return tags.includes('snack') || category === 'snack' || tags.includes('quick');
        default:
          return true;
      }
    }).slice(0, 6); // Show top 6 suggestions
  };

  const getMealPlanStats = () => {
    let totalRecipes = 0;
    let totalTime = 0;
    let totalCalories = 0;

    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipe => {
        if (recipe) {
          totalRecipes++;
          totalTime += parseInt(recipe.cookingTime) || 30;
          // Estimate calories (rough calculation)
          totalCalories += (recipe.ingredients?.length || 5) * 150;
        }
      });
    });

    return { totalRecipes, totalTime, totalCalories };
  };

  const stats = getMealPlanStats();

  return (
    <div className={styles.mealPlannerContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Weekly Meal Planner</h2>
        <p>Plan your meals for the week and generate shopping lists</p>
        <div className={styles.headerControls}>
          <div className={styles.weekNavigation}>
            <button 
              onClick={() => {
                const newWeek = new Date(selectedWeek);
                newWeek.setDate(selectedWeek.getDate() - 7);
                setSelectedWeek(newWeek);
              }}
              className={styles.navButton}
            >
              <i className="fas fa-chevron-left"></i>
              Previous Week
            </button>
            <span className={styles.weekDisplay}>
              {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </span>
            <button 
              onClick={() => {
                const newWeek = new Date(selectedWeek);
                newWeek.setDate(selectedWeek.getDate() + 7);
                setSelectedWeek(newWeek);
              }}
              className={styles.navButton}
            >
              Next Week
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          <button 
            onClick={generateGroceryList}
            className={styles.generateListButton}
            disabled={stats.totalRecipes === 0}
          >
            <i className="fas fa-shopping-cart"></i>
            Shopping List
          </button>
          <button 
            onClick={() => setShowStats(true)}
            className={styles.statsButton}
          >
            <i className="fas fa-chart-bar"></i>
            Stats
          </button>
        </div>
      </div>
      {/* Card-based layout for days */}
      <div className={styles.dayCardsContainer}>
        {daysOfWeek.map((day, index) => (
          <DayCard
            key={day}
            day={day}
            date={weekDates[index]}
            mealTypes={mealTypes}
            meals={mealPlan[day] || {}}
            onSlotClick={handleSlotClick}
            removeMeal={removeMeal}
          />
        ))}
      </div>
      {/* Modals for grocery list and stats (implementation remains) */}
      {/* Recipe Selector Modal */}
      {showRecipeSelector && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Select Recipe for {selectedSlot?.mealType}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowRecipeSelector(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={styles.recipeSuggestions}>
              <h4>Suggested Recipes</h4>
              <div className={styles.recipeGrid}>
                {getSuggestedRecipes(selectedSlot?.mealType).map(recipe => (
                  <div 
                    key={recipe.id} 
                    className={styles.suggestionCard}
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    <div className={styles.suggestionImage}>
                      <i className="fas fa-utensils"></i>
                    </div>
                    <div className={styles.suggestionInfo}>
                      <h5>{recipe.title}</h5>
                      <span className={styles.suggestionTime}>
                        <i className="fas fa-clock"></i>
                        {recipe.cookingTime || '30 min'}
                      </span>
                      {recipe.rating && (
                        <span className={styles.suggestionRating}>
                          <i className="fas fa-star"></i>
                          {recipe.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <h4>All Recipes</h4>
              <div className={styles.recipeGrid}>
                {recipes.slice(0, 12).map(recipe => (
                  <div 
                    key={recipe.id} 
                    className={styles.suggestionCard}
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    <div className={styles.suggestionImage}>
                      <i className="fas fa-utensils"></i>
                    </div>
                    <div className={styles.suggestionInfo}>
                      <h5>{recipe.title}</h5>
                      <span className={styles.suggestionTime}>
                        <i className="fas fa-clock"></i>
                        {recipe.cookingTime || '30 min'}
                      </span>
                      {recipe.rating && (
                        <span className={styles.suggestionRating}>
                          <i className="fas fa-star"></i>
                          {recipe.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grocery List Modal */}
      {showGroceryList && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Generated Shopping List</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowGroceryList(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={styles.groceryList}>
              {Object.entries(groceryList.reduce((groups, item) => {
                if (!groups[item.category]) {
                  groups[item.category] = [];
                }
                groups[item.category].push(item);
                return groups;
              }, {})).map(([category, items]) => (
                <div key={category} className={styles.categorySection}>
                  <h4 className={styles.categoryHeader}>
                    <span className={styles.categoryIcon}>{getCategoryIcon(category)}</span>
                    {getCategoryName(category)}
                  </h4>
                  <div className={styles.categoryItems}>
                    {items.map(item => (
                      <div 
                        key={item.id} 
                        className={`${styles.groceryItem} ${item.checked ? styles.checked : ''}`}
                      >
                        <label className={styles.itemCheckbox}>
                          <input
                            type="checkbox"
                            checked={item.checked}
                            onChange={() => {
                              setGroceryList(prev => prev.map(i => 
                                i.id === item.id ? { ...i, checked: !i.checked } : i
                              ));
                            }}
                          />
                          <span className={styles.checkmark}></span>
                        </label>
                        <span className={styles.itemQuantity}>{item.quantity}</span>
                        <span className={styles.itemName}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.modalActions}>
              <button 
                onClick={() => {
                  const text = groceryList.map(item => `${item.quantity} ${item.name}`).join('\n');
                  navigator.clipboard.writeText(text);
                  alert('Shopping list copied to clipboard!');
                }}
                className={styles.copyButton}
              >
                <i className="fas fa-copy"></i>
                Copy to Clipboard
              </button>
              <button 
                onClick={() => setShowGroceryList(false)}
                className={styles.closeButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStats && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Meal Plan Stats</h3>
              <button className={styles.closeButton} onClick={() => setShowStats(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.statsModalContent}>
              <div className={styles.statItem}><i className="fas fa-utensils"></i> <span>{stats.totalRecipes} recipes planned</span></div>
              <div className={styles.statItem}><i className="fas fa-clock"></i> <span>{Math.round(stats.totalTime / 60)} hours total cooking</span></div>
              <div className={styles.statItem}><i className="fas fa-fire"></i> <span>~{Math.round(stats.totalCalories / 7)} avg calories/day</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// New DayCard component for card-based layout
function DayCard({ day, date, mealTypes, meals, onSlotClick, removeMeal }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className={styles.dayCard}>
      <div className={styles.dayCardHeader}>
        <div>
          <div className={styles.dayCardName}>{day}</div>
          <div className={styles.dayCardDate}>{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
        </div>
        <button className={styles.expandBtn} onClick={() => setExpanded(e => !e)}>
          <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
        </button>
      </div>
      {expanded && (
        <div className={styles.dayCardMeals}>
          {mealTypes.map(mealType => {
            const recipe = meals[mealType];
            return (
              <div key={mealType} className={styles.dayCardMealSlot} onClick={() => onSlotClick(day, mealType)}>
                <div className={styles.dayCardMealType}>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</div>
                {recipe ? (
                  <div className={styles.dayCardRecipe}>
                    <div className={styles.dayCardRecipeTitle}>{recipe.title}</div>
                    <div className={styles.dayCardRecipeTime}><i className="fas fa-clock"></i> {recipe.cookingTime || '30 min'}</div>
                    <button className={styles.dayCardRemoveBtn} onClick={e => { e.stopPropagation(); removeMeal(day, mealType); }}><i className="fas fa-times"></i></button>
                  </div>
                ) : (
                  <div className={styles.dayCardEmpty}><i className="fas fa-plus"></i> Add Recipe</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WeeklyMealPlanner; 