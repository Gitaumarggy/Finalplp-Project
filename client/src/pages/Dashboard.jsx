import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Dashboard.module.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/auth/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data || userData);
        await fetchUserStats((userData.data || userData)._id);
      } else {
        console.warn('API returned non-OK status:', response.status);
        // Fallback to localStorage user data
        loadLocalUserData();
      }
    } catch (error) {
      console.warn('Error fetching user data from API:', error.message);
      // Fallback to localStorage user data
      loadLocalUserData();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalUserData = () => {
    try {
      const userRaw = localStorage.getItem('user');
      if (userRaw && userRaw !== 'undefined') {
        const userData = JSON.parse(userRaw);
        setUser(userData);
        fetchLocalStats();
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading local user data:', error);
      navigate('/login');
    }
  };

  const fetchUserStats = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`/api/users/progress`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const progressData = await response.json();
        setStats(progressData);
      } else {
        console.warn('API returned non-OK status for stats:', response.status);
        fetchLocalStats();
      }
    } catch (error) {
      console.warn('Error fetching user stats from API:', error.message);
      fetchLocalStats();
    }
  };

  const fetchLocalStats = () => {
    try {
      const localRecipes = JSON.parse(localStorage.getItem('recipes')) || [];
      const localStats = {
        stats: {
          recipesCreated: localRecipes.length,
          favorites: 0,
          recipesCompleted: Math.floor(localRecipes.length * 0.3) // Mock completed recipes
        },
        completedRecipes: localRecipes.slice(0, 3).map(recipe => ({
          recipe: { title: recipe.title },
          completedAt: new Date().toISOString()
        })),
        badges: [
          { icon: '🥇', name: 'First Recipe' },
          { icon: '👨‍🍳', name: 'Home Chef' },
          { icon: '⭐', name: 'Recipe Creator' }
        ]
      };
      setStats(localStats);
    } catch (error) {
      console.error('Error loading local stats:', error);
      setStats({
        stats: { recipesCreated: 0, favorites: 0, recipesCompleted: 0 },
        completedRecipes: [],
        badges: []
      });
    }
  };

  if (loading) return <div className={styles.loading}>Loading your dashboard...</div>;
  if (!user) return null;

  return (
    <div className={styles.dashboardRoot}>
      {/* Background Accent */}
      <div className={styles.profileAccent}></div>
      {/* Profile and Quick Stats */}
      <div className={styles.headerRow}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {user.profile?.avatar
              ? <img src={user.profile.avatar} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
              : <span>{user.username.charAt(0).toUpperCase()}</span>
            }
          </div>
          <div>
            <div className={styles.greeting}>Welcome back, {user.profile?.firstName || user.username}!</div>
            <h2>{user.profile?.firstName || user.username}</h2>
            <p className={styles.email}>{user.email}</p>
          </div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.statsRow}>
          <div>
            <span className={`${styles.statIcon} ${styles.recipes}`}>🍲</span>
            <span className={styles.statValue}>{stats.stats?.recipesCreated || 0}</span>
            <span className={styles.statLabel}>Recipes</span>
          </div>
          <div>
            <span className={`${styles.statIcon} ${styles.favorites}`}>⭐</span>
            <span className={styles.statValue}>{stats.stats?.favorites || 0}</span>
            <span className={styles.statLabel}>Favorites</span>
          </div>
          <div>
            <span className={`${styles.statIcon} ${styles.completed}`}>✅</span>
            <span className={styles.statValue}>{stats.stats?.recipesCompleted || 0}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/add')}>
          <i className="fas fa-plus"></i> Add Recipe
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={activeTab === 'overview' ? styles.active : ''} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={activeTab === 'recipes' ? styles.active : ''} onClick={() => setActiveTab('recipes')}>My Recipes</button>
        <button className={activeTab === 'favorites' ? styles.active : ''} onClick={() => setActiveTab('favorites')}>Favorites</button>
        <button className={activeTab === 'progress' ? styles.active : ''} onClick={() => setActiveTab('progress')}>Progress</button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && <OverviewTab stats={stats} />}
        {activeTab === 'recipes' && <RecipesTab user={user} />}
        {activeTab === 'favorites' && <FavoritesTab />}
        {activeTab === 'progress' && <ProgressTab stats={stats} />}
      </div>
    </div>
  );
};

const OverviewTab = ({ stats }) => (
  <div>
    <h3>Recent Activity</h3>
    <ul>
      {stats.completedRecipes?.slice(0, 5).map((completion, i) => (
        <li key={i}>
          <span>✔️ {completion.recipe?.title}</span>
          <span style={{ color: '#888', marginLeft: 8 }}>{new Date(completion.completedAt).toLocaleDateString()}</span>
        </li>
      ))}
      {(!stats.completedRecipes || stats.completedRecipes.length === 0) && <li>No recent activity</li>}
    </ul>
  </div>
);

const RecipesTab = ({ user }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/my-recipes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      } else {
        setRecipes([]);
      }
    } catch (error) {
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId) => {
    if (!window.confirm('Remove this recipe from your cookbook?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/my-recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setRecipes(recipes.filter(r => r.recipe._id !== recipeId && r.recipe.id !== recipeId));
      }
    } catch (error) {}
  };

  const handleEdit = (recipeId) => {
    navigate(`/edit/${recipeId}`);
  };

  if (loading) return <div className={styles.loading}>Loading your recipes...</div>;

  return (
    <div>
      {recipes.length === 0 ? (
        <div>No recipes in your cookbook yet. <button onClick={() => navigate('/add')}>Add a recipe!</button></div>
      ) : (
        <div className={styles.recipeGrid}>
          {recipes.map((r) => {
            const recipe = r.custom && Object.keys(r.custom).length > 0 ? { ...r.recipe, ...r.custom } : r.recipe;
            return (
              <div key={recipe._id || recipe.id} className={styles.recipeCard}>
                <div className={styles.recipeTitle}>{recipe.title}</div>
                <div className={styles.recipeActions}>
                  <button onClick={() => navigate(`/recipe/${recipe._id || recipe.id}`)} title="View"><i className="fas fa-eye"></i></button>
                  <button onClick={() => handleEdit(recipe._id || recipe.id)} title="Edit"><i className="fas fa-edit"></i></button>
                  <button onClick={() => handleDelete(recipe._id || recipe.id)} title="Remove"><i className="fas fa-trash"></i></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const FavoritesTab = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => { 
    fetchFavorites(); 
  }, []);
  
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/users/favorites', { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) { 
        setFavorites(await response.json()); 
      } else {
        console.warn('API returned non-OK status for favorites:', response.status);
        loadLocalFavorites();
      }
    } catch (error) {
      console.warn('Error fetching favorites from API:', error.message);
      loadLocalFavorites();
    } finally { 
      setLoading(false); 
    }
  };

  const loadLocalFavorites = () => {
    try {
      const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
      setFavorites(localFavorites);
    } catch (error) {
      console.error('Error loading local favorites:', error);
      setFavorites([]);
    }
  };
  
  if (loading) return <div className={styles.loading}>Loading favorites...</div>;
  
  return (
    <div>
      {favorites.length === 0 ? (
        <div>No favorites yet. Browse recipes to add some favorites!</div>
      ) : (
        <ul>
          {favorites.map((r) => (
            <li key={r._id || r.id}>
              <span>{r.title}</span>
              <button onClick={() => navigate(`/recipe/${r._id || r.id}`)} title="View"><i className="fas fa-eye"></i></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ProgressTab = ({ stats }) => {
  // Helper for progress bar
  const ProgressBar = ({ current, target, label }) => (
    <div style={{ margin: '12px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
        <span>{label}</span>
        <span>{current} / {target}</span>
      </div>
      <div style={{ background: '#e5e7eb', borderRadius: 6, height: 12, width: '100%', marginTop: 2 }}>
        <div style={{ width: `${Math.min(100, (current / target) * 100)}%`, background: '#7c3aed', height: '100%', borderRadius: 6 }}></div>
      </div>
    </div>
  );

  return (
    <div>
      <h3>Achievements</h3>
      <ul>
        {stats.badges?.map((badge, i) => (
          <li key={i}><span>{badge.icon}</span> {badge.name}</li>
        ))}
        {(!stats.badges || stats.badges.length === 0) && <li>No achievements yet. Keep cooking to earn badges!</li>}
      </ul>
      {/* Progress Bars for Milestones */}
      {stats.nextMilestones && stats.nextMilestones.length > 0 && (
        <div style={{ margin: '24px 0' }}>
          <h4>Progress Toward Next Milestones</h4>
          {stats.nextMilestones.map((m, i) => (
            <ProgressBar key={i} current={m.current} target={m.target} label={m.description} />
          ))}
        </div>
      )}
      <h3 style={{ marginTop: 24 }}>Completed Recipes</h3>
      <ul>
        {stats.completedRecipes?.length > 0 ? stats.completedRecipes.map((completion, i) => (
          <li key={i}>
            <span>✔️ {completion.recipe?.title}</span>
            {completion.rating && <span style={{ marginLeft: 8, color: '#f59e0b' }}>{'★'.repeat(completion.rating)}</span>}
            <span style={{ color: '#888', marginLeft: 8 }}>{new Date(completion.completedAt).toLocaleDateString()}</span>
          </li>
        )) : <li>No completed recipes yet.</li>}
      </ul>
      {stats.reviews && (
        <>
          <h3 style={{ marginTop: 24 }}>Reviews Written</h3>
          <ul>
            {stats.reviews.length > 0 ? stats.reviews.map((review, i) => (
              <li key={i}>
                <span>📝 {review.title || review.comment?.slice(0, 30) + '...'}</span>
                {review.rating && <span style={{ marginLeft: 8, color: '#f59e0b' }}>{'★'.repeat(review.rating)}</span>}
                <span style={{ color: '#888', marginLeft: 8 }}>{new Date(review.createdAt).toLocaleDateString()}</span>
              </li>
            )) : <li>No reviews written yet.</li>}
          </ul>
        </>
      )}
    </div>
  );
};

export default Dashboard; 