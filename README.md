# Content Platform — Multi-Author Blog

A multi-author content platform (think Medium / Dev.to) where registered users can write and publish posts, build a following, and engage with others through comments and likes.

## Features

- **Multi-author platform** — any registered user can publish posts
- **Block-based content** — posts use a JSONB block structure (markdown, plaintext, images)
- **Personalized feed** — follow authors and get a curated feed
- **Content gate** — unauthenticated users see a truncated preview (~300 words)
- **Comments & likes** — engage with content
- **JWT auth** — access + refresh token pattern with true logout/revocation
- **Cursor pagination** — all list endpoints use cursor-based pagination
- **Image uploads** — Cloudinary integration for media storage + CDN

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript
- **ORM**: Prisma 5
- **Database**: PostgreSQL (local dev) / Neon (production)
- **Validation**: Zod
- **Auth**: JWT (access + refresh tokens)
- **Media**: Cloudinary / Cloudflare R2
- **File uploads**: Multer
- **Logging**: Pino

### Frontend
- **Framework**: React (Vite)
- **Language**: JavaScript
- **Styling**: Tailwind CSS
- **HTTP client**: Axios
- **State**: Zustand (auth) + TanStack Query (server state)

## Monorepo Structure

```
/
├── client/       ← React frontend
├── server/       ← Express backend
├── shared/       ← Shared JavaScript types (JSDoc)
├── .env          ← Never commit
└── .env.example  ← Always commit
```

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL (local or Neon account for production)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in `.env` with your values (see Environment Variables below).

4. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development servers**
   ```bash
   cd ..
   npm run dev
   ```

   This starts both the client and server concurrently.

   - **API**: `http://localhost:3000/api/v1`
   - **Client**: `http://localhost:5173`

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend URL (for CORS) |
| `DATABASE_URL` | PostgreSQL connection URL (with pooling) |
| `DIRECT_URL` | Direct PostgreSQL connection (for Prisma migrations) |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/posts` | Global feed (all published posts) |
| `GET` | `/api/v1/feed` | Personalized feed (followed users, auth required) |

## Response Format

All API responses follow a consistent envelope:

```json
// Success
{ "success": true, "data": {}, "meta": {} }

// Error
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

## Pagination

All list endpoints use cursor-based pagination:

```
GET /api/v1/posts?cursor=<id>&limit=10
```

- Default limit: 10, Max limit: 50
- Response includes `meta: { cursor, hasMore, limit }`

## Auth Strategy

- **Access token**: sent via `Authorization: Bearer <token>` header (expires in 15 min)
- **Refresh token**: sent in request body to `POST /auth/refresh` (expires in 7 days)
- Tokens stored in `localStorage` on the client
- Three middleware variants: `authenticate` (hard), `optionalAuth` (soft), `authorize` (ownership/role)

## User Roles

| Role | Permissions |
|---|---|
| `user` | Read, write, comment, like, follow |
| `admin` | All user permissions + delete any post or comment |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run client and server in development mode |
| `npm run build` | Build all packages |
| `npm run lint` | Run ESLint across all packages |

## License

ISC
