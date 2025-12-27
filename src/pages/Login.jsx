import React, { useState } from 'react'

function Login({ goSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    console.log("Login:", email, password)
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Login</h2>
        <p className="subtitle">Sign in to continue</p>

        <p className="alert-text">
          * Enter valid credentials to continue
        </p>

        <form onSubmit={handleLogin}>
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

          <button type="submit">Login</button>
        </form>

        <p className="footer-text">
          New user?
          <button className="link-btn" onClick={goSignup}>
            Signup
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
