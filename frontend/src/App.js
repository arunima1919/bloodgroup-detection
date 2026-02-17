import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminDashboard from './pages/AdminDashboard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PredictPage from './pages/PredictPage';
import Result from "./pages/Result";
import Signup from './pages/SignupPage';
import VerifyOTP from './pages/VerifyOTP';
import './App.css';



function App() {
  const [user, setUser] = useState(null);

  // Optional: persist user info from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/predict" element={<PredictPage user={user} />} />
        <Route path="/result" element={<Result user={user} />} />
        <Route path="/admin" element={<AdminDashboard user={user} />} />
        <Route path="/verify" element={<VerifyOTP setUser={setUser} />} />
        
      </Routes>
    </Router>
  );
}

export default App;
