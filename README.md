# Aria — AI for College Students 🎓
**Hackathon-Ready Full Stack App**

Built for Indian college students. 4 core features, fully connected frontend + backend.

---

## 🚀 Quick Start (3 commands)

### Terminal 1 — AI Brain
```bash
ollama serve
# First time only:
ollama pull llama3.2
```

### Terminal 2 — Backend API
```bash
cd aria/backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Docs → http://localhost:8000/docs
```

### Terminal 3 — Frontend
```bash
cd aria
npm install
npm run dev
# Site → http://localhost:3000
```

---

## 📁 Complete File Structure

```
aria/
├── app/
│   ├── globals.css              ← All CSS variables, animations
│   ├── layout.tsx               ← Root layout, fonts, metadata
│   ├── page.tsx                 ← Landing page
│   ├── dashboard/page.tsx       ← App dashboard
│   ├── attendance/page.tsx      ← Full attendance tracker
│   ├── tutor/page.tsx           ← AI Tutor + YouTube player
│   ├── community/page.tsx       ← Community hub
│   └── api/
│       ├── chat/route.ts        ← AI chat proxy
│       ├── early-access/route.ts ← Waitlist
│       ├── attendance/route.ts  ← Attendance data
│       ├── posts/route.ts       ← Community posts
│       ├── uploads/route.ts     ← File uploads
│       ├── alerts/route.ts      ← WhatsApp config
│       └── health/route.ts      ← System health check
│
├── components/
│   ├── LoadingScreen.tsx        ← 2.8s cinematic intro
│   ├── Navbar.tsx               ← Fixed nav with app links
│   ├── FrameHeroSection.tsx     ← Canvas animation + hero overlay
│   ├── FeaturesGrid.tsx         ← 6 feature cards
│   ├── AttendanceDemo.tsx       ← Interactive live demo
│   ├── HowItWorks.tsx           ← 3-step process
│   ├── Testimonials.tsx         ← Infinite carousel
│   ├── FinalCTA.tsx             ← Waitlist form
│   ├── Footer.tsx               ← 3-column footer
│   ├── FloatingAI.tsx           ← Persistent AI chat bubble
│   └── SmoothScrollProvider.tsx ← Lenis scroll
│
├── public/
│   ├── arialogo.png             ← Your actual logo
│   └── frames/
│       ├── frame_0001.png       ← 240 animation frames
│       └── frame_0240.png
│
└── backend/
    ├── main.py                  ← FastAPI (all routes)
    ├── requirements.txt
    └── .env.example
```

---

## 🔗 All Pages

| URL | Page |
|-----|------|
| `/` | Landing page with frame scroll animation |
| `/dashboard` | App dashboard with stats |
| `/attendance` | Full attendance tracker + AI chat |
| `/tutor` | YouTube AI Tutor + Pomodoro |
| `/community` | Feed, uploads, groups |

---

## 📡 API Endpoints (FastAPI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ping` | Health check |
| GET | `/health` | Full system status |
| POST | `/waitlist` | Join early access |
| GET | `/waitlist/count` | Waitlist size |
| POST | `/chat` | AI chat (Ollama/Groq) |
| POST | `/timetable` | Save timetable |
| POST | `/attendance/mark` | Mark present/absent |
| POST | `/attendance/can-skip` | Skip calculator |
| GET | `/attendance/{id}/summary` | Full summary |
| POST | `/alerts/configure` | WhatsApp alerts setup |
| POST | `/posts` | Create community post |
| GET | `/posts` | Get feed |
| POST | `/posts/{id}/like` | Like a post |
| GET | `/uploads` | Search uploads |
| POST | `/uploads` | Create upload record |
| POST | `/ai/generate-notes` | Generate study notes |
| POST | `/moderate` | Content moderation |

---

## ⚙️ Environment Variables

### Frontend (.env.local)
```
BACKEND_URL=http://localhost:8000
```

### Backend (.env)
```
# AI — choose one:
USE_GROQ=false
GROQ_API_KEY=your_key_here
OLLAMA_MODEL=llama3.2

# WhatsApp alerts (optional):
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# CORS:
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🎯 Hackathon Demo Flow

1. Open `http://localhost:3000` — loading screen plays
2. Scroll slowly — 240 frames animate with text overlays
3. Keep scrolling — Features, Attendance Demo, How It Works
4. Click **Attendance** in navbar — full tracker with AI chat
5. Click **AI Tutor** — paste any YouTube link, ask questions
6. Click **Community** — login, post, share notes
7. Click the **Aria logo button** (bottom-right) — floating AI chat works everywhere

---

## 🌐 Deploy

**Frontend → Vercel:**
```bash
npx vercel deploy
# Add env: BACKEND_URL=https://your-backend.railway.app
```

**Backend → Railway:**
- Go to railway.app → New Project → Deploy from GitHub
- Point to `aria/backend` folder
- Add environment variables

**Note:** Ollama can't run on free cloud tiers. Use `USE_GROQ=true` with a free Groq API key for cloud deployment.
