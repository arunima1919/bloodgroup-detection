import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./Predict.css";

function PredictPage() {

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();

  const steps = [
    "Resizing image...",
    "Converting to grayscale...",
    "Normalizing pixel values...",
    "Preparing input tensor..."
  ];

  // Animate fake preprocessing steps
  const animateSteps = () =>
    new Promise((resolve) => {

      let stepIndex = 0;

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

  const handlePrediction = async () => {

    if (!file) {
      alert("Please upload a fingerprint image");
      return;
    }

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("image", file);

    try {

      const apiRequest = API.post(
        "/predict",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      const [res] = await Promise.all([
        apiRequest,
        animateSteps()
      ]);

      setStatus("Prediction Complete");
      setProgress(100);

      setTimeout(() => {

        navigate("/result", {
          state: {
            bloodGroup: res.data.blood_group,
            confidence: res.data.confidence,
            pattern: res.data.pattern,
            logId: res.data.log_id,
            gradcamImage: res.data.gradcam_image
          }
        });

      }, 800);

    } catch (err) {

      console.error("Prediction error:", err);

      setStatus("Prediction failed");
      setProgress(0);

      alert(
        err.response?.data?.error ||
        "Prediction failed. Please login again or check backend."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="result-page">

      {/* HERO */}
      <section className="result-hero">

        <h1>Fingerprint Analysis</h1>

        <p>
          Upload a fingerprint image to analyze and predict the blood group.
        </p>

      </section>


      {/* MAIN CARD */}
      <section className="result-card">

        {/* IMAGE PREVIEW */}

        <div
          style={{
            margin: "25px 0",
            display: "flex",
            justifyContent: "center"
          }}
        >

          {preview ? (

            <div className="image-container">

              {/* animated scan ring */}
              <div className="scan-ring"></div>

              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "250px",
                  borderRadius: "12px",
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.2)"
                }}
              />

            </div>

          ) : (

            <p style={{ color: "#666" }}>
              No Image Selected
            </p>

          )}

        </div>


        {/* PROGRESS BAR */}

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
                  background:
                    "linear-gradient(135deg,#1a237e,#b71c1c)",
                  transition: "width 0.4s ease"
                }}
              />

            </div>

            <p
              className="ai-thinking"
              style={{
                fontSize: "14px",
                color: "#555"
              }}
            >
              {status}
            </p>

          </div>

        )}


        {/* FILE INPUT */}

        <input
          type="file"
          hidden
          id="file-input"
          accept="image/*"
          onChange={(e) => {

            const selectedFile = e.target.files[0];

            if (!selectedFile) return;

            setFile(selectedFile);

            setPreview(
              URL.createObjectURL(selectedFile)
            );

          }}
        />


        {/* BUTTONS */}

        <div
          className="result-actions"
          style={{
            marginTop: "25px",
            gap: "15px",
            display: "flex",
            justifyContent: "center"
          }}
        >

          <button
            className="btn-outline"
            onClick={() =>
              document
                .getElementById("file-input")
                .click()
            }
            disabled={loading}
          >
            Choose Image
          </button>


          <button
            className="btn-solid"
            onClick={handlePrediction}
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