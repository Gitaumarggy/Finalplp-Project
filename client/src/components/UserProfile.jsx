import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from '../styles/UserProfile.module.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('recipes');
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const targetUserId = userId || currentUser?.id;
    setIsOwnProfile(currentUser?.id === targetUserId);
    loadProfile(targetUserId, currentUser?.id);
  }, [userId]);

  // User search logic
  useEffect(() => {
    if (userSearch.trim() === '') {
      setUserSearchResults([]);
      return;
    }
    // Simulate user search from localStorage (or mock data)
    const allUsers = [
      ...Array.from({ length: 10 }, (_, i) => ({
        id: (i + 1).toString(),
        username: `chef${i + 1}`,
        displayName: `Chef ${i + 1}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=chef${i + 1}`
      })),
      // Add current profile for demo
      profile && {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        avatar: profile.avatar
      }
    ].filter(Boolean);
    const results = allUsers.filter(u =>
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.displayName.toLowerCase().includes(userSearch.toLowerCase())
    );
    setUserSearchResults(results);
  }, [userSearch, profile]);

  // Load reviews (mock/demo)
  useEffect(() => {
    if (!profile) return;
    // In a real app, fetch from API
    const mockReviews = [
      { id: 1, user: { id: '2', username: 'chef2', displayName: 'Chef 2', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef2' }, rating: 5, text: 'Amazing recipes and super helpful!', date: '2024-06-01' },
      { id: 2, user: { id: '3', username: 'chef3', displayName: 'Chef 3', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef3' }, rating: 4, text: 'Great chef, love the Italian dishes!', date: '2024-06-02' }
    ];
    setReviews(mockReviews);
  }, [profile]);

  useEffect(() => {
    if (isOwnProfile) {
      fetch('/api/users/favorites', {
        headers: { Authorization: JSON.parse(localStorage.getItem('user'))?.token ? `Bearer ${JSON.parse(localStorage.getItem('user')).token}` : undefined }
      })
        .then(res => res.json())
        .then(data => setFavorites(data || []));
    }
  }, [isOwnProfile]);

  // Fetch profile, followers, following, and isFollowing
  const loadProfile = async (targetUserId, currentUserId) => {
    setLoading(true);
    try {
      // Fetch profile
      const res = await fetch(`/api/users/profile/${targetUserId}`);
      const data = await res.json();
      setProfile({
        ...data.user,
        displayName: data.user.profile?.firstName || data.user.username,
        avatar: data.user.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}`
      });
      setRecipes(data.recipes || []);
      // Fetch followers
      const followersRes = await fetch(`/api/users/${targetUserId}/followers`);
      const followersData = await followersRes.json();
      setFollowers(followersData);
      // Fetch following
      const followingRes = await fetch(`/api/users/${targetUserId}/following`);
      const followingData = await followingRes.json();
      setFollowing(followingData);
      // Check if current user is following
      if (currentUserId && followersData.some(f => f._id === currentUserId)) {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Follow/unfollow handlers
  const handleFollow = async () => {
    if (!profile) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`/api/users/${profile._id}/follow`, {
        method: 'POST',
        headers: { Authorization: user?.token ? `Bearer ${user.token}` : undefined }
      });
      if (res.ok) {
        setIsFollowing(true);
        setFollowers(prev => [...prev, user]);
      }
    } catch (err) {
      // Optionally show error
    }
  };
  const handleUnfollow = async () => {
    if (!profile) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch(`/api/users/${profile._id}/unfollow`, {
        method: 'POST',
        headers: { Authorization: user?.token ? `Bearer ${user.token}` : undefined }
      });
      if (res.ok) {
        setIsFollowing(false);
        setFollowers(prev => prev.filter(f => f._id !== user.id));
      }
    } catch (err) {
      // Optionally show error
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/profile/${profile.id}`;
    if (navigator.share) {
      navigator.share({
        title: `${profile.displayName}'s Profile`,
        text: `Check out ${profile.displayName}'s amazing recipes!`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Profile link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <i className="fas fa-spinner fa-spin"></i>
        </div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <i className="fas fa-user-slash"></i>
          <h2>Profile Not Found</h2>
          <p>This user profile doesn't exist or has been removed.</p>
          <Link to="/" className={styles.backButton}>
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      {/* User Search Bar */}
      <div className={styles.userSearchBar} style={{ marginBottom: 24, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
        <input
          type="text"
          value={userSearch}
          onChange={e => setUserSearch(e.target.value)}
          placeholder="Search users by username or name..."
          className={styles.input}
          style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: 8, border: '1.5px solid var(--border-color)', fontSize: '1rem' }}
        />
        {userSearch && userSearchResults.length > 0 && (
          <div className={styles.userSearchResults} style={{ background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: 8, marginTop: 4, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', zIndex: 10, position: 'absolute', width: '100%' }}>
            {userSearchResults.map(user => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className={styles.userSearchResult}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 1rem', textDecoration: 'none', color: 'var(--text-primary)' }}
                onClick={() => setUserSearch('')}
              >
                <img src={user.avatar} alt={user.displayName} style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid var(--primary-color-alpha)' }} />
                <span style={{ fontWeight: 500 }}>{user.displayName}</span>
                <span style={{ color: 'var(--primary-color)', marginLeft: 6 }}>@{user.username}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.coverImage}>
          <div className={styles.coverOverlay}></div>
        </div>
        
        <div className={styles.profileInfo}>
          <div className={styles.avatarSection}>
            <img 
              src={profile.avatar} 
              alt={profile.displayName}
              className={styles.avatar}
            />
            {isOwnProfile && (
              <button className={styles.editAvatarButton}>
                <i className="fas fa-camera"></i>
              </button>
            )}
          </div>
          
          <div className={styles.profileDetails}>
            <div className={styles.nameSection}>
              <h1>{profile.displayName}</h1>
              <span className={styles.username}>@{profile.username}</span>
              {profile.badges.length > 0 && (
                <div className={styles.badgePreview}>
                  {profile.badges.slice(0, 3).map((badge, index) => (
                    <span key={index} className={styles.badge} title={badge.description}>
                      {badge.icon}
                    </span>
                  ))}
                  {profile.badges.length > 3 && (
                    <span className={styles.moreBadges}>+{profile.badges.length - 3}</span>
                  )}
                </div>
              )}
            </div>
            
            <p className={styles.bio}>{profile.bio}</p>
            
            <div className={styles.profileMeta}>
              <span className={styles.metaItem}>
                <i className="fas fa-map-marker-alt"></i>
                {profile.location}
              </span>
              <span className={styles.metaItem}>
                <i className="fas fa-calendar-alt"></i>
                Joined {new Date(profile.joinDate).toLocaleDateString()}
              </span>
              {profile.website && (
                <a href={profile.website} className={styles.metaItem} target="_blank" rel="noopener noreferrer">
                  <i className="fas fa-globe"></i>
                  Website
                </a>
              )}
            </div>
            
            <div className={styles.socialLinks}>
              {Object.entries(profile.socialLinks).map(([platform, handle]) => (
                <a 
                  key={platform}
                  href={`https://${platform}.com/${handle}`}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className={`fab fa-${platform}`}></i>
                </a>
              ))}
            </div>
          </div>
          
          <div className={styles.profileActions}>
            {!isOwnProfile && (
              <>
                {isFollowing ? (
                  <button 
                    onClick={handleUnfollow}
                    className={`${styles.followButton} ${styles.following}`}
                  >
                    <i className="fas fa-user-check"></i>
                    Following
                  </button>
                ) : (
                  <button 
                    onClick={handleFollow}
                    className={styles.followButton}
                  >
                    <i className="fas fa-user-plus"></i>
                    Follow
                  </button>
                )}
                <button className={styles.messageButton}>
                  <i className="fas fa-envelope"></i>
                  Message
                </button>
              </>
            )}
            <button onClick={handleShare} className={styles.shareButton}>
              <i className="fas fa-share"></i>
              Share
            </button>
            {isOwnProfile && (
              <Link to="/settings" className={styles.editProfileButton}>
                <i className="fas fa-edit"></i>
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{recipes.length}</div>
          <div className={styles.statLabel}>Recipes</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{followers.length}</div>
          <div className={styles.statLabel}>Followers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{following.length}</div>
          <div className={styles.statLabel}>Following</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{profile.stats?.totalLikes || 0}</div>
          <div className={styles.statLabel}>Total Likes</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{profile.stats?.totalViews || 0}</div>
          <div className={styles.statLabel}>Total Views</div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className={styles.contentTabs}>
        <div className={styles.tabNavigation}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'recipes' ? styles.active : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            <i className="fas fa-utensils"></i>
            Recipes ({recipes.length})
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'followers' ? styles.active : ''}`}
            onClick={() => setActiveTab('followers')}
          >
            <i className="fas fa-users"></i>
            Followers ({followers.length})
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'following' ? styles.active : ''}`}
            onClick={() => setActiveTab('following')}
          >
            <i className="fas fa-user-friends"></i>
            Following ({following.length})
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'badges' ? styles.active : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            <i className="fas fa-trophy"></i>
            Badges ({profile.badges.length})
          </button>
          {isOwnProfile && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'preferences' ? styles.active : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <i className="fas fa-cog"></i>
              Preferences
            </button>
          )}
          {isOwnProfile && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'favorites' ? styles.active : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <i className="fas fa-heart"></i>
              Favorites ({favorites.length})
            </button>
          )}
          {isOwnProfile && (
            <button 
              className={`${styles.tabButton} ${activeTab === 'collections' ? styles.active : ''}`}
              onClick={() => setActiveTab('collections')}
            >
              <i className="fas fa-folder"></i>
              Collections
            </button>
          )}
          <button 
            className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <i className="fas fa-comments"></i>
            Reviews ({reviews.length})
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* Recipes Tab */}
          {activeTab === 'recipes' && (
            <div className={styles.recipesGrid}>
              {recipes.length > 0 ? (
                recipes.map(recipe => (
                  <div key={recipe.id} className={styles.recipeCard}>
                    <div className={styles.recipeImage}>
                      <i className="fas fa-utensils"></i>
                    </div>
                    <div className={styles.recipeInfo}>
                      <h3>{recipe.title}</h3>
                      <div className={styles.recipeMeta}>
                        <span>
                          <i className="fas fa-clock"></i>
                          {recipe.cookingTime || '30 min'}
                        </span>
                        <span>
                          <i className="fas fa-star"></i>
                          {recipe.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                    <Link to={`/recipe/${recipe.id}`} className={styles.viewRecipeButton}>
                      <i className="fas fa-eye"></i>
                    </Link>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <i className="fas fa-utensils"></i>
                  <h3>No recipes yet</h3>
                  <p>Start sharing your culinary creations!</p>
                  {isOwnProfile && (
                    <Link to="/add" className={styles.addRecipeButton}>
                      <i className="fas fa-plus"></i>
                      Add Your First Recipe
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Favorites Tab */}
          {activeTab === 'favorites' && isOwnProfile && (
            <div className={styles.recipesGrid}>
              {favorites.length > 0 ? (
                favorites.map(recipe => (
                  <div key={recipe._id || recipe.id} className={styles.recipeCard}>
                    <div className={styles.recipeImage}>
                      <i className="fas fa-heart"></i>
                    </div>
                    <div className={styles.recipeInfo}>
                      <h3>{recipe.title}</h3>
                      <div className={styles.recipeMeta}>
                        <span>
                          <i className="fas fa-clock"></i>
                          {recipe.cookingTime || '30 min'}
                        </span>
                        <span>
                          <i className="fas fa-star"></i>
                          {recipe.rating || '4.5'}
                        </span>
                      </div>
                    </div>
                    <Link to={`/recipe/${recipe._id || recipe.id}`} className={styles.viewRecipeButton}>
                      <i className="fas fa-eye"></i>
                    </Link>
                  </div>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <i className="fas fa-heart"></i>
                  <h3>No favorites yet</h3>
                  <p>Click the heart on any recipe to add it to your favorites!</p>
                </div>
              )}
            </div>
          )}

          {/* Followers Tab */}
          {activeTab === 'followers' && (
            <div className={styles.usersGrid}>
              {followers.map(user => (
                <div key={user._id} className={styles.userCard}>
                  <img src={user.avatar} alt={user.displayName} className={styles.userAvatar} />
                  <div className={styles.userInfo}>
                    <h4>{user.displayName}</h4>
                    <span>@{user.username}</span>
                  </div>
                  <button className={styles.followUserButton}>
                    <i className="fas fa-user-plus"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Following Tab */}
          {activeTab === 'following' && (
            <div className={styles.usersGrid}>
              {following.map(user => (
                <div key={user._id} className={styles.userCard}>
                  <img src={user.avatar} alt={user.displayName} className={styles.userAvatar} />
                  <div className={styles.userInfo}>
                    <h4>{user.displayName}</h4>
                    <span>@{user.username}</span>
                  </div>
                  <button className={styles.unfollowButton}>
                    <i className="fas fa-user-minus"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Badges Tab */}
          {activeTab === 'badges' && (
            <div className={styles.badgesGrid}>
              {profile.badges.map((badge, index) => (
                <div key={index} className={styles.badgeCard}>
                  <div className={styles.badgeIcon}>{badge.icon}</div>
                  <h4>{badge.name}</h4>
                  <p>{badge.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && isOwnProfile && (
            <div className={styles.preferencesGrid}>
              <div className={styles.preferenceCard}>
                <h4>Favorite Cuisine</h4>
                <p>{profile.preferences.favoriteCuisine}</p>
              </div>
              <div className={styles.preferenceCard}>
                <h4>Cooking Level</h4>
                <p>{profile.preferences.cookingLevel}</p>
              </div>
              <div className={styles.preferenceCard}>
                <h4>Dietary Restrictions</h4>
                <div className={styles.tags}>
                  {profile.preferences.dietaryRestrictions.map((restriction, index) => (
                    <span key={index} className={styles.tag}>{restriction}</span>
                  ))}
                </div>
              </div>
              <div className={styles.preferenceCard}>
                <h4>Favorite Ingredients</h4>
                <div className={styles.tags}>
                  {profile.preferences.favoriteIngredients.map((ingredient, index) => (
                    <span key={index} className={styles.tag}>{ingredient}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Collections Tab */}
          {activeTab === 'collections' && isOwnProfile && (
            <RecipeCollections />
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className={styles.reviewsSection}>
              <h3>Profile Reviews</h3>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (!newReview.trim()) return;
                  const currentUser = JSON.parse(localStorage.getItem('user')) || { id: '1', username: 'chef1', displayName: 'Chef 1', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef1' };
                  setReviews(prev => [
                    { id: Date.now(), user: currentUser, rating: reviewRating, text: newReview, date: new Date().toISOString().slice(0, 10) },
                    ...prev
                  ]);
                  setNewReview('');
                  setReviewRating(5);
                }}
                style={{ marginBottom: 18 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <img src={JSON.parse(localStorage.getItem('user'))?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=chef1'} alt="Your avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} style={{ fontSize: '1rem', borderRadius: 6, border: '1.5px solid var(--border-color)', padding: '0.2rem 0.5rem' }}>
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
                  </select>
                  <input
                    type="text"
                    value={newReview}
                    onChange={e => setNewReview(e.target.value)}
                    placeholder="Leave a comment..."
                    style={{ flex: 1, borderRadius: 6, border: '1.5px solid var(--border-color)', padding: '0.5rem 1rem', fontSize: '1rem' }}
                  />
                  <button type="submit" className={styles.addReviewButton} style={{ padding: '0.5rem 1.2rem', borderRadius: 6, background: 'var(--primary-color)', color: '#fff', border: 'none', fontWeight: 600 }}>Post</button>
                </div>
              </form>
              <div className={styles.reviewsList}>
                {reviews.length === 0 ? (
                  <div style={{ color: 'var(--text-secondary)', padding: '1.5rem 0' }}>No reviews yet. Be the first to leave a comment!</div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className={styles.reviewCard} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18, background: '#f8fafc', borderRadius: 10, padding: '1rem 1.2rem' }}>
                      <img src={review.user.avatar} alt={review.user.displayName} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--primary-color-alpha)' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{review.user.displayName}</span>
                          <span style={{ color: 'var(--primary-color)', fontSize: '0.97rem' }}>@{review.user.username}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginLeft: 8 }}>{review.date}</span>
                          <span style={{ marginLeft: 'auto', color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(review.rating)}</span>
                        </div>
                        <div style={{ marginTop: 2 }}>{review.text}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 