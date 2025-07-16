import React, { useState, useEffect } from 'react';
import styles from '../styles/AIRecipeGenerator.module.css';

const AIRecipeGenerator = ({ recipes = [] }) => {
  console.log('AIRecipeGenerator rendered with recipes:', recipes);
  console.log('Recipes length:', recipes.length);
  
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState([]);
  const [cookingTime, setCookingTime] = useState('any');
  const [difficulty, setDifficulty] = useState('any');
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' or 'question'
  const [questionInput, setQuestionInput] = useState('');
  const [showSubstitutionModal, setShowSubstitutionModal] = useState(false);
  const [substitutionInput, setSubstitutionInput] = useState('');
  const [substitutionResult, setSubstitutionResult] = useState('');
  const [isSubstituting, setIsSubstituting] = useState(false);
  const [substitutionError, setSubstitutionError] = useState('');
  const [showRewriteModal, setShowRewriteModal] = useState(false);
  const [rewriteRestriction, setRewriteRestriction] = useState('vegan');
  const [rewriteResult, setRewriteResult] = useState('');
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState('');
  const [rewriteRecipeText, setRewriteRecipeText] = useState('');

  // Common ingredients database
  const commonIngredients = [
    'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'eggs', 'milk', 'cheese', 'butter',
    'flour', 'sugar', 'salt', 'pepper', 'garlic', 'onion', 'tomato', 'potato', 'carrot',
    'broccoli', 'spinach', 'lettuce', 'cucumber', 'bell pepper', 'mushroom', 'rice',
    'pasta', 'bread', 'oil', 'olive oil', 'vinegar', 'lemon', 'lime', 'herbs', 'spices',
    'beans', 'chickpeas', 'lentils', 'quinoa', 'oatmeal', 'yogurt', 'cream', 'sour cream',
    'bacon', 'ham', 'turkey', 'lamb', 'tuna', 'crab', 'lobster', 'scallops', 'mussels',
    'avocado', 'banana', 'apple', 'orange', 'strawberry', 'blueberry', 'raspberry',
    'peach', 'pear', 'grape', 'pineapple', 'mango', 'kiwi', 'coconut', 'almonds',
    'walnuts', 'pecans', 'cashews', 'peanuts', 'sunflower seeds', 'pumpkin seeds',
    'chocolate', 'vanilla', 'cinnamon', 'nutmeg', 'ginger', 'oregano', 'basil', 'thyme',
    'rosemary', 'parsley', 'cilantro', 'dill', 'mint', 'sage', 'bay leaves', 'cumin',
    'paprika', 'turmeric', 'curry powder', 'chili powder', 'cayenne pepper', 'red pepper flakes'
  ];

  // Ingredient substitutions database
  const substitutions = {
    'eggs': [
      { ingredient: 'flaxseed meal', ratio: '1 tbsp + 3 tbsp water', notes: 'For binding in baking' },
      { ingredient: 'banana', ratio: '1/4 cup mashed', notes: 'For moisture in baking' },
      { ingredient: 'applesauce', ratio: '1/4 cup', notes: 'For moisture in baking' },
      { ingredient: 'silken tofu', ratio: '1/4 cup blended', notes: 'For protein and binding' }
    ],
    'milk': [
      { ingredient: 'almond milk', ratio: '1:1', notes: 'Dairy-free alternative' },
      { ingredient: 'soy milk', ratio: '1:1', notes: 'High protein alternative' },
      { ingredient: 'oat milk', ratio: '1:1', notes: 'Creamy dairy-free option' },
      { ingredient: 'coconut milk', ratio: '1:1', notes: 'Rich, tropical flavor' }
    ],
    'butter': [
      { ingredient: 'olive oil', ratio: '3/4 cup oil for 1 cup butter', notes: 'For cooking and baking' },
      { ingredient: 'coconut oil', ratio: '1:1', notes: 'For baking and cooking' },
      { ingredient: 'applesauce', ratio: '1/2 cup for 1 cup butter', notes: 'For baking, reduces fat' },
      { ingredient: 'avocado', ratio: '1:1', notes: 'For spreading and some baking' }
    ],
    'flour': [
      { ingredient: 'almond flour', ratio: '1:1', notes: 'Gluten-free, high protein' },
      { ingredient: 'coconut flour', ratio: '1/4 cup for 1 cup flour', notes: 'Gluten-free, absorbs more liquid' },
      { ingredient: 'oat flour', ratio: '1:1', notes: 'Gluten-free, whole grain' },
      { ingredient: 'quinoa flour', ratio: '1:1', notes: 'Gluten-free, complete protein' }
    ],
    'sugar': [
      { ingredient: 'honey', ratio: '3/4 cup for 1 cup sugar', notes: 'Natural sweetener' },
      { ingredient: 'maple syrup', ratio: '3/4 cup for 1 cup sugar', notes: 'Natural sweetener' },
      { ingredient: 'stevia', ratio: '1/4 tsp for 1 cup sugar', notes: 'Zero-calorie sweetener' },
      { ingredient: 'coconut sugar', ratio: '1:1', notes: 'Lower glycemic index' }
    ],
    'salt': [
      { ingredient: 'herbs and spices', ratio: 'to taste', notes: 'Flavor without sodium' },
      { ingredient: 'lemon juice', ratio: 'to taste', notes: 'Brightens flavors' },
      { ingredient: 'vinegar', ratio: 'to taste', notes: 'Adds acidity and flavor' }
    ]
  };

  const addIngredient = (e) => {
    e.preventDefault();
    if (ingredientInput.trim() && !availableIngredients.includes(ingredientInput.trim().toLowerCase())) {
      setAvailableIngredients(prev => [...prev, ingredientInput.trim().toLowerCase()]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ingredient) => {
    setAvailableIngredients(prev => prev.filter(item => item !== ingredient));
  };

  const generateRecipes = async () => {
    if (availableIngredients.length === 0) {
      alert('Please add some ingredients first!');
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipes([]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/recipes/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ ingredients: availableIngredients })
      });
      if (!response.ok) {
        throw new Error('Failed to generate recipe.');
      }
      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        setGeneratedRecipes(data.recipes);
      } else {
        setGeneratedRecipes([]);
        alert('No matching recipes found!');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert('Sorry, there was an error generating the recipe. Please try again!');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRecipesFromQuestion = async () => {
    console.log('Question-based generation clicked!');
    console.log('Question:', questionInput);
    
    if (!questionInput.trim()) {
      alert('Please ask a question about what you want to cook!');
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Starting question-based recipe generation...');
      
      // Parse the question to understand what the user wants
      const question = questionInput.toLowerCase();
      
      // Define recipe templates based on common questions
      const recipeTemplates = {
        'breakfast': {
          title: 'Delicious Breakfast Bowl',
          category: 'Breakfast',
          cookingTime: '15 min',
          difficulty: 'Beginner',
          ingredients: ['eggs', 'avocado', 'tomato', 'bread', 'olive oil', 'salt', 'pepper'],
          instructions: '1. Toast bread until golden brown\n2. Fry eggs to your preference\n3. Slice avocado and tomato\n4. Arrange on plate and season with salt and pepper',
          aiInsights: ['🌅 Perfect morning meal!', '⚡ Quick and nutritious']
        },
        'pasta': {
          title: 'Simple Pasta Dish',
          category: 'Main Course',
          cookingTime: '20 min',
          difficulty: 'Beginner',
          ingredients: ['pasta', 'olive oil', 'garlic', 'tomato', 'basil', 'salt', 'pepper'],
          instructions: '1. Cook pasta according to package instructions\n2. Sauté garlic in olive oil\n3. Add tomatoes and cook until soft\n4. Toss with pasta and fresh basil\n5. Season with salt and pepper',
          aiInsights: ['🍝 Classic Italian flavors!', '👨‍🍳 Easy to customize']
        },
        'chicken': {
          title: 'Herb-Roasted Chicken',
          category: 'Main Course',
          cookingTime: '45 min',
          difficulty: 'Intermediate',
          ingredients: ['chicken breast', 'olive oil', 'herbs', 'garlic', 'lemon', 'salt', 'pepper'],
          instructions: '1. Preheat oven to 400°F\n2. Season chicken with herbs, garlic, salt, and pepper\n3. Drizzle with olive oil and lemon juice\n4. Roast for 25-30 minutes until cooked through',
          aiInsights: ['🍗 Juicy and flavorful!', '🌿 Fresh herbs make it special']
        },
        'salad': {
          title: 'Fresh Garden Salad',
          category: 'Salad',
          cookingTime: '10 min',
          difficulty: 'Beginner',
          ingredients: ['lettuce', 'cucumber', 'tomato', 'bell pepper', 'olive oil', 'vinegar', 'salt'],
          instructions: '1. Wash and chop all vegetables\n2. Combine in a large bowl\n3. Drizzle with olive oil and vinegar\n4. Season with salt and toss gently',
          aiInsights: ['🥗 Healthy and refreshing!', '🌱 Packed with nutrients']
        },
        'dessert': {
          title: 'Simple Fruit Dessert',
          category: 'Dessert',
          cookingTime: '15 min',
          difficulty: 'Beginner',
          ingredients: ['mixed berries', 'yogurt', 'honey', 'mint', 'nuts'],
          instructions: '1. Wash and prepare fresh berries\n2. Layer berries with yogurt in serving glasses\n3. Drizzle with honey\n4. Garnish with mint and chopped nuts',
          aiInsights: ['🍓 Sweet and healthy!', '🍯 Natural sweetness']
        }
      };

      // Determine what type of recipe to generate based on the question
      let recipeType = 'pasta'; // default
      if (question.includes('breakfast') || question.includes('morning') || question.includes('eggs')) {
        recipeType = 'breakfast';
      } else if (question.includes('pasta') || question.includes('noodle') || question.includes('spaghetti')) {
        recipeType = 'pasta';
      } else if (question.includes('chicken') || question.includes('meat') || question.includes('protein')) {
        recipeType = 'chicken';
      } else if (question.includes('salad') || question.includes('vegetable') || question.includes('healthy')) {
        recipeType = 'salad';
      } else if (question.includes('dessert') || question.includes('sweet') || question.includes('cake')) {
        recipeType = 'dessert';
      }

      // Generate a custom recipe based on the template
      const template = recipeTemplates[recipeType];
      const customRecipe = {
        id: Date.now(),
        title: template.title,
        category: template.category,
        cookingTime: template.cookingTime,
        difficulty: template.difficulty,
        ingredients: template.ingredients,
        instructions: template.instructions,
        matchPercentage: 100,
        matchingIngredients: template.ingredients,
        missingIngredients: [],
        aiInsights: template.aiInsights,
        rating: 4.5,
        tags: [template.category.toLowerCase(), 'ai-generated']
      };

      // Also try to find similar recipes from the database
      const similarRecipes = recipes.filter(recipe => {
        const recipeText = `${recipe.title} ${recipe.category || ''} ${recipe.tags?.join(' ') || ''}`.toLowerCase();
        return question.split(' ').some(word => 
          word.length > 3 && recipeText.includes(word)
        );
      }).slice(0, 3);

      const allSuggestions = [customRecipe, ...similarRecipes];
      
      setGeneratedRecipes(allSuggestions);
      
      console.log('Successfully generated recipes from question!');
      
    } catch (error) {
      console.error('Error generating recipes from question:', error);
      alert('Sorry, there was an error generating recipes. Please try again!');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAIInsights = (recipe, matching, missing) => {
    const insights = [];
    
    // Handle different ingredient formats
    let totalIngredients = 0;
    if (Array.isArray(recipe.ingredients)) {
      totalIngredients = recipe.ingredients.length;
    } else if (typeof recipe.ingredients === 'string') {
      totalIngredients = recipe.ingredients.split(',').length;
    }
    
    if (totalIngredients > 0) {
      if (matching.length >= totalIngredients * 0.7) {
        insights.push('🎯 Perfect match! You have most ingredients needed.');
      } else if (matching.length >= totalIngredients * 0.5) {
        insights.push('👍 Good match! You have half the ingredients.');
      } else {
        insights.push('⚠️ Partial match. You\'ll need to shop for some ingredients.');
      }
    }
    
    if (missing.length <= 3) {
      insights.push('🛒 Only a few ingredients needed!');
    }
    
    if (recipe.tags?.includes('quick') || recipe.category?.toLowerCase().includes('quick')) {
      insights.push('⚡ Quick and easy recipe!');
    }
    
    if (recipe.rating && recipe.rating >= 4.5) {
      insights.push('⭐ Highly rated by the community!');
    }
    
    return insights;
  };

  const getSubstitutionsForIngredient = (ingredient) => {
    return substitutions[ingredient.toLowerCase()] || [];
  };

  const clearAll = () => {
    setAvailableIngredients([]);
    setGeneratedRecipes([]);
    setDietaryPreferences([]);
    setCookingTime('any');
    setDifficulty('any');
  };

  return (
    <div className={styles.aiGeneratorContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h2>🤖 AI Recipe Generator</h2>
        <p>Tell me what ingredients you have, or ask me what to cook!</p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'ingredients' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('ingredients')}
        >
          <i className="fas fa-carrot"></i>
          I Have Ingredients
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'question' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('question')}
        >
          <i className="fas fa-question-circle"></i>
          Ask Me What to Cook
        </button>
      </div>

      {/* Ingredients Tab */}
      {activeTab === 'ingredients' && (
        <>
          {/* Ingredient Input */}
          <div className={styles.ingredientSection}>
            <h3>Available Ingredients</h3>
            <form onSubmit={addIngredient} className={styles.ingredientForm}>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  placeholder="Type an ingredient (e.g., chicken, tomatoes, pasta)..."
                  className={styles.ingredientInput}
                  list="commonIngredients"
                />
                <datalist id="commonIngredients">
                  {commonIngredients.map(ingredient => (
                    <option key={ingredient} value={ingredient} />
                  ))}
                </datalist>
                <button type="submit" className={styles.addButton}>
                  <i className="fas fa-plus"></i>
                </button>
                <button
                  type="button"
                  className={styles.substituteButton}
                  style={{ marginLeft: 8 }}
                  onClick={() => {
                    setShowSubstitutionModal(true);
                    setSubstitutionInput('');
                    setSubstitutionResult('');
                    setSubstitutionError('');
                  }}
                  title="Smart Ingredient Substitution"
                >
                  <i className="fas fa-exchange-alt"></i> Smart Substitution
                </button>
              </div>
            </form>

            {/* Selected Ingredients */}
            <div className={styles.selectedIngredients}>
              {availableIngredients.map(ingredient => (
                <span key={ingredient} className={styles.ingredientTag}>
                  {ingredient}
                  <button 
                    onClick={() => removeIngredient(ingredient)}
                    className={styles.removeIngredient}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {availableIngredients.length === 0 && (
              <div className={styles.emptyState}>
                <i className="fas fa-carrot"></i>
                <p>Add some ingredients to get started!</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Question Tab */}
      {activeTab === 'question' && (
        <div className={styles.questionSection}>
          <h3>What would you like to cook?</h3>
          <div className={styles.questionInputContainer}>
            <textarea
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask me anything! Examples:&#10;• What should I cook for breakfast?&#10;• I want something healthy with chicken&#10;• Quick pasta recipe for dinner&#10;• Easy dessert for kids&#10;• Vegetarian meal ideas"
              className={styles.questionInput}
              rows={4}
            />
          </div>
          <div className={styles.questionExamples}>
            <h4>💡 Try asking:</h4>
            <div className={styles.exampleQuestions}>
              <button 
                onClick={() => setQuestionInput('What should I cook for breakfast?')}
                className={styles.exampleButton}
              >
                "What should I cook for breakfast?"
              </button>
              <button 
                onClick={() => setQuestionInput('I want something healthy with chicken')}
                className={styles.exampleButton}
              >
                "I want something healthy with chicken"
              </button>
              <button 
                onClick={() => setQuestionInput('Quick pasta recipe for dinner')}
                className={styles.exampleButton}
              >
                "Quick pasta recipe for dinner"
              </button>
              <button 
                onClick={() => setQuestionInput('Easy dessert for kids')}
                className={styles.exampleButton}
              >
                "Easy dessert for kids"
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preferences */}
      <div className={styles.preferencesSection}>
        <h3>Preferences</h3>
        <div className={styles.preferencesGrid}>
          {/* Dietary Preferences */}
          <div className={styles.preferenceGroup}>
            <label>Dietary Restrictions</label>
            <div className={styles.checkboxGroup}>
              {['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].map(pref => (
                <label key={pref} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={dietaryPreferences.includes(pref)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDietaryPreferences(prev => [...prev, pref]);
                      } else {
                        setDietaryPreferences(prev => prev.filter(p => p !== pref));
                      }
                    }}
                  />
                  <span className={styles.checkmark}></span>
                  {pref.charAt(0).toUpperCase() + pref.slice(1).replace('-', ' ')}
                </label>
              ))}
            </div>
          </div>

          {/* Cooking Time */}
          <div className={styles.preferenceGroup}>
            <label>Cooking Time</label>
            <select 
              value={cookingTime} 
              onChange={(e) => setCookingTime(e.target.value)}
              className={styles.select}
            >
              <option value="any">Any time</option>
              <option value="quick">Quick (≤ 30 min)</option>
              <option value="medium">Medium (30-60 min)</option>
              <option value="long">Long (&gt; 60 min)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div className={styles.preferenceGroup}>
            <label>Difficulty Level</label>
            <select 
              value={difficulty} 
              onChange={(e) => setDifficulty(e.target.value)}
              className={styles.select}
            >
              <option value="any">Any level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className={styles.generateSection}>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Button clicked!');
            if (activeTab === 'ingredients') {
              generateRecipes();
            } else {
              generateRecipesFromQuestion();
            }
          }}
          onMouseDown={(e) => {
            console.log('Button mouse down!');
          }}
          onMouseUp={(e) => {
            console.log('Button mouse up!');
          }}
          disabled={
            (activeTab === 'ingredients' && availableIngredients.length === 0) ||
            (activeTab === 'question' && !questionInput.trim()) ||
            isGenerating
          }
          className={styles.generateButton}
          type="button"
        >
          {isGenerating ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              AI is thinking...
            </>
          ) : (
            <>
              <i className="fas fa-magic"></i>
              {activeTab === 'ingredients' 
                ? `Generate Recipes (${availableIngredients.length} ingredients)`
                : 'Generate Recipe from Question'
              }
            </>
          )}
        </button>
        
        <button onClick={clearAll} className={styles.clearButton}>
          <i className="fas fa-trash"></i>
          Clear All
        </button>
      </div>

      {/* Generated Recipes */}
      {generatedRecipes.length > 0 && (
        <div className={styles.generatedRecipesSection}>
          <h3>AI-Generated Recipes</h3>
          <div className={styles.recipesGrid}>
            {generatedRecipes.map((recipe, idx) => (
              <div key={idx} className={styles.recipeCard}>
                <div className={styles.recipeHeader}>
                  <h4>{recipe.title}</h4>
                  <div className={styles.recipeMeta}>
                    {recipe.category && <span className={styles.metaItem}><i className="fas fa-tag"></i> {recipe.category}</span>}
                    {recipe.cookingTime && <span className={styles.metaItem}><i className="fas fa-clock"></i> {recipe.cookingTime} min</span>}
                    {recipe.difficulty && <span className={styles.metaItem}><i className="fas fa-signal"></i> {recipe.difficulty}</span>}
                  </div>
                </div>
                <div className={styles.recipeContent}>
                  <div>
                    <strong>Ingredients:</strong>
                    <ul>
                      {Array.isArray(recipe.ingredients)
                        ? recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
                        : <li>{recipe.ingredients}</li>
                      }
                    </ul>
                  </div>
                  <div>
                    <strong>Instructions:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', color: '#222' }}>{recipe.instructions}</pre>
                  </div>
                </div>
                <div className={styles.recipeActions}>
                  <button className={styles.viewButton} onClick={() => setSelectedRecipe(recipe)}>
                    <i className="fas fa-eye"></i> View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{selectedRecipe.title}</h3>
              <button 
                onClick={() => setSelectedRecipe(null)}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.recipeDetail}>
                <div className={styles.ingredientsList}>
                  <h4>Ingredients</h4>
                  <ul>
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className={styles.ingredientItem}>
                        {ingredient}
                        {availableIngredients.some(available => 
                          ingredient.toLowerCase().includes(available) || 
                          available.includes(ingredient.toLowerCase())
                        ) && (
                          <span className={styles.availableBadge}>✓ Available</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className={styles.instructions}>
                  <h4>Instructions</h4>
                  <p>{selectedRecipe.instructions}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Substitutions Modal */}
      {showSubstitutions && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Smart Ingredient Substitutions</h3>
              <button 
                onClick={() => setShowSubstitutions(false)}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.substitutionsList}>
                {Object.entries(substitutions).map(([ingredient, subs]) => (
                  <div key={ingredient} className={styles.substitutionGroup}>
                    <h4>Instead of {ingredient}:</h4>
                    <div className={styles.substitutionOptions}>
                      {subs.map((sub, index) => (
                        <div key={index} className={styles.substitutionOption}>
                          <div className={styles.subIngredient}>{sub.ingredient}</div>
                          <div className={styles.subRatio}>{sub.ratio}</div>
                          <div className={styles.subNotes}>{sub.notes}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Substitution Modal */}
      {showSubstitutionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: 480 }}>
            <div className={styles.modalHeader}>
              <h3>AI-Powered Ingredient Substitution</h3>
              <button
                onClick={() => setShowSubstitutionModal(false)}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalContent}>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubstituting(true);
                  setSubstitutionResult('');
                  setSubstitutionError('');
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('/api/recipes/ai-substitute', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                      },
                      body: JSON.stringify({ ingredient: substitutionInput })
                    });
                    if (!response.ok) throw new Error('Failed to get substitutions.');
                    const data = await response.json();
                    setSubstitutionResult(data.substitutions);
                  } catch (err) {
                    setSubstitutionError('Sorry, there was an error. Please try again!');
                  } finally {
                    setIsSubstituting(false);
                  }
                }}
                style={{ marginBottom: 16 }}
              >
                <input
                  type="text"
                  value={substitutionInput}
                  onChange={e => setSubstitutionInput(e.target.value)}
                  placeholder="Enter an ingredient (e.g., egg, milk)"
                  className={styles.ingredientInput}
                  list="commonIngredients"
                  style={{ width: '100%', marginBottom: 8 }}
                  required
                />
                <button
                  type="submit"
                  className={styles.generateButton}
                  style={{ width: '100%' }}
                  disabled={isSubstituting || !substitutionInput.trim()}
                >
                  {isSubstituting ? <><i className="fas fa-spinner fa-spin"></i> AI is thinking...</> : <>Get Substitutions</>}
                </button>
              </form>
              {substitutionError && <div style={{ color: 'red', marginBottom: 8 }}>{substitutionError}</div>}
              {substitutionResult && (
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', color: '#222' }}>{substitutionResult}</pre>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rewrite Modal */}
      {showRewriteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: 520 }}>
            <div className={styles.modalHeader}>
              <h3>Rewrite Recipe for Dietary Needs</h3>
              <button
                onClick={() => setShowRewriteModal(false)}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalContent}>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsRewriting(true);
                  setRewriteResult('');
                  setRewriteError('');
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('/api/recipes/ai-rewrite', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': token ? `Bearer ${token}` : ''
                      },
                      body: JSON.stringify({ recipeText: rewriteRecipeText, restriction: rewriteRestriction })
                    });
                    if (!response.ok) throw new Error('Failed to rewrite recipe.');
                    const data = await response.json();
                    setRewriteResult(data.rewritten);
                  } catch (err) {
                    setRewriteError('Sorry, there was an error. Please try again!');
                  } finally {
                    setIsRewriting(false);
                  }
                }}
                style={{ marginBottom: 16 }}
              >
                <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>Select Dietary Restriction:</label>
                <select
                  value={rewriteRestriction}
                  onChange={e => setRewriteRestriction(e.target.value)}
                  className={styles.select}
                  style={{ width: '100%', marginBottom: 12 }}
                >
                  <option value="vegan">Vegan</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="gluten-free">Gluten-Free</option>
                  <option value="dairy-free">Dairy-Free</option>
                  <option value="nut-free">Nut-Free</option>
                  <option value="keto">Keto</option>
                  <option value="paleo">Paleo</option>
                  <option value="low-carb">Low-Carb</option>
                </select>
                <button
                  type="submit"
                  className={styles.generateButton}
                  style={{ width: '100%' }}
                  disabled={isRewriting}
                >
                  {isRewriting ? <><i className="fas fa-spinner fa-spin"></i> AI is thinking...</> : <>Rewrite Recipe</>}
                </button>
              </form>
              {rewriteError && <div style={{ color: 'red', marginBottom: 8 }}>{rewriteError}</div>}
              {rewriteResult && (
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', color: '#222' }}>{rewriteResult}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecipeGenerator; 