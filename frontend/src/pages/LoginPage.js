import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../api";
import "./LoginPage.css";

export default function LoginPage({ setUser }) {

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [loading,setLoading]=useState(false);

  const navigate=useNavigate();

  const handleLogin=async()=>{

    if(!email || !password){
      alert("Please enter email and password");
      return;
    }

    try{

      setLoading(true);

      const res=await API.post("/login",{email,password});
      const loggedUser=res.data.user;

      setUser(loggedUser);

      localStorage.setItem("user",JSON.stringify(loggedUser));
      localStorage.setItem("role",loggedUser.role.toLowerCase());

      if(loggedUser.role.toLowerCase()==="admin"){
        navigate("/admin");
      }else{
        navigate("/");
      }

    }catch(err){
      alert(err.response?.data?.error || "Login failed");
    }
    finally{
      setLoading(false);
    }
  };

  return(

    <div className="login-container">

      {/* LEFT SIDE */}
      <motion.div
        className="login-left"
        initial={{x:-60,opacity:0}}
        animate={{x:0,opacity:1}}
        transition={{duration:0.7}}
      >

        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Login to access blood group prediction system</p>

        <input
          type="email"
          placeholder="Email address"
          className="login-input"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="login-input"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button className="login-button" onClick={handleLogin}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="register-link">
          Never have an account? <span onClick={()=>navigate("/signup")}>Register now</span>
        </p>

      </motion.div>

      {/* RIGHT SIDE */}
      <motion.div
        className="login-right"
        initial={{x:60,opacity:0}}
        animate={{x:0,opacity:1}}
        transition={{duration:0.7}}
      >

        <div className="lock-icon">🔒</div>

        <h3>Secure AI Blood Group Detection</h3>
        <p>
          Upload fingerprint images and let our AI model predict blood group
          using advanced deep learning techniques.
        </p>

        <div className="pulse pulse1"></div>
        <div className="pulse pulse2"></div>
        <div className="pulse pulse3"></div>

      </motion.div>

    </div>
  );
}