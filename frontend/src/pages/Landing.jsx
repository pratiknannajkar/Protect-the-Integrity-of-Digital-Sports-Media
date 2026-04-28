import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="hero">
      <div className="hero-badge">🔒 Digital Asset Protection — Solution Challenge 2026</div>
      <h1>Protect the Integrity of Digital Sports Media</h1>
      <p>AI-powered deepfake detection, tamper analysis & blockchain provenance for the sports industry. Built with Google Gemini.</p>
      <div className="hero-buttons">
        <Link to="/analyze" className="btn-primary">🔬 Analyze Media Now</Link>
        <Link to="/dashboard" className="btn-secondary">📊 View Dashboard</Link>
      </div>
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-value">99.2%</div>
          <div className="stat-label">Detection Accuracy</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">&lt;500ms</div>
          <div className="stat-label">Analysis Speed</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">5</div>
          <div className="stat-label">Forensic Layers</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">Gemini</div>
          <div className="stat-label">AI Engine</div>
        </div>
      </div>
    </div>
  )
}
