import { useState } from 'react'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import CreateChallenge from './CreateChallenge.jsx'

function App() {
  // look in both places, because remember me uses localStorage
  const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedToken)
  const [page, setPage] = useState('dashboard')

  const handleLogin = (token, rememberMe, username) => {
    if (rememberMe) {
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
    } else {
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('username', username)
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    }

    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
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
