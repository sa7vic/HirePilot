# HirePilot AI

An AI-powered job assistant for students and freshers. Track applications, analyze resumes, match jobs, and generate cover letters with Groq. Wire (Anakin Holocron) integration is included for action discovery and task execution.

## Quick start

1. Install dependencies

```
npm run install:all
```

2. Configure environment variables

Create these files and add your keys/values:

- server/.env (copy from server/.env.example)
- client/.env (copy from client/.env.example)

3. Run locally

```
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## API overview

- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- AI: `/api/ai/resume-analyze`, `/api/ai/job-match`, `/api/ai/cover-letter`
- Applications: `/api/applications`
- Wire: `/api/wire/search`, `/api/wire/task`, `/api/wire/jobs/:id`

## Deploy (Render + Vercel)

### Backend (Render)

1. Create a new Web Service from the `server` folder.
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables from server/.env.example.

### Frontend (Vercel)

1. Import the `client` folder as a new project.
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add `VITE_API_URL` pointing to your Render API URL (e.g. `https://your-service.onrender.com/api`).

## Notes

- Wire uses the Anakin API key in `ANAKIN_API_KEY`.
- Groq is used for all AI analysis and generation.
- Job discovery uses Wire catalogs for Jobicy, RemoteOK, and We Work Remotely.
