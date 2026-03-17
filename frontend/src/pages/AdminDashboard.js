import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import API from "../api";
import "./Admin.css";

export default function AdminPage() {
  const navigate = useNavigate();

  const [loadingScan, setLoadingScan] = useState(false);
  const [currentStep, setCurrentStep] = useState("");

  const handleQuickScan = async () => {
    try {
      setLoadingScan(true);

      const steps = [
        "Resizing fingerprint...",
        "Converting to grayscale...",
        "Normalizing pixels...",
        "Generating input tensor..."
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 700));
      }

      const res = await API.post("/predict-scan");

      navigate("/result", {
        state: {
          bloodGroup: res.data.blood_group,
          confidence: res.data.confidence,
          logId: res.data.log_id,
          pattern: res.data.pattern,
          gradcamImage: res.data.gradcam_image,
        },
      });

    } catch {
      alert("No scanned fingerprint found. Please scan first.");
    } finally {
      setTimeout(() => {
        setLoadingScan(false);
        setCurrentStep("");
      }, 500);
    }
  };

  return (
    <div className="adminpage">

      {/* HERO / DASHBOARD */}
      <section className="hero">
        <motion.h1
          style={{ color: "white" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Admin Control Panel
        </motion.h1>
        <p className="subtitle">
          Quick scans and manual uploads
        </p>

        <div className="scanner">
          <div className="ring ring1"></div>
          <div className="ring ring2"></div>

          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Fingerprint size={100} color="#ffffff" />
          </motion.div>

          <div className="pulse pulse1"></div>
          <div className="pulse pulse2"></div>
          <div className="pulse pulse3"></div>
        </div>

        <div className="buttons">
          <button className="scanBtn" onClick={handleQuickScan}>
            {loadingScan ? "Scanning..." : "Quick Scan"}
          </button>
          <button className="btn" onClick={() => navigate("/predict")}>
            Manual Upload
          </button>
        </div>

        {loadingScan && <p className="status">{currentStep}</p>}
      </section>

    </div>
  );
}