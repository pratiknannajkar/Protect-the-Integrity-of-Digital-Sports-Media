import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Analyzer from './pages/Analyzer'
import Provenance from './pages/Provenance'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <NavLink to="/" className="nav-logo">
          <span className="shield">🛡️</span>
          <h1>SportShield AI</h1>
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? 'active' : ''}>Dashboard</NavLink>
          <NavLink to="/analyze" className={({isActive}) => isActive ? 'active' : ''}>Analyze</NavLink>
          <NavLink to="/provenance" className={({isActive}) => isActive ? 'active' : ''}>Provenance</NavLink>
        </div>
        <div className="nav-badge">⚡ Powered by Gemini</div>
      </nav>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<Analyzer />} />
        <Route path="/provenance" element={<Provenance />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
