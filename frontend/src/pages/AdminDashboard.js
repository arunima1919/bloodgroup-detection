import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);

  const handleQuickScan = async () => {
    try {
      setLoadingScan(true);
      const res = await API.post("/predict-scan");

      navigate("/result", {
        state: {
          bloodGroup: res.data.blood_group,
          confidence: res.data.confidence,
          logId: res.data.log_id,
        },
      });
    } catch (err) {
      alert("No scanned fingerprint found. Please scan first.");
    } finally {
      setLoadingScan(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await API.get("/admin/predictions");
      setLogs(res.data);
      setShowLogs(true);
    } catch (err) {
      alert("Unauthorized");
    }
  };

  return (
    <div>
      {/* HERO SECTION */}
      <section style={hero}>
        <h1>Admin Control Panel</h1>
        <p>Scan fingerprints quickly or manually upload and review logs</p>

        <div style={{ marginTop: "30px", display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
          <button style={scanBtn} onClick={handleQuickScan} disabled={loadingScan}>
            {loadingScan ? "Scanning..." : "⚡ Quick Scan"}
          </button>

          <button style={heroBtn} onClick={() => navigate("/predict")}>
            Manual Upload
          </button>

          <button style={logsBtn} onClick={fetchLogs}>
            View Prediction Logs
          </button>
        </div>
      </section>

      {/* LOGS TABLE */}
      {showLogs && (
        <div style={logsContainer}>
          <h2>Prediction Logs</h2>
          <table style={table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Prediction</th>
                <th>Confidence</th>
                <th>Actual</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.image_name}</td>
                  <td>{log.prediction}</td>
                  <td>{(log.confidence * 100).toFixed(2)}%</td>
                  <td>{log.actual_label || "Not verified"}</td>
                  <td>
                    {log.is_correct === null
                      ? "Pending"
                      : log.is_correct
                      ? "Correct"
                      : "Incorrect"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* STYLES */
const hero = {
  minHeight: "60vh",
  background: "linear-gradient(135deg, #1a237e, #b71c1c)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "40px 20px",
};

const heroBtn = {
  padding: "12px 28px",
  background: "white",
  color: "#b71c1c",
  borderRadius: "30px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
};

const scanBtn = {
  padding: "12px 28px",
  background: "#ffcc00",
  color: "#000",
  borderRadius: "30px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
};

const logsBtn = {
  padding: "12px 28px",
  background: "#000",
  color: "white",
  borderRadius: "30px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
};

const logsContainer = {
  padding: "40px",
  maxWidth: "95%",
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "center",
};

