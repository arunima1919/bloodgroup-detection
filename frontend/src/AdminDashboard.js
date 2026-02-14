// import axios from "axios";
// import { useEffect, useState } from "react";

// function AdminDashboard() {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     axios.get("http://localhost:5000/admin/fingerprints", {
//       withCredentials: true
//     }).then(res => setData(res.data));
//   }, []);

//   const verify = (id) => {
//     const actual = prompt("Enter Correct Blood Group:");
//     axios.post(`http://localhost:5000/admin/verify/${id}`, {
//       actual_blood: actual
//     }, { withCredentials: true })
//     .then(() => window.location.reload());
//   };

//   return (
//     <div>
//       <h2>Admin Dashboard</h2>
//       {data.map(item => (
//         <div key={item.id}>
//           <p>ID: {item.id}</p>
//           <p>Predicted: {item.predicted_blood}</p>
//           <p>Verified: {item.is_verified ? "Yes" : "No"}</p>
//           {!item.is_verified && (
//             <button onClick={() => verify(item.id)}>Verify</button>
//           )}
//           <hr />
//         </div>
//       ))}
//     </div>
//   );
// }

// export default AdminDashboard;


import axios from "axios";
import { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/fingerprints", {
        withCredentials: true,
      })
      .then((res) => setData(res.data))
      .catch(() => alert("Unauthorized or Session Expired"));
  }, []);

  const verify = async (id) => {
    const actual = prompt("Enter Correct Blood Group:");
    if (!actual) return;

    await axios.post(
      `http://localhost:5000/admin/verify/${id}`,
      { actual_blood: actual },
      { withCredentials: true }
    );

    setData(
      data.map((item) =>
        item.id === id ? { ...item, is_verified: true } : item
      )
    );
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Admin Dashboard</h2>
      </header>

      <div className="dashboard-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Predicted</th>
              <th>Actual</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.predicted_blood}</td>
                <td>{item.actual_blood || "-"}</td>
                <td>
                  <span
                    className={
                      item.is_verified ? "status verified" : "status pending"
                    }
                  >
                    {item.is_verified ? "Verified" : "Pending"}
                  </span>
                </td>
                <td>
                  {!item.is_verified && (
                    <button onClick={() => verify(item.id)}>
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
