import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import styles from '../styles/Navbar.module.css';

const Navbar = ({ onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.logo}>
          🍽️ Carey's Recippa App
        </Link>
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/" onClick={() => setIsMenuOpen(false)} className={styles.navLink}>Home</Link>
              <div className={styles.dropdownContainer} ref={dropdownRef}>
                <button
                  className={`${styles.navLink} ${styles.dropdownButton}`}
                  onClick={toggleDropdown}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleDropdown();
                    }
                  }}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="true"
                  tabIndex={0}
                >
                  Dashboard
                  <i className={`fas fa-chevron-down ${isDropdownOpen ? styles.rotated : ''}`}></i>
                </button>
                <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.show : ''}`}>
                  <Link to="/dashboard" onClick={() => { setIsMenuOpen(false); setIsDropdownOpen(false); }} className={styles.dropdownItem} tabIndex={isDropdownOpen ? 0 : -1}>
                    <i className="fas fa-chart-bar"></i>
                    Overview
                  </Link>
                  <Link to="/meal-planner" onClick={() => { setIsMenuOpen(false); setIsDropdownOpen(false); }} className={styles.dropdownItem} tabIndex={isDropdownOpen ? 0 : -1}>
                    <i className="fas fa-calendar-alt"></i>
                    Meal Planner
                  </Link>
                  <Link to="/ai-generator" onClick={() => { setIsMenuOpen(false); setIsDropdownOpen(false); }} className={styles.dropdownItem} tabIndex={isDropdownOpen ? 0 : -1}>
                    <i className="fas fa-magic"></i>
                    AI Generator
                  </Link>
                  <Link to="/shopping-lists" onClick={() => { setIsMenuOpen(false); setIsDropdownOpen(false); }} className={styles.dropdownItem} tabIndex={isDropdownOpen ? 0 : -1}>
                    <i className="fas fa-shopping-cart"></i>
                    Shopping Lists
                  </Link>
                </div>
              </div>
              <Link to="/add" onClick={() => setIsMenuOpen(false)} className={styles.navLink}>Add Recipe</Link>
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className={styles.navLink}>About</Link>
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className={styles.navLink}>Contact</Link>
              <div className={styles.themeToggleWrapper}>
                <ThemeToggle variant="minimal" />
              </div>
              <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
            </>
          ) : (
            <>
              <div className={styles.themeToggleWrapper}>
                <ThemeToggle variant="minimal" />
              </div>
              <button className={styles.loginButton} onClick={() => navigate('/login')}>Login</button>
              <button className={styles.registerButton} onClick={() => navigate('/register')}>Register</button>
            </>
          )}
        </div>
        <div className={styles.mobileMenuButton} onClick={toggleMenu} tabIndex={0} aria-label="Toggle navigation menu" role="button">
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}></span>
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}></span>
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.active : ''}`}></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
