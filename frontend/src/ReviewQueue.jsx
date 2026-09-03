import { useEffect, useState } from 'react'

function formatTime(value) {
  if (!value) {
    return '-'
  }

  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusLabel(status) {
  if (status === 'UNDER_REVIEW') {
    return 'Under Review'
  }

  return 'Pending'
}

function ReviewQueue({
  attemptId,
  onLogout,
  onOpenDashboard,
  onOpenList,
  onOpenQueue,
  onOpenAttempt,
  onForbidden,
  onUnauthorized,
  onNotFound,
}) {
  const [attempts, setAttempts] = useState([])
  const [attempt, setAttempt] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')

    const loadQueue = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/submissions/review-queue', {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        })

        const data = await response.json()

        if (response.status === 403) {
          onForbidden()
          return
        }

        if (response.status === 401) {
          onUnauthorized()
          return
        }

        if (!response.ok) {
          setMessage(data.message || 'Cannot load review queue')
          return
        }

        setAttempts(data)
      } catch (error) {
        setMessage('Cannot connect to server')
      }
    }

    const loadAttempt = async () => {
      try {
        const response = await fetch(
          'http://localhost:5001/api/submissions/review-queue/' + attemptId,
          {
            headers: {
              Authorization: 'Bearer ' + token,
            },
          }
        )

        const data = await response.json()

        if (response.status === 403) {
          onForbidden()
          return
        }

        if (response.status === 401) {
          onUnauthorized()
          return
        }

        if (response.status === 404) {
          onNotFound()
          return
        }

        if (!response.ok) {
          setMessage(data.message || 'Cannot load attempt')
          return
        }

        setAttempt(data)
      } catch (error) {
        setMessage('Cannot connect to server')
      }
    }

    if (attemptId) {
      loadAttempt()
    } else {
      setAttempt(null)
      loadQueue()
    }
  }, [attemptId])

  return (
    <div>
      <div className="nav">
        <span className="nav-logo">Coding Challenge Platform</span>
        <div className="nav-links">
          <button type="button" className="nav-link" onClick={onOpenDashboard}>
            Dashboard
          </button>
          <button type="button" className="nav-link" onClick={onOpenList}>
            Challenge Management
          </button>
          <span>Review Queue</span>
          <button type="button" className="nav-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <h1 className="page-title">Review Queue</h1>

      {message && <p className="form-message">{message}</p>}

      {attemptId && attempt ? (
        <div>
          <p className="list-empty">
            <button type="button" className="link" onClick={onOpenQueue}>
              Back to Review Queue
            </button>
          </p>
          <div className="detail-box">
            <p>Challenge Number: {attempt.challenge?.challengeNumber || '-'}</p>
            <p>Title: {attempt.challenge?.title || '-'}</p>
            <p>Learner: {attempt.learner?.username || '-'}</p>
            <p>Attempt: {attempt.attemptNumber}</p>
            <p>Submitted Time: {formatTime(attempt.submittedAt)}</p>
            <p>Status: {statusLabel(attempt.status)}</p>
            <p>Repository Link: {attempt.repoUrl}</p>
            <p>Commit Link: {attempt.commitUrl}</p>
            <p>Explanation: {attempt.explanation}</p>
            <p>Test Evidence: {attempt.testEvidence}</p>
          </div>
        </div>
      ) : null}

      {!attemptId && attempts.length === 0 && !message ? (
        <p className="list-empty">No attempts waiting for review</p>
      ) : null}

      {!attemptId && attempts.length > 0 ? (
        <table className="challenge-table">
          <thead>
            <tr>
              <th>Challenge Number</th>
              <th>Title</th>
              <th>Learner</th>
              <th>Attempt</th>
              <th>Submitted Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((item) => (
              <tr key={item._id} className={item.selectedForReview ? 'attempt-latest' : ''}>
                <td>{item.challenge?.challengeNumber || '-'}</td>
                <td>{item.challenge?.title || '-'}</td>
                <td>{item.learner?.username || '-'}</td>
                <td>
                  <button type="button" className="table-link" onClick={() => onOpenAttempt(item._id)}>
                    Attempt {item.attemptNumber}
                  </button>
                  {item.selectedForReview ? <span className="latest-tag">Latest</span> : null}
                </td>
                <td>{formatTime(item.submittedAt)}</td>
                <td>{statusLabel(item.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}

export default ReviewQueue
