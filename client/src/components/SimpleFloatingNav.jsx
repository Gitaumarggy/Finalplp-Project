import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SimpleFloatingNav = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      zIndex: 9999,
    }}>
      {/* Main Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6B35, #F7931E)',
          border: 'none',
          color: 'white',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(255, 107, 53, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Menu Items */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          right: '0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          background: 'white',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          minWidth: '200px'
        }}>
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#2C1810',
              borderRadius: '8px',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#FFF8F0'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            🏠 Home
          </Link>
          <Link 
            to="/dashboard" 
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#2C1810',
              borderRadius: '8px',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#FFF8F0'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/add" 
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#2C1810',
              borderRadius: '8px',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#FFF8F0'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            ➕ Add Recipe
          </Link>
          <Link 
            to="/about" 
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#2C1810',
              borderRadius: '8px',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#FFF8F0'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            ℹ️ About
          </Link>
          <Link 
            to="/contact" 
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.5rem 1rem',
              textDecoration: 'none',
              color: '#2C1810',
              borderRadius: '8px',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#FFF8F0'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            📧 Contact
          </Link>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: 'none',
              border: 'none',
              color: '#DC3545',
              borderRadius: '8px',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: '1rem',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#FFF8F0'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleFloatingNav; 