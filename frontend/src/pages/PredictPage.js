// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../ScanUpload.css";

// function PredictPage() {
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState("No file selected");
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fileInputRef = useRef(null);
//   const scanSectionRef = useRef(null);
//   const navigate = useNavigate();

//   const scrollToScan = () => {
//     scanSectionRef.current.scrollIntoView({ behavior: "smooth" });
//   };

//   const handleFileChange = (e) => {
//     const selected = e.target.files[0];
//     if (selected) {
//       setFile(selected);
//       setFileName(selected.name);
//       setPreview(URL.createObjectURL(selected));
//     }
//   };

//   const removeFile = () => {
//     setFile(null);
//     setFileName("No file selected");
//     setPreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleScan = async () => {
//     if (!file) {
//       alert("Please upload a fingerprint image");
//       return;
//     }

//     setLoading(true);

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/predict",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       navigate("/result", {
//         state: {
//           bloodGroup: res.data.blood_group,
//           confidence: "High"
//         }
//       });

//     } catch (err) {
//       console.error(err);
//       alert("Prediction failed. Check backend.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <section className="scan-hero">
//         <h1>AI-Based Blood Group Detection</h1>
//         <p>Upload your fingerprint and let AI predict your blood group.</p>
//         <button className="hero-btn" onClick={scrollToScan}>
//           Start Scan ↓
//         </button>
//       </section>

//       <div className="page" ref={scanSectionRef}>
//         <div className="card">
//           <h2 className="title">Fingerprint Scan</h2>
//           <p className="subtitle">Supported formats: JPG, PNG</p>

//           <div className="upload-box">
//             <div className="icon">🧬</div>
//             <p className="filename">{fileName}</p>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={handleFileChange}
//               ref={fileInputRef}
//               disabled={loading}
//             />
//           </div>

//           {preview && (
//             <div className="preview-box">
//               <img src={preview} alt="Preview" />
//               <div className="remove" onClick={removeFile}>×</div>
//             </div>
//           )}

//           <button className="scan-btn" onClick={handleScan} disabled={loading}>
//             {loading ? "Analyzing..." : "Scan Fingerprint"}
//           </button>
//         </div>
//       </div>

//       <footer className="scan-footer">
//         © 2026 Hemoprint | AI-Powered Blood Group Detection
//       </footer>
//     </>
//   );
// }

// export default PredictPage;














// import React, { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../ScanUpload.css";
// import heroImage from "../assets/result-illustration.png";

// function PredictPage() {
//   const [file, setFile] = useState(null);
//   const [fileName, setFileName] = useState("No file selected");
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fileInputRef = useRef(null);
//   const navigate = useNavigate();

//   const handleFileChange = (e) => {
//     const selected = e.target.files[0];
//     if (selected) {
//       setFile(selected);
//       setFileName(selected.name);
//       setPreview(URL.createObjectURL(selected));
//     }
//   };

//   const removeFile = () => {
//     setFile(null);
//     setFileName("No file selected");
//     setPreview(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   };

//   const handleScan = async () => {
//     if (!file) {
//       alert("Please upload a fingerprint image");
//       return;
//     }

//     setLoading(true);

//     const formData = new FormData();
//     formData.append("image", file);

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/predict",
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       navigate("/result", {
//         state: {
//           bloodGroup: res.data.blood_group,
//           confidence: "High"
//         }
//       });

//     } catch (err) {
//       console.error(err);
//       alert("Prediction failed. Check backend.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="page-wrapper">

//       {/* HERO SECTION */}
//       <section className="hero">
//         <div className="hero-text">
//           <h1>
//             AI Based <span>Blood Group Detection</span>
//           </h1>
//           <p>Upload your fingerprint and let AI predict your blood group</p>

//           <div className="hero-buttons">
//             <button
//               className="primary-btn"
//               onClick={handleScan}
//               disabled={loading}
//             >
//               {loading ? "Analyzing..." : "Scan Fingerprint"}
//             </button>
//           </div>
//         </div>

//         <div className="hero-image">
//           <img src={heroImage} alt="Bloodgroup Illustration" />
//         </div>
//       </section>

//       {/* UPLOAD SECTION */}
//       <section className="features">
//         <div className="feature-card" style={{ maxWidth: "400px" }}>

//           <div className="feature-icon">🧬</div>
//           <h3>Upload Fingerprint</h3>
//           <p>Supported formats: JPG, PNG</p>

//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             ref={fileInputRef}
//             disabled={loading}
//             style={{ marginTop: "15px" }}
//           />

//           <p style={{ marginTop: "10px", fontSize: "13px" }}>
//             {fileName}
//           </p>

//           {preview && (
//             <div style={{ marginTop: "15px", position: "relative" }}>
//               <img
//                 src={preview}
//                 alt="Preview"
//                 style={{
//                   width: "100%",
//                   borderRadius: "12px"
//                 }}
//               />
//               <div
//                 onClick={removeFile}
//                 style={{
//                   position: "absolute",
//                   top: "-8px",
//                   right: "-8px",
//                   background: "#501606",
//                   color: "white",
//                   width: "22px",
//                   height: "22px",
//                   borderRadius: "50%",
//                   cursor: "pointer",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center"
//                 }}
//               >
//                 ×
//               </div>
//             </div>
//           )}

//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="prediction">
//         <h2>© 2026 Hemoprint | AI-Powered Blood Group Detection</h2>
//       </footer>

//     </div>
//   );
// }

// export default PredictPage;









import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../ScanUpload.css";
import heroImage from "../assets/result-illustration.png";

function PredictPage() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setFileName(selected.name);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName("No file selected");
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScan = async () => {
    if (!file) {
      alert("Please upload a fingerprint image");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/predict",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      navigate("/result", {
        state: {
          bloodGroup: res.data.blood_group,
          confidence: "High"
        }
      });

    } catch (err) {
      console.error(err);
      alert("Prediction failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-text">
          <h1>
            AI Based <span>Blood Group Detection</span>
          </h1>
          <p>
            Upload your fingerprint and let AI predict your blood group
          </p>
        </div>

        <div className="hero-image">
          <img src={heroImage} alt="Bloodgroup Illustration" />
        </div>
      </section>

      {/* UPLOAD SECTION */}
      <section className="features">
        <div className="feature-card" style={{ maxWidth: "400px" }}>

          <div className="feature-icon">🧬</div>
          <h3>Upload Fingerprint</h3>
          <p>Supported formats: JPG, PNG</p>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            disabled={loading}
            style={{ marginTop: "15px" }}
          />

          <p style={{ marginTop: "10px", fontSize: "13px" }}>
            {fileName}
          </p>

          {preview && (
            <div style={{ marginTop: "15px", position: "relative" }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%",
                  borderRadius: "12px"
                }}
              />
              <div
                onClick={removeFile}
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "#501606",
                  color: "white",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </div>
            </div>
          )}

          {/* SCAN BUTTON AT BOTTOM */}
          <button
            className="primary-btn"
            onClick={handleScan}
            disabled={loading}
            style={{ marginTop: "20px", width: "100%" }}
          >
            {loading ? "Analyzing..." : "Scan Fingerprint"}
          </button>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="prediction">
        <h2>© 2026 Hemoprint | AI-Powered Blood Group Detection</h2>
      </footer>

    </div>
  );
}

export default PredictPage;
