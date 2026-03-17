import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear user state and localStorage
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      navigate("/"); // go to homepage
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/logo.jpeg" alt="Logo" className="logo" />
        <span className="brand">HemoPrint</span>
      </div>

      <ul className="nav-links">
        {user && (
          <li>
            <Link to="/predict">Predict</Link>
          </li>
        )}

        {!user && (
          <>
            <li>
              <Link to="/signup">Signup</Link>
            </li>
            <li>
              <Link to="/login" className="login-btn">
                Login
              </Link>
            </li>
          </>
        )}

        {user && user.role === "admin" && (
          <li>
            <Link to="/admin-history">History</Link>
          </li>
        )}

        {user && (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;