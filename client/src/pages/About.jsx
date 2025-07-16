import React, { useEffect, useState, useRef } from 'react';
import styles from '../styles/About.module.css';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const teamRef = useRef(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: '🍳',
      title: 'Easy Recipe Management',
      description: 'Add, edit, and organize your recipes with our intuitive interface.'
    },
    {
      icon: '🔍',
      title: 'Smart Search',
      description: 'Find recipes by ingredients, dietary needs, or cooking time.'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Access your recipes anywhere, on any device.'
    },
    {
      icon: '🔄',
      title: 'Sync Across Devices',
      description: 'Your recipes are saved in the cloud and available everywhere.'
    }
  ];

  const teamMembers = [
    {
      name: 'Margaret Gitau',
      role: 'Founder & Developer',
      bio: 'Passionate about cooking and technology, bringing recipes to the digital world.'
    },
    {
      name: 'Carey',
      role: 'Culinary Advisor',
      bio: 'Professional chef with 10+ years experience in international cuisine.'
    }
  ];

  const navigate = useNavigate();

  const handleCtaClick = () => {
    navigate('/add');
  };

  return (
    <div className={styles.aboutContainer}>
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`${styles.aboutHero} ${isVisible ? styles.fadeIn : ''}`}
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          opacity: 1 - (scrollY * 0.001)
        }}
      >
        <div className={styles.heroContent}>
          <h1 className={isVisible ? styles.slideDown : ''}>About Our Recipe App</h1>
          <p className={isVisible ? styles.slideUp : ''}>
            More than just a collection of recipes - it's your digital kitchen companion
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className={`${styles.aboutSection} ${isVisible ? styles.fadeIn : ''}`}>
        <h2>Our Mission</h2>
        <p>
          We created this app to make cooking more accessible and enjoyable for everyone. 
          Whether you're a seasoned chef or just starting out in the kitchen, our goal is 
          to provide you with the tools and inspiration you need to create delicious meals.
        </p>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>Key Features</h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`${styles.featureCard} ${isVisible ? styles.fadeIn : ''}`}
              style={{ 
                animationDelay: `${index * 0.2}s`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.6s ease ${index * 0.2}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className={`${styles.techSection} ${isVisible ? styles.fadeIn : ''}`}>
        <h2 className={styles.sectionTitle}>Built With Modern Technology</h2>
        <div className={styles.techStack}>
          {['MongoDB', 'Express', 'React', 'Node.js'].map((tech, index) => (
            <div 
              key={index}
              className={styles.techItem}
              style={{
                animationDelay: `${index * 0.3}s`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) rotate(0deg)' : 'translateY(20px) rotate(5deg)',
                transition: `all 0.5s ease ${index * 0.3}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) rotate(3deg) scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) rotate(0deg) scale(1)';
              }}
            >
              <div className={styles.techLogo}>{tech[0]}</div>
              <span>{tech}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className={styles.teamSection}>
        <h2 className={styles.sectionTitle}>Meet The Team</h2>
        <div className={styles.teamGrid}>
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className={styles.teamCard}
              style={{
                animationDelay: `${index * 0.4}s`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible 
                  ? (index % 2 === 0 ? 'translateX(0)' : 'translateX(0)') 
                  : (index % 2 === 0 ? 'translateX(-100px)' : 'translateX(100px)'),
                transition: `all 0.7s ease ${index * 0.4}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.1)';
              }}
            >
              <div className={styles.teamAvatar}>
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3>{member.name}</h3>
              <p className={styles.teamRole}>{member.role}</p>
              <p className={styles.teamBio}>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className={`${styles.ctaSection} ${isVisible ? styles.fadeIn : ''}`}>
        <h2>Ready to Start Cooking?</h2>
        <p>Join thousands of home chefs who are already using our app</p>
        <button 
          className={styles.ctaButton}
          onClick={handleCtaClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
          }}
        >
          Get Started Now
        </button>
      </section>
    </div>
  );
};

export default About;