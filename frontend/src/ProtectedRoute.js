import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/check", {
        withCredentials: true,
      })
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Checking session...</p>;

  if (!isAdmin) return <Navigate to="/admin/login" />;

  return children;
}

export default ProtectedRoute;