import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import API from "../api";
import "../Result.css";

function Result({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [result, setResult] = useState(location.state || {});
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loadingScan, setLoadingScan] = useState(false);

  // 🔥 NEW STATES FOR PREPROCESSING DISPLAY
  const [scanStatus, setScanStatus] = useState("");
  const [scanProgress, setScanProgress] = useState(0);

  const isAdmin = user?.role === "admin";

  const handleFeedback = async (actualLabel) => {
    if (!result.logId) return alert("Log ID missing.");

    try {
      await API.post("/feedback", {
        log_id: result.logId,
        actual_label: actualLabel
      });

      setFeedbackSent(true);
      setShowCorrection(false);
      alert("Feedback saved successfully!");
    } catch {
      alert("Failed to save feedback.");
    }
  };

  // ✅ UPDATED QUICK SCAN WITH PREPROCESSING STEPS
  const handleQuickScan = async () => {
    try {
      setLoadingScan(true);
      setScanProgress(0);

      const steps = [
        "Resizing image...",
        "Converting to grayscale...",
        "Normalizing pixel values...",
        "Preparing input tensor..."
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
          logId: res.data.log_id,
          gradcamImage: res.data.gradcam_image
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

      <section className="result-card">

        <h2>
          Detected Blood Group:{" "}
          <span className="blood-group">
            {result.bloodGroup || result.blood_group || "N/A"}
          </span>
        </h2>

        <p>
          Confidence:{" "}
          <b>
            {result.confidence
              ? (result.confidence * 100).toFixed(2)
              : "0.00"}
            %
          </b>
        </p>

        {/* 🔥 PREPROCESSING DISPLAY FOR QUICK SCAN */}
        {loadingScan && (
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
                  width: `${scanProgress}%`,
                  height: "100%",
                  background: "linear-gradient(135deg, #1a237e, #b71c1c)",
                  transition: "width 0.4s ease"
                }}
              ></div>
            </div>

            <p style={{ fontSize: "14px", color: "#555" }}>
              {scanStatus}
            </p>
          </div>
        )}

        {/* 🔥 Grad-CAM Section */}
        {(result.gradcamImage || result.gradcam_image) && (
          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <h3>(Grad-CAM Visualization)</h3>

            <img
              src={
                process.env.REACT_APP_API_URL +
                (result.gradcamImage || result.gradcam_image)
              }
              alt="Grad-CAM"
              style={{
                width: "300px",
                borderRadius: "10px",
                marginTop: "15px",
                boxShadow: "0px 4px 15px rgba(0,0,0,0.2)"
              }}
            />

            <p style={{ marginTop: "10px", fontSize: "14px" }}>
              Highlighted regions indicate areas the AI focused on
              while predicting the blood group.
            </p>
          </div>
        )}

        <hr />

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
                ✅ Yes
              </button>

              <button
                className="btn-outline"
                onClick={() => setShowCorrection(true)}
              >
                ❌ No
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

        <div
          className="result-actions"
          style={{ marginTop: "20px", display: "flex", gap: "15px" }}
        >
          {isAdmin && (
            <button
              className="btn-solid"
              onClick={handleQuickScan}
              disabled={loadingScan}
            >
              {loadingScan ? "Scanning..." : "⚡ Quick Scan"}
            </button>
          )}

          <button
            className="btn-outline"
            onClick={() => navigate("/predict")}
          >
            Manual Upload
          </button>

          <Link
            to={isAdmin ? "/admin" : "/"}
            className="btn-solid"
          >
            Go Home
          </Link>
        </div>

      </section>
    </div>
  );
}

export default Result;