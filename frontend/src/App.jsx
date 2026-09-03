import { useEffect, useState } from 'react'
import Login from './Login.jsx'
import LearnerLogin from './LearnerLogin.jsx'
import Register from './Register.jsx'
import Dashboard from './Dashboard.jsx'
import ChallengeList from './ChallengeList.jsx'
import CreateChallenge from './CreateChallenge.jsx'
import Challenges from './Challenges.jsx'
import NotFound from './NotFound.jsx'
import Forbidden from './Forbidden.jsx'
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
  const [path, setPath] = useState(window.location.pathname)
  const [editingChallenge, setEditingChallenge] = useState(null)
  const [errorPage, setErrorPage] = useState('')

  const navigate = (next) => {
    if (window.location.pathname !== next) {
      window.history.pushState({}, '', next)
    }
    setPath(next)
    setErrorPage('')
  }

  useEffect(() => {
    const onPopState = () => {
      setPath(window.location.pathname)
      setErrorPage('')
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      if (path === '/') {
        window.history.replaceState({}, '', '/login')
        setPath('/login')
        return
      }

      if (path.startsWith('/admin/')) {
        window.history.replaceState({}, '', '/admin')
        setPath('/admin')
      }
      return
    }

    if (isLearnerRole(role)) {
      if (path === '/login' || path === '/register') {
        window.history.replaceState({}, '', '/')
        setPath('/')
      }
      return
    }

    if (path === '/admin' || path === '/' || path === '/login' || path === '/register') {
      window.history.replaceState({}, '', '/admin/dashboard')
      setPath('/admin/dashboard')
    }
  }, [isLoggedIn, role, path])

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
    navigate(isLearnerRole(userRole) ? '/' : '/admin/dashboard')
  }

  const handleLogout = () => {
    const logoutPath = isLearnerRole(role) ? '/login' : '/admin'
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('username')
    sessionStorage.removeItem('role')
    setEditingChallenge(null)
    setErrorPage('')
    setRole('')
    setIsLoggedIn(false)
    navigate(logoutPath)
  }

  const goAdminHome = () => {
    setEditingChallenge(null)
    navigate('/admin/dashboard')
  }

  if (isLoggedIn && isLearnerRole(role)) {
    if (path.startsWith('/admin')) {
      return <NotFound onHome={() => navigate('/')} />
    }

    const learnerPages = {
      '/': 'challenges',
      '/login': 'challenges',
      '/register': 'challenges',
      '/progress': 'progress',
      '/history': 'history',
      '/browsing-history': 'browsing',
    }

    if (learnerPages[path]) {
      return (
        <Challenges
          onLogout={handleLogout}
          page={learnerPages[path]}
          onOpenPage={(name) => {
            const urls = {
              challenges: '/',
              progress: '/progress',
              history: '/history',
              browsing: '/browsing-history',
            }
            navigate(urls[name])
          }}
        />
      )
    }

    return <NotFound onHome={() => navigate('/')} />
  }

  if (isLoggedIn) {
    if (errorPage === '403') {
      return <Forbidden onHome={goAdminHome} />
    }

    if (errorPage === '404') {
      return <NotFound onHome={goAdminHome} />
    }

    const canManageChallenges = can(role, 'challengeManagement')

    if (path === '/admin/create') {
      if (!canManageChallenges) {
        return <Forbidden onHome={goAdminHome} />
      }

      return (
        <CreateChallenge
          key={editingChallenge ? editingChallenge._id : 'new'}
          challenge={editingChallenge}
          onLogout={handleLogout}
          onForbidden={() => setErrorPage('403')}
          onUnauthorized={handleLogout}
          onBack={() => {
            setEditingChallenge(null)
            navigate('/admin/challenges')
          }}
          onOpenDashboard={() => {
            setEditingChallenge(null)
            navigate('/admin/dashboard')
          }}
          onOpenList={() => {
            setEditingChallenge(null)
            navigate('/admin/challenges')
          }}
        />
      )
    }

    if (path === '/admin/challenges') {
      if (!canManageChallenges) {
        return <Forbidden onHome={goAdminHome} />
      }

      return (
        <ChallengeList
          onLogout={handleLogout}
          onForbidden={() => setErrorPage('403')}
          onUnauthorized={handleLogout}
          onOpenDashboard={() => navigate('/admin/dashboard')}
          onCreate={() => {
            setEditingChallenge(null)
            navigate('/admin/create')
          }}
          onOpenChallenge={(item) => {
            setEditingChallenge(item)
            navigate('/admin/create')
          }}
        />
      )
    }

    if (path === '/admin/dashboard' || path === '/admin' || path === '/' || path === '/login' || path === '/register') {
      return (
        <Dashboard
          onLogout={handleLogout}
          canManageChallenges={canManageChallenges}
          onOpenList={() => navigate('/admin/challenges')}
        />
      )
    }

    return <NotFound onHome={goAdminHome} />
  }

  if (path === '/register') {
    return <Register onLogin={handleLogin} />
  }

  if (path === '/admin' || path.startsWith('/admin/')) {
    return <Login onLogin={handleLogin} />
  }

  return <LearnerLogin onLogin={handleLogin} />
}

export default App
