import React from 'react';
import styles from '../styles/App.module.css';

const Contact = () => {
  const contactInfo = [
    { icon: 'fas fa-user', text: 'Margaret Gitau' },
    { icon: 'fas fa-envelope', text: 'gitaumarggy@gmail.com', link: 'mailto:gitaumarggy@gmail.com' },
    { icon: 'fas fa-phone', text: '+254 742 617804', link: 'tel:+254742617804' },
    { icon: 'fas fa-map-marker-alt', text: 'Nairobi, Kenya' }
  ];

  const socialLinks = [
    { icon: 'fab fa-instagram', url: 'https://www.instagram.com/margg.y' },
    { icon: 'fab fa-github', url: 'https://github.com/Gitaumarggy' },
    { icon: 'fab fa-linkedin', url: 'https://www.linkedin.com/in/margaret-gitau' },
    { icon: 'fab fa-twitter', url: 'https://twitter.com/MargaretGitau1' }
  ];

  return (
    <div className={styles.contactContainer}>
      {/* Hero Section */}
      <section className={`${styles.contactHero} ${styles.fadeIn}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.slideDown}>Get In Touch</h1>
          <p className={styles.slideUp}>
            Have questions, suggestions, or just want to say hello? We'd love to hear from you!
          </p>
        </div>
      </section>

      {/* Contact Cards Section */}
      <section className={styles.contactCards}>
        {/* Contact Information */}
        <div className={`${styles.contactCard} ${styles.slideInLeft}`}>
          <h2 className={styles.cardTitle}>
            <i className="fas fa-address-card"></i> Contact Information
          </h2>
          <ul className={styles.contactList}>
            {contactInfo.map((item, index) => (
              <li key={index} className={styles.contactItem}>
                <i className={item.icon}></i>
                {item.link ? (
                  <a href={item.link} className={styles.contactLink}>
                    {item.text}
                  </a>
                ) : (
                  <span>{item.text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div className={`${styles.contactCard} ${styles.slideInRight}`}>
          <h2 className={styles.cardTitle}>
            <i className="fas fa-share-alt"></i> Connect With Me
          </h2>
          <div className={styles.socialLinks}>
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={social.icon.replace('fab fa-', '')}
              >
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className={`${styles.contactFormSection} ${styles.fadeIn}`}>
        <h2 className={styles.sectionTitle}>Send Me a Message</h2>
        <form className={styles.contactForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Your Name</label>
            <input type="text" id="name" placeholder="Enter your name" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="Enter your email" />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="message">Your Message</label>
            <textarea id="message" rows="5" placeholder="Type your message here"></textarea>
          </div>
          <button type="submit" className={styles.submitButton}>
            Send Message
          </button>
        </form>
      </section>
    </div>
  );
};

export default Contact;