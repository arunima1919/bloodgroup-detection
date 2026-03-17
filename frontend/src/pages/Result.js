import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api";
import "./Result.css";

function Result({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state || {});
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loadingScan, setLoadingScan] = useState(false);

  const [scanStatus, setScanStatus] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  const isAdmin = user?.role === "admin";

  // HANDLE FEEDBACK
  const handleFeedback = async (actualLabel) => {
    if (!result.logId) return alert("Log ID missing.");

    try {
      await API.post("/feedback", {
        log_id: result.logId,
        actual_label: actualLabel,
      });

      setFeedbackSent(true);
      setShowCorrection(false);
      alert("Feedback saved successfully!");
    } catch {
      alert("Failed to save feedback.");
    }
  };

  // QUICK SCAN
  const handleQuickScan = async () => {
    try {
      setLoadingScan(true);
      setScanProgress(0);

      const steps = [
        "Resizing image...",
        "Converting to grayscale...",
        "Normalizing pixel values...",
        "Preparing input tensor...",
      ];

      let stepIndex = 0;

      const apiRequest = API.post("/predict-scan");

      const animateSteps = () =>
        new Promise((resolve) => {
          const interval = setInterval(() => {
            if (stepIndex < steps.length) {
              setScanStatus(steps[stepIndex]);
              setScanProgress(((stepIndex + 1) / steps.length) * 90);
              stepIndex++;
            } else {
              clearInterval(interval);
              resolve();
            }
          }, 700);
        });

      const [res] = await Promise.all([apiRequest, animateSteps()]);

      setScanStatus("Prediction Complete");
      setScanProgress(100);

      setTimeout(() => {
        setResult({
          bloodGroup: res.data.blood_group,
          confidence: res.data.confidence,
          pattern: res.data.pattern,           // <-- Pattern added
          logId: res.data.log_id,
          gradcamImage: res.data.gradcam_image,
        });

        setFeedbackSent(false);
        setShowCorrection(false);
        setSelectedGroup("");
      }, 600);
    } catch {
      alert("No scanned fingerprint found.");
    } finally {
      setLoadingScan(false);
    }
  };

  return (
    <div className="result-page">

      <section className="result-hero">
        <h1>Analysis Result</h1>
      </section>

      <section className="result-card result-grid">

        {/* LEFT SIDE */}
        <div className="result-left">

          {/* BLOOD GROUP */}
          <div className="blood-group-wrapper">
            <h2 className="label">Detected Blood Group</h2>
            <span className="blood-group">{result.bloodGroup || "N/A"}</span>
          </div>

          <p className="confidence-text">
            Confidence:
            <b>
              {result.confidence
                ? (result.confidence * 100).toFixed(2)
                : "0.00"} %
            </b>
          </p>

          {/* FINGERPRINT PATTERN */}
          <div className="pattern-wrapper">
            <h2 className="label">Fingerprint Pattern</h2>
            <span className="pattern">{result.pattern || "N/A"}</span>
          </div>

          {/* SCAN PROGRESS */}
          {loadingScan && (
            <div className="scan-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              <p className="scan-status">{scanStatus}</p>
            </div>
          )}

          {/* ADMIN FEEDBACK */}
          {isAdmin && !feedbackSent && result.logId && (
            <div className="feedback-section">

              <p><b>Is this prediction correct?</b></p>

              <div className="feedback-buttons">
                <button
                  className="btn-solid"
                  onClick={() =>
                    handleFeedback(result.bloodGroup || result.blood_group)
                  }
                >
                  Yes
                </button>

                <button
                  className="btn-outline"
                  onClick={() => setShowCorrection(true)}
                >
                  No
                </button>
              </div>

              {showCorrection && (
                <div className="correction-section">
                  <p>Select correct blood group:</p>

                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                  >
                    <option value="">Select Blood Group</option>
                    {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  <button
                    className="btn-solid"
                    disabled={!selectedGroup}
                    onClick={() => handleFeedback(selectedGroup)}
                  >
                    Confirm
                  </button>

                </div>
              )}

            </div>
          )}

        </div>

        {/* RIGHT SIDE */}
        <div className="result-right">

          {(result.gradcamImage || result.gradcam_image) && (
            <div className="gradcam-section">
              <h3>Grad-CAM Visualization</h3>
              <img
                src={`http://127.0.0.1:5000${result.gradcamImage || result.gradcam_image}`}
                alt="Grad-CAM"
                className="gradcam-img"
              />
              <p className="gradcam-text">AI attention regions</p>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="result-actions">
            {isAdmin && (
              <button
                className="btn-solid"
                onClick={handleQuickScan}
                disabled={loadingScan}
              >
                {loadingScan ? "Scanning..." : "Quick Scan"}
              </button>
            )}

            <button
              className="btn-outline"
              onClick={() => navigate("/predict")}
            >
              Manual Upload
            </button>
          </div>

        </div>

      </section>

    </div>
  );
}

export default Result;