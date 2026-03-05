// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Auth.css";

// function UserSignup() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();

//   const handleSignup = async (e) => {
//     e.preventDefault();

//     const response = await fetch("http://localhost:5000/api/users/signup", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ name, email, password }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       alert("Signup successful! Please login.");
//       navigate("/user/login");
//     } else {
//       alert(data.message || "Signup failed");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>User Signup</h2>
//       <form onSubmit={handleSignup}>
//         <input
//           type="text"
//           placeholder="Full Name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//         />

//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button type="submit">Signup</button>
//       </form>
//     </div>
//   );
// }

// export default UserSignup;














// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import "./Auth.css";

// function UserSignup() {
//   const [step, setStep] = useState(1);
//   const [email, setEmail] = useState("");
//   const [otp, setOtp] = useState("");
//   const [name, setName] = useState("");
//   const [password, setPassword] = useState("");

//   const navigate = useNavigate();

//   // Step 1: Send OTP
//   const sendOtp = async () => {
//     try {
//       await axios.post(
//         "http://localhost:5000/send-otp",
//         { email },
//         { withCredentials: true }
//       );
//       alert("OTP sent to your email");
//       setStep(2);
//     } catch (error) {
//       alert("Failed to send OTP");
//     }
//   };

//   // Step 2: Verify OTP and Register
//   const verifyOtp = async () => {
//     try {
//       await axios.post(
//         "http://localhost:5000/verify-otp",
//         { otp, name, password },
//         { withCredentials: true }
//       );
//       alert("Account created successfully!");
//       navigate("/user/login");
//     } catch (error) {
//       alert("Invalid OTP");
//     }
//   };

//   return (
//     <div className="auth-container">
//       <h2>User Signup</h2>

//       {step === 1 && (
//         <>
//           <input
//             type="email"
//             placeholder="Enter Email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <button onClick={sendOtp}>Send OTP</button>
//         </>
//       )}

//       {step === 2 && (
//         <>
//           <input
//             type="text"
//             placeholder="Enter OTP"
//             value={otp}
//             onChange={(e) => setOtp(e.target.value)}
//             required
//           />

//           <input
//             type="text"
//             placeholder="Enter Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             required
//           />

//           <input
//             type="password"
//             placeholder="Enter Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <button onClick={verifyOtp}>Verify & Register</button>
//         </>
//       )}
//     </div>
//   );
// }

// export default UserSignup;




















import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function UserSignup() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Step 1: Send OTP
  const sendOtp = async () => {
    try {
      await axios.post(
        "http://localhost:5000/send-otp",
        { email },
        { withCredentials: true }
      );
      alert("OTP sent to your email");
      setStep(2);
    } catch (error) {
      alert("Failed to send OTP");
    }
  };

  // Step 2: Verify OTP and Register
  const verifyOtp = async () => {
    try {
      await axios.post(
        "http://localhost:5000/verify-otp",
        { otp, name, password },
        { withCredentials: true }
      );
      alert("Account created successfully!");
      navigate("/user/login");
    } catch (error) {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* Logo */}
        <div className="logo-section">
          <div className="logo-icon">
            <img src="/myico.png" alt="Logo" />
          </div>
        </div>

        <h3>Create Account</h3>
        <p className="subtitle">
          Join us to explore blood group detection
        </p>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button onClick={sendOtp}>
              Send OTP
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <label>OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />

            <label>Full Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <label>Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </span>
            </div>

            <button onClick={verifyOtp}>
              Create Account
            </button>
          </>
        )}

        <p className="bottom-text">
          Already have an account? <Link to="/user/login">Sign In</Link>
        </p>

        <Link to="/" className="back-link">← Back to Home</Link>

      </div>
    </div>
  );
}

export default UserSignup;
