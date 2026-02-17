import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function HomePage() {
  const navigate = useNavigate();

  const handleQuickScan = async () => {
    try {
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
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <section style={hero}>
        <h1>Fingerprint Based Blood Group Detection</h1>
        <p>
          A smart biometric system that predicts blood group using fingerprint
          images — fast, reliable and non-invasive.
        </p>

        <div style={{ marginTop: "30px", display: "flex", gap: "20px" }}>
          

          <a href="/predict" style={heroBtn}>
            Manual Upload
          </a>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={section}>
        <h2>About the Project</h2>
        <p>
          Blood group detection using fingerprint technology is an innovative
          approach that eliminates the need for invasive blood tests.
        </p>
      </section>

      {/* FEATURES */}
      <section style={lightSection}>
        <h2>Why HemoPrint?</h2>

        <div style={cards}>
          <div style={card}>
            <h3>🧬 Biometric Accuracy</h3>
            <p>Uses fingerprint patterns for unique identification.</p>
          </div>

          <div style={card}>
            <h3>🩸 Non-Invasive</h3>
            <p>No blood samples required.</p>
          </div>

          <div style={card}>
            <h3>⚡ Fast Results</h3>
            <p>Instant blood group prediction.</p>
          </div>
        </div>
      </section>

      <footer style={footer}>
        © 2025 HemoPrint | Fingerprint Blood Group Detection
      </footer>
    </>
  );
}

/* STYLES */
const hero = {
  minHeight: "90vh",
  background: "linear-gradient(135deg, #1a237e, #b71c1c)",
  color: "white",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  padding: "20px"
};

const heroBtn = {
  padding: "12px 28px",
  background: "white",
  color: "#b71c1c",
  borderRadius: "30px",
  textDecoration: "none",
  fontWeight: "bold"
};

const scanBtn = {
  padding: "12px 28px",
  background: "#ffcc00",
  color: "#000",
  borderRadius: "30px",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer"
};

const section = {
  padding: "80px 20px",
  textAlign: "center",
  maxWidth: "800px",
  margin: "auto"
};

const lightSection = {
  padding: "80px 20px",
  background: "#f6f8fc",
  textAlign: "center"
};

const cards = {
  display: "flex",
  justifyContent: "center",
  gap: "30px",
  marginTop: "40px",
  flexWrap: "wrap"
};

const card = {
  background: "white",
  padding: "25px",
  borderRadius: "14px",
  width: "250px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.1)"
};

const footer = {
  padding: "20px",
  textAlign: "center",
  background: "#eef1f6",
  fontSize: "14px"
};

export default HomePage;
