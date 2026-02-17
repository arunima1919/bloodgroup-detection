import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import API from "../api";
import "../Result.css";

function Result({ user }) {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Use component state instead of location.state directly
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

      // ✅ Update state directly instead of navigating again
      setResult({
        bloodGroup: res.data.blood_group,
        confidence: res.data.confidence,
        logId: res.data.log_id
      });

      setFeedbackSent(false); // reset feedback section
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
            {result.bloodGroup || "N/A"}
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

        <hr />

        {!feedbackSent && result.logId && (
          <div className="feedback-section">
            <p><b>Is this prediction correct?</b></p>

            <div className="feedback-buttons">
              <button
                className="btn-solid"
                onClick={() => handleFeedback(result.bloodGroup)}
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
