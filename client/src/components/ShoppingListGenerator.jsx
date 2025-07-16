import React, { useState, useEffect } from 'react';
import styles from '../styles/ShoppingListGenerator.module.css';
import SearchBar from './SearchBar';

const ShoppingListGenerator = ({ recipes = [] }) => {
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [listName, setListName] = useState('');
  const [savedLists, setSavedLists] = useState([]);
  const [search, setSearch] = useState('');
  const [expandedRecipeId, setExpandedRecipeId] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  // Load saved shopping lists
  useEffect(() => {
    const saved = localStorage.getItem('savedShoppingLists');
    if (saved) {
      setSavedLists(JSON.parse(saved));
    }
  }, []);

  // Save shopping lists
  useEffect(() => {
    localStorage.setItem('savedShoppingLists', JSON.stringify(savedLists));
  }, [savedLists]);

  // Get all unique tags from recipes (if you want to filter by tags in the future)
  const allTags = React.useMemo(() => {
    const tags = new Set();
    recipes.forEach(recipe => {
      if (recipe.tags) {
        recipe.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [recipes]);

  // Filter recipes based on search and tags
  const filteredRecipes = React.useMemo(() => {
    return recipes.filter(recipe => {
      // Search filter
      const searchMatch = !search ||
        recipe.title.toLowerCase().includes(search.toLowerCase()) ||
        (Array.isArray(recipe.ingredients)
          ? recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(search.toLowerCase()))
          : recipe.ingredients?.toLowerCase().includes(search.toLowerCase()));
      // Tag filter
      const tagMatch = selectedTags.length === 0 ||
        (recipe.tags && recipe.tags.some(tag => selectedTags.includes(tag)));
      return searchMatch && tagMatch;
    });
  }, [recipes, search, selectedTags]);

  const toggleRecipeSelection = (recipeId) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const generateShoppingList = () => {
    if (selectedRecipes.length === 0) {
      alert('Please select at least one recipe');
      return;
    }

    const selectedRecipeObjects = recipes.filter(recipe => 
      selectedRecipes.includes(recipe.id)
    );

    // Extract and combine ingredients
    const allIngredients = selectedRecipeObjects.flatMap(recipe => 
      Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : recipe.ingredients?.split(',').map(i => i.trim()) || []
    );

    // Group and count ingredients
    const ingredientCounts = {};
    allIngredients.forEach(ingredient => {
      const cleanIngredient = ingredient.trim().toLowerCase();
      ingredientCounts[cleanIngredient] = (ingredientCounts[cleanIngredient] || 0) + 1;
    });

    // Convert to shopping list format
    const newShoppingList = Object.entries(ingredientCounts).map(([ingredient, count]) => ({
      id: Date.now() + Math.random(),
      name: ingredient,
      quantity: count > 1 ? `${count}x` : '1x',
      category: categorizeIngredient(ingredient),
      checked: false,
      recipe: selectedRecipeObjects.find(recipe => 
        Array.isArray(recipe.ingredients) 
          ? recipe.ingredients.some(i => i.toLowerCase().includes(ingredient))
          : recipe.ingredients?.toLowerCase().includes(ingredient)
      )?.title || 'Multiple recipes'
    }));

    // Sort by category
    const categoryOrder = ['produce', 'dairy', 'meat', 'pantry', 'spices', 'other'];
    newShoppingList.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      return aIndex - bIndex;
    });

    setShoppingList(newShoppingList);
    setShowShoppingList(true);
    setListName(`Shopping List - ${new Date().toLocaleDateString()}`);
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

  const toggleItemChecked = (itemId) => {
    setShoppingList(prev => prev.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const removeItem = (itemId) => {
    setShoppingList(prev => prev.filter(item => item.id !== itemId));
  };

  const addCustomItem = (e) => {
    e.preventDefault();
    const input = e.target.elements.customItem;
    const itemName = input.value.trim();
    
    if (itemName) {
      const newItem = {
        id: Date.now() + Math.random(),
        name: itemName,
        quantity: '1x',
        category: categorizeIngredient(itemName),
        checked: false,
        recipe: 'Custom item'
      };
      
      setShoppingList(prev => [...prev, newItem]);
      input.value = '';
    }
  };

  const saveShoppingList = () => {
    if (!listName.trim()) {
      alert('Please enter a name for your shopping list');
      return;
    }

    const savedList = {
      id: Date.now(),
      name: listName,
      items: shoppingList,
      createdAt: new Date().toISOString(),
      recipeCount: selectedRecipes.length
    };

    setSavedLists(prev => [...prev, savedList]);
    alert('Shopping list saved successfully!');
  };

  const loadSavedList = (savedList) => {
    setShoppingList(savedList.items);
    setListName(savedList.name);
    setShowShoppingList(true);
  };

  const deleteSavedList = (listId) => {
    if (window.confirm('Are you sure you want to delete this shopping list?')) {
      setSavedLists(prev => prev.filter(list => list.id !== listId));
    }
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

  const groupedItems = shoppingList.reduce((groups, item) => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
    return groups;
  }, {});

  return (
    <div className={styles.shoppingListContainer}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Shopping List Generator</h2>
        <p>Select recipes to generate a shopping list</p>
      </div>

      {/* Recipe Selection */}
      <div className={styles.recipeSelection}>
        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Select Recipes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '180px' }}>
          <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
            <SearchBar
              search={search}
              setSearch={setSearch}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              allTags={allTags}
            />
          </div>
          {search.trim() === '' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '2.5rem', color: 'var(--text-secondary)' }}>
              <i className="fas fa-search" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--primary-color)' }}></i>
              <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>Start typing to find your recipes!</div>
            </div>
          ) : (
            <div className={styles.recipeGrid} style={{ width: '100%', marginTop: '1.5rem', animation: 'fadeIn 0.5s' }}>
              {filteredRecipes.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🥲</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>No recipes found.<br/>Try a different search!</div>
                </div>
              ) : (
                filteredRecipes.map(recipe => {
                  const isExpanded = expandedRecipeId === recipe.id;
                  const isSelected = selectedRecipes.includes(recipe.id);
                  // Highlight search term in title
                  const title = recipe.title;
                  const searchIndex = search ? title.toLowerCase().indexOf(search.toLowerCase()) : -1;
                  let highlightedTitle = title;
                  if (searchIndex !== -1 && search.trim() !== '') {
                    highlightedTitle = <>
                      {title.substring(0, searchIndex)}
                      <span style={{ background: 'var(--primary-color-alpha)', color: 'var(--primary-color)', borderRadius: '4px', padding: '0 2px' }}>{title.substring(searchIndex, searchIndex + search.length)}</span>
                      {title.substring(searchIndex + search.length)}
                    </>;
                  }
                  return (
                    <div
                      key={recipe.id}
                      className={`${styles.recipeCard} ${isSelected ? styles.selected : ''}`}
                      style={{
                        cursor: 'pointer',
                        marginBottom: '14px',
                        boxShadow: '0 2px 12px 0 rgba(80, 0, 120, 0.07)',
                        borderRadius: '14px',
                        border: isSelected ? '2.5px solid var(--primary-color)' : '1.5px solid var(--border-color)',
                        background: isSelected ? 'var(--primary-color-alpha)' : 'var(--bg-primary)',
                        transition: 'box-shadow 0.2s, border 0.2s, background 0.2s',
                        position: 'relative',
                        animation: 'fadeIn 0.5s',
                        minHeight: 70,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <div
                        onClick={() => setExpandedRecipeId(isExpanded ? null : recipe.id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem 0.7rem 0.7rem' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className={styles.recipeImage} style={{ minWidth: 44, minHeight: 44, fontSize: 20, background: 'var(--primary-color)', color: '#fff', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="fas fa-utensils"></i>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <h4 style={{ margin: 0, fontWeight: 600, fontSize: '1.08rem', lineHeight: 1.2 }}>{highlightedTitle}</h4>
                            <div style={{ fontSize: '0.97rem', color: 'var(--text-secondary)', display: 'flex', gap: 12, alignItems: 'center' }}>
                              <span><i className="fas fa-list-ul" style={{ marginRight: 4 }}></i> {Array.isArray(recipe.ingredients) ? recipe.ingredients.length : (recipe.ingredients || '').split(',').length} ingredients</span>
                              <span><i className="fas fa-clock" style={{ marginRight: 4 }}></i> {recipe.cookingTime || '30 min'}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: 'var(--primary-color)' }}
                        >
                          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        </button>
                        {isSelected && (
                          <span style={{ position: 'absolute', top: 8, right: 8, background: 'var(--primary-color)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, boxShadow: '0 1px 4px rgba(80,0,120,0.12)', animation: 'popIn 0.3s' }}>
                            <i className="fas fa-check"></i>
                          </span>
                        )}
                      </div>
                      {isExpanded && (
                        <div style={{ marginTop: '0.5rem', paddingLeft: '3.2rem', paddingBottom: '0.7rem' }}>
                          <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                            <strong>Ingredients:</strong>
                            <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                              {(Array.isArray(recipe.ingredients) ? recipe.ingredients : (recipe.ingredients || '').split(',')).map((ing, idx) => (
                                <li key={idx}>{ing}</li>
                              ))}
                            </ul>
                          </div>
                          <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                            <i className="fas fa-clock"></i> {recipe.cookingTime || '30 min'}
                          </div>
                          {recipe.instructions && (
                            <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                              <strong>Instructions:</strong> {recipe.instructions.length > 100 ? recipe.instructions.slice(0, 100) + '...' : recipe.instructions}
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', paddingRight: '1.2rem', paddingBottom: '0.7rem' }}>
                        <button
                          type="button"
                          className={styles.generateButton}
                          style={{ minWidth: 0, padding: '0.3rem 0.8rem', fontSize: '0.95rem', borderRadius: '6px', background: isSelected ? 'var(--primary-color)' : 'var(--bg-secondary)', color: isSelected ? '#fff' : 'var(--primary-color)', border: isSelected ? 'none' : '1px solid var(--primary-color)', marginRight: 0, boxShadow: isSelected ? '0 2px 8px 0 rgba(80,0,120,0.10)' : 'none', transition: 'all 0.2s' }}
                          onClick={() => toggleRecipeSelection(recipe.id)}
                        >
                          {isSelected ? <i className="fas fa-check"></i> : <i className="fas fa-plus"></i>} {isSelected ? 'Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
          <button
            className={styles.generateButton}
            onClick={generateShoppingList}
            disabled={selectedRecipes.length === 0}
            style={{ marginTop: '1.5rem', width: '100%', maxWidth: 400 }}
          >
            <i className="fas fa-shopping-cart"></i>
            Generate Shopping List ({selectedRecipes.length} recipes)
          </button>
        </div>
      </div>

      {/* Shopping List */}
      {showShoppingList && (
        <div className={styles.shoppingListSection}>
          <div className={styles.listHeader}>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              className={styles.listNameInput}
              placeholder="Shopping List Name"
            />
            <div className={styles.listActions}>
              <button onClick={saveShoppingList} className={styles.saveButton}>
                <i className="fas fa-save"></i>
                Save List
              </button>
              <button 
                onClick={() => setShowShoppingList(false)}
                className={styles.closeButton}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          {/* Add Custom Item */}
          <form onSubmit={addCustomItem} className={styles.addItemForm}>
            <input
              name="customItem"
              type="text"
              placeholder="Add custom item..."
              className={styles.customItemInput}
            />
            <button type="submit" className={styles.addItemButton}>
              <i className="fas fa-plus"></i>
            </button>
          </form>

          {/* Shopping List Items */}
          <div className={styles.shoppingList}>
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className={styles.categorySection}>
                <h4 className={styles.categoryHeader}>
                  <span className={styles.categoryIcon}>{getCategoryIcon(category)}</span>
                  {getCategoryName(category)}
                </h4>
                <div className={styles.categoryItems}>
                  {items.map(item => (
                    <div 
                      key={item.id} 
                      className={`${styles.shoppingItem} ${item.checked ? styles.checked : ''}`}
                    >
                      <label className={styles.itemCheckbox}>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItemChecked(item.id)}
                        />
                        <span className={styles.checkmark}></span>
                      </label>
                      <span className={styles.itemQuantity}>{item.quantity}</span>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemRecipe}>{item.recipe}</span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className={styles.removeItemButton}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* List Summary */}
          <div className={styles.listSummary}>
            <div className={styles.summaryItem}>
              <i className="fas fa-list"></i>
              <span>{shoppingList.length} items</span>
            </div>
            <div className={styles.summaryItem}>
              <i className="fas fa-check"></i>
              <span>{shoppingList.filter(item => item.checked).length} checked</span>
            </div>
            <div className={styles.summaryItem}>
              <i className="fas fa-utensils"></i>
              <span>{selectedRecipes.length} recipes</span>
            </div>
          </div>
        </div>
      )}

      {/* Saved Lists */}
      {savedLists.length > 0 && (
        <div className={styles.savedLists}>
          <h3>Saved Shopping Lists</h3>
          <div className={styles.savedListsGrid}>
            {savedLists.map(savedList => (
              <div key={savedList.id} className={styles.savedListCard}>
                <div className={styles.savedListInfo}>
                  <h4>{savedList.name}</h4>
                  <p>{savedList.items.length} items • {savedList.recipeCount} recipes</p>
                  <span className={styles.savedListDate}>
                    {new Date(savedList.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.savedListActions}>
                  <button 
                    onClick={() => loadSavedList(savedList)}
                    className={styles.loadButton}
                  >
                    <i className="fas fa-download"></i>
                    Load
                  </button>
                  <button 
                    onClick={() => deleteSavedList(savedList.id)}
                    className={styles.deleteButton}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListGenerator; 