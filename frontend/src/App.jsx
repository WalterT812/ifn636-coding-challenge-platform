import { useState } from 'react'
import Login from './Login.jsx'
import Dashboard from './Dashboard.jsx'
import ChallengeList from './ChallengeList.jsx'
import CreateChallenge from './CreateChallenge.jsx'

function App() {
  // look in both places, because remember me uses localStorage
  const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token')
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedToken)
  const [page, setPage] = useState('dashboard')
  const [editingChallenge, setEditingChallenge] = useState(null)

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
    setEditingChallenge(null)
    setPage('dashboard')
    setIsLoggedIn(false)
  }

  if (isLoggedIn) {
    if (page === 'create') {
      return (
        <CreateChallenge
          key={editingChallenge ? editingChallenge._id : 'new'}
          challenge={editingChallenge}
          onLogout={handleLogout}
          onBack={() => {
            setEditingChallenge(null)
            setPage('list')
          }}
          onOpenDashboard={() => {
            setEditingChallenge(null)
            setPage('dashboard')
          }}
          onOpenList={() => {
            setEditingChallenge(null)
            setPage('list')
          }}
        />
      )
    }

    if (page === 'list') {
      return (
        <ChallengeList
          onLogout={handleLogout}
          onOpenDashboard={() => setPage('dashboard')}
          onCreate={() => {
            setEditingChallenge(null)
            setPage('create')
          }}
          onOpenChallenge={(item) => {
            setEditingChallenge(item)
            setPage('create')
          }}
        />
      )
    }

    return (
      <Dashboard
        onLogout={handleLogout}
        onOpenList={() => setPage('list')}
      />
    )
  }

  return <Login onLogin={handleLogin} />
}

export default App
