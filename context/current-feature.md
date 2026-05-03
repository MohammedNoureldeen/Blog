# Comments — Create, List, Delete

## Status

In Progress

## Goals

- Create `server/src/modules/comment/` with routes, controller, service, and schema files
- Implement GET /api/v1/posts/:id/comments — public, cursor-paginated, oldest first, 404 on non-existent or soft-deleted posts
- Implement POST /api/v1/posts/:id/comments — authenticated, validate content (non-empty, max 2000 chars), verify published post, return 201 CommentDto
- Implement DELETE /api/v1/comments/:commentId — authenticated, authorize ownerOrAdmin, hard delete
- Add `comment` resource type to authorize middleware
- Register comment routes in app.js

## Notes

- Flat comments — no parentId field
- authorize('comment', 'ownerOrAdmin') must load comment by req.params.commentId and compare userId
- Hard deletes are correct for comments (no dependents)
- GET endpoint must check post is published, not just existence — soft-deleted posts should 404
- CommentDto: { id, content, createdAt, author: { id, username, avatarUrl } }

## History

- Middleware — Auth, Validation, Error Handling: Implemented authenticate (hard auth with JWT, INVALID_TOKEN error codes), optional-auth (soft auth, req.user = null on missing token), authorize (factory with owner/admin/ownerOrAdmin checks using Prisma lookup), validate (Zod wrapper with body/query/params source), async-handler (async error forwarding), error-handler (AppError handling, Prisma P2002→409/P2025→404 mapping, pino logging, production-safe messages); added JSDoc AuthenticatedUser type; fixed app.js middleware order (pino → helmet → cors → json → rateLimit → routes → errorHandler)
- Frontend Setup — React + Vite + Tailwind: Installed dependencies (zustand, @tanstack/react-query, react-hook-form, zod, @tailwindcss/typography, marked, dompurify); created Zustand auth store with persist middleware; updated Axios client with 401 refresh interceptor flow; created API endpoint files (auth, posts, users); built UI components (Button, Input, Card, Avatar, Spinner); created layout components (Navbar, Footer, PageWrapper); added hooks (useAuth, useCurrentUser); set up routing with QueryClientProvider and ProtectedRoute; created all page stubs; implemented content gate UI for PostPage; added sanitized markdown renderer utility (marked + DOMPurify); configured Tailwind v4 with typography plugin
- Project Setup — Monorepo: Initialize npm workspaces with client, server, shared packages; root package.json with workspace config; .gitignore; .env.example; shared JSDoc types; Express skeleton; Vite + React + Tailwind client setup
- Users — Profiles, Follow, Unfollow: Created user module (routes, controller, service, schema) with 8 endpoints — GET /users/:username (public profile with optionalAuth and isFollowing conditional query), PUT /users/me (update profile with transactional upsert of author_profiles), DELETE /users/me (hard delete with cascade), GET /users/:username/posts (cursor-paginated published posts), GET /users/:username/followers and /following (cursor-paginated follow lists), POST /users/:username/follow (with self-follow guard and ALREADY_FOLLOWING check), DELETE /users/:username/follow (with NOT_FOLLOWING check); Zod validation for profile updates (socialLinks as optional object with twitter/github/linkedin URLs), username params, and pagination queries; registered routes at /api/v1/users in app.js