// import { Link, useNavigate } from "react-router-dom";
// import "./Navbar.css";

// function Navbar() {
//   const navigate = useNavigate();
//   const isAdmin = localStorage.getItem("isAdmin") === "true";

//   const logout = () => {
//     localStorage.removeItem("isAdmin");
//     navigate("/");
//   };

//   return (
//     <nav className="navbar">
//       <div className="logo">Hemoprint</div>

//       <div className="nav-links">
//         <Link to="/">Home</Link>

//         {isAdmin && <Link to="/admin/dashboard">Dashboard</Link>}

//         {isAdmin ? (
//           <button className="logout-btn" onClick={logout}>
//             Logout
//           </button>
//         ) : (
//           <Link to="/admin">Admin</Link>
//         )}
//       </div>
//     </nav>
//   );
// }

// export default Navbar;






import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const logout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">Hemoprint</div>

      <div className="nav-links">
        {/* Public Links */}
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>

        {/* Admin Only Link */}
        {isAdmin && <Link to="/admin/dashboard">Dashboard</Link>}

        {/* Admin Logout Button */}
        {isAdmin && (
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
