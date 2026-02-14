// import axios from "axios";
// import { useState } from "react";

// function AdminLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const login = async () => {
//     await axios.post("http://localhost:5000/admin/login", {
//       email,
//       password
//     }, { withCredentials: true });

//     window.location.href = "/admin/dashboard";
//   };

//   return (
//     <div>
//       <h2>Admin Login</h2>
//       <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
//       <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
//       <button onClick={login}>Login</button>
//     </div>
//   );
// }

// export default AdminLogin;




import axios from "axios";
import { useState } from "react";
import "./AdminLogin.css";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/admin/login",
        { email, password },
        { withCredentials: true }
      );

      if (res.status === 200) {

        localStorage.setItem("isAdmin", "true");
        window.location.href = "/";




        // window.location.href = "/admin/dashboard";
      }
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Panel</h2>
        <p className="subtitle">Secure Login Access</p>

        {error && <div className="error">{error}</div>}

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
      </div>
    </div>
  );
}

export default AdminLogin;
