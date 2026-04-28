import { useState } from 'react'

const sampleChain = [
  {
    action: '📷 Original Capture',
    detail: 'Captured by Sony A7IV at Wankhede Stadium, Mumbai',
    hash: 'a3f8c7e2d9b4f1a6e5c8d3b2a1f7e4c9d8b5a2f3e6c1d4b7a8f9e2c3d6b1a4',
    time: '2026-04-28T10:30:00Z',
    verifier: 'Camera Device',
  },
  {
    action: '✏️ Editor Processing',
    detail: 'Color correction + crop by Adobe Lightroom Classic',
    hash: 'b7d2e5f8a1c4b9e6d3f2a5c8b1e4d7f0a3c6b9e2d5f8a1c4b7e0d3f6a9c2b5',
    time: '2026-04-28T11:15:00Z',
    verifier: 'BCCI Media Team',
  },
  {
    action: '✅ League Verification',
    detail: 'Verified and approved by IPL Official Media Division',
    hash: 'c4e7f0a3b6d9e2f5a8c1b4d7e0f3a6c9b2e5d8f1a4c7b0e3d6f9a2c5b8e1d4',
    time: '2026-04-28T12:00:00Z',
    verifier: 'IPL Media Authority',
  },
  {
    action: '📡 Distribution',
    detail: 'Published to ESPN, Star Sports, and official social media channels',
    hash: 'd1f4a7c0b3e6d9f2a5c8b1e4d7f0a3c6b9e2d5f8a1c4b7e0d3f6a9c2b5e8f1',
    time: '2026-04-28T12:30:00Z',
    verifier: 'SportShield AI',
  },
  {
    action: '🛡️ Current Verification',
    detail: 'Real-time integrity verified — no tampering detected',
    hash: 'e8f1a4c7b0e3d6f9a2c5b8e1d4f7a0c3b6e9d2f5a8c1b4d7e0f3a6c9b2e5d8',
    time: new Date().toISOString(),
    verifier: 'SportShield AI v1.0',
  },
]

export default function Provenance() {
  const [searchHash, setSearchHash] = useState('')

  return (
    <div className="page">
      <div className="page-header">
        <h2>⛓️ Provenance Chain</h2>
        <p>Blockchain-based media ownership and verification history</p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <input
          type="text"
          placeholder="Search by media hash..."
          value={searchHash}
          onChange={e => setSearchHash(e.target.value)}
          style={{
            flex: 1, padding: '12px 16px', background: '#161b2e', border: '1px solid #1e2545',
            borderRadius: 10, color: '#e8ecf4', fontSize: 14, fontFamily: 'monospace',
            outline: 'none',
          }}
        />
        <button className="btn-primary">🔍 Verify</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div>
          <div className="dash-card" style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ fontSize: 40 }}>🏏</div>
            <div>
              <h3 style={{ marginBottom: 4 }}>IPL Final — Match Winning Six Highlight</h3>
              <p style={{ fontSize: 13, color: '#8b92a8' }}>Wankhede Stadium, Mumbai • BCCI Official Media</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <span className="mc-status clean">✅ VERIFIED</span>
                <span style={{ fontSize: 11, color: '#5a6178' }}>Chain Length: {sampleChain.length}</span>
              </div>
            </div>
          </div>

          <div className="provenance-timeline">
            {sampleChain.map((node, i) => (
              <div key={i} className="prov-node">
                <h4>{node.action}</h4>
                <p style={{ fontSize: 12, color: '#8b92a8', marginBottom: 6 }}>{node.detail}</p>
                <div className="prov-hash">🔗 {node.hash}</div>
                <div className="prov-time">
                  🕐 {new Date(node.time).toLocaleString()} • Verified by: {node.verifier}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="dash-card">
            <h3>🔐 Verification Details</h3>
            <div style={{ marginTop: 12, fontSize: 13 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#5a6178', fontSize: 11, marginBottom: 4 }}>MEDIA HASH (SHA-256)</div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#adc6ff', wordBreak: 'break-all' }}>
                  a3f8c7e2d9b4f1a6e5c8d3b2a1f7e4c9d8b5a2f3e6c1d4b7a8f9e2c3d6b1a4
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#5a6178', fontSize: 11, marginBottom: 4 }}>CHAIN INTEGRITY</div>
                <div style={{ color: '#34A853', fontWeight: 700 }}>✅ Valid — All hashes verified</div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#5a6178', fontSize: 11, marginBottom: 4 }}>FIRST VERIFIED</div>
                <div>April 28, 2026 10:30 AM IST</div>
              </div>
              <div>
                <div style={{ color: '#5a6178', fontSize: 11, marginBottom: 4 }}>DIGITAL SIGNATURE</div>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#8b92a8', wordBreak: 'break-all' }}>
                  MEUCIQD7x2Gk3f8Hq...SportShieldAI_v1
                </div>
              </div>
            </div>
          </div>

          <div className="qr-section" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 80 }}>📱</div>
            <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>QR Code generated after analysis</p>
            <p style={{ fontSize: 10, color: '#999' }}>Scan to verify on any device</p>
          </div>

          <div className="dash-card" style={{ marginTop: 16 }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              📜 Download Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
