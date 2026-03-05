import { useLocation, Link } from "react-router-dom";
import "../Result.css";

function Result() {
  const location = useLocation();
  // const { bloodGroup, confidence } = location.state || {};
  // const { bloodGroup, confidence, logId, gradcamImage } = location.state || {};
  const { bloodGroup, confidence, logId, gradcamImage, isAdmin } = location.state || {};

  return (
    <>
    

      <div className="result-page">
        {/* Hero Section */}
        <section className="result-hero">
          <h1>Fingerprint Analysis Result</h1>
          <p>
            Your fingerprint has been successfully analyzed using AI-based
            pattern recognition.
          </p>
        </section>

        {/* Result Card */}
        <section className="result-card">
          <h2>Detected Blood Group</h2>

          <div className="blood-result">
            <span className="blood-group">
              {bloodGroup || "N/A"}
            </span>
            <span className="confidence">
              Prediction Confidence: <b>{confidence || "N/A"}</b>
            </span>
            {isAdmin && (
  <p className="log-id">
    <b>Log ID:</b> {logId}
  </p>
)}
           
          </div>

          <p className="result-note">
            This result is generated using fingerprint ridge pattern analysis
            and machine learning models. Accuracy may vary depending on image
            quality.
          </p>

          <div className="result-actions">
            <Link to="/scan" className="btn-outline">
              Scan Another Fingerprint
            </Link>

            <Link to="/" className="btn-solid">
              Go to Home
            </Link>
          </div>
        </section>
        {gradcamImage && (
  <div style={{marginTop:"20px"}}>
    <h3>Grad-CAM Visualization</h3>
    <img
      src={`data:image/png;base64,${gradcamImage}`}
      alt="GradCAM"
      style={{width:"300px", borderRadius:"10px"}}
    />
  </div>
)}

        {/* Info Section */}
        <section className="result-info">
          <h3>How This Works</h3>
          <p>
            Hemoprint analyzes unique fingerprint ridge patterns and maps them
            with learned blood group correlations using artificial intelligence.
            This technology aims to provide fast and contactless blood group
            detection.
          </p>
        </section>
        {!isAdmin && bloodGroup && (

<Link
to="/blood-info"
state={{ bloodGroup }}
className="btn-info"
>
🧬 Learn About Your Blood Group
</Link>

)}

        {/* Footer */}
        <footer className="result-footer">
          <p>© 2025 Hemoprint — AI Powered Blood Group Detection</p>
        </footer>
      </div>
    </>
  );
}

export default Result;
