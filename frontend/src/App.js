
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminRoute from "./AdminRoute";
import Navbar from "./Navbar";
import About from "./About";

import UserSignup from "./UserSignup";
import UserLogin from "./UserLogin";
import UserDashboard from "./UserDashboard";
import BloodInfo from "./pages/BloodInfo";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import AdminResults from "./pages/AdminResults";
import ProtectedRoute from "./ProtectedRoute";
import PredictPage from "./pages/PredictPage";
import Result from "./pages/Result";
import axios from "axios";

axios.defaults.withCredentials = true;

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        
        {/* HOME */}
        <Route path="/" element={<PredictPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin/about" element={<About />} />
        <Route path="/result" element={<Result />} />
  {/* ADMIN ROOT ROUTE */}
  <Route path="/admin" element={<AdminRoute />} />
        {/* USER */}
        <Route path="/user/signup" element={<UserSignup />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
<Route path="/admin/result" element={<Result />} />
<Route path="/admin/results" element={<AdminResults />} />
<Route path="/blood-info" element={<BloodInfo />} />
        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
  path="/admin/home"
  element={
    <ProtectedRoute>
      <PredictPage isAdminPage={true} />
    </ProtectedRoute>
  }
/>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;