// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Dashboard.css";

// function UserDashboard() {
//   const [results, setResults] = useState([]);
//   const navigate = useNavigate();
//   const token = localStorage.getItem("userToken");

//   useEffect(() => {
//     if (!token) {
//       navigate("/user/login");
//       return;
//     }

//     fetch("http://localhost:5000/api/users/results", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => res.json())
//       .then((data) => setResults(data))
//       .catch((err) => console.error(err));
//   }, [token, navigate]);

//   const logout = () => {
//     localStorage.removeItem("userToken");
//     localStorage.removeItem("userName");
//     navigate("/");
//   };

//   return (
//     <div className="dashboard-container">
//       <h2>Welcome, {localStorage.getItem("userName")}</h2>

//       <button className="logout-btn" onClick={logout}>
//         Logout
//       </button>

//       <h3>Your Previous Results</h3>

//       <table>
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Time</th>
//             <th>Predicted Result</th>
//             <th>Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {results.length === 0 ? (
//             <tr>
//               <td colSpan="4">No results found</td>
//             </tr>
//           ) : (
//             results.map((result, index) => {
//               const dateObj = new Date(result.createdAt);
//               return (
//                 <tr key={index}>
//                   <td>{dateObj.toLocaleDateString()}</td>
//                   <td>{dateObj.toLocaleTimeString()}</td>
//                   <td>{result.prediction}</td>
//                   <td>{result.status}</td>
//                 </tr>
//               );
//             })
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default UserDashboard;































import { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

function UserDashboard() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/user/history", {
        withCredentials: true,
      })
      .then((res) => setHistory(res.data))
      .catch(() => alert("Please login"));
  }, []);

  return (
    <div className="dashboard-container">
      <h2>Your Test History</h2>

      {history.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Result</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.date).toLocaleString()}</td>
                <td>{item.result}</td>
                <td>{item.confidence}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserDashboard;
