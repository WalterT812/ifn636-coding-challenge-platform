import { useState } from 'react'

const emptyForm = {
  title: '',
  type: '',
  tier: '',
  keywords: [],
  description: '',
  testExample: '',
  expectedResult: '',
}

const requiredFields = [
  'title',
  'type',
  'tier',
  'description',
  'testExample',
  'expectedResult',
]

function CreateChallenge({ onLogout, onBack }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [keywordText, setKeywordText] = useState('')
  const publisher = localStorage.getItem('username') || sessionStorage.getItem('username') || ''
  const createdDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const updateField = (name, value) => {
    setForm({ ...form, [name]: value })
  }

  const addKeyword = () => {
    const word = keywordText.trim()

    if (!word) {
      return
    }

    if (form.keywords.includes(word)) {
      setKeywordText('')
      return
    }

    setForm({ ...form, keywords: [...form.keywords, word] })
    setKeywordText('')
  }

  const removeKeyword = (word) => {
    setForm({
      ...form,
      keywords: form.keywords.filter((item) => item !== word),
    })
  }

  // only publish needs every box filled
  const handlePublish = () => {
    const nextErrors = {}

    requiredFields.forEach((name) => {
      if (!String(form[name]).trim()) {
        nextErrors[name] = true
      }
    })

    if (form.keywords.length === 0) {
      nextErrors.keywords = true
    }

    setErrors(nextErrors)
  }

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
          <div className="field">
            {/* we do not type this, the server makes CCP-CH-001, 002, ... */}
            <input type="text" value="Challenge Number: Auto" disabled />
          </div>

          <div className="field">
            <input
              type="text"
              placeholder="Title *"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <p className="field-error">This field is required</p>}
          </div>

          <div className="field">
            <select
              value={form.type}
              onChange={(event) => updateField('type', event.target.value)}
              className={errors.type ? 'input-error' : ''}
            >
              <option value="">Challenge Type *</option>
              <option value="Debugging">Debugging</option>
              <option value="Feature">Feature</option>
              <option value="Refactoring">Refactoring</option>
              <option value="Security">Security</option>
            </select>
            {errors.type && <p className="field-error">This field is required</p>}
          </div>

          <div className="field">
            <input
              type="text"
              placeholder="Difficulty Tier *"
              value={form.tier}
              onChange={(event) => updateField('tier', event.target.value)}
              className={errors.tier ? 'input-error' : ''}
            />
            {errors.tier && <p className="field-error">This field is required</p>}
          </div>

          <div className="field">
            {/* type a word, click Add, repeat */}
            <div className="keyword-row">
              <input
                type="text"
                placeholder="Keywords *"
                value={keywordText}
                onChange={(event) => setKeywordText(event.target.value)}
                className={errors.keywords ? 'input-error' : ''}
              />
              <button type="button" className="keyword-add" onClick={addKeyword}>
                Add
              </button>
            </div>
            <div className="keyword-list">
              {form.keywords.map((word) => (
                <button
                  key={word}
                  type="button"
                  className="keyword-tag"
                  onClick={() => removeKeyword(word)}
                >
                  {word} ×
                </button>
              ))}
            </div>
            {errors.keywords && <p className="field-error">This field is required</p>}
          </div>

          <div className="field">
            <textarea
              className={errors.description ? 'box-tall input-error' : 'box-tall'}
              placeholder="Description *"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
            />
            {errors.description && <p className="field-error">This field is required</p>}
          </div>
        </div>

        <div className="form-panel">
          <div className="field">
            <textarea
              className={errors.testExample ? 'box-medium input-error' : 'box-medium'}
              placeholder="Test Example *"
              value={form.testExample}
              onChange={(event) => updateField('testExample', event.target.value)}
            />
            {errors.testExample && <p className="field-error">This field is required</p>}
          </div>

          <div className="field">
            <textarea
              className={errors.expectedResult ? 'box-medium input-error' : 'box-medium'}
              placeholder="Expected Result Example *"
              value={form.expectedResult}
              onChange={(event) => updateField('expectedResult', event.target.value)}
            />
            {errors.expectedResult && <p className="field-error">This field is required</p>}
          </div>

          <div className="field">
            {/* taken from the person who logged in */}
            <input
              type="text"
              value={'Publisher: ' + (publisher || 'Unknown')}
              disabled
            />
          </div>

          <div className="field">
            {/* shown as today; the database also stores createdAt */}
            <input type="text" value={'Date: ' + createdDate} disabled />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-secondary">
          Save Draft
        </button>
        <button type="button" className="btn-primary" onClick={handlePublish}>
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
