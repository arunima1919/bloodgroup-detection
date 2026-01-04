import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../ScanUpload.css";

function ScanUpload() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const scanSectionRef = useRef(null);
  const navigate = useNavigate();

  const scrollToScan = () => {
    scanSectionRef.current.scrollIntoView({ behavior: "smooth" });
  };

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleScan = async () => {
    if (!file) {
      alert("Please upload fingerprint image");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/scan/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      navigate("/result", { state: data });
    } catch (error) {
      alert("Server error. Try again.");
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
          Upload your fingerprint and let artificial intelligence predict your
          blood group accurately.
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
            {loading ? <span className="spinner"></span> : "Scan Fingerprint"}
          </button>
        </div>
      </div>

      <footer className="scan-footer">
        © 2026 Hemoprint | AI-Powered Blood Group Detection
      </footer>
    </>
  );
}

export default ScanUpload;
