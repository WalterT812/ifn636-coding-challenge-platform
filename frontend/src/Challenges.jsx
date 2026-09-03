function Challenges({ onLogout }) {
  return (
    <div>
      <div className="nav">
        <span className="nav-logo">Coding Challenge Platform</span>
        <div className="nav-links">
          <span>Challenges</span>
          <span>Progress</span>
          <span>History</span>
          <span>Browsing History</span>
          <button type="button" className="nav-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <h1 className="page-title">Challenges</h1>
    </div>
  )
}

export default Challenges
