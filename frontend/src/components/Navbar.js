import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/logo.jpeg" alt="Logo" className="logo" />
        <span className="brand">HemoPrint</span>
      </div>

      <ul className="nav-links">
        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <Link to="/predict">Predict</Link>
        </li>

        <li>
          <Link to="/signup">Signup</Link>
        </li>
        <li>
          <Link to="/Result">Result</Link>
        </li>


        <li>
          <Link to="/login" className="login-btn">
            Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
