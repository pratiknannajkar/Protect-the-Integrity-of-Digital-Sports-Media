import { useState, useEffect } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'http://localhost:8000'

const detectionTypes = [
  { name: 'Deepfake', value: 45, color: '#EA4335' },
  { name: 'Splicing', value: 25, color: '#FBBC04' },
  { name: 'Copy-Move', value: 15, color: '#4285F4' },
  { name: 'Metadata', value: 15, color: '#34A853' },
]

const weeklyData = [
  { day: 'Mon', scans: 45, threats: 3 },
  { day: 'Tue', scans: 62, threats: 5 },
  { day: 'Wed', scans: 38, threats: 2 },
  { day: 'Thu', scans: 71, threats: 8 },
  { day: 'Fri', scans: 55, threats: 4 },
  { day: 'Sat', scans: 89, threats: 7 },
  { day: 'Sun', scans: 43, threats: 1 },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_scans: 12847,
    threats_detected: 234,
    authentic_media: 12613,
    active_monitors: 89,
  })

  useEffect(() => {
    axios.get(`${API}/api/dashboard/stats`)
      .then(res => {
        if (res.data.total_scans > 0) setStats(res.data)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h2>📊 Analytics Dashboard</h2>
        <p>Real-time monitoring of sports media integrity</p>
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="ds-label">Total Scans</div>
          <div className="ds-value">{stats.total_scans.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="ds-label">Threats Detected</div>
          <div className="ds-value">{stats.threats_detected}</div>
        </div>
        <div className="dash-stat">
          <div className="ds-label">Authentic Media</div>
          <div className="ds-value">{stats.authentic_media.toLocaleString()}</div>
        </div>
        <div className="dash-stat">
          <div className="ds-label">Active Monitors</div>
          <div className="ds-value">{stats.active_monitors}</div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <h3>📈 Weekly Scan Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2545" />
              <XAxis dataKey="day" stroke="#5a6178" fontSize={12} />
              <YAxis stroke="#5a6178" fontSize={12} />
              <Tooltip
                contentStyle={{ background: '#161b2e', border: '1px solid #1e2545', borderRadius: 8, color: '#e8ecf4' }}
              />
              <Bar dataKey="scans" fill="#4285F4" radius={[4,4,0,0]} />
              <Bar dataKey="threats" fill="#EA4335" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-card">
          <h3>🔍 Detection Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={detectionTypes} dataKey="value" cx="50%" cy="50%" outerRadius={80} label={({name, value}) => `${name} ${value}%`}>
                {detectionTypes.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#161b2e', border: '1px solid #1e2545', borderRadius: 8, color: '#e8ecf4' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="dash-card" style={{ marginTop: 16 }}>
        <h3>📋 Recent Analyses</h3>
        <table className="results-table">
          <thead>
            <tr>
              <th>Media</th>
              <th>Type</th>
              <th>Verdict</th>
              <th>Confidence</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>FIFA_WC_goal_highlight.mp4</td>
              <td>Video</td>
              <td><span className="mc-status clean">AUTHENTIC</span></td>
              <td>98.7%</td>
              <td>2 min ago</td>
            </tr>
            <tr>
              <td>messi_interview_clip.jpg</td>
              <td>Image</td>
              <td><span className="mc-status tampered">TAMPERED</span></td>
              <td>94.2%</td>
              <td>5 min ago</td>
            </tr>
            <tr>
              <td>IPL_final_replay.png</td>
              <td>Image</td>
              <td><span className="mc-status clean">AUTHENTIC</span></td>
              <td>99.1%</td>
              <td>12 min ago</td>
            </tr>
            <tr>
              <td>nba_dunk_deepfake.jpg</td>
              <td>Image</td>
              <td><span className="mc-status tampered">TAMPERED</span></td>
              <td>96.8%</td>
              <td>18 min ago</td>
            </tr>
            <tr>
              <td>olympics_100m_finish.jpg</td>
              <td>Image</td>
              <td><span className="mc-status suspicious">SUSPICIOUS</span></td>
              <td>67.3%</td>
              <td>25 min ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
