function Challenges({ onLogout, page, onOpenPage }) {
  const titles = {
    challenges: 'Challenges',
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
      <h1 className="page-title">{titles[page] || 'Challenges'}</h1>
    </div>
  )
}

export default Challenges
