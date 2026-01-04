

function Signup() {
  return (
    <>


      <div style={container}>
        <div style={card}>
          <h2 style={title}>Create Account</h2>
          <p style={subtitle}>Sign up to access fingerprint scanning</p>

          <input type="text" placeholder="Full Name" style={input} />
          <input type="email" placeholder="Email" style={input} />
          <input type="password" placeholder="Password" style={input} />

          <button style={button}>Sign Up</button>
        </div>
      </div>
    </>
  );
}

const container = {
  minHeight: "90vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6fb"
};

const card = {
  background: "white",
  padding: "40px",
  width: "350px",
  borderRadius: "14px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
  textAlign: "center"
};

const title = {
  color: "#1a237e",
  marginBottom: "6px"
};

const subtitle = {
  fontSize: "13px",
  marginBottom: "20px",
  color: "#555"
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const button = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(135deg, #1a237e, #b71c1c)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};

export default Signup;
