# HirePilot AI — Powered by Anakin Wire

> **Finding jobs is broken.** Listings are scattered across Jobicy, RemoteOK, and We Work Remotely. Market trends are invisible. You apply blind, with no idea if your resume even matches. HirePilot fixes all of that in one place.

---

## Live Demo

🌐 **[https://hire-pilot-beta.vercel.app](https://hire-pilot-beta.vercel.app)**

▶️ **[Watch Demo on YouTube](https://youtu.be/K9e0uikkM90)**

**Demo credentials — no sign-up needed:**
```
Email:    ABC@gmail.com
Password: ABC
```

---

## The Problem

Students and freshers face the same three walls every job hunt:

- **Fragmentation** — job listings scattered across dozens of platforms, no single view
- **Blind applications** — no way to know if your resume actually matches a role before applying
- **Zero market intelligence** — no visibility into which skills are trending, what pays what, or where hiring is happening

---

## The Solution — HirePilot AI

HirePilot is an AI-powered job assistant that aggregates live job data, scores your resume against real listings, and gives you market intelligence — all in one dashboard.

At its core, HirePilot is built on **[Anakin Wire](https://anakin.io)** — Anakin's Holocron-powered action execution layer. Wire is what makes real-time, multi-source job aggregation possible without building and maintaining individual scrapers for every job board. We fire Wire tasks against Jobicy, RemoteOK, and We Work Remotely in parallel, poll for results, and pipe the unified data into our analytics and matching engine.

**Wire made the hardest part of this project trivial.** What would have been weeks of scraper maintenance is now three lines of task configuration.

---

## Features

### Live Job Discovery (Powered By WIRE)
Pulls real-time listings from three sources simultaneously via Anakin Wire:
- **Jobicy** — global remote jobs with salary, geo, and industry filters
- **RemoteOK** — skill-tagged remote listings with company and apply links
- **We Work Remotely** — category-based remote listings

Jobs are deduplicated, normalized, and ranked by resume match score automatically.

### AI Resume Matching
Upload your resume once. HirePilot uses Groq (Llama 3.3 70B) to:
- Parse your skills, experience, and preferred roles
- Score every job listing against your profile (0–100%)
- Surface gaps between your resume and target roles
- Generate tailored cover letters in seconds

### Market Analytics (Powered By WIRE)
Select a category (Frontend, Backend, AI/ML, DevOps, etc.) and get live intelligence:
- **Trending skills** — technologies appearing most across current job postings
- **Skill pairings** — what employers want alongside React, Python, Docker, etc.
- **Geographic demand** — where hiring is hottest by region
- **Salary benchmarks** — compensation ranges per category
- **Emerging technologies** — skills gaining traction before they go mainstream

### Application Tracker
Kanban-style pipeline to track every application across Saved → Applied → Interview → Rejected → Offer, with match scores and direct apply links.

### Interview Prep
AI-generated interview questions, focus areas, and closing pitches tailored to the specific company and role.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Job aggregation | **Anakin Wire** (Jobicy, RemoteOK, WeWorkRemotely actions) |
| AI / LLM | **Groq** — Llama 3.3 70B for all analysis and generation |
| Backend | Node.js + Express + MongoDB |
| Frontend | React + Vite + Tailwind CSS + Recharts |
| Auth | JWT |
| Deployment | Render (API) + Vercel (frontend) |

---

## Quick Start (Local)

**1. Install dependencies**
```bash
npm run install:all
```

**2. Configure environment**

Create `server/.env`:
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
ANAKIN_API_KEY=your_anakin_key
CLIENT_ORIGIN=http://localhost:5173
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

**3. Run**
```bash
npm run dev
```

Frontend: http://localhost:5173

Backend: http://localhost:5000

---

## API Overview

| Route | Description |
|---|---|
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in |
| `GET /api/auth/me` | Current user |
| `POST /api/ai/resume-analyze` | Parse and analyze resume PDF |
| `POST /api/ai/job-match` | Score a job against resume |
| `POST /api/ai/cover-letter` | Generate cover letter |
| `POST /api/ai/interview-prep` | Generate interview questions |
| `GET /api/applications` | List tracked applications |
| `POST /api/applications` | Add application |
| `PATCH /api/applications/:id` | Update status |
| `POST /api/wire/task` | Fire a Wire action |
| `GET /api/wire/jobs/:id` | Poll Wire task result |
| `POST /api/analytics/market` | Generate market analytics |

---

## Deploy

### Backend → Render
1. New Web Service → point to `server` folder
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all env vars from `server/.env`

### Frontend → Vercel
1. New Project → point to `client` folder
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add `VITE_API_URL=https://your-render-url.onrender.com/api`

---

## Why Anakin Wire?

Job boards don't have open APIs. Building and maintaining scrapers for each platform is fragile, slow, and breaks constantly. Wire gives us a single, reliable execution layer that handles the complexity — we just configure the action, fire the task, and poll for results. It's what made real-time multi-source aggregation feasible to build in a hackathon timeframe.

---

*Built for the Anakin Build-a-thon — HirePilot AI*
