import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Fingerprint } from "lucide-react";
import "./HomePage.css";

function HomePage() {

  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [loadingScan, setLoadingScan] = useState(false);
  const [statusText, setStatusText] = useState("System Ready");

  useEffect(() => {
    const storedRole = (localStorage.getItem("role") || "").toLowerCase();
    setRole(storedRole);
  }, []);

  const scanMessages = [
    "Initializing Scanner...",
    "Analyzing Ridge Patterns...",
    "Extracting Features...",
    "Predicting Blood Group..."
  ];

  const handleQuickScan = async () => {

    try {

      setLoadingScan(true);

      let i = 0;

      const textInterval = setInterval(() => {
        setStatusText(scanMessages[i]);
        i++;
        if (i === scanMessages.length) clearInterval(textInterval);
      }, 700);

      const res = await axios.post("http://localhost:5000/predict-scan");

      navigate("/result", {
        state: {
          bloodGroup: res.data.blood_group,
          confidence: res.data.confidence,
          logId: res.data.log_id
        }
      });

    } catch (err) {

      alert("No scanned fingerprint found. Please scan and save as latest.png first.");

    } finally {

      setLoadingScan(false);
      setStatusText("System Ready");

    }

  };

  return (

    <div className="homepage">

      {/* HERO SECTION */}

      <section className="hero">

        <motion.h1
          style={{color:"white"}}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Bloodgroup at  a Touch
        </motion.h1>

        <p className="subtitle">
          A smart biometric system that predicts blood group using fingerprint images
        </p>


        {/* BIOMETRIC SCANNER */}

        <div className="scanner">

          {/* rotating rings */}
          <div className="ring ring1"></div>
          <div className="ring ring2"></div>

          {/* fingerprint icon */}
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Fingerprint size={120} color="white" />
          </motion.div>

          {/* scanning beam */}
          <div className="scan-line"></div>

          {/* biometric pulse waves */}
          <div className="pulse pulse1"></div>
          <div className="pulse pulse2"></div>
          <div className="pulse pulse3"></div>

        </div>

        <p className="status">
          {loadingScan ? statusText : ""}
        </p>


        {/* BUTTONS */}

        <div className="buttons">

          {role === "user" && (

            <button
              className="btn"
              onClick={() => navigate("/predict")}
            >
              Manual Upload
            </button>

          )}

          {role === "admin" && (

            <>
              <button
                className="scanBtn"
                onClick={handleQuickScan}
              >
                {loadingScan ? "Scanning..." : "Quick Scan"}
              </button>

              <button
                className="btn"
                onClick={() => navigate("/predict")}
              >
                Manual Upload
              </button>
            </>

          )}

        </div>

      </section>


      {/* ABOUT SECTION */}

      <section className="about">

        <h2>About the Project</h2>

        <p>
          This system predicts blood group from fingerprint patterns using a
          trained CNN model. It eliminates the need for invasive blood tests
          and demonstrates the potential of biometric-based medical analysis.
        </p>

      </section>


      {/* FEATURES */}

      <section className="features">

        <h2>Why HemoPrint?</h2>

        <div className="cards">

          <motion.div whileHover={{ y: -10 }} className="card">
            <h3>🧬 Biometric Identification</h3>
            <p>Fingerprint ridge patterns are analysed using AI.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="card">
            <h3>🩸 Non-Invasive</h3>
            <p>No blood samples required.</p>
          </motion.div>

          <motion.div whileHover={{ y: -10 }} className="card">
            <h3>⚡ Fast Results</h3>
            <p>Instant blood group prediction.</p>
          </motion.div>

        </div>

        <p className="disclaimer">
          ⚠️ <strong>Disclaimer:</strong> Research prototype only.
          Not intended for medical diagnosis.
        </p>

      </section>

    </div>

  );

}

export default HomePage;