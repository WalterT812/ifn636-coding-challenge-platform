import { useState } from 'react'
import Login from './Login.jsx'
import LearnerLogin from './LearnerLogin.jsx'
import Register from './Register.jsx'
import Dashboard from './Dashboard.jsx'
import ChallengeList from './ChallengeList.jsx'
import CreateChallenge from './CreateChallenge.jsx'
import Challenges from './Challenges.jsx'
import { can } from './permissions.js'

function getSavedToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

function getSavedRole() {
  return localStorage.getItem('role') || sessionStorage.getItem('role') || ''
}

function isLearnerRole(role) {
  return role === 'LEARNER'
}

function App() {
  const savedToken = getSavedToken()
  const [isLoggedIn, setIsLoggedIn] = useState(!!savedToken)
  const [role, setRole] = useState(getSavedRole())
  const [page, setPage] = useState('dashboard')
  const [editingChallenge, setEditingChallenge] = useState(null)

  const handleLogin = (token, rememberMe, username, userRole) => {
    if (rememberMe) {
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      localStorage.setItem('role', userRole)
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('username')
      sessionStorage.removeItem('role')
    } else {
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('username', username)
      sessionStorage.setItem('role', userRole)
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('role')
    }

    setRole(userRole)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('role')
    setEditingChallenge(null)
    setPage('dashboard')
    setRole('')
    setIsLoggedIn(false)
  }

  if (isLoggedIn && isLearnerRole(role)) {
    return <Challenges onLogout={handleLogout} />
  }

  if (isLoggedIn) {
    const canManageChallenges = can(role, 'challengeManagement')

    if (page === 'create' && canManageChallenges) {
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

    if (page === 'list' && canManageChallenges) {
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

  const path = window.location.pathname

  if (path === '/register') {
    return <Register onLogin={handleLogin} />
  }

  if (path === '/login') {
    return <LearnerLogin onLogin={handleLogin} />
  }

  return <Login onLogin={handleLogin} />
}

export default App
