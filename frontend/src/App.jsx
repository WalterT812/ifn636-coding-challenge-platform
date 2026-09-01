import { useEffect, useState } from 'react'
import './App.css'

const stats = [
  { label: 'Total users', value: '1,248', change: '+12%' },
  { label: 'Active challenges', value: '24', change: '+4' },
  { label: 'Submissions', value: '486', change: '+18%' },
  { label: 'Pass rate', value: '78%', change: '+2%' },
]

const challengeRows = [
  { name: 'JavaScript Basics', status: 'Open', progress: '82%' },
  { name: 'React Dashboard', status: 'Review', progress: '63%' },
  { name: 'Node API', status: 'Closed', progress: '95%' },
  { name: 'Database Design', status: 'Open', progress: '58%' },
]

const challengeCards = [
  { title: 'JavaScript Basics', level: 'Beginner', type: 'Frontend', status: 'Open', due: '2 days left' },
  { title: 'React Dashboard', level: 'Intermediate', type: 'Frontend', status: 'Review', due: '5 days left' },
  { title: 'Node API', level: 'Advanced', type: 'Backend', status: 'Closed', due: 'Completed' },
  { title: 'Database Design', level: 'Intermediate', type: 'Database', status: 'Open', due: '4 days left' },
]

const activity = [
  'New challenge published this week',
  '3 users submitted code for review',
  'Admin login reviewed from Australia',
]

function App() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [activeView, setActiveView] = useState('overview')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsLoggedIn(true)
      setUser({ username: 'Super Admin' })
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      setUser({ username: data.user.username || 'Admin' })
      setIsLoggedIn(true)
      setMessage('Login successful')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setUser(null)
    setActiveView('overview')
    setMessage('Logged out')
  }

  if (isLoggedIn) {
    return (
      <div className="dashboard-page">
        <aside className="sidebar">
          <div className="brand-row">
            <div className="brand-mark">C</div>
            <div>
              <p className="eyebrow">IFN636</p>
              <h2>CCP</h2>
            </div>
          </div>

          <nav className="nav">
            <button
              className={`nav-item ${activeView === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveView('overview')}
            >
              Overview
            </button>
            <button
              className={`nav-item ${activeView === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveView('challenges')}
            >
              Challenges
            </button>
            <button className="nav-item">Users</button>
            <button className="nav-item">Reports</button>
          </nav>

          <button className="logout-button" onClick={handleLogout}>Log out</button>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <div>
              <p className="eyebrow">Welcome back</p>
              <h1>{user?.username || 'Admin'}</h1>
            </div>
            <button className="primary-button">New challenge</button>
          </header>

          {activeView === 'overview' && (
            <>
              <section className="stats-grid">
                {stats.map((item) => (
                  <article key={item.label} className="stat-card">
                    <p>{item.label}</p>
                    <h3>{item.value}</h3>
                    <span>{item.change}</span>
                  </article>
                ))}
              </section>

              <section className="content-grid">
                <div className="panel">
                  <div className="panel-header">
                    <h3>Challenge progress</h3>
                    <span>Last 7 days</span>
                  </div>

                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challengeRows.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>
                            <span className={`status status-${row.status.toLowerCase()}`}>
                              {row.status}
                            </span>
                          </td>
                          <td>{row.progress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="panel">
                  <div className="panel-header">
                    <h3>Recent activity</h3>
                    <span>Live</span>
                  </div>

                  <ul className="activity-list">
                    {activity.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </section>
            </>
          )}

          {activeView === 'challenges' && (
            <section className="challenge-view">
              <div className="challenge-header">
                <div>
                  <p className="eyebrow">Challenge hub</p>
                  <h2>All challenges</h2>
                </div>
                <button className="primary-button">Create challenge</button>
              </div>

              <div className="challenge-grid">
                {challengeCards.map((challenge) => (
                  <article key={challenge.title} className="challenge-card">
                    <div className="challenge-top">
                      <span className={`chip chip-${challenge.status.toLowerCase()}`}>
                        {challenge.status}
                      </span>
                      <span className="challenge-due">{challenge.due}</span>
                    </div>

                    <h3>{challenge.title}</h3>
                    <div className="meta-row">
                      <span>{challenge.level}</span>
                      <span>{challenge.type}</span>
                    </div>

                    <button className="secondary-button">View details</button>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand-block">
          <span className="brand-tag">IFN636</span>
          <h1>CCP Portal</h1>
          <p>Sign in to your coding challenge platform.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@ifn636.local"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          {message && <p className="status-message">{message}</p>}
        </form>
      </div>
    </div>
  )
}

export default App
