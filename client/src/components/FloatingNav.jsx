import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/FloatingNav.module.css';

const FloatingNav = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { path: '/', icon: 'fas fa-home', label: 'Home', color: '#FF6B35' },
    { path: '/dashboard', icon: 'fas fa-chart-line', label: 'Dashboard', color: '#F7931E' },
    { path: '/add', icon: 'fas fa-plus', label: 'Add Recipe', color: '#FFD23F' },
    { path: '/about', icon: 'fas fa-info-circle', label: 'About', color: '#28A745' },
    { path: '/contact', icon: 'fas fa-envelope', label: 'Contact', color: '#17A2B8' },
  ];

  return (
    <div className={styles.floatingNavContainer}>
      {/* Main Floating Button */}
      <button 
        className={`${styles.floatingButton} ${isOpen ? styles.active : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
      >
        <div className={styles.buttonContent}>
          <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </div>
      </button>

      {/* Navigation Items */}
      <div className={`${styles.navItems} ${isOpen ? styles.open : ''}`}>
        {navItems.map((item, index) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${activeItem === item.path ? styles.active : ''}`}
            style={{
              '--delay': `${index * 0.1}s`,
              '--color': item.color
            }}
            onClick={() => setIsOpen(false)}
          >
            <div className={styles.navIcon}>
              <i className={item.icon}></i>
            </div>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}

        {/* Logout Button */}
        <button
          className={`${styles.navItem} ${styles.logoutItem}`}
          onClick={handleLogout}
          style={{
            '--delay': '0.6s',
            '--color': '#DC3545'
          }}
        >
          <div className={styles.navIcon}>
            <i className="fas fa-sign-out-alt"></i>
          </div>
          <span className={styles.navLabel}>Logout</span>
        </button>
      </div>

      {/* Background Overlay */}
      {isOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FloatingNav; 