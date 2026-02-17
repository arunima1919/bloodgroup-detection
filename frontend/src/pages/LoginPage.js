import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function LoginPage({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/login", { email, password }); // your backend endpoint

      const loggedUser = res.data.user;

      setUser(loggedUser);
      localStorage.setItem("user", JSON.stringify(loggedUser));

      if (loggedUser.role === "admin") {
        navigate("/admin"); // admin dashboard
      } else {
        navigate("/"); // normal user homepage
      }
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={title}>Welcome Back</h2>
        <p style={subtitle}>Login to continue</p>

        <input
          type="email"
          placeholder="Email"
          style={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          style={input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={button} onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

/* STYLES */
const container = { minHeight: "90vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f4f6fb" };
const card = { background: "white", padding: "40px", width: "350px", borderRadius: "14px", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", textAlign: "center" };
const title = { color: "#1a237e", marginBottom: "6px" };
const subtitle = { fontSize: "13px", marginBottom: "20px", color: "#555" };
const input = { width: "100%", padding: "12px", marginBottom: "14px", borderRadius: "8px", border: "1px solid #ccc" };
const button = { width: "100%", padding: "12px", background: "linear-gradient(135deg, #1a237e, #b71c1c)", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" };
