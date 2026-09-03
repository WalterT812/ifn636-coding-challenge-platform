import { useState } from 'react'

function App() {
  const [loginName, setLoginName] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginName,
          password: password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message || 'Invalid email or password')
        return
      }

      localStorage.setItem('token', data.token)
      setMessage('Login successful')
    } catch (error) {
      setMessage('Cannot connect to server')
    }
  }

  return (
    <div>
      <h1>Coding Challenge Platform Admin Portal</h1>

      <form className="login-box" onSubmit={handleLogin}>
        <h2>Admin Login</h2>

        <label>Email or Username:</label>
        <input
          type="text"
          value={loginName}
          onChange={(event) => setLoginName(event.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="row">
          <label>
            <input type="checkbox" /> Remember Me
          </label>
          <span className="link">Forgot Password?</span>
        </div>

        <button type="submit">Login</button>

        {message && <p className="message">{message}</p>}

        <p className="note">Only authorised Admin accounts can log in.</p>
      </form>
    </div>
  )
}

export default App
