import React, { useState, useEffect } from 'react';
import styles from '../styles/RecipeScalingCalculator.module.css';

const RecipeScalingCalculator = ({ recipe }) => {
  const [originalServings, setOriginalServings] = useState(4);
  const [newServings, setNewServings] = useState(4);
  const [scalingFactor, setScalingFactor] = useState(1);
  const [scaledIngredients, setScaledIngredients] = useState([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [ingredientPrices, setIngredientPrices] = useState({});
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (recipe) {
      // Try to extract servings from recipe
      const recipeServings = recipe.servings || recipe.servingSize || 4;
      setOriginalServings(parseInt(recipeServings) || 4);
      setNewServings(parseInt(recipeServings) || 4);
    }
  }, [recipe]);

  useEffect(() => {
    if (originalServings > 0) {
      const factor = newServings / originalServings;
      setScalingFactor(factor);
    }
  }, [originalServings, newServings]);

  useEffect(() => {
    if (recipe && recipe.ingredients) {
      const ingredients = Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : recipe.ingredients.split(',').map(i => i.trim());
      
      const scaled = ingredients.map(ingredient => {
        const { amount, unit, item } = parseIngredient(ingredient);
        const scaledAmount = amount * scalingFactor;
        
        return {
          original: ingredient,
          amount: scaledAmount,
          unit: unit,
          item: item,
          displayAmount: formatAmount(scaledAmount, unit)
        };
      });
      
      setScaledIngredients(scaled);
    }
  }, [recipe, scalingFactor]);

  // Update total cost when scaledIngredients or prices change
  useEffect(() => {
    let cost = 0;
    scaledIngredients.forEach((ing, idx) => {
      const price = parseFloat(ingredientPrices[ing.item] || 0);
      cost += price;
    });
    setTotalCost(cost);
  }, [scaledIngredients, ingredientPrices]);

  const parseIngredient = (ingredient) => {
    // Common patterns for ingredient parsing
    const patterns = [
      // "2 cups flour" or "1/2 cup sugar"
      /^(\d+(?:\/\d+)?)\s+(\w+)\s+(.+)$/i,
      // "2 tablespoons olive oil"
      /^(\d+(?:\/\d+)?)\s+(\w+\s+\w+)\s+(.+)$/i,
      // "1 large onion"
      /^(\d+(?:\/\d+)?)\s+(\w+)\s+(.+)$/i,
      // "salt and pepper to taste"
      /^(.+)$/i
    ];

    for (const pattern of patterns) {
      const match = ingredient.match(pattern);
      if (match) {
        if (match.length === 2) {
          // No amount/unit found
          return {
            amount: 1,
            unit: '',
            item: match[1]
          };
        } else {
          const amountStr = match[1];
          const unit = match[2];
          const item = match[3];

          // Parse fractions
          let amount = 1;
          if (amountStr.includes('/')) {
            const [num, denom] = amountStr.split('/');
            amount = parseInt(num) / parseInt(denom);
          } else {
            amount = parseFloat(amountStr) || 1;
          }

          return { amount, unit, item };
        }
      }
    }

    // Fallback
    return {
      amount: 1,
      unit: '',
      item: ingredient
    };
  };

  const formatAmount = (amount, unit) => {
    if (amount === 0) return '';
    
    // Round to reasonable precision
    let rounded = Math.round(amount * 100) / 100;
    
    // Handle fractions for common amounts
    if (rounded === 0.25) return `1/4 ${unit}`;
    if (rounded === 0.33) return `1/3 ${unit}`;
    if (rounded === 0.5) return `1/2 ${unit}`;
    if (rounded === 0.67) return `2/3 ${unit}`;
    if (rounded === 0.75) return `3/4 ${unit}`;
    
    // Remove trailing zeros
    const displayAmount = rounded.toString().replace(/\.?0+$/, '');
    
    if (unit) {
      return `${displayAmount} ${unit}`;
    }
    return displayAmount;
  };

  const handleServingsChange = (type, value) => {
    const numValue = parseInt(value) || 1;
    if (type === 'original') {
      setOriginalServings(numValue);
    } else {
      setNewServings(numValue);
    }
  };

  const handlePriceChange = (item, value) => {
    setIngredientPrices(prices => ({ ...prices, [item]: value }));
  };

  const getScalingMessage = () => {
    if (scalingFactor === 1) return 'No scaling needed';
    if (scalingFactor > 1) return `Scale up by ${scalingFactor.toFixed(2)}x`;
    return `Scale down by ${(1/scalingFactor).toFixed(2)}x`;
  };

  const getScalingColor = () => {
    if (scalingFactor === 1) return '#10b981';
    if (scalingFactor > 2) return '#ef4444';
    if (scalingFactor > 1.5) return '#f59e0b';
    return '#10b981';
  };

  const copyToClipboard = () => {
    const scaledRecipe = `
${recipe.title} - Scaled for ${newServings} servings

Original: ${originalServings} servings
New: ${newServings} servings
Scaling: ${getScalingMessage()}

INGREDIENTS:
${scaledIngredients.map(ing => `• ${ing.displayAmount} ${ing.item}`).join('\n')}

INSTRUCTIONS:
${recipe.instructions}
    `.trim();

    navigator.clipboard.writeText(scaledRecipe);
    alert('Scaled recipe copied to clipboard!');
  };

  if (!recipe) {
    return (
      <div className={styles.noRecipe}>
        <i className="fas fa-calculator"></i>
        <p>Select a recipe to use the scaling calculator</p>
      </div>
    );
  }

  return (
    <div className={styles.scalingCalculator}>
      {/* Header */}
      <div className={styles.header}>
        <h3>Recipe Scaling Calculator</h3>
        <button 
          className={styles.toggleButton}
          onClick={() => setShowCalculator(!showCalculator)}
        >
          <i className={`fas ${showCalculator ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        </button>
      </div>

      {showCalculator && (
        <div className={styles.calculatorContent}>
          {/* Servings Controls */}
          <div className={styles.servingsControls}>
            <div className={styles.servingInput}>
              <label>Original Servings</label>
              <input
                type="number"
                min="1"
                value={originalServings}
                onChange={(e) => handleServingsChange('original', e.target.value)}
                className={styles.servingInputField}
              />
            </div>
            
            <div className={styles.scalingIndicator}>
              <div 
                className={styles.scalingFactor}
                style={{ color: getScalingColor() }}
              >
                {scalingFactor.toFixed(2)}x
              </div>
              <div className={styles.scalingMessage}>
                {getScalingMessage()}
              </div>
            </div>
            
            <div className={styles.servingInput}>
              <label>New Servings</label>
              <input
                type="number"
                min="1"
                value={newServings}
                onChange={(e) => handleServingsChange('new', e.target.value)}
                className={styles.servingInputField}
              />
            </div>
          </div>

          {/* Scaling Preview */}
          <div className={styles.scalingPreview}>
            <h4>Scaled Ingredients</h4>
            <div className={styles.ingredientsList}>
              {scaledIngredients.map((ingredient, index) => (
                <div key={index} className={styles.ingredientRow}>
                  <div className={styles.originalIngredient}>
                    <span className={styles.originalText}>{ingredient.original}</span>
                  </div>
                  <div className={styles.scalingArrow}>
                    <i className="fas fa-arrow-right"></i>
                  </div>
                  <div className={styles.scaledIngredient}>
                    <span className={styles.scaledText}>
                      {ingredient.displayAmount} {ingredient.item}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ingredientPrices[ingredient.item] || ''}
                      onChange={e => handlePriceChange(ingredient.item, e.target.value)}
                      placeholder="Price"
                      className={styles.priceInput}
                      style={{ marginLeft: 8, width: 70 }}
                    />
                    <span style={{ marginLeft: 4, color: '#888', fontSize: 13 }}>$</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Cost Summary */}
          <div className={styles.costSummary} style={{ marginTop: 18, fontWeight: 600, fontSize: 17 }}>
            <span>Estimated Total Cost: </span>
            <span style={{ color: '#059669', marginLeft: 6 }}>${totalCost.toFixed(2)}</span>
            <span style={{ marginLeft: 18, color: '#64748b', fontWeight: 400, fontSize: 15 }}>
              (${(totalCost / (newServings || 1)).toFixed(2)} per serving)
            </span>
          </div>

          {/* Quick Scaling Buttons */}
          <div className={styles.quickScaling}>
            <h4>Quick Scaling</h4>
            <div className={styles.quickButtons}>
              {[2, 4, 6, 8, 10].map(servings => (
                <button
                  key={servings}
                  className={`${styles.quickButton} ${
                    newServings === servings ? styles.active : ''
                  }`}
                  onClick={() => setNewServings(servings)}
                >
                  {servings} servings
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button 
              className={styles.copyButton}
              onClick={copyToClipboard}
            >
              <i className="fas fa-copy"></i>
              Copy Scaled Recipe
            </button>
            
            <button 
              className={styles.resetButton}
              onClick={() => {
                setNewServings(originalServings);
                setScalingFactor(1);
              }}
            >
              <i className="fas fa-undo"></i>
              Reset
            </button>
          </div>

          {/* Tips */}
          <div className={styles.tips}>
            <h4>Scaling Tips</h4>
            <ul>
              <li>For large scaling factors (&gt;3x), consider cooking in batches</li>
              <li>Some ingredients (like salt) may not need exact scaling</li>
              <li>Adjust cooking time for larger quantities</li>
              <li>Test the scaled recipe with a small batch first</li>
            </ul>
          </div>
        </div>
      )}

      {/* Compact View */}
      {!showCalculator && (
        <div className={styles.compactView}>
          <div className={styles.compactInfo}>
            <span className={styles.currentServings}>
              {newServings} servings
            </span>
            {scalingFactor !== 1 && (
              <span 
                className={styles.scalingBadge}
                style={{ backgroundColor: getScalingColor() }}
              >
                {scalingFactor.toFixed(1)}x
              </span>
            )}
          </div>
          <button 
            className={styles.viewButton}
            onClick={() => setShowCalculator(true)}
          >
            View Calculator
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeScalingCalculator; 