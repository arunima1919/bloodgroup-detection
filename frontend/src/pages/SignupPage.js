import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "./SignupPage.css";

export default function Signup({ setUser }) {

  const navigate = useNavigate(); // For navigating to login page

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await API.post("/signup", { name, email, password });
      alert("OTP sent to your email");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Enter OTP");
      return;
    }
    try {
      setLoading(true);
      const res = await API.post("/verify-otp", { email, otp });
      const user = res.data.user;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      alert("Signup successful!");
      navigate("/"); // Redirect after signup
    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">

      {/* LEFT SIDE */}
      <motion.div
        className="signup-left"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h1>Join HemoPrint</h1>
        <p>
          Create an account to access our AI powered blood group detection
          system using fingerprint analysis.
        </p>
        <div className="ai-icon">🧬</div>
        <p className="description">
          Our system uses deep learning to analyze fingerprint ridge
          patterns and estimate possible blood group types. Register to
          start exploring predictions and research insights.
        </p>
      </motion.div>

      {/* RIGHT SIDE FORM */}
      <motion.div
        className="signup-right"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="signup-card">
          <h2>Create Account</h2>

          {step === 1 && (
            <form onSubmit={handleSendOTP}>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP}>
              <p>OTP sent to <strong>{email}</strong></p>
              <input
                type="text"
                placeholder="Enter 6 digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button type="submit">
                {loading ? "Verifying..." : "Create Account"}
              </button>
            </form>
          )}

          {/* LOGIN LINK */}
          <p className="login-link">
            Already have an account?{" "}
            <span style={{ cursor: "pointer", color: "#1a237e", fontWeight: "bold" }}
                  onClick={() => navigate("/login")}>
              Login here
            </span>
          </p>
        </div>
      </motion.div>

    </div>
  );
}