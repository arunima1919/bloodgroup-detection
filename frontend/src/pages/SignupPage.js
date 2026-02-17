import React, { useState } from "react";
import API from "../api";

export default function Signup({ setUser }) {
  const [step, setStep] = useState(1); // Step 1 = enter details, Step 2 = enter OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await API.post("/signup", { name, email, password }); // backend generates OTP
      alert("OTP sent to your email");
      setStep(2); // move to OTP step
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & complete signup
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Enter the OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/verify-otp", { email, otp });

      const user = res.data.user;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      alert("Signup successful!");
      window.location.href = "/"; // or navigate to home/dashboard
    } catch (err) {
      alert(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Signup</h2>

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
            <p>OTP has been sent to <strong>{email}</strong></p>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit">
              {loading ? "Verifying..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
