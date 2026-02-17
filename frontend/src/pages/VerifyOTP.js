import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";

export default function VerifyOTP({ setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");

  const handleVerify = async () => {
    try {
      const res = await API.post("/verify-otp", { email, otp });

      const user = res.data.user;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Verification failed");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
        />
        <button onClick={handleVerify}>Verify</button>
      </div>
    </div>
  );
}
