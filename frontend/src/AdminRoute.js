import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdminRoute() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/check", {
        withCredentials: true,
      })
      .then(() => {
        // ✅ If logged in → go to admin home
        navigate("/admin/home");
      })
      .catch(() => {
        // ❌ If not logged in → go to admin login
        navigate("/admin/login");
      })
      .finally(() => {
        setChecking(false);
      });
  }, [navigate]);

  return checking ? <div>Loading...</div> : null;
}

export default AdminRoute;