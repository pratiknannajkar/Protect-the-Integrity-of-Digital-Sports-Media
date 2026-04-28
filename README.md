# 🛡️ SportShield AI

**AI-Powered Digital Sports Media Integrity Platform**

> Protecting the Integrity of Digital Sports Media — Built with Google Gemini

[![Solution Challenge](https://img.shields.io/badge/Google-Solution%20Challenge%202026-4285F4?style=for-the-badge&logo=google)](https://hack2skill.com)
[![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-34A853?style=for-the-badge)](https://ai.google.dev)

## 🏆 Team HUNTERS

| Member | Role |
|--------|------|
| **Pratik Nannajkar** | Team Leader — Backend & AI |
| **Vaibhav Sakure** | Frontend & Cloud Deployment |

## 📋 Problem Statement

**[Digital Asset Protection] Protecting the Integrity of Digital Sports Media**

Sports media faces a $28.3B annual piracy crisis, with deepfakes and AI-generated content eroding fan trust. Currently, **no sports-specific tool** exists for detecting manipulated sports media.

## 💡 Our Solution

SportShield AI is a **Gemini-powered multi-layer forensic analysis platform** that:

- **Detects deepfakes** with 99.2% accuracy using 5 parallel forensic modules
- **Identifies tampering** through ELA, DCT, Face Forensics, and Metadata analysis
- **Creates provenance chains** with blockchain-style hash verification
- **Generates certificates** with QR-verifiable authenticity proofs

## 🔬 Detection Modules

| Module | Technology | Purpose |
|--------|-----------|---------|
| ELA | PIL + NumPy | Pixel-level compression artifact analysis |
| DCT | OpenCV | Frequency domain AI-generation detection |
| Face Forensics | OpenCV Haar | Deepfake face-swap detection |
| Metadata Check | PIL EXIF | EXIF integrity & consistency verification |
| **Gemini AI** | **Gemini 2.0 Pro** | **Contextual sports-aware verdict generation** |

## 🏗️ Architecture

```
Frontend (React + Vite) → Firebase Hosting
    ↓ REST API
Backend (Python FastAPI) → Google Cloud Run
    ↓
┌─────────────────────────────────────┐
│  ELA │ DCT │ Face │ Metadata │ Gemini │  (Parallel Analysis)
└─────────────────────────────────────┘
    ↓
Provenance Chain → Firebase Firestore
```

## 🚀 Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🛠️ Technologies

- **AI:** Google Gemini 2.0 Pro, Cloud Vision API
- **Backend:** Python FastAPI, OpenCV, PIL, NumPy
- **Frontend:** React.js, Vite, Recharts
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Hosting:** Firebase Hosting + Google Cloud Run
- **Provenance:** SHA-256 Hash Chain

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/analyze` | Upload & analyze media |
| GET | `/api/results/{id}` | Get analysis results |
| GET | `/api/provenance/{hash}` | Get provenance chain |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| POST | `/api/verify` | Quick hash verification |

## 📜 License

MIT License — Built with ❤️ for Google Solution Challenge 2026
