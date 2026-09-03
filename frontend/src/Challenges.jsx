import BrowseChallenges from './BrowseChallenges.jsx'
import ChallengeDetail from './ChallengeDetail.jsx'

function Challenges({ onLogout, page, onOpenPage, onUnauthorized, challengeId }) {
  const titles = {
    progress: 'Progress',
    history: 'History',
    browsing: 'Browsing History',
  }

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

      {page === 'challenges' ? (
        <BrowseChallenges
          onUnauthorized={onUnauthorized}
          onOpenChallenge={(id) => onOpenPage('detail', id)}
        />
      ) : null}

      {page === 'detail' ? (
        <ChallengeDetail
          challengeId={challengeId}
          onUnauthorized={onUnauthorized}
          onBack={() => onOpenPage('challenges')}
        />
      ) : null}

      {page !== 'challenges' && page !== 'detail' ? (
        <h1 className="page-title">{titles[page]}</h1>
      ) : null}
    </div>
  )
}

export default Challenges
