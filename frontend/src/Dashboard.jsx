function Dashboard({ onLogout }) {
  return (
    <div>
      {/* top menu */}
      <div className="nav">
        <span className="nav-logo">Coding Challenge Platform</span>
        <div className="nav-links">
          <span>Dashboard</span>
          <span>Challenge Management</span>
          <span>Review Queue</span>
          {/* logout button, click to go back to login */}
          <button type="button" className="nav-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
      <h1 className="page-title">Dashboard</h1>
    </div>
  )
}

export default Dashboard
