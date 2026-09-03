import { useState } from 'react'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'

function App() {
  // look in both places, because remember me uses localStorage
  const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedToken)

  const handleLogin = (token, rememberMe) => {
    // tick remember me = keep login after I close the browser
    if (rememberMe) {
      localStorage.setItem('token', token)
      sessionStorage.removeItem('token')
    } else {
      // no tick = login is gone when I close the tab
      sessionStorage.setItem('token', token)
      localStorage.removeItem('token')
    }

    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    // delete token from both places
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
    setIsLoggedIn(false)
  }

  // two pages: dashboard or login
  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />
  }

  return <Login onLogin={handleLogin} />
}

export default App
