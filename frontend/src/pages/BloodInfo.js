import { useLocation, Link } from "react-router-dom";
import bloodInfo from "../data/bloodInfo";
import "../BloodInfo.css";

function BloodInfo() {

  const location = useLocation();
  const bloodGroup = location.state?.bloodGroup;

  const info = bloodInfo[bloodGroup];

  if (!info) {
    return <h2 style={{textAlign:"center"}}>Blood information not available</h2>;
  }

  return (

    <div className="blood-page">

      {/* HERO */}
      <div className="blood-hero">

        <div className="blood-circle">
          {bloodGroup}
        </div>

        <h1>Your Blood Group</h1>
        <p>
          Understanding your blood group helps in emergency situations,
          blood donation, and medical treatments.
        </p>

      </div>

      {/* INFO CARD */}

      <div className="blood-card">

        <h2>About {bloodGroup}</h2>

        <p className="about-text">
          {info.about}
        </p>

        <div className="compatibility-grid">

          <div className="compatibility-box donate">
            <h3>🩸 Can Donate To</h3>
            <div className="blood-tags">

              {info.donateTo.map((b, i) => (
                <span key={i} className="tag donate-tag">{b}</span>
              ))}

            </div>
          </div>

          <div className="compatibility-box receive">
            <h3>💉 Can Receive From</h3>

            <div className="blood-tags">

              {info.receiveFrom.map((b, i) => (
                <span key={i} className="tag receive-tag">{b}</span>
              ))}

            </div>

          </div>

        </div>

        <div className="type-box">
          <h3>Blood Type Category</h3>
          <p>{info.type}</p>
        </div>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}

export default BloodInfo;