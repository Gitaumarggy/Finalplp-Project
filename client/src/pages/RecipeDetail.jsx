import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RecipeScalingCalculator from '../components/RecipeScalingCalculator';
import styles from '../styles/RecipeDetail.module.css';

// Helper to check for valid MongoDB ObjectId
function isValidObjectId(id) {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cooking Mode States
  const [isCookingMode, setIsCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [timer, setTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [cookingProgress, setCookingProgress] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef(null);
  const speechRef = useRef(null);

  // Comments/Reviews state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [postingComment, setPostingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState(null); // photo file
  const [reviewPhotoUrl, setReviewPhotoUrl] = useState(''); // uploaded photo URL

  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = recipe ? `Check out this recipe: ${recipe.title}` : 'Check out this recipe!';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    const loadRecipe = async () => {
      if (isValidObjectId(id)) {
        // Try to fetch from API first
        try {
          const response = await fetch(`/api/recipes/${id}`);
          if (response.ok) {
            const recipeData = await response.json();
            setRecipe(recipeData);
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
      setRecipe(found || null);
      setIsLoading(false);
    };

    loadRecipe();
  }, [id]);

  // Fetch comments for this recipe
  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      // Only fetch if id is a valid ObjectId
      if (!isValidObjectId(id)) {
        setComments([]);
        setCommentsLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/reviews/recipe/${id}`);
        if (res.ok) {
          const data = await res.json();
          setComments(Array.isArray(data) ? data : []);
        } else {
          setComments([]);
        }
      } catch (err) {
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  // Add this function to handle photo upload
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setReviewPhoto(file);
    // Upload to backend
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch('/api/reviews/upload-photo', {
        method: 'POST',
        headers: {
          Authorization: user?.token ? `Bearer ${user.token}` : undefined
        },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        setReviewPhotoUrl(data.url);
      } else {
        setCommentError('Failed to upload photo.');
        setReviewPhoto(null);
        setReviewPhotoUrl('');
      }
    } catch (err) {
      setCommentError('Photo upload error.');
      setReviewPhoto(null);
      setReviewPhotoUrl('');
    }
  };

  // Post a new comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    if (!newComment.trim()) return;
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      setCommentError('You must be logged in to post a comment.');
      return;
    }
    setPostingComment(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          targetType: 'recipe',
          targetId: recipe._id || recipe.id,
          rating: commentRating,
          comment: newComment,
          photos: reviewPhotoUrl ? [{ url: reviewPhotoUrl }] : [],
        }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setComments(prev => [newReview, ...prev]);
        setNewComment('');
        setCommentRating(5);
        setReviewPhoto(null);
        setReviewPhotoUrl('');
      } else {
        const data = await res.json();
        setCommentError(data.error || 'Failed to post comment.');
      }
    } catch (err) {
      setCommentError('Network error. Please try again.');
    } finally {
      setPostingComment(false);
    }
  };

  // Delete a comment (if user is author)
  const handleDeleteComment = async (commentId) => {
    setCommentError('');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) {
      setCommentError('You must be logged in to delete a comment.');
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
      });
      if (res.ok) {
        setComments(prev => prev.filter(c => c._id !== commentId && c.id !== commentId));
      } else {
        const data = await res.json();
        setCommentError(data.error || 'Failed to delete comment.');
      }
    } catch (err) {
      setCommentError('Network error. Please try again.');
    }
  };

  // Helper: format date as "x days ago" or date string
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }

  // Helper: render colored stars
  function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={styles.star} style={{ opacity: i < rating ? 1 : 0.25 }}>★</span>
    ));
  }

  // Timer functionality
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (isVoiceEnabled) {
              speakText("Timer finished! Time to move to the next step.");
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds, isVoiceEnabled]);

  // Speech synthesis
  const speakText = (text) => {
    if ('speechSynthesis' in window && isVoiceEnabled) {
      if (speechRef.current) {
        speechSynthesis.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  // Cooking mode functions
  const startCookingMode = () => {
    setIsCookingMode(true);
    setCurrentStep(0);
    setCheckedIngredients([]);
    setCookingProgress(0);
    if (isVoiceEnabled) {
      speakText("Starting cooking mode. Let's begin with the ingredients.");
    }
  };

  const exitCookingMode = () => {
    setIsCookingMode(false);
    setCurrentStep(0);
    setCheckedIngredients([]);
    setCookingProgress(0);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    if (speechRef.current) {
      speechSynthesis.cancel();
    }
  };

  const toggleIngredient = (index) => {
    setCheckedIngredients(prev => {
      const newChecked = prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index];
      
      const progress = (newChecked.length / recipe.ingredients.length) * 100;
      setCookingProgress(progress);
      
      if (isVoiceEnabled && newChecked.length > prev.length) {
        speakText(`Ingredient ${index + 1} checked off.`);
      }
      
      return newChecked;
    });
  };

  const nextStep = () => {
    if (currentStep < recipe.instructions.split('\n').length - 1) {
      setCurrentStep(prev => prev + 1);
      const progress = ((currentStep + 1) / recipe.instructions.split('\n').length) * 100;
      setCookingProgress(progress);
      
      if (isVoiceEnabled) {
        const nextInstruction = recipe.instructions.split('\n')[currentStep + 1];
        speakText(`Step ${currentStep + 2}: ${nextInstruction}`);
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      const progress = ((currentStep - 1) / recipe.instructions.split('\n').length) * 100;
      setCookingProgress(progress);
    }
  };

  const startTimer = (seconds) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
    if (isVoiceEnabled) {
      speakText(`Timer started for ${Math.floor(seconds / 60)} minutes and ${seconds % 60} seconds.`);
    }
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
    if (isVoiceEnabled) {
      speakText("Timer paused.");
    }
  };

  const resumeTimer = () => {
    setIsTimerRunning(true);
    if (isVoiceEnabled) {
      speakText("Timer resumed.");
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse instructions robustly
  let instructions = [];
  if (recipe && recipe.instructions) {
    if (Array.isArray(recipe.instructions)) {
      instructions = recipe.instructions.filter(Boolean);
    } else if (typeof recipe.instructions === 'string') {
      instructions = recipe.instructions.split('\n').filter(line => line.trim() !== '');
    }
  }

  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    if (recipe) {
      setFavoriteCount(recipe.stats?.favorites || 0);
      // Check if this recipe is in the user's favorites
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.favorites && Array.isArray(user.favorites)) {
        setIsFavorited(user.favorites.includes(recipe._id || recipe.id));
      } else {
        setIsFavorited(false);
      }
    }
  }, [recipe]);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('user'));
    const recipeId = recipe._id || recipe.id;
    const isLiked = isFavorited;

    // Optimistically update UI
    setIsFavorited(!isLiked);
    setFavoriteCount(c => !isLiked ? c + 1 : Math.max(0, c - 1));

    if (user && user.token && isValidObjectId(recipeId)) {
      try {
        const res = await fetch(`/api/users/favorites/${recipeId}`, {
          method: !isLiked ? 'POST' : 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!res.ok) {
          // Revert UI if API fails
          setIsFavorited(isLiked);
          setFavoriteCount(c => isLiked ? c + 1 : Math.max(0, c - 1));
          console.error('Failed to update like status on server');
        }
      } catch (err) {
        setIsFavorited(isLiked);
        setFavoriteCount(c => isLiked ? c + 1 : Math.max(0, c - 1));
        console.error('Error updating like status:', err);
      }
    } else {
      // Guest or local recipe: store in localStorage
      let localLiked = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
      if (!isLiked) {
        localLiked.push(recipeId);
      } else {
        localLiked = localLiked.filter(x => x !== recipeId);
      }
      localStorage.setItem('likedRecipes', JSON.stringify(localLiked));
      // UI already updated optimistically
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

  if (!recipe) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>❌</div>
          <h2>Recipe Not Found</h2>
          <p>We couldn't find the recipe you're looking for</p>
          <button 
            onClick={() => navigate('/')}
            className={styles.backButton}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  const ingredients = Array.isArray(recipe.ingredients) 
    ? recipe.ingredients 
    : recipe.ingredients.split('\n');

  return (
    <div className={styles.recipeContainer}>
      {/* Recipe Hero Section */}
      <div className={styles.recipeHero}>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <h1>{recipe.title}</h1>
          <div className={styles.recipeMeta}>
            <span>⭐ 4.8 (24 reviews)</span>
            {recipe.cookingTime && <span>⏱️ {recipe.cookingTime}</span>}
            {recipe.servings && <span>👨‍🍳 {recipe.servings}</span>}
            <button 
              className={`${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
              onClick={handleFavorite}
              title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              style={{ marginLeft: 12, display: 'inline-flex', alignItems: 'center', fontSize: '1.2rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <i className={isFavorited ? 'fas fa-heart' : 'far fa-heart'} style={{ color: isFavorited ? '#ef4444' : '#aaa', fontSize: '1.3em', marginRight: 4 }}></i>
              <span style={{ fontWeight: 600, color: isFavorited ? '#ef4444' : '#555', fontSize: '1.05em' }}>{favoriteCount}</span>
            </button>
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className={styles.recipeTags}>
              {recipe.tags.map((tag, index) => (
                <span key={index} className={styles.recipeTag}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share Section */}
          <div className={styles.shareSection}>
            <button onClick={handleCopyLink} className={styles.copyLinkButton}>
              <i className="fas fa-link" style={{ color: copied ? '#059669' : '#f59e0b', transition: 'color 0.2s' }}></i> {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn} title="Share on WhatsApp">
              <i className="fab fa-whatsapp" style={{ color: '#25D366', transition: 'color 0.2s' }}></i>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn} title="Share on Facebook">
              <i className="fab fa-facebook" style={{ color: '#1877F3', transition: 'color 0.2s' }}></i>
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className={styles.shareBtn} title="Share on Twitter/X">
              <i className="fab fa-x-twitter"></i>
            </a>
            <a href={`mailto:?subject=${encodeURIComponent('Recipe: ' + recipe.title)}&body=${encodeURIComponent(shareText + '\n' + shareUrl)}`} className={styles.shareBtn} title="Share via Email">
              <i className="fas fa-envelope"></i>
            </a>
          </div>

          {/* Cooking Mode Toggle */}
          <div className={styles.cookingModeToggle}>
            <button 
              onClick={startCookingMode}
              className={`${styles.cookingModeButton} ${isCookingMode ? styles.active : ''}`}
            >
              <i className="fas fa-play"></i>
              Start Cooking Mode
            </button>
            {isCookingMode && (
              <button 
                onClick={exitCookingMode}
                className={styles.exitCookingButton}
              >
                <i className="fas fa-times"></i>
                Exit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recipe Media Section */}
      {(recipe.videoUrl || (recipe.images && recipe.images.length > 0)) && (
        <div className={styles.mediaSection} style={{ margin: '2rem 0', textAlign: 'center' }}>
          {recipe.videoUrl && (
            <div style={{ marginBottom: 18 }}>
              <iframe
                width="100%"
                height="360"
                src={recipe.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                title="Recipe Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ maxWidth: 600, width: '100%', borderRadius: 12 }}
              ></iframe>
            </div>
          )}
          {recipe.images && recipe.images.length > 0 && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {recipe.images.map((img, idx) => (
                <div key={idx} style={{ display: 'inline-block', position: 'relative' }}>
                  <img
                    src={img.url}
                    alt={img.caption || `Recipe image ${idx + 1}`}
                    style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 10, border: img.isPrimary ? '2.5px solid #7c3aed' : '1.5px solid #e5e7eb' }}
                  />
                  {img.isPrimary && <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#059669', color: '#fff', borderRadius: 6, fontSize: 11, padding: '2px 6px' }}>Primary</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cooking Mode Interface */}
      {isCookingMode && (
        <div className={styles.cookingModeInterface}>
          {/* Progress Bar */}
          <div className={styles.cookingProgress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${cookingProgress}%` }}
              ></div>
            </div>
            <div className={styles.progressText}>
              {Math.round(cookingProgress)}% Complete
            </div>
          </div>

          {/* Timer Section */}
          <div className={styles.timerSection}>
            <div className={styles.timerDisplay}>
              <div className={styles.timerTime}>{formatTime(timerSeconds)}</div>
              <div className={styles.timerControls}>
                {!isTimerRunning && timerSeconds > 0 ? (
                  <button onClick={resumeTimer} className={styles.timerButton}>
                    <i className="fas fa-play"></i>
                  </button>
                ) : isTimerRunning ? (
                  <button onClick={pauseTimer} className={styles.timerButton}>
                    <i className="fas fa-pause"></i>
                  </button>
                ) : null}
                <button onClick={resetTimer} className={styles.timerButton}>
                  <i className="fas fa-redo"></i>
                </button>
              </div>
            </div>
            <div className={styles.quickTimers}>
              <button onClick={() => startTimer(300)} className={styles.quickTimer}>5 min</button>
              <button onClick={() => startTimer(600)} className={styles.quickTimer}>10 min</button>
              <button onClick={() => startTimer(900)} className={styles.quickTimer}>15 min</button>
              <button onClick={() => startTimer(1800)} className={styles.quickTimer}>30 min</button>
            </div>
          </div>

          {/* Voice Control */}
          <div className={styles.voiceControl}>
            <button 
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={`${styles.voiceButton} ${isVoiceEnabled ? styles.voiceActive : ''}`}
            >
              <i className={`fas ${isVoiceEnabled ? 'fa-volume-up' : 'fa-volume-mute'}`}></i>
              Voice Guidance {isVoiceEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* Recipe Content */}
      <div className={styles.recipeContent}>
        {/* Ingredients Card */}
        <div className={`${styles.card} ${styles.ingredientsCard}`}>
          <div className={styles.cardHeader}>
            <h2>Ingredients</h2>
            <div className={styles.cardIcon}>🥕</div>
            {isCookingMode && (
              <div className={styles.ingredientsProgress}>
                {checkedIngredients.length} / {ingredients.length}
              </div>
            )}
          </div>
          <ul>
            {ingredients.map((item, i) => (
              <li 
                key={i}
                className={`${isCookingMode && checkedIngredients.includes(i) ? styles.checked : ''}`}
                onClick={() => isCookingMode && toggleIngredient(i)}
              >
                <span 
                  className={`${styles.checkbox} ${isCookingMode ? styles.interactive : ''}`}
                >
                  {isCookingMode && checkedIngredients.includes(i) && (
                    <i className="fas fa-check"></i>
                  )}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Card */}
        <div className={`${styles.card} ${styles.instructionsCard}`}>
          <div className={styles.cardHeader}>
            <h2>Instructions</h2>
            <div className={styles.cardIcon}>📝</div>
            {isCookingMode && (
              <div className={styles.stepNavigation}>
                <button 
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className={styles.stepNavButton}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span className={styles.stepCounter}>
                  {currentStep + 1} / {instructions.length}
                </span>
                <button 
                  onClick={nextStep}
                  disabled={currentStep === instructions.length - 1}
                  className={styles.stepNavButton}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </div>
          
          {isCookingMode ? (
            instructions.length > 0 ? (
              <div className={styles.cookingInstructions}>
                <div className={styles.currentStep}>
                  <div className={styles.stepNumber}>{currentStep + 1}</div>
                  <div className={styles.stepText}>{instructions[currentStep]}</div>
                </div>
                <div className={styles.stepActions}>
                  <button 
                    onClick={previousStep}
                    disabled={currentStep === 0}
                    className={styles.stepActionButton}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Previous
                  </button>
                  <button 
                    onClick={nextStep}
                    disabled={currentStep === instructions.length - 1}
                    className={styles.stepActionButton}
                  >
                    Next
                    <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-secondary)', padding: '1.5rem 0' }}>No instructions provided for this recipe.</div>
            )
          ) : (
            instructions.length > 0 ? (
              <ol>
                {instructions.map((step, i) => (
                  <li key={i}>
                    <div className={styles.stepNumber}>{i + 1}</div>
                    <div className={styles.stepText}>{step}</div>
                  </li>
                ))}
              </ol>
            ) : (
              <div style={{ color: 'var(--text-secondary)', padding: '1.5rem 0' }}>No instructions provided for this recipe.</div>
            )
          )}
        </div>

        {/* Nutrition Card */}
        <div className={`${styles.card} ${styles.nutritionCard}`}>
          <div className={styles.cardHeader}>
            <h2>Nutrition Facts</h2>
            <div className={styles.cardIcon}>🍎</div>
          </div>
          <div className={styles.nutritionGrid}>
            <div className={styles.nutritionItem}>
              <div className={styles.nutritionValue}>320</div>
              <div className={styles.nutritionLabel}>Calories</div>
            </div>
            <div className={styles.nutritionItem}>
              <div className={styles.nutritionValue}>12g</div>
              <div className={styles.nutritionLabel}>Protein</div>
            </div>
            <div className={styles.nutritionItem}>
              <div className={styles.nutritionValue}>8g</div>
              <div className={styles.nutritionLabel}>Fat</div>
            </div>
            <div className={styles.nutritionItem}>
              <div className={styles.nutritionValue}>42g</div>
              <div className={styles.nutritionLabel}>Carbs</div>
            </div>
          </div>
        </div>

        {/* Recipe Scaling Calculator */}
        <div className={`${styles.card} ${styles.scalingCard}`}>
          <RecipeScalingCalculator recipe={recipe} />
        </div>

        {/* Resource Attachments Section */}
        {recipe.resources && recipe.resources.length > 0 && (
          <div className={styles.resourcesSection} style={{ margin: '2rem 0' }}>
            <h3 style={{ marginBottom: 10, color: '#7c3aed' }}><i className="fas fa-paperclip"></i> Resources</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {recipe.resources.map((res, idx) => (
                <li key={idx} style={{ marginBottom: 8 }}>
                  {res.type === 'link' ? (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}>
                      <i className="fas fa-link" style={{ marginRight: 6 }}></i>{res.name}
                    </a>
                  ) : (
                    <a href={res.url} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', textDecoration: 'underline', fontWeight: 600 }} download>
                      <i className="fas fa-file-pdf" style={{ marginRight: 6 }}></i>{res.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button 
          onClick={() => navigate(`/edit/${id}`)}
          className={styles.editButton}
        >
          <i className="fas fa-edit"></i>
          Edit Recipe
        </button>
        <button 
          onClick={() => navigate('/')} 
          className={styles.backButton}
        >
          <i className="fas fa-arrow-left"></i>
          Back to Recipes
        </button>
      </div>

      {/* Comments & Reviews Section */}
      <div className={styles.commentsSection}>
        <h2><i className="fas fa-comments"></i> Comments & Reviews</h2>
        {commentError && (
          <div style={{ color: '#e11d48', background: '#fff0f3', border: '1px solid #e11d48', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: 10, fontWeight: 500 }}>
            {commentError}
          </div>
        )}
        <form onSubmit={handlePostComment} style={{ marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <img src={JSON.parse(localStorage.getItem('user'))?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef1'} alt="Your avatar" className={styles.userAvatar} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <select value={commentRating} onChange={e => setCommentRating(Number(e.target.value))} style={{ fontSize: '1rem', borderRadius: 6, border: '1.5px solid var(--border-color)', padding: '0.2rem 0.5rem' }}>
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
              </select>
              <input type="file" accept="image/*" onChange={handlePhotoChange} disabled={postingComment} style={{ marginLeft: 8 }} />
            </div>
            {reviewPhotoUrl && (
              <div style={{ marginBottom: 6 }}>
                <img src={reviewPhotoUrl} alt="Review" style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1.5px solid #e5e7eb' }} />
              </div>
            )}
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Leave a comment..."
              className={styles.textarea}
              disabled={postingComment}
              rows={3}
              style={{ marginBottom: 6 }}
            />
            <button type="submit" className={styles.addReviewButton} disabled={postingComment}>
              {postingComment ? <span className="fas fa-spinner fa-spin"></span> : 'Post'}
            </button>
          </div>
        </form>
        <div className={styles.reviewsList}>
          {commentsLoading ? (
            <div style={{ color: 'var(--text-secondary)', padding: '1.5rem 0' }}>Loading comments...</div>
          ) : !Array.isArray(comments) || comments.length === 0 ? (
            <div className="emptyState">
              <div className="emptyStateIcon">🗨️</div>
              <div>No comments yet. Be the first to leave a review!</div>
            </div>
          ) : (
            comments.map((review, idx) => {
              const user = JSON.parse(localStorage.getItem('user'));
              const isOwn = user && (review.user?._id === user.id || review.user?.id === user.id);
              return (
                <React.Fragment key={review._id || review.id}>
                  <div className={styles.reviewCard}>
                    <img src={review.user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef1'} alt={review.user?.displayName || 'User'} className={styles.userAvatar} />
                    <div style={{ flex: 1 }}>
                      <div className="reviewHeader" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="reviewName" style={{ fontWeight: 600 }}>{review.user?.displayName || review.user?.username || 'User'}</span>
                        <span className="reviewUsername" style={{ color: 'var(--primary-color)', fontSize: '0.97rem' }}>@{review.user?.username}</span>
                        <span className="reviewDate" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginLeft: 8 }}>{formatDate(review.createdAt)}</span>
                        <span className={styles.reviewStars}>{renderStars(review.rating)}</span>
                        {isOwn && (
                          <button className={styles.deleteCommentButton} title="Delete comment" onClick={() => handleDeleteComment(review._id || review.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </div>
                      <div style={{ marginTop: 2 }}>{review.comment || review.text}</div>
                      {review.photos && review.photos.length > 0 && (
                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                          {review.photos.map((photo, i) => (
                            <img
                              key={i}
                              src={photo.url}
                              alt={photo.caption || `Review photo ${i + 1}`}
                              style={{ maxWidth: 120, maxHeight: 120, borderRadius: 8, border: '1.5px solid #e5e7eb' }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {idx < comments.length - 1 && <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0 1rem' }} />}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;