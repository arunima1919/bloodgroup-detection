import React, { useEffect, useState } from "react";
import axios from "axios";

function History() {
  const [history, setHistory] = useState([]);
  const [selectedActual, setSelectedActual] = useState({});


  // Load history from backend
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    axios.get("http://127.0.0.1:5000/history")
      .then(res => setHistory(res.data))
      .catch(err => console.error(err));
  };

  // Save actual blood group
  const saveActual = (id, actual) => {
  axios.post("http://127.0.0.1:5000/update-actual", {
    id: id,
    actual: actual
  })
  .then(() => {
    // update UI from DB truth
    setHistory(prev =>
      prev.map(row =>
        row.id === id
          ? { ...row, actual: actual }
          : row
      )
    );

    alert("Actual blood group saved");
  })
  .catch(err => {
    console.error(err);
    alert("Failed to save");
  });
};


  return (
    <div style={{ padding: "20px" }}>
      <h2>Prediction History</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Time</th>
            <th>Fingerprint</th>
            <th>Predicted</th>
            <th>Actual</th>
          </tr>
        </thead>

        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.time}</td>

              {/* ✅ IMAGE PREVIEW */}
              <td>
                <img
                  src={`http://127.0.0.1:5000/uploads/${item.image_path}`}
                  alt="fingerprint"
                  width="80"
                  style={{ borderRadius: "5px" }}
                />
              </td>

              <td>{item.predicted}</td>

              <td>
  {item.actual ? (
    item.actual
  ) : (
    <>
      <select
        onChange={(e) =>
          setSelectedActual(prev => ({
            ...prev,
            [item.id]: e.target.value
          }))
        }
        defaultValue=""
      >
        <option value="" disabled>Select</option>
        <option value="A+">A+</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B-">B-</option>
        <option value="AB+">AB+</option>
        <option value="AB-">AB-</option>
        <option value="O+">O+</option>
        <option value="O-">O-</option>
      </select>

      <button
        style={{ marginLeft: "5px" }}
        onClick={() =>
          saveActual(item.id, selectedActual[item.id])
        }
        disabled={!selectedActual[item.id]}
      >
        Save
      </button>
    </>
  )}
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;
