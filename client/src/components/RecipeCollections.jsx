import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/RecipeCollections.module.css';

const RecipeCollections = () => {
  const [collections, setCollections] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCollection, setEditingCollection] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [renameDescription, setRenameDescription] = useState('');
  const [renameIsPublic, setRenameIsPublic] = useState(false);
  const [userRecipes, setUserRecipes] = useState([]);
  const [addingRecipeId, setAddingRecipeId] = useState(null);
  const [openCollection, setOpenCollection] = useState(null);

  const token = JSON.parse(localStorage.getItem('user'))?.token;

  // Fetch collections from backend
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/collections', {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        if (!res.ok) throw new Error('Failed to fetch collections');
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, [token]);

  // Fetch user recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('/api/recipes', {
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        if (!res.ok) throw new Error('Failed to fetch recipes');
        const data = await res.json();
        setUserRecipes(data);
      } catch (err) {
        setUserRecipes([]);
      }
    };
    fetchRecipes();
  }, [token]);

  // Create collection
  const handleCreateCollection = async () => {
    if (!newCollection.name.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a collection name' });
      return;
    }
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify({ name: newCollection.name })
      });
      if (!res.ok) throw new Error('Failed to create collection');
      const created = await res.json();
      setCollections(prev => [...prev, created]);
      setNewCollection({ name: '' });
      setShowCreateModal(false);
      setFeedback({ type: 'success', message: 'Collection created!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Delete collection
  const deleteCollection = async (collectionId) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      });
      if (!res.ok) throw new Error('Failed to delete collection');
      setCollections(prev => prev.filter(c => c._id !== collectionId));
      setFeedback({ type: 'success', message: 'Collection deleted!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  // Add recipe to collection
  const addRecipeToCollection = async (collectionId, recipeId) => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify({ recipeId })
      });
      if (!res.ok) throw new Error('Failed to add recipe');
      const updated = await res.json();
      setCollections(prev => prev.map(c => c._id === collectionId ? updated : c));
    } catch (err) {
      alert(err.message);
    }
  };

  // Remove recipe from collection
  const removeRecipeFromCollection = async (collectionId, recipeId) => {
    try {
      const res = await fetch(`/api/collections/${collectionId}/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify({ recipeId })
      });
      if (!res.ok) throw new Error('Failed to remove recipe');
      const updated = await res.json();
      setCollections(prev => prev.map(c => c._id === collectionId ? updated : c));
    } catch (err) {
      alert(err.message);
    }
  };

  // Rename collection
  const handleRenameCollection = async () => {
    if (!renameValue.trim()) {
      setFeedback({ type: 'error', message: 'Please enter a collection name' });
      return;
    }
    try {
      const res = await fetch(`/api/collections/${editingCollection._id}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify({ name: renameValue, description: renameDescription, isPublic: renameIsPublic })
      });
      if (!res.ok) throw new Error('Failed to rename collection');
      const updated = await res.json();
      setCollections(prev => prev.map(c => c._id === updated._id ? updated : c));
      setEditingCollection(null);
      setRenameValue('');
      setRenameDescription('');
      setRenameIsPublic(false);
      setFeedback({ type: 'success', message: 'Collection updated!' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading collections...</div>;
  }
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.collectionsContainer}>
      <div className={styles.header}>
        <h2>Recipe Collections</h2>
        <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus"></i> Create Collection
        </button>
      </div>
      <div className={styles.collectionsGrid}>
        {collections.map(collection => (
          <div key={collection._id} className={styles.collectionCard}>
            <div className={styles.collectionHeader}>
              <h3 className={styles.collectionName}>{collection.name}</h3>
              <div className={styles.collectionActions}>
                <button className={styles.actionButton} onClick={() => deleteCollection(collection._id)} title="Delete Collection">
                  <i className="fas fa-trash"></i>
                </button>
                <button className={styles.actionButton} onClick={() => { setEditingCollection(collection); setRenameValue(collection.name); setRenameDescription(collection.description || ''); setRenameIsPublic(!!collection.isPublic); }} title="Rename Collection">
                  <i className="fas fa-edit"></i>
                </button>
                <button className={styles.viewAllButton} onClick={() => setOpenCollection(collection)}>
                  <i className="fas fa-eye"></i> View All
                </button>
              </div>
            </div>
            <div className={styles.recipesPreview}>
              {collection.recipes && collection.recipes.length > 0 ? (
                collection.recipes.slice(0, 3).map(recipe => (
                  <Link
                    key={recipe._id}
                    to={`/recipe/${recipe._id}`}
                    className={styles.recipePreview}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className={styles.recipeImage}>
                      {recipe.images && recipe.images.length > 0 && recipe.images[0].url ? (
                        <img
                          src={recipe.images[0].url}
                          alt={recipe.title}
                          style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10 }}
                        />
                      ) : (
                        <i className="fas fa-utensils"></i>
                      )}
                    </div>
                    <div className={styles.recipeInfo}>
                      <h4>{recipe.title}</h4>
                      <span className={styles.recipeTime}>
                        <i className="fas fa-clock"></i>
                        {recipe.cookTime || '30 min'}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className={styles.emptyCollection}>
                  <i className="fas fa-plus"></i>
                  <p>No recipes yet</p>
                </div>
              )}
            </div>
            {/* Add Recipe Section (optional: implement recipe selection UI) */}
            <div className={styles.addRecipeSection}>
              <select
                className={styles.recipeSelect}
                disabled={addingRecipeId !== null}
                onChange={async (e) => {
                  const recipeId = e.target.value;
                  if (!recipeId) return;
                  setAddingRecipeId(recipeId);
                  await addRecipeToCollection(collection._id, recipeId);
                  setAddingRecipeId(null);
                  e.target.value = '';
                }}
              >
                <option value="">Add a recipe...</option>
                {userRecipes
                  .filter(recipe => !collection.recipes.some(r => r._id === recipe._id))
                  .map(recipe => (
                    <option key={recipe._id} value={recipe._id}>{recipe.title}</option>
                  ))}
              </select>
            </div>
          </div>
        ))}
      </div>
      {collections.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <i className="fas fa-folder-open"></i>
          </div>
          <h3>No collections yet</h3>
          <p>Create your first collection to organize your favorite recipes</p>
          <button className={styles.createButton} onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i> Create Your First Collection
          </button>
        </div>
      )}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Create New Collection</h3>
              <button className={styles.closeButton} onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>Collection Name *</label>
                <input
                  type="text"
                  value={newCollection.name}
                  onChange={e => setNewCollection({ name: e.target.value })}
                  placeholder="e.g., Weeknight Dinners"
                  className={styles.input}
                />
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className={styles.createButton} onClick={handleCreateCollection}>
                Create Collection
              </button>
            </div>
          </div>
        </div>
      )}
      {editingCollection && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Rename Collection</h3>
              <button className={styles.closeButton} onClick={() => setEditingCollection(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.formGroup}>
                <label>New Name *</label>
                <input
                  type="text"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  placeholder="e.g., Weeknight Dinners"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={renameDescription}
                  onChange={e => setRenameDescription(e.target.value)}
                  placeholder="Describe your collection..."
                  className={styles.textarea}
                  rows="3"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={renameIsPublic}
                    onChange={e => setRenameIsPublic(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkmark}></span>
                  Make this collection public
                </label>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setEditingCollection(null)}>
                Cancel
              </button>
              <button className={styles.createButton} onClick={handleRenameCollection}>
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
      {feedback && (
        <div className={feedback.type === 'success' ? styles.toastSuccess : styles.toastError}>
          {feedback.message}
          <button onClick={() => setFeedback(null)} className={styles.toastClose}><i className="fas fa-times"></i></button>
        </div>
      )}
      {openCollection && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: 600, width: '100%' }}>
            <div className={styles.modalHeader}>
              <h3>{openCollection.name} - All Recipes</h3>
              <button className={styles.closeButton} onClick={() => setOpenCollection(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className={styles.modalContent}>
              {openCollection.recipes && openCollection.recipes.length > 0 ? (
                <div className={styles.detailRecipesGrid}>
                  {openCollection.recipes.map(recipe => (
                    <div key={recipe._id} className={styles.detailRecipeCard}>
                      <Link to={`/recipe/${recipe._id}`} className={styles.detailRecipeLink}>
                        <div className={styles.detailRecipeImage}>
                          {recipe.images && recipe.images.length > 0 && recipe.images[0].url ? (
                            <img
                              src={recipe.images[0].url}
                              alt={recipe.title}
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 12 }}
                            />
                          ) : (
                            <i className="fas fa-utensils"></i>
                          )}
                        </div>
                        <div className={styles.detailRecipeInfo}>
                          <h4>{recipe.title}</h4>
                          <span className={styles.recipeTime}>
                            <i className="fas fa-clock"></i>
                            {recipe.cookTime || '30 min'}
                          </span>
                        </div>
                      </Link>
                      <button
                        className={styles.removeRecipeButton}
                        onClick={async () => {
                          await removeRecipeFromCollection(openCollection._id, recipe._id);
                          setOpenCollection(prev => ({ ...prev, recipes: prev.recipes.filter(r => r._id !== recipe._id) }));
                        }}
                        title="Remove from collection"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyCollection}>
                  <i className="fas fa-plus"></i>
                  <p>No recipes in this collection yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCollections; 