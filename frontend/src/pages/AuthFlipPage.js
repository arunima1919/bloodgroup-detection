import React,{useState} from "react";
import LoginPage from "./LoginPage";
import Signup from "./SignupPage";
import "./AuthFlip.css";

export default function AuthFlipPage({ setUser }) {

  const [flip,setFlip] = useState(false);

  console.log("Flip:", flip);

  return(

    <div className="auth-container">

      <div className={`page-wrapper ${flip ? "flipped" : ""}`}>

        {/* FRONT PAGE (LOGIN) */}
        <div className="page front">
          <LoginPage setUser={setUser} goSignup={()=>setFlip(true)} />
        </div>

        {/* BACK PAGE (SIGNUP) */}
        <div className="page back">
          <Signup setUser={setUser} goLogin={()=>setFlip(false)} />
        </div>

      </div>

    </div>

  );
}