import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../ScanUpload.css";
import heroImage from "../assets/result-illustration.png";

function PredictPage({ user }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingQuickScan, setLoadingQuickScan] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  // ---------------- FILE UPLOAD ----------------
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName("No file selected");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------------- MANUAL SCAN ----------------
  const handleScan = async () => {
    if (!file) {
      alert("Please upload a fingerprint image");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true
        }
      );

      navigate("/result", {
        state: {
          bloodGroup: res.data.blood_group,
          confidence: res.data.confidence,
          logId: res.data.log_id,
          gradcamImage: res.data.gradcam_image
        }
      });

    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Please login first!");
        navigate("/user/login");
      } else {
        alert("Prediction failed. Check backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------------- QUICK SCAN ----------------
  const handleQuickScan = async () => {
    try {
      setLoadingQuickScan(true);

      const res = await axios.post(
        "http://localhost:5000/predict-scan",
        {},
        { withCredentials: true }
      );

      navigate("/result", {
        state: {
          bloodGroup: res.data.blood_group,
          confidence: res.data.confidence,
          logId: res.data.log_id,
          gradcamImage: res.data.gradcam_image
        }
      });

    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Admin login required!");
        navigate("/admin/login");
      } else {
        alert("No scanned fingerprint found.");
      }
    } finally {
      setLoadingQuickScan(false);
    }
  };

  return (
    <div className="page-wrapper">

      <section className="hero">
         <div className="floating-logo">
        <img src="/myico.png" alt="Logo" className="nav-logo" />
      </div>
        <div className="hero-text">
          <h1>
            AI Based <span>Blood Group Detection</span>
          </h1>
          <p>
            Upload your fingerprint or use quick scan (Admin)
          </p>
        </div>

      
        <div className="hero-image">
          <img src={heroImage} alt="Bloodgroup Illustration" />
        </div>
      </section>
      
      {/* WHY CHOOSE HEMOPRINT */}
      <section className="info-section">
        <h2 className="info-title">Why Choose HemoPrint?</h2>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">⚡</div>
            <h3>Instant AI Prediction</h3>
            <p>Our advanced deep learning model analyzes fingerprint patterns within seconds.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔬</div>
            <h3>Advanced CNN Model</h3>
            <p>Built using Convolutional Neural Networks (CNN) for accurate detection.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🔐</div>
            <h3>Secure & Private</h3>
            <p>Your fingerprint data is securely processed and private.</p>
          </div>
          <div className="info-card">
            <div className="info-icon">📊</div>
            <h3>Confidence & Visualization</h3>
            <p>Get prediction confidence levels and Grad-CAM visualization.</p>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card" style={{ maxWidth: "500px", position: "relative" }}>
          <div className="feature-icon">🧬</div>
          <h3>Upload Fingerprint</h3>
          <p>Supported formats: JPG, PNG</p>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={loading}
            style={{
    marginTop: "15px",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box"
  }}
            
          />

          <p style={{ marginTop: "10px", fontSize: "13px" }}>
            {fileName}
          </p>

          {preview && (
            <div style={{ marginTop: "15px", position: "relative" }}>
              <img
                src={preview}
                alt="Preview"
                style={{ width: "100%", borderRadius: "12px" }}
              />
              <div
                onClick={removeFile}
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "#501606",
                  color: "white",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </div>
            </div>
          )}

          <button
            className="primary-btn"
            onClick={handleScan}
            disabled={loading}
            style={{ marginTop: "20px", width: "100%" }}
          >
            {loading ? "Analyzing..." : "Scan Fingerprint"}
          </button>

          {isAdmin && (
            <button
              className="primary-btn"
              onClick={handleQuickScan}
              disabled={loadingQuickScan}
              style={{
                marginTop: "15px",
                width: "100%",
                backgroundColor: "#2e7d32"
              }}
            >
              {loadingQuickScan ? "Scanning..." : "⚡ Quick Scan (Admin)"}
            </button>
          )}

          {/* --- NEW DISCLAIMER SECTION --- */}
          <div style={{
            marginTop: "30px",
            padding: "15px",
            borderTop: "1px solid #eee",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            textAlign: "left",
            backgroundColor: "#fafafa",
            borderRadius: "50px"
          }}>
            <span style={{ fontSize: "18px", marginTop: "-2px" }}>⚠️</span>
            <p style={{ fontSize: "12px", color: "#666", lineHeight: "1.4", margin: 0 }}>
              <strong>Disclaimer:</strong> This is a demonstration of the research prototype. Results are simulated for demo purposes. 
              Actual medical diagnosis should only be performed by qualified healthcare professionals.
            </p>
          </div>
          {/* ---------------------------- */}

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
      <p>Email: bloodgroup346@gmail.com</p>
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

export default PredictPage;

