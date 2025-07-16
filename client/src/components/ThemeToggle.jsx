import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import styles from '../styles/ThemeToggle.module.css';

const ThemeToggle = ({ variant = 'default' }) => {
  const { isDarkMode, toggleTheme, isTransitioning } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleToggle = () => {
    if (!isTransitioning) {
      toggleTheme();
    }
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  // Add keyboard support
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 't' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleToggle();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isTransitioning]);

  if (variant === 'minimal') {
    return (
      <button
        className={`${styles.minimalToggle} ${isDarkMode ? styles.dark : styles.light}`}
        onClick={handleToggle}
        disabled={isTransitioning}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode (Ctrl+T)`}
      >
        <div className={styles.minimalIcon}>
          {isDarkMode ? (
            <i className="fas fa-sun"></i>
          ) : (
            <i className="fas fa-moon"></i>
          )}
        </div>
      </button>
    );
  }

  return (
    <div className={styles.themeToggleContainer}>
      <button
        className={`${styles.themeToggle} ${isDarkMode ? styles.dark : styles.light} ${isHovered ? styles.hovered : ''} ${isPressed ? styles.pressed : ''} ${isTransitioning ? styles.transitioning : ''}`}
        onClick={handleToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        disabled={isTransitioning}
        aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode (Ctrl+T)`}
      >
        {/* Toggle Track */}
        <div className={styles.toggleTrack}>
          {/* Sun Icon */}
          <div className={`${styles.iconContainer} ${styles.sunIcon} ${!isDarkMode ? styles.active : ''}`}>
            <i className="fas fa-sun"></i>
          </div>
          
          {/* Moon Icon */}
          <div className={`${styles.iconContainer} ${styles.moonIcon} ${isDarkMode ? styles.active : ''}`}>
            <i className="fas fa-moon"></i>
          </div>
          
          {/* Toggle Handle */}
          <div className={`${styles.toggleHandle} ${isDarkMode ? styles.darkHandle : styles.lightHandle}`}>
            <div className={styles.handleGlow}></div>
          </div>
        </div>
        
        {/* Ripple Effect */}
        <div className={`${styles.ripple} ${isPressed ? styles.rippleActive : ''}`}></div>
      </button>
      
      {/* Theme Label */}
      <span className={styles.themeLabel}>
        {isDarkMode ? 'Dark' : 'Light'} Mode
      </span>
    </div>
  );
};

export default ThemeToggle; 