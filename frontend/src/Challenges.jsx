import { useEffect, useState } from 'react'

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function Challenges({ onLogout, page, onOpenPage, onUnauthorized }) {
  const titles = {
    challenges: 'Challenges',
    progress: 'Progress',
    history: 'History',
    browsing: 'Browsing History',
  }
  const [challenges, setChallenges] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (page !== 'challenges') {
      return
    }

    const loadList = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')

      try {
        const response = await fetch('http://localhost:5001/api/challenges/published', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })

        const data = await response.json()

        if (response.status === 401) {
          onUnauthorized()
          return
        }

        if (!response.ok) {
          setMessage(data.message || 'Cannot load challenges')
          return
        }

        setChallenges(data)
      } catch (error) {
        setMessage('Cannot connect to server')
      }
    }

    loadList()
  }, [page])

  return (
    <div>
      <div className="nav">
        <span className="nav-logo">Coding Challenge Platform</span>
        <div className="nav-links">
          <button type="button" className="nav-link" onClick={() => onOpenPage('challenges')}>
            Challenges
          </button>
          <button type="button" className="nav-link" onClick={() => onOpenPage('progress')}>
            Progress
          </button>
          <button type="button" className="nav-link" onClick={() => onOpenPage('history')}>
            History
          </button>
          <button type="button" className="nav-link" onClick={() => onOpenPage('browsing')}>
            Browsing History
          </button>
          <button type="button" className="nav-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <h1 className="page-title">{titles[page] || 'Challenges'}</h1>

      {page === 'challenges' && message && <p className="form-message">{message}</p>}

      {page === 'challenges' && challenges.length === 0 && !message ? (
        <p className="list-empty">No published challenges yet</p>
      ) : null}

      {page === 'challenges' && challenges.length > 0 && (
        <table className="challenge-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Title</th>
              <th>Type</th>
              <th>Tier</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((item) => (
              <tr key={item._id}>
                <td>{item.challengeNumber || '-'}</td>
                <td>{item.title || '(no title)'}</td>
                <td>{item.type || '-'}</td>
                <td>{item.tier || '-'}</td>
                <td>{formatDate(item.publishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Challenges
