import { useEffect, useState } from "react";
import API from "../api";
import "./AdminHistory.css";
function AdminHistory() {

  const [adminLogs, setAdminLogs] = useState([]);
  const [userLogs, setUserLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("admin");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get("/admin/history");

      setAdminLogs(res.data.admin_predictions);
      setUserLogs(res.data.user_predictions);

    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  return (
    <div className="history-page">

      <h1 className="history-title">Prediction History</h1>

      {/* TOGGLE SWITCH */}
      <div className="history-toggle">

        <div
          className={`toggle-btn ${activeTab === "admin" ? "active" : ""}`}
          onClick={() => setActiveTab("admin")}
        >
          Admin
        </div>

        <div
          className={`toggle-btn ${activeTab === "user" ? "active" : ""}`}
          onClick={() => setActiveTab("user")}
        >
          User
        </div>

      </div>


      {/* ADMIN TABLE */}
      {activeTab === "admin" && (
        <div className="history-table">

          <h2>Admin Predictions</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Predicted</th>
                <th>Actual</th>
                <th>Confidence</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {adminLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.prediction}</td>
                  <td>{log.actual_label || "Not provided"}</td>
                  <td>{(log.confidence * 100).toFixed(2)}%</td>
                  <td>{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}


      {/* USER TABLE */}
      {activeTab === "user" && (
        <div className="history-table">

          <h2>User Predictions</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Predicted</th>
                <th>Actual</th>
                <th>Confidence</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {userLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.username}</td>
                  <td>{log.email}</td>
                  <td>{log.prediction}</td>
                  <td>{log.actual_label || "Not provided"}</td>
                  <td>{(log.confidence * 100).toFixed(2)}%</td>
                  <td>{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

    </div>
  );
}

export default AdminHistory;