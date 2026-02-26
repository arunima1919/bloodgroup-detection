import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Result.css";   // ✅ Use SAME CSS as Result Page

function PredictPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();

  const handleScan = async () => {
    if (!file) return alert("Please upload a fingerprint image");

    setLoading(true);
    setProgress(0);

    const steps = [
      "Resizing image...",
      "Converting to grayscale...",
      "Normalizing pixel values...",
      "Preparing input tensor..."
    ];

    let stepIndex = 0;

    const formData = new FormData();
    formData.append("image", file);

    const apiRequest = axios.post(
      "http://localhost:5000/predict",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    const animateSteps = () =>
      new Promise((resolve) => {
        const interval = setInterval(() => {
          if (stepIndex < steps.length) {
            setStatus(steps[stepIndex]);
            setProgress(((stepIndex + 1) / steps.length) * 90);
            stepIndex++;
          } else {
            clearInterval(interval);
            resolve();
          }
        }, 700);
      });

    try {
      const [res] = await Promise.all([apiRequest, animateSteps()]);

      setStatus("Prediction Complete");
      setProgress(100);

      setTimeout(() => {
        navigate("/result", {
          state: {
            bloodGroup: res.data.blood_group,
            confidence: res.data.confidence,
            logId: res.data.log_id,
          },
        });
      }, 800);

    } catch (err) {
      setStatus("Prediction failed");
      setProgress(0);
      alert("Prediction failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="result-page">

      {/* HERO SECTION */}
      <section className="result-hero">
        <h1>Fingerprint Analysis</h1>
        <p>Upload a fingerprint image to analyze and predict the blood group.</p>
      </section>

      {/* MAIN CARD */}
      <section className="result-card">


        {/* Image Preview */}
        <div style={{ margin: "20px 0" }}>
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              style={{
                width: "250px",
                borderRadius: "12px",
                boxShadow: "0px 4px 15px rgba(0,0,0,0.15)"
              }}
            />
          ) : (
            <p style={{ color: "#666" }}>No Image Selected</p>
          )}
        </div>

        {/* Progress Section */}
        {loading && (
          <div style={{ marginTop: "20px" }}>
            <div
              style={{
                width: "100%",
                height: "8px",
                background: "#eee",
                borderRadius: "10px",
                overflow: "hidden",
                marginBottom: "8px"
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(135deg, #1a237e, #b71c1c)",
                  transition: "width 0.4s ease"
                }}
              ></div>
            </div>

            <p style={{ fontSize: "14px", color: "#555" }}>
              {status}
            </p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          hidden
          id="file-input"
          accept="image/*"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            if (!selectedFile) return;
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
          }}
        />

        {/* Buttons */}
        <div className="result-actions" style={{ marginTop: "25px" }}>
          <button
            className="btn-outline"
            onClick={() =>
              document.getElementById("file-input").click()
            }
            disabled={loading}
          >
            Choose Image
          </button>

          <button
            className="btn-solid"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? "Processing..." : "Start Prediction"}
          </button>
        </div>

      </section>
    </div>
  );
}

export default PredictPage;