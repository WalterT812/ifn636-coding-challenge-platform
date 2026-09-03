function CreateChallenge({ onLogout, onBack }) {
  return (
    <div>
      <div className="nav">
        <span className="nav-logo">Coding Challenge Platform</span>
        <div className="nav-links">
          <button type="button" className="nav-link" onClick={onBack}>
            Dashboard
          </button>
          <span>Challenge Management</span>
          <span>Review Queue</span>
          <button type="button" className="nav-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      <h1 className="create-title">Create Challenge</h1>

      <div className="form-panels">
        <div className="form-panel">
          <input type="text" placeholder="Title *" />
          <input type="text" placeholder="Challenge Type *" />
          <input type="text" placeholder="Difficulty Tier *" />
          <input type="text" placeholder="Keywords *" />
          <textarea className="box-tall" placeholder="Description *" />
        </div>

        <div className="form-panel">
          <textarea className="box-medium" placeholder="Test Example *" />
          <textarea className="box-medium" placeholder="Expected Result Example *" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary">
          Save Draft
        </button>
        <button type="button" className="btn-primary">
          Publish Challenge
        </button>
        <button type="button" className="btn-cancel" onClick={onBack}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default CreateChallenge
