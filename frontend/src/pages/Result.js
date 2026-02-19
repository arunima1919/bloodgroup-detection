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

  const handleQuickScan = async () => {
    try {
      setLoadingScan(true);

      const res = await API.post("/predict-scan");

      setResult({
        bloodGroup: res.data.blood_group,
        confidence: res.data.confidence,
        logId: res.data.log_id,
        gradcamImage: res.data.gradcam_image   // ✅ ADD THIS
      });

      setFeedbackSent(false);
      setShowCorrection(false);
      setSelectedGroup("");

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
