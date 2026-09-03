import { useEffect, useState } from 'react'
import BrowseChallenges from './BrowseChallenges.jsx'
import ChallengeDetail from './ChallengeDetail.jsx'
import AttemptHistory from './AttemptHistory.jsx'
import AttemptDetail from './AttemptDetail.jsx'
import ReviewHistory from './ReviewHistory.jsx'
import NotFound from './NotFound.jsx'

function Challenges({ onLogout, page, onOpenPage, onUnauthorized, challengeId, attemptId }) {
  const titles = {
    progress: 'Progress',
    browsing: 'Browsing History',
  }
  const [challengeMissing, setChallengeMissing] = useState(false)
  const [attemptMissing, setAttemptMissing] = useState(false)

  useEffect(() => {
    setChallengeMissing(false)
    setAttemptMissing(false)
  }, [challengeId, attemptId, page])

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
          <button type="button" className="nav-link" onClick={() => onOpenPage('reviews')}>
            Reviews
          </button>
          <button type="button" className="nav-link" onClick={() => onOpenPage('browsing')}>
            Browsing History
          </button>
          <button type="button" className="nav-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {page === 'challenges' ? (
        <BrowseChallenges
          onUnauthorized={onUnauthorized}
          onOpenChallenge={(id) => onOpenPage('detail', id)}
        />
      ) : null}

      {page === 'detail' && challengeMissing ? (
        <NotFound onHome={() => onOpenPage('challenges')} />
      ) : null}

      {page === 'detail' && !challengeMissing ? (
        <ChallengeDetail
          challengeId={challengeId}
          onUnauthorized={onUnauthorized}
          onNotFound={() => setChallengeMissing(true)}
          onBack={() => onOpenPage('challenges')}
          onOpenAttempt={(id) => onOpenPage('attempt', id)}
        />
      ) : null}

      {page === 'history' ? (
        <AttemptHistory
          showChallenge
          onUnauthorized={onUnauthorized}
          onOpenAttempt={(id) => onOpenPage('attempt', id)}
        />
      ) : null}

      {page === 'attempt' && attemptMissing ? (
        <NotFound onHome={() => onOpenPage('history')} />
      ) : null}

      {page === 'reviews' ? (
        <ReviewHistory
          onUnauthorized={onUnauthorized}
          onOpenAttempt={(id) => onOpenPage('attempt', id)}
        />
      ) : null}

      {page === 'attempt' && !attemptMissing ? (
        <AttemptDetail
          attemptId={attemptId}
          onUnauthorized={onUnauthorized}
          onNotFound={() => setAttemptMissing(true)}
          onBack={() => onOpenPage('history')}
        />
      ) : null}

      {page !== 'challenges' && page !== 'detail' && page !== 'history' && page !== 'reviews' && page !== 'attempt' ? (
        <h1 className="page-title">{titles[page]}</h1>
      ) : null}
    </div>
  )
}

export default Challenges
