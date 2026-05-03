# Current Feature — Users: Profiles, Follow, Unfollow

## Status

In Progress

## Goals

- Create `server/src/modules/user/` module (routes, controller, service, schema)
- Implement GET /api/v1/users/:username — public profile with optional auth
- Implement PUT /api/v1/users/me — update own profile (username, avatar, bio, website, socialLinks) with transactional upsert of author_profiles
- Implement DELETE /api/v1/users/me — hard delete with cascade
- Implement GET /api/v1/users/:username/posts — cursor-paginated published posts
- Implement GET /api/v1/users/:username/followers — paginated followers list
- Implement GET /api/v1/users/:username/following — paginated following list
- Implement POST /api/v1/users/:username/follow — follow a user (with self-follow guard)
- Implement DELETE /api/v1/users/:username/follow — unfollow a user

## Notes

- `isFollowing` field requires conditional query based on `req.user` (false for guests)
- Route ordering matters: register `/me` before `/:username` to avoid "me" matching as username param
- `socialLinks` validated as Zod optional object with twitter/github/linkedin URL fields
- Uses `optionalAuth` middleware for public endpoints, `authenticate` for mutating ones
- Update `users` table and upsert `author_profiles` in a single Prisma transaction on PUT /me
- Cascade deletes should handle related data on DELETE /me

## History

- Middleware — Auth, Validation, Error Handling: Implemented authenticate (hard auth with JWT, INVALID_TOKEN error codes), optional-auth (soft auth, req.user = null on missing token), authorize (factory with owner/admin/ownerOrAdmin checks using Prisma lookup), validate (Zod wrapper with body/query/params source), async-handler (async error forwarding), error-handler (AppError handling, Prisma P2002→409/P2025→404 mapping, pino logging, production-safe messages); added JSDoc AuthenticatedUser type; fixed app.js middleware order (pino → helmet → cors → json → rateLimit → routes → errorHandler)
- Frontend Setup — React + Vite + Tailwind: Installed dependencies (zustand, @tanstack/react-query, react-hook-form, zod, @tailwindcss/typography, marked, dompurify); created Zustand auth store with persist middleware; updated Axios client with 401 refresh interceptor flow; created API endpoint files (auth, posts, users); built UI components (Button, Input, Card, Avatar, Spinner); created layout components (Navbar, Footer, PageWrapper); added hooks (useAuth, useCurrentUser); set up routing with QueryClientProvider and ProtectedRoute; created all page stubs; implemented content gate UI for PostPage; added sanitized markdown renderer utility (marked + DOMPurify); configured Tailwind v4 with typography plugin
- Project Setup — Monorepo: Initialize npm workspaces with client, server, shared packages; root package.json with workspace config; .gitignore; .env.example; shared JSDoc types; Express skeleton; Vite + React + Tailwind client setup