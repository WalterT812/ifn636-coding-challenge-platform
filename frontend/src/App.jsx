import { useState } from 'react'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import CreateChallenge from './CreateChallenge.jsx'

function App() {
  // look in both places, because remember me uses localStorage
  const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedToken)
  const [page, setPage] = useState('dashboard')

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
    setPage('dashboard')
    setIsLoggedIn(false)
  }

  if (isLoggedIn) {
    if (page === 'create') {
      return (
        <CreateChallenge
          onLogout={handleLogout}
          onBack={() => setPage('dashboard')}
        />
      )
    }

    return (
      <Dashboard
        onLogout={handleLogout}
        onOpenCreate={() => setPage('create')}
      />
    )
  }

  return <Login onLogin={handleLogin} />
}

export default App
