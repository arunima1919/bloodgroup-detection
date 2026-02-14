// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Navbar from './components/Navbar';
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import PredictPage from './pages/PredictPage';
// import Result from "./pages/Result";
// import './App.css';
// import Signup from './pages/SignupPage';

// function App() {
//   const [user, setUser] = useState(null);

//   return (
//     <Router>
//       <Navbar user={user} setUser={setUser} />

//       <Routes>
//         <Route path="/" element={<HomePage />} />
//         <Route path="/login" element={<LoginPage setUser={setUser} />} />
//         <Route path="/predict" element={<PredictPage />} />
//         <Route path="/result" element={<Result />} />
//         <Route path="/signup" element={<Signup />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import UserPage from "./UserPage";
// import AdminLogin from "./AdminLogin";
// import AdminDashboard from "./AdminDashboard";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* USER SIDE */}
//         <Route path="/*" element={<UserPage />} />

//         {/* ADMIN SIDE */}
//         <Route path="/admin" element={<AdminLogin />} />
//         <Route path="/admin/dashboard" element={<AdminDashboard />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;






import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UserPage from "./UserPage";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import Navbar from "./Navbar";
import About from "./About";


function App() {
  return (
    <Router>
      <Navbar />   {/* 👈 Navbar visible everywhere */}

      <Routes>
        {/* USER SIDE */}
        <Route path="/*" element={<UserPage />} />
        <Route path="/about" element={<About />} />


        {/* ADMIN LOGIN */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* ADMIN DASHBOARD */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
