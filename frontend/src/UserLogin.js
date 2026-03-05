




import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Auth.css";

function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/login",
        { email, password },
        { withCredentials: true }
      );

      alert(res.data.message || "Login successful");

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Invalid email or password. Not registered?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        
        <div className="logo-section">


          <div className="logo-icon">
            <img src="/myico.png" alt="Logo" />
          </div>

          {/* <div className="logo-icon">🩸</div> */}
          {/* <h2>BloodPrint</h2> */}
        </div>

        <h3>Welcome Back</h3>
        <p className="subtitle">Sign in to continue to your account</p>

        <form onSubmit={handleLogin}>

          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              
            </span>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {error && <p className="error-text">{error}</p>}

        <p className="bottom-text">
          Don't have an account? <Link to="/user/signup">Sign Up</Link>
        </p>

        <Link to="/" className="back-link">← Back to Home</Link>

      </div>
    </div>
  );
}

export default UserLogin;
