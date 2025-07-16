import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={styles.privacyContainer}>
      {/* Header Section */}
      <section className={`${styles.header} ${isVisible ? styles.fadeIn : ''}`}>
        <div className={styles.headerContent}>
          <button 
            onClick={() => navigate('/')}
            className={styles.backButton}
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </button>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.subtitle}>
            Protecting your privacy is our priority
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className={`${styles.content} ${isVisible ? styles.fadeIn : ''}`}>
        <div className={styles.contentWrapper}>
          
          {/* Introduction */}
          <div className={styles.section}>
            <h2>1. Introduction</h2>
            <p>
              Welcome to Recipe App ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our recipe management application.
            </p>
            <p>
              By using our service, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our service.
            </p>
          </div>

          {/* Information We Collect */}
          <div className={styles.section}>
            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Personal Information</h3>
            <p>We may collect the following personal information:</p>
            <ul>
              <li>Name and email address when you create an account</li>
              <li>Username and profile information</li>
              <li>Recipe content and cooking preferences</li>
              <li>Usage data and interaction with our app</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>We automatically collect certain information when you use our app:</p>
            <ul>
              <li>Device information (browser type, operating system)</li>
              <li>IP address and location data</li>
              <li>Usage patterns and app interactions</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </div>

          {/* How We Use Information */}
          <div className={styles.section}>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li>To provide and maintain our recipe management service</li>
              <li>To personalize your experience and show relevant content</li>
              <li>To communicate with you about your account and updates</li>
              <li>To improve our app and develop new features</li>
              <li>To ensure security and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </div>

          {/* Information Sharing */}
          <div className={styles.section}>
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
            <ul>
              <li><strong>Service Providers:</strong> With trusted third-party service providers who assist us in operating our app</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
            </ul>
          </div>

          {/* Data Security */}
          <div className={styles.section}>
            <h2>5. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information:</p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Employee training on data protection</li>
            </ul>
            <p>
              However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </div>

          {/* Your Rights */}
          <div className={styles.section}>
            <h2>6. Your Rights and Choices</h2>
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Opt-out:</strong> Opt out of certain communications and data processing</li>
            </ul>
          </div>

          {/* Cookies */}
          <div className={styles.section}>
            <h2>7. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar technologies to enhance your experience:</p>
            <ul>
              <li><strong>Essential Cookies:</strong> Required for basic app functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our app</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p>You can control cookie settings through your browser preferences.</p>
          </div>

          {/* Children's Privacy */}
          <div className={styles.section}>
            <h2>8. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </div>

          {/* International Transfers */}
          <div className={styles.section}>
            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
            </p>
          </div>

          {/* Changes to Policy */}
          <div className={styles.section}>
            <h2>10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </div>

          {/* Contact Information */}
          <div className={styles.section}>
            <h2>11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className={styles.contactInfo}>
              <p><strong>Email:</strong> margaretgitau@gmail.com</p>
              <p><strong>Developer:</strong> Margaret Gitau</p>
              <p><strong>Project:</strong> Recipe App</p>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy; 