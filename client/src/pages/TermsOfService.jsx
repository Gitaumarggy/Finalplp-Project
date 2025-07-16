import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/TermsOfService.module.css';

const TermsOfService = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={styles.termsContainer}>
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
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.subtitle}>
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className={`${styles.content} ${isVisible ? styles.fadeIn : ''}`}>
        <div className={styles.contentWrapper}>
          
          {/* Introduction */}
          <div className={styles.section}>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Recipe App ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p>
              These Terms of Service ("Terms") govern your use of our recipe management application and any related services provided by Recipe App ("we," "us," or "our").
            </p>
          </div>

          {/* Description of Service */}
          <div className={styles.section}>
            <h2>2. Description of Service</h2>
            <p>Recipe App provides the following services:</p>
            <ul>
              <li>Recipe creation, storage, and management</li>
              <li>Recipe sharing and discovery</li>
              <li>Cooking mode with step-by-step instructions</li>
              <li>User profiles and preferences</li>
              <li>Recipe recommendations and search functionality</li>
              <li>Community features and interactions</li>
            </ul>
          </div>

          {/* User Accounts */}
          <div className={styles.section}>
            <h2>3. User Accounts</h2>
            
            <h3>3.1 Account Creation</h3>
            <p>To use certain features of our service, you must create an account. You agree to:</p>
            <ul>
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3>3.2 Account Responsibilities</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>All content posted under your account</li>
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring your account information is up to date</li>
            </ul>
          </div>

          {/* User Content */}
          <div className={styles.section}>
            <h2>4. User Content</h2>
            
            <h3>4.1 Content Ownership</h3>
            <p>You retain ownership of the content you create and share on our platform, including:</p>
            <ul>
              <li>Recipes you create and upload</li>
              <li>Comments and reviews you post</li>
              <li>Profile information and preferences</li>
            </ul>

            <h3>4.2 Content License</h3>
            <p>By posting content, you grant us a worldwide, non-exclusive, royalty-free license to:</p>
            <ul>
              <li>Display and distribute your content on our platform</li>
              <li>Use your content to improve our services</li>
              <li>Share your content with other users as intended</li>
            </ul>

            <h3>4.3 Content Guidelines</h3>
            <p>You agree not to post content that:</p>
            <ul>
              <li>Is illegal, harmful, or offensive</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains false or misleading information</li>
              <li>Promotes spam or commercial activities</li>
              <li>Violates any applicable laws or regulations</li>
            </ul>
          </div>

          {/* Acceptable Use */}
          <div className={styles.section}>
            <h2>5. Acceptable Use Policy</h2>
            <p>You agree to use our service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
            <ul>
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service or servers</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Upload viruses or malicious code</li>
              <li>Use automated systems to access the service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div className={styles.section}>
            <h2>6. Intellectual Property Rights</h2>
            
            <h3>6.1 Our Rights</h3>
            <p>The Service and its original content, features, and functionality are owned by Recipe App and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>

            <h3>6.2 Your Rights</h3>
            <p>You retain ownership of your content, but grant us a license to use it as described in Section 4.2.</p>

            <h3>6.3 Third-Party Content</h3>
            <p>Our service may contain content from third parties. We are not responsible for third-party content and do not endorse it.</p>
          </div>

          {/* Privacy */}
          <div className={styles.section}>
            <h2>7. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices regarding the collection and use of your information.
            </p>
          </div>

          {/* Disclaimers */}
          <div className={styles.section}>
            <h2>8. Disclaimers</h2>
            <p>The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, we disclaim all warranties, express or implied, including but not limited to:</p>
            <ul>
              <li>Warranties of merchantability and fitness for a particular purpose</li>
              <li>Warranties that the service will be uninterrupted or error-free</li>
              <li>Warranties regarding the accuracy or completeness of content</li>
              <li>Warranties that the service will meet your specific requirements</li>
            </ul>
          </div>

          {/* Limitation of Liability */}
          <div className={styles.section}>
            <h2>9. Limitation of Liability</h2>
            <p>
              In no event shall Recipe App, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
            </p>
          </div>

          {/* Indemnification */}
          <div className={styles.section}>
            <h2>10. Indemnification</h2>
            <p>
              You agree to defend, indemnify, and hold harmless Recipe App and its affiliates from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your use of the service or violation of these Terms.
            </p>
          </div>

          {/* Termination */}
          <div className={styles.section}>
            <h2>11. Termination</h2>
            
            <h3>11.1 Termination by You</h3>
            <p>You may terminate your account at any time by contacting us or using the account deletion feature in your settings.</p>

            <h3>11.2 Termination by Us</h3>
            <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the service.</p>

            <h3>11.3 Effect of Termination</h3>
            <p>Upon termination, your right to use the service will cease immediately, and we may delete your account and content.</p>
          </div>

          {/* Governing Law */}
          <div className={styles.section}>
            <h2>12. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of [Your Jurisdiction], without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the service shall be resolved in the courts of [Your Jurisdiction].
            </p>
          </div>

          {/* Changes to Terms */}
          <div className={styles.section}>
            <h2>13. Changes to Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </div>

          {/* Contact Information */}
          <div className={styles.section}>
            <h2>14. Contact Information</h2>
            <p>If you have any questions about these Terms of Service, please contact us:</p>
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

export default TermsOfService; 