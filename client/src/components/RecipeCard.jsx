import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/RecipeCard.module.css';

const RecipeCard = ({ recipe, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isRating, setIsRating] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingComment, setRatingComment] = useState('');
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(recipe.stats?.favorites || 0);

  useEffect(() => {
    // Check if this recipe is in the user's favorites
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.favorites && Array.isArray(user.favorites)) {
      setIsFavorited(user.favorites.includes(recipe._id || recipe.id));
    } else {
      // Optionally, fetch from backend if needed
    }
    setFavoriteCount(recipe.stats?.favorites || 0);
  }, [recipe]);

  // Get recipe rating data
  const recipeRating = recipe.rating || 0;
  const reviewCount = recipe.reviewCount || 0;
  const userHasRated = recipe.userHasRated || false;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    setMousePosition({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowActions(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(recipe.id);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      onDelete(recipe.id);
    }
  };

  const handleRatingClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowRatingModal(true);
  };

  const handleStarHover = (starIndex) => {
    if (!isRating) return;
    setUserRating(starIndex + 1);
  };

  const handleStarClick = (starIndex) => {
    setUserRating(starIndex + 1);
  };

  const handleRatingSubmit = async () => {
    try {
      // Here you would typically send the rating to your backend
      const ratingData = {
        recipeId: recipe.id,
        rating: userRating,
        comment: ratingComment,
        timestamp: new Date().toISOString()
      };

      // Simulate API call
      console.log('Submitting rating:', ratingData);
      
      // For demo purposes, we'll just close the modal
      setShowRatingModal(false);
      setRatingComment('');
      setUserRating(0);
      
      // Show success message
      alert('Thank you for your rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) return;
    if (!isFavorited) {
      // Add to favorites
      const res = await fetch(`/api/users/favorites/${recipe._id || recipe.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setIsFavorited(true);
        setFavoriteCount(c => c + 1);
      }
    } else {
      // Remove from favorites
      const res = await fetch(`/api/users/favorites/${recipe._id || recipe.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (res.ok) {
        setIsFavorited(false);
        setFavoriteCount(c => Math.max(0, c - 1));
      }
    }
  };

  // Helper to check for valid MongoDB ObjectId
  function isValidObjectId(id) {
    return /^[a-fA-F0-9]{24}$/.test(id);
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return '#10b981';
      case 'medium':
      case 'intermediate':
        return '#f59e0b';
      case 'hard':
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return '🌱';
      case 'medium':
      case 'intermediate':
        return '🔥';
      case 'hard':
      case 'advanced':
        return '⚡';
      default:
        return '🍽️';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#10b981'; // Green for excellent
    if (rating >= 3.5) return '#f59e0b'; // Yellow for good
    if (rating >= 2.5) return '#f97316'; // Orange for average
    return '#ef4444'; // Red for poor
  };

  const renderStars = (rating, interactive = false, onStarHover = null, onStarClick = null) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      let starClass = styles.star;
      let starIcon = 'far fa-star';

      if (i < fullStars) {
        starClass = `${styles.star} ${styles.starFilled}`;
        starIcon = 'fas fa-star';
      } else if (i === fullStars && hasHalfStar) {
        starClass = `${styles.star} ${styles.starHalf}`;
        starIcon = 'fas fa-star-half-alt';
      }

      if (interactive) {
        starClass += ` ${styles.starInteractive}`;
      }

      stars.push(
        <i
          key={i}
          className={`${starIcon} ${starClass}`}
          onMouseEnter={() => onStarHover && onStarHover(i)}
          onClick={() => onStarClick && onStarClick(i)}
          style={{
            animationDelay: `${i * 0.1}s`
          }}
        />
      );
    }
    return stars;
  };

  return (
    <>
      <div 
        ref={cardRef}
        className={`${styles.recipeCard} ${isHovered ? styles.hovered : ''}`}
        onMouseEnter={() => {
          setIsHovered(true);
          setTimeout(() => setShowActions(true), 200);
        }}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        style={{
          transform: isHovered 
            ? `perspective(1000px) rotateX(${mousePosition.x}deg) rotateY(${mousePosition.y}deg) scale(1.02)` 
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          transition: isHovered ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Floating Action Buttons */}
        <div className={`${styles.floatingActions} ${showActions ? styles.visible : ''}`}>
          <button 
            className={`${styles.floatingButton} ${styles.favoriteButton} ${isFavorited ? styles.favorited : ''}`}
            onClick={handleFavorite}
            title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            <i className={isFavorited ? 'fas fa-heart' : 'far fa-heart'}></i>
            <span className={styles.favoriteCount}>{favoriteCount}</span>
          </button>
          <button 
            className={`${styles.floatingButton} ${styles.shareButton}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add share functionality here
            }}
            title="Share Recipe"
          >
            <i className="fas fa-share-alt"></i>
          </button>
        </div>

        {/* Difficulty Badge */}
        <div 
          className={styles.difficultyBadge}
          style={{ 
            backgroundColor: getDifficultyColor(recipe.difficulty),
            boxShadow: `0 4px 12px ${getDifficultyColor(recipe.difficulty)}40`
          }}
        >
          <span className={styles.difficultyIcon}>
            {getDifficultyIcon(recipe.difficulty)}
          </span>
          <span className={styles.difficultyText}>
            {recipe.difficulty || 'Beginner'}
          </span>
        </div>

        {/* Rating Badge */}
        <div 
          className={styles.ratingBadge}
          style={{ 
            backgroundColor: getRatingColor(recipeRating),
            boxShadow: `0 4px 12px ${getRatingColor(recipeRating)}40`
          }}
        >
          <div className={styles.ratingStars}>
            {renderStars(recipeRating)}
          </div>
          <div className={styles.ratingScore}>
            {recipeRating.toFixed(1)}
          </div>
          <div className={styles.ratingCount}>
            ({reviewCount})
          </div>
        </div>

        {/* Card Image with Zoom Effect */}
        <div className={`${styles.cardImage} ${isHovered ? styles.imageZoomed : ''}`}>
          <div className={styles.imagePlaceholder}>
            <i className="fas fa-utensils"></i>
          </div>
          
          {/* Recipe Badges Overlay */}
          <div className={styles.recipeBadges}>
            {/* Difficulty Badge */}
            {recipe.difficulty && (
              <div 
                className={styles.difficultyBadge}
                style={{ 
                  backgroundColor: getDifficultyColor(recipe.difficulty),
                  boxShadow: `0 2px 8px ${getDifficultyColor(recipe.difficulty)}40`
                }}
              >
                <span className={styles.badgeIcon}>{getDifficultyIcon(recipe.difficulty)}</span>
                <span className={styles.badgeText}>{recipe.difficulty}</span>
              </div>
            )}
            
            {/* Cooking Time Indicator */}
            {recipe.cookingTime && (
              <div className={styles.cookingTimeBadge}>
                <i className="fas fa-clock"></i>
                <span>{recipe.cookingTime}</span>
              </div>
            )}
            
            {/* Dietary Icons */}
            {recipe.tags && (
              <div className={styles.dietaryBadges}>
                {recipe.tags.includes('vegetarian') && (
                  <div className={styles.dietaryBadge} title="Vegetarian">
                    🥬
                  </div>
                )}
                {recipe.tags.includes('vegan') && (
                  <div className={styles.dietaryBadge} title="Vegan">
                    🌱
                  </div>
                )}
                {recipe.tags.includes('gluten-free') && (
                  <div className={styles.dietaryBadge} title="Gluten-Free">
                    🌾
                  </div>
                )}
                {recipe.tags.includes('dairy-free') && (
                  <div className={styles.dietaryBadge} title="Dairy-Free">
                    🥛
                  </div>
                )}
                {recipe.tags.includes('keto') && (
                  <div className={styles.dietaryBadge} title="Keto">
                    🥑
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className={styles.imageOverlay}>
            <div className={styles.overlayContent}>
              <i className="fas fa-play-circle"></i>
              <span>View Recipe</span>
            </div>
          </div>
        </div>
        
        <div className={styles.cardContent}>
          <h3 className={styles.recipeTitle}>
            <Link to={`/recipe/${recipe.id}`} className={styles.recipeLink}>
              {recipe.title}
            </Link>
          </h3>
          {/* Author Info */}
          {recipe.userId && recipe.username && (
            <div className={styles.authorInfo} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Link to={`/profile/${recipe.userId}`} className={styles.authorLink} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'var(--primary-color)' }}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${recipe.userId}`} alt={recipe.username} style={{ width: 28, height: 28, borderRadius: '50%', marginRight: 6, border: '1.5px solid var(--primary-color-alpha)' }} />
                <span style={{ fontWeight: 500 }}>@{recipe.username}</span>
              </Link>
            </div>
          )}
          
          {/* Rating Section */}
          <div className={styles.ratingSection}>
            <div className={styles.ratingDisplay}>
              <div className={styles.starsContainer}>
                {renderStars(recipeRating)}
              </div>
              <div className={styles.ratingInfo}>
                <span className={styles.ratingValue}>{recipeRating.toFixed(1)}</span>
                <span className={styles.ratingCountText}>
                  ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            </div>
            {!userHasRated && (
              <button 
                className={styles.rateButton}
                onClick={handleRatingClick}
              >
                <i className="fas fa-star"></i>
                Rate Recipe
              </button>
            )}
          </div>
          
          <div className={styles.recipeMeta}>
            {recipe.cookingTime && (
              <span className={styles.metaItem}>
                <i className="fas fa-clock"></i>
                {recipe.cookingTime}
              </span>
            )}
            {recipe.servings && (
              <span className={styles.metaItem}>
                <i className="fas fa-users"></i>
                {recipe.servings}
              </span>
            )}
          </div>
          
          <div className={styles.ingredientsPreview}>
            <strong>Ingredients:</strong> {recipe.ingredients.slice(0, 3).join(', ')}
            {recipe.ingredients.length > 3 && '...'}
          </div>
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className={styles.tagsContainer}>
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className={styles.tag}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className={styles.moreTags}>+{recipe.tags.length - 3}</span>
              )}
            </div>
          )}
          
          <div className={styles.cardActions}>
            <Link to={`/recipe/${recipe.id}`} className={styles.viewButton}>
              <i className="fas fa-eye"></i>
              View
            </Link>
            <button onClick={handleEdit} className={styles.editButton}>
              <i className="fas fa-edit"></i>
              Edit
            </button>
            <button onClick={handleDelete} className={styles.deleteButton}>
              <i className="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>

        {/* Glow Effect */}
        <div className={`${styles.cardGlow} ${isHovered ? styles.glowActive : ''}`}></div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className={styles.ratingModalOverlay} onClick={() => setShowRatingModal(false)}>
          <div className={styles.ratingModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.ratingModalHeader}>
              <h3>Rate this Recipe</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowRatingModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className={styles.ratingModalContent}>
              <div className={styles.recipeInfo}>
                <h4>{recipe.title}</h4>
                <div className={styles.currentRating}>
                  Current Rating: {renderStars(recipeRating)} {recipeRating.toFixed(1)}
                </div>
              </div>
              
              <div className={styles.userRatingSection}>
                <label>Your Rating:</label>
                <div 
                  className={styles.interactiveStars}
                  onMouseEnter={() => setIsRating(true)}
                  onMouseLeave={() => setIsRating(false)}
                >
                  {renderStars(userRating, true, handleStarHover, handleStarClick)}
                </div>
                <div className={styles.ratingText}>
                  {userRating === 0 && 'Click to rate'}
                  {userRating === 1 && 'Poor'}
                  {userRating === 2 && 'Fair'}
                  {userRating === 3 && 'Good'}
                  {userRating === 4 && 'Very Good'}
                  {userRating === 5 && 'Excellent'}
                </div>
              </div>
              
              <div className={styles.commentSection}>
                <label htmlFor="ratingComment">Add a comment (optional):</label>
                <textarea
                  id="ratingComment"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Share your thoughts about this recipe..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className={styles.ratingModalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowRatingModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.submitButton}
                onClick={handleRatingSubmit}
                disabled={userRating === 0}
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecipeCard;
