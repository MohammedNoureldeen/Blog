# Current Feature: Comments — Create, List, Delete

## Status

In Progress

## Goals

- Create comment module with routes, controller, service, and schema
- Implement GET /api/v1/posts/:id/comments — public, cursor-paginated, oldest-first, 404 on non-published posts
- Implement POST /api/v1/posts/:id/comments — authenticated, validates content 1-2000 chars, verifies published post, returns 201
- Implement DELETE /api/v1/comments/:commentId — authenticated, authorize ownerOrAdmin, hard delete
- Define CommentDto with id, content, createdAt, and author (id, username, avatarUrl)

## Notes

- Comments are flat — no parentId field in schema
- authorize('comment', 'ownerOrAdmin') middleware needs to load comment by req.params.commentId to compare userId
- Hard deletes are correct for comments (no orphan risk since comments have no dependents)
- For GET endpoint, comments on soft-deleted posts should still 404 — check post status, not just existence
- References: coding-standards.md, spec/03-middleware.md, spec/05-posts.md

## History

- Middleware — Auth, Validation, Error Handling: Implemented authenticate (hard auth with JWT, INVALID_TOKEN error codes), optional-auth (soft auth, req.user = null on missing token), authorize (factory with owner/admin/ownerOrAdmin checks using Prisma lookup), validate (Zod wrapper with body/query/params source), async-handler (async error forwarding), error-handler (AppError handling, Prisma P2002→409/P2025→404 mapping, pino logging, production-safe messages); added JSDoc AuthenticatedUser type; fixed app.js middleware order (pino → helmet → cors → json → rateLimit → routes → errorHandler)
- Frontend Setup — React + Vite + Tailwind: Installed dependencies (zustand, @tanstack/react-query, react-hook-form, zod, @tailwindcss/typography, marked, dompurify); created Zustand auth store with persist middleware; updated Axios client with 401 refresh interceptor flow; created API endpoint files (auth, posts, users); built UI components (Button, Input, Card, Avatar, Spinner); created layout components (Navbar, Footer, PageWrapper); added hooks (useAuth, useCurrentUser); set up routing with QueryClientProvider and ProtectedRoute; created all page stubs; implemented content gate UI for PostPage; added sanitized markdown renderer utility (marked + DOMPurify); configured Tailwind v4 with typography plugin
- Project Setup — Monorepo: Initialize npm workspaces with client, server, shared packages; root package.json with workspace config; .gitignore; .env.example; shared JSDoc types; Express skeleton; Vite + React + Tailwind client setup
- Users — Profiles, Follow, Unfollow: Created user module (routes, controller, service, schema) with 8 endpoints — GET /users/:username (public profile with optionalAuth and isFollowing conditional query), PUT /users/me (update profile with transactional upsert of author_profiles), DELETE /users/me (hard delete with cascade), GET /users/:username/posts (cursor-paginated published posts), GET /users/:username/followers and /following (cursor-paginated follow lists), POST /users/:username/follow (with self-follow guard and ALREADY_FOLLOWING check), DELETE /users/:username/follow (with NOT_FOLLOWING check); Zod validation for profile updates (socialLinks as optional object with twitter/github/linkedin URLs), username params, and pagination queries; registered routes at /api/v1/users in app.js
- Comments — Create, List, Delete: Created comment module (routes, controller, service, schema) with 3 endpoints — GET /posts/:id/comments (public, cursor-paginated oldest-first, 404 on non-published posts), POST /posts/:id/comments (authenticated, validates content 1-2000 chars, verifies published post, returns 201), DELETE /comments/:commentId (authenticated, authorize ownerOrAdmin, hard delete); extended authorize middleware with paramMap for commentId param resolution; registered postCommentRoutes at /api/v1/posts and commentRoutes at /api/v1/comments in app.js
