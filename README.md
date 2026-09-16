# Tevli

Real-time collaborative project-management web application.

## Setup

1. Run `npm run install:all` in the root directory to install all dependencies.
2. Copy `.env.example` to `.env` in both `frontend` and `backend` directories.
3. Run `npm run dev` in the root directory to start both servers.

## Architecture

- Frontend: React, Vite, Tailwind CSS, TanStack Query
- Backend: Node.js, Express, TypeScript
- Real-time: Socket.IO (pending Phase 7)
- Database: PostgreSQL with Prisma (pending Phase 2)
