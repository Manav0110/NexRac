# NexRec

NexRec is a full-stack recommendation platform that helps users discover content across multiple domains from a single interface. It combines a React + Vite frontend with an Express backend, supports JWT-based authentication, includes onboarding-driven preference capture, and serves personalized recommendations for movies, music, podcasts, videos, and news.

## Features

- User registration and login with JWT authentication
- Personalized onboarding flow to collect recommendation preferences
- Multi-page React app with home, explore, search, and profile views
- Recommendation engine with feedback support
- External content integrations for TMDB, YouTube, NewsAPI, and iTunes
- Health check endpoint to verify API status and configured keys

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, CORS, dotenv
- Auth: JSON Web Tokens, bcryptjs
- Data: Local JSON user store plus API-backed content sources

## Project Structure

```text
NexRac/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # Reusable UI pieces
│   │   ├── context/        # User/auth state management
│   │   └── pages/          # Route-level screens
├── server/                 # Express backend
│   ├── data/               # Mock data and JSON user storage
│   ├── engine/             # Recommendation logic
│   └── routes/             # Auth, content, and recommendation APIs
├── start.sh                # Convenience script to install deps and run both apps
└── package.json            # Root scripts for full project workflow
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/Manav0110/NexRac.git
cd NexRac
npm install
npm run install:all
```

### Environment Variables

Create `server/.env` from `server/.env.example`.

```env
TMDB_API_KEY=your_tmdb_api_key_here
YOUTUBE_API_KEY=your_youtube_api_key_here
NEWS_API_KEY=your_newsapi_key_here
JWT_SECRET=your_strong_secret_here
PORT=5000
```

Notes:

- `iTunes` works without an API key.
- If `JWT_SECRET` is not set, the server falls back to a default development secret. Set your own secret before deploying.

## Running the Project

### Option 1: Run both apps from the root

```bash
npm run dev
```

This installs client and server dependencies, then starts both services together.

### Option 2: Use the helper script

```bash
chmod +x start.sh
./start.sh
```

### Option 3: Start frontend and backend separately

```bash
# terminal 1
npm run dev:server

# terminal 2
npm run dev:client
```

## Default Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health Check: `http://localhost:5000/api/health`

## Available Scripts

From the project root:

- `npm run install:all` - install server and client dependencies
- `npm run dev:server` - start the backend in watch mode
- `npm run dev:client` - start the Vite frontend
- `npm run dev` - install dependencies and run both apps concurrently
- `npm run start` - run frontend and backend concurrently

From `client/`:

- `npm run dev` - start the Vite dev server
- `npm run build` - build the production frontend
- `npm run preview` - preview the production build

From `server/`:

- `npm run dev` - run the backend with `node --watch`
- `npm run start` - run the backend normally

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/preferences`
- `PUT /api/auth/profile`

### Recommendations

- `POST /api/recommendations`
- `POST /api/recommendations/feedback`

### Utility

- `GET /api/health`

### Content

- `GET /api/content/...`
- `GET /api/real/...`

The exact content routes are defined under `server/routes/` and are designed to serve both mock and real API-backed data.

## Current Storage Model

This project currently stores users in `server/data/users.json`, which is convenient for development and demos. For production use, replace this with a real database and move secrets to a secure environment management setup.

## Future Improvements

- Replace JSON-based user storage with MongoDB or PostgreSQL
- Add role-based access control and refresh tokens
- Persist recommendation feedback for better personalization
- Add tests for API routes and recommendation logic
- Add deployment configuration for frontend and backend hosting

## License

This project is open for learning and development use. Add a formal license if you plan to distribute it publicly.
