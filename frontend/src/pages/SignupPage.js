import React, { useState } from 'react'

function Signup({ goLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignup = (e) => {
    e.preventDefault()
    console.log("Signup:", name, email, password)
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Signup</h2>
        <p className="subtitle">Create your medical account</p>

        <p className="alert-text">
          * All fields are mandatory
        </p>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Create Account</button>
        </form>

        <p className="footer-text">
          Already registered?
          <button className="link-btn" onClick={goLogin}>
            Login
          </button>
        </p>
      </div>
    </div>
  )
}

export default Signup