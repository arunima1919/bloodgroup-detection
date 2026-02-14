import { Routes, Route } from "react-router-dom";
import PredictPage from "./pages/PredictPage";
import Result from "./pages/Result";

function UserPage() {
  return (
    <Routes>
      <Route path="/" element={<PredictPage />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}

export default UserPage;
