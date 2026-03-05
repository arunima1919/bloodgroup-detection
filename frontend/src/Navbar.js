

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);

  // Check sessions
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/check", { withCredentials: true })
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));

    axios
      .get("http://localhost:5000/user/check", { withCredentials: true })
      .then(() => setIsUser(true))
      .catch(() => setIsUser(false));
  }, [location]);

  const adminLogout = async () => {
    await axios.post(
      "http://localhost:5000/admin/logout",
      {},
      { withCredentials: true }
    );
    setIsAdmin(false);
    navigate("/");
  };

  const userLogout = async () => {
    await axios.post(
      "http://localhost:5000/user/logout",
      {},
      { withCredentials: true }
    );
    setIsUser(false);
    navigate("/");
  };


const isAdminRoute = location.pathname.startsWith("/admin");

return (
  <nav className="navbar">
    <div className="nav-links">

      {/* ADMIN NAVBAR */}
      
      
      
      
      
      {isAdminRoute ? (
  <>
    <Link to="/admin/home">Home</Link>
        <Link to="/admin/dashboard">Dashboard</Link>

    <Link to="/admin/about">About</Link>

{isAdmin && (
  <Link to="/admin/results">Results</Link>
)}

    {isAdmin ? (
      <button className="logout-btn" onClick={adminLogout}>
        Logout
      </button>
    ) : (
      <Link to="/admin/login">Login</Link>
    )}
  </>
): (
        <>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>

          {isUser ? (
            <>
              <Link to="/user/dashboard">Dashboard</Link>
              <button className="logout-btn" onClick={userLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/user/login">Login</Link>
              <Link to="/user/signup">Signup</Link>
            </>
          )}
        </>
      )}

    </div>
  </nav>
);


  
}


export default Navbar;
