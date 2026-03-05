import React from "react";
import "./About.css";

function About() {
  return (
    <div className="about-page">

      {/* HERO SECTION */}
      <section className="about-hero">
        <h1>About HemoPrint</h1>
        <p>AI-Powered Blood Group Detection Using Fingerprint Analysis</p>
         {/* Image from PUBLIC folder */}
        
       
      </section>
      
      <img
          src="/fingerprint1.png"
          alt="fingerprint"
          className="about-fingerprint"
        />
      {/* ABOUT CONTENT */}
      <section className="about-content">

        <div className="about-card">
          <h2>Our Mission</h2>
          <p>
            HemoPrint aims to revolutionize medical diagnostics by leveraging
            Artificial Intelligence to predict blood groups using fingerprint
            patterns — enabling faster and non-invasive identification.
          </p>
        </div>

        <div className="about-card">
          <h2>Our Vision</h2>
          <p>
            We envision a future where blood group detection becomes instant,
            accessible, and affordable using biometric intelligence.
          </p>
        </div>

        <div className="about-card">
          <h2>Why HemoPrint?</h2>
          <ul>
            <li>✔ AI-Based Prediction</li>
            <li>✔ Fast & Accurate Results</li>
            <li>✔ Secure System</li>
            <li>✔ Admin Quick Scan Feature</li>
          </ul>
        </div>

      </section>
<footer className="main-footer">
  <div className="footer-container">

    <div className="footer-section">
      <h3>🩸 HemoPrint</h3>
      <p>
        AI-powered blood group detection using fingerprint analysis.
        Built with advanced Deep Learning & CNN models.
      </p>
    </div>

    <div className="footer-section">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/user/login">User Login</a></li>
        <li><a href="/admin/login">Admin Login</a></li>
        <li><a href="/about">About Project</a></li>
      </ul>
    </div>

    <div className="footer-section">
      <h4>Contact</h4>
      <p>Email: support@hemoprint.ai</p>
      <p>Phone: +91 98765 43210</p>
      <p>Location: India</p>
    </div>

  </div>

  <div className="footer-bottom">
    <p>
      ⚠️ This system is a research prototype. Not intended for clinical use.
    </p>
    <p>© 2026 HemoPrint | All Rights Reserved</p>
  </div>
</footer>
    </div>
  );
}

export default About;
