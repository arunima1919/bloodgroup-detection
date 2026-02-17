import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../ScanUpload.css";

function PredictPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const scanSectionRef = useRef(null);

  const handleScan = async () => {
    if (!file) return alert("Please upload a fingerprint image");

    setLoading(true);
    setProgress(0);
    setStatus("Preparing image...");

    // --------- Animate progress while waiting ---------
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) return prev + 1; // move slowly to 90%
        return prev;
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append("image", file);

      setStatus("Running Deep Analysis...");

      const res = await axios.post("http://localhost:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 0
      });

      // --------- Backend finished ---------
      clearInterval(interval);
      setProgress(100);
      setStatus("Analysis complete!");

      // Small delay for smooth UX
      await new Promise(r => setTimeout(r, 300));

      navigate("/result", {
        state: {
          bloodGroup: res.data.blood_group,
          confidence: res.data.confidence,
          logId: res.data.log_id   // ✅ THIS IS THE MISSING PART
        }
      });


    } catch (err) {
      console.error(err);
      clearInterval(interval);
      setProgress(0);
      setStatus("Analysis failed!");
      alert("Analysis timed out or failed. Check if Python server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" ref={scanSectionRef}>
      <div className="card">
        <h2 className="title">Fingerprint Deep Scan</h2>

        {/* Preview */}
        <div className={`preview-box ${loading ? "scanning" : ""}`}>
          {preview ? <img src={preview} alt="Preview" /> : <div className="placeholder">Upload Image</div>}
          {loading && <div className="scan-line"></div>}
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            <p className="progress-text">{status} ({Math.round(progress)}%)</p>
          </div>
        )}

        {/* File Input */}
        <input
          type="file"
          hidden
          id="file-input"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setPreview(URL.createObjectURL(e.target.files[0]));
          }}
        />

        {/* Buttons */}
        {!loading && (
          <button className="upload-btn" onClick={() => document.getElementById("file-input").click()}>
            Choose Image
          </button>
        )}

        <button className="scan-btn" onClick={handleScan} disabled={loading}>
          {loading ? "Analyzing Deep Patterns..." : "Start Accurate Prediction"}
        </button>
      </div>
    </div>
  );
}

export default PredictPage;
