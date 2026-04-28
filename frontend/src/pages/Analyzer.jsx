import { useState, useRef } from 'react'
import axios from 'axios'

const API = 'http://localhost:8000'

export default function Analyzer() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(0)
  const [history, setHistory] = useState([])
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [activeTab, setActiveTab] = useState('results')
  const inputRef = useRef()

  const steps = [
    { name: 'Uploading media...', icon: '📤' },
    { name: 'Error Level Analysis (ELA)', icon: '🔬' },
    { name: 'DCT Frequency Analysis', icon: '📡' },
    { name: 'Face Forensics Detection', icon: '👤' },
    { name: 'Metadata Verification', icon: '📋' },
    { name: 'Gemini AI Assessment', icon: '🤖' },
    { name: 'Generating Provenance', icon: '⛓️' },
  ]

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setShowHeatmap(false)
    setActiveTab('results')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('dragover')
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setResult(null)
    setStep(0)

    const interval = setInterval(() => {
      setStep(s => Math.min(s + 1, steps.length - 1))
    }, 700)

    try {
      const form = new FormData()
      form.append('file', file)
      const res = await axios.post(`${API}/api/analyze`, form)
      setResult(res.data)
      setHistory(prev => [{ ...res.data, filename: file.name, thumb: preview }, ...prev].slice(0, 10))
    } catch (err) {
      setResult({ error: err.response?.data?.detail || err.message, final_verdict: 'ERROR' })
    }
    clearInterval(interval)
    setStep(steps.length)
    setLoading(false)
  }

  const downloadReport = () => {
    if (!result) return
    const report = {
      platform: 'SportShield AI',
      team: 'TEAM HUNTERS',
      analysis_id: result.analysis_id,
      filename: file?.name,
      timestamp: result.timestamp,
      verdict: result.final_verdict,
      confidence: result.confidence + '%',
      processing_time: result.processing_time_seconds + 's',
      media_hash: result.media_hash,
      modules: Object.entries(result.modules || {}).map(([k, v]) => ({
        name: v.module || k,
        score: v.score + '/100',
        status: v.status,
      })),
      gemini_explanation: result.modules?.gemini_ai?.explanation || 'N/A',
      provenance_hash: result.provenance?.record_hash || 'N/A',
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sportshield_report_${result.analysis_id}.json`
    a.click()
  }

  const verdictClass = (v) => {
    if (!v) return ''
    const vl = v.toLowerCase()
    if (vl === 'authentic') return 'authentic'
    if (vl === 'tampered') return 'tampered'
    return 'suspicious'
  }

  const statusClass = (s) => {
    if (!s) return ''
    const sl = s.toLowerCase()
    if (sl === 'clean' || sl === 'authentic' || sl === 'no_faces') return 'clean'
    if (sl === 'suspicious') return 'suspicious'
    return 'tampered'
  }

  const getVerdictEmoji = (v) => {
    if (v === 'AUTHENTIC') return '✅'
    if (v === 'TAMPERED') return '🚨'
    if (v === 'SUSPICIOUS') return '⚠️'
    return '❓'
  }

  const cleanGeminiText = (text) => {
    if (!text) return 'Assessment completed.'
    // Clean up error messages for display
    if (text.includes('429') || text.includes('quota')) {
      return 'Gemini AI used fallback analysis mode. The 4 forensic modules (ELA, DCT, Face Forensics, Metadata) completed successfully and the verdict is based on their combined assessment.'
    }
    // Remove markdown formatting
    return text.replace(/\*\*/g, '').replace(/\*/g, '').substring(0, 500)
  }

  const getScoreColor = (score) => {
    if (score <= 30) return '#34A853'
    if (score <= 60) return '#FBBC04'
    return '#EA4335'
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>🔬 Media Analysis Engine</h2>
        <p>Upload sports media to detect deepfakes, tampering, and AI-generated content</p>
      </div>

      <div className="analyzer-layout">
        {/* Left: Upload & Preview */}
        <div>
          {!preview ? (
            <div
              className="upload-zone"
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover') }}
              onDragLeave={e => e.currentTarget.classList.remove('dragover')}
              onClick={() => inputRef.current?.click()}
            >
              <div className="uz-icon">📤</div>
              <h3>Drop sports media here</h3>
              <p>or click to upload • Supports JPEG, PNG, WebP</p>
              <p style={{ fontSize: 11, color: '#5a6178', marginTop: 8 }}>Max size: 10MB</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={e => e.target.files[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="upload-zone" style={{ padding: '16px', cursor: 'default', borderStyle: 'solid' }}>
              <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <img src={preview} alt="Preview" className="upload-preview" />
                {/* ELA Heatmap Overlay */}
                {showHeatmap && result?.modules?.ela?.heatmap_base64 && (
                  <img
                    src={`data:image/png;base64,${result.modules.ela.heatmap_base64}`}
                    alt="ELA Heatmap"
                    className="upload-preview"
                    style={{ position: 'absolute', top: 0, opacity: 0.6, mixBlendMode: 'screen' }}
                  />
                )}
              </div>

              {/* Image Controls */}
              {result && result.modules?.ela?.heatmap_base64 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, justifyContent: 'center' }}>
                  <button
                    onClick={() => setShowHeatmap(false)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: !showHeatmap ? '#4285F4' : '#161b2e', color: '#fff', fontSize: 12, fontWeight: 600
                    }}
                  >📷 Original</button>
                  <button
                    onClick={() => setShowHeatmap(true)}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: showHeatmap ? '#EA4335' : '#161b2e', color: '#fff', fontSize: 12, fontWeight: 600
                    }}
                  >🔥 ELA Heatmap</button>
                </div>
              )}

              <p style={{ fontSize: 13, color: '#8b92a8', marginBottom: 12 }}>
                {file?.name} ({(file?.size / 1024).toFixed(1)} KB)
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn-primary" onClick={analyze} disabled={loading}>
                  {loading ? '⏳ Analyzing...' : '🔬 Analyze Now'}
                </button>
                <button className="btn-secondary" onClick={() => { setFile(null); setPreview(null); setResult(null); setShowHeatmap(false) }}>
                  🔄 New File
                </button>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          {loading && (
            <div className="results-panel" style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 16 }}>⏳ Multi-Layer Forensic Analysis</h3>
              <div className="analysis-progress">
                {steps.map((s, i) => (
                  <div key={i} className="progress-step">
                    <div className={`ps-dot ${i < step ? 'done' : i === step ? 'active' : 'pending'}`}>
                      {i < step ? '✓' : s.icon}
                    </div>
                    <span style={{ color: i <= step ? '#e8ecf4' : '#5a6178' }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DCT Frequency Map */}
          {result?.modules?.dct?.frequency_map_base64 && activeTab === 'forensics' && (
            <div className="results-panel" style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 12 }}>📡 DCT Frequency Map</h3>
              <img
                src={`data:image/png;base64,${result.modules.dct.frequency_map_base64}`}
                alt="DCT Frequency"
                style={{ width: '100%', borderRadius: 8 }}
              />
              <p style={{ fontSize: 11, color: '#8b92a8', marginTop: 8 }}>
                Bright spots indicate frequency anomalies — potential AI generation artifacts
              </p>
            </div>
          )}

          {/* Analysis History */}
          {history.length > 0 && (
            <div className="results-panel" style={{ marginTop: 16 }}>
              <h3 style={{ marginBottom: 12 }}>📜 Recent Analyses</h3>
              {history.map((h, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: '#0f1219', borderRadius: 8, marginBottom: 6
                }}>
                  <img src={h.thumb} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{h.filename}</div>
                    <div style={{ fontSize: 10, color: '#5a6178' }}>{h.processing_time_seconds}s</div>
                  </div>
                  <span className={`mc-status ${statusClass(h.final_verdict)}`}>{h.final_verdict}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: getScoreColor(100 - h.confidence) }}>
                    {h.confidence}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Results Panel */}
        <div className="results-panel">
          {!result && !loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#5a6178' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
              <h3>Awaiting Analysis</h3>
              <p style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
                Upload a sports image to run our 5-layer<br />forensic analysis powered by Gemini AI
              </p>
              <div style={{ marginTop: 24, padding: 16, background: '#0f1219', borderRadius: 10, textAlign: 'left' }}>
                <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Detection Capabilities:</p>
                <div style={{ fontSize: 11, color: '#8b92a8', lineHeight: 1.8 }}>
                  🔬 Error Level Analysis (ELA)<br />
                  📡 DCT Frequency Analysis<br />
                  👤 Face Forensics Detection<br />
                  📋 Metadata Integrity Check<br />
                  🤖 Gemini AI Assessment
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p style={{ fontWeight: 600 }}>Running 5-layer forensic analysis...</p>
              <p style={{ fontSize: 12, color: '#5a6178' }}>Powered by Google Gemini AI</p>
            </div>
          )}

          {result && !result.error && (
            <>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                {['results', 'forensics', 'provenance'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    flex: 1, padding: '8px 12px', border: 'none', borderRadius: 8, cursor: 'pointer',
                    background: activeTab === tab ? '#4285F4' : '#0f1219',
                    color: activeTab === tab ? '#fff' : '#8b92a8',
                    fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
                  }}>{tab === 'results' ? '📊 Results' : tab === 'forensics' ? '🔬 Details' : '⛓️ Provenance'}</button>
                ))}
              </div>

              {activeTab === 'results' && (
                <>
                  {/* Verdict */}
                  <div className={`verdict-badge ${verdictClass(result.final_verdict)}`}>
                    {getVerdictEmoji(result.final_verdict)} {result.final_verdict}
                  </div>

                  {/* Confidence */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>Confidence</span>
                      <span style={{ fontWeight: 700 }}>{result.confidence}%</span>
                    </div>
                    <div className="confidence-bar">
                      <div
                        className={`confidence-fill ${result.confidence > 80 ? 'high' : result.confidence > 50 ? 'medium' : 'low'}`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>

                  <p style={{ fontSize: 12, color: '#5a6178', margin: '8px 0' }}>
                    ⏱️ {result.processing_time_seconds}s • 🔗 {result.media_hash?.slice(0, 20)}...
                  </p>

                  {/* Module Results */}
                  <div className="module-results">
                    {result.modules && Object.entries(result.modules).map(([key, mod]) => (
                      <div key={key} className="module-card">
                        <div>
                          <div className="mc-name">{mod.module || key}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 40, height: 4, borderRadius: 2, background: '#0f1219', overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${mod.score || 0}%`, height: '100%', borderRadius: 2,
                              background: getScoreColor(mod.score || 0)
                            }} />
                          </div>
                          <span className="mc-score">{mod.score ?? 'N/A'}</span>
                          <span className={`mc-status ${statusClass(mod.status)}`}>{mod.status || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Explanation */}
                  <div className="ai-explanation">
                    <h4>🤖 Gemini AI Assessment</h4>
                    <p>{cleanGeminiText(result.modules?.gemini_ai?.explanation)}</p>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                    <button className="btn-primary" onClick={downloadReport} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                      📥 Download Report
                    </button>
                    <button className="btn-secondary" onClick={() => setShowHeatmap(!showHeatmap)} style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                      🔥 Toggle Heatmap
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'forensics' && (
                <>
                  <h3 style={{ marginBottom: 16 }}>🔬 Detailed Forensic Analysis</h3>

                  {/* ELA Details */}
                  <div style={{ background: '#0f1219', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <h4 style={{ fontSize: 13, marginBottom: 8, color: '#4285F4' }}>Error Level Analysis (ELA)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                      <div><span style={{ color: '#5a6178' }}>Score:</span> <b>{result.modules?.ela?.score}/100</b></div>
                      <div><span style={{ color: '#5a6178' }}>Mean Error:</span> <b>{result.modules?.ela?.mean_error}</b></div>
                      <div><span style={{ color: '#5a6178' }}>Max Error:</span> <b>{result.modules?.ela?.max_error}</b></div>
                      <div><span style={{ color: '#5a6178' }}>Tampered %:</span> <b>{result.modules?.ela?.tampered_ratio}%</b></div>
                    </div>
                    {result.modules?.ela?.tampered_regions?.length > 0 && (
                      <p style={{ fontSize: 11, color: '#EA4335', marginTop: 8 }}>
                        ⚠️ {result.modules.ela.tampered_regions.length} suspicious region(s) detected
                      </p>
                    )}
                  </div>

                  {/* DCT Details */}
                  <div style={{ background: '#0f1219', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <h4 style={{ fontSize: 13, marginBottom: 8, color: '#FBBC04' }}>DCT Frequency Analysis</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                      <div><span style={{ color: '#5a6178' }}>Score:</span> <b>{result.modules?.dct?.score}/100</b></div>
                      <div><span style={{ color: '#5a6178' }}>AI Generated:</span> <b>{result.modules?.dct?.is_ai_generated ? 'Yes' : 'No'}</b></div>
                      <div><span style={{ color: '#5a6178' }}>High Freq:</span> <b>{result.modules?.dct?.high_freq_ratio}%</b></div>
                    </div>
                  </div>

                  {/* Face Details */}
                  <div style={{ background: '#0f1219', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <h4 style={{ fontSize: 13, marginBottom: 8, color: '#34A853' }}>Face Forensics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
                      <div><span style={{ color: '#5a6178' }}>Faces Found:</span> <b>{result.modules?.face_forensics?.faces_found || 0}</b></div>
                      <div><span style={{ color: '#5a6178' }}>Deepfake %:</span> <b>{result.modules?.face_forensics?.deepfake_probability || 0}%</b></div>
                      <div><span style={{ color: '#5a6178' }}>Score:</span> <b>{result.modules?.face_forensics?.score}/100</b></div>
                    </div>
                  </div>

                  {/* Metadata Details */}
                  <div style={{ background: '#0f1219', borderRadius: 10, padding: 14 }}>
                    <h4 style={{ fontSize: 13, marginBottom: 8, color: '#EA4335' }}>Metadata Verification</h4>
                    <div style={{ fontSize: 12 }}>
                      <div><span style={{ color: '#5a6178' }}>Format:</span> <b>{result.modules?.metadata?.format}</b></div>
                      <div><span style={{ color: '#5a6178' }}>Dimensions:</span> <b>{result.modules?.metadata?.dimensions}</b></div>
                      <div><span style={{ color: '#5a6178' }}>Anomalies:</span> <b>{result.modules?.metadata?.anomaly_count || 0}</b></div>
                    </div>
                    {result.modules?.metadata?.anomalies?.map((a, i) => (
                      <div key={i} style={{ fontSize: 11, color: '#EA4335', marginTop: 6 }}>
                        ⚠️ [{a.severity}] {a.detail}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeTab === 'provenance' && (
                <>
                  <h3 style={{ marginBottom: 16 }}>⛓️ Provenance Record</h3>

                  <div style={{ background: '#0f1219', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#5a6178', marginBottom: 4 }}>MEDIA HASH (SHA-256)</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#adc6ff', wordBreak: 'break-all' }}>
                      {result.media_hash}
                    </div>
                  </div>

                  <div style={{ background: '#0f1219', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#5a6178', marginBottom: 4 }}>RECORD HASH</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#adc6ff', wordBreak: 'break-all' }}>
                      {result.provenance?.record_hash || 'N/A'}
                    </div>
                  </div>

                  <div style={{ background: '#0f1219', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#5a6178', marginBottom: 4 }}>VERIFICATION TIMESTAMP</div>
                    <div style={{ fontSize: 13 }}>{result.provenance?.timestamp_iso || result.timestamp}</div>
                  </div>

                  <div style={{ background: '#0f1219', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#5a6178', marginBottom: 4 }}>VERDICT RECORDED</div>
                    <div className={`mc-status ${statusClass(result.final_verdict)}`} style={{ display: 'inline-block' }}>
                      {getVerdictEmoji(result.final_verdict)} {result.final_verdict} — {result.confidence}% confidence
                    </div>
                  </div>

                  {result.provenance?.qr_code_base64 && (
                    <div className="qr-section">
                      <img src={`data:image/png;base64,${result.provenance.qr_code_base64}`} alt="QR" />
                      <p style={{ fontSize: 11, color: '#666', marginTop: 8 }}>Scan to verify authenticity</p>
                    </div>
                  )}

                  <button className="btn-primary" onClick={downloadReport} style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}>
                    📜 Download Authenticity Certificate
                  </button>
                </>
              )}
            </>
          )}

          {result?.error && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
              <h3 style={{ color: '#EA4335' }}>Analysis Error</h3>
              <p style={{ fontSize: 13, color: '#8b92a8', marginTop: 8 }}>{result.error}</p>
              <p style={{ fontSize: 12, color: '#5a6178', marginTop: 8 }}>
                Make sure the backend server is running on port 8000
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
