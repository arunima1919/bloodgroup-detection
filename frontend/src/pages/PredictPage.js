import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../ScanUpload.css";

function PredictPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const scanSectionRef = useRef(null);
  const navigate = useNavigate();

  // Scroll to scan section
  const scrollToScan = () => {
    scanSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    setFileName("No file selected");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle scan and prediction
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
        "http://127.0.0.1:5000/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000, // 30 seconds timeout
        }
      );

      // Navigate to Result page with prediction data
      navigate("/result", {
        state: {
          bloodGroup: res.data.blood_group,
          confidence: res.data.confidence,
        },
      });
    } catch (err) {
      console.error(err);
      alert("Backend Error! Make sure app.py is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section className="scan-hero">
        <h1>AI-Based Blood Group Detection</h1>
        <p>
          Upload your fingerprint and let AI predict your blood group accurately.
        </p>
        <button className="hero-btn" onClick={scrollToScan}>
          Start Scan ↓
        </button>
      </section>

      {/* SCAN SECTION */}
      <div className="page" ref={scanSectionRef}>
        <div className="card">
          <h2 className="title">Fingerprint Scan</h2>
          <p className="subtitle">Supported formats: JPG, PNG</p>

          <div className="upload-box">
            <div className="icon">🧬</div>
            <p className="filename">{fileName}</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              disabled={loading}
            />
          </div>

          {preview && (
            <div className="preview-box">
              <img src={preview} alt="Preview" />
              <div className="remove" onClick={removeFile}>
                ×
              </div>
            </div>
          )}

          <button
            className="scan-btn"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? <span className="spinner">Analyzing...</span> : "Scan Fingerprint"}
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="scan-footer">
        © 2026 Hemoprint | AI-Powered Blood Group Detection
      </footer>
    </>
  );
}

export default PredictPage;
