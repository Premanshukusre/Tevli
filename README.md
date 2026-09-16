# Tevli

> A real-time collaborative project management platform for teams.

Tevli is a full-stack collaborative project management application designed to help teams organize work across workspaces, projects, tasks, comments, activity, and notifications.

The application is built with a production-minded architecture while keeping the codebase understandable, maintainable, and suitable for a portfolio-level software engineering project.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Product Highlights](#product-highlights)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Core Data Model](#core-data-model)
- [Authentication & Authorization](#authentication--authorization)
- [Real-Time Collaboration](#real-time-collaboration)
- [Security](#security)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Production Build](#production-build)
- [Quality Assurance](#quality-assurance)
- [Current Status](#current-status)
- [Known Limitation](#known-limitation)
- [Roadmap](#roadmap)
- [Engineering Principles](#engineering-principles)
- [Why Tevli](#why-tevli)
- [Author](#author)
- [License](#license)

---

## Overview

Tevli is a web-based collaborative project management platform built around the idea of making team project management simple, structured, and real-time.

Users can create workspaces, organize projects, manage team membership, create and assign tasks, collaborate through comments, track project activity, and receive real-time notifications.

The application follows a REST-first architecture where the backend and PostgreSQL database remain the source of truth. Socket.IO is used to synchronize relevant changes between connected users without requiring manual page refreshes.

### Core Product Areas

- Workspaces
- Projects
- Members and permissions
- Kanban task management
- Comments
- Activity history
- Notifications
- Recent projects
- Starred projects
- Account settings
- Real-time collaboration

---

## Key Features

### Authentication

- Email and password authentication
- Secure password hashing
- JWT-based sessions
- HTTP-only authentication cookies
- Protected application routes
- Logout and session handling
- Secure password change flow

### Workspace Management

- Create workspaces
- Rename workspaces
- Delete workspaces
- Workspace administration
- Workspace member management
- Workspace roles
- Admin protection rules
- Safe workspace deletion and dependent-data cleanup

### Project Management

- Create projects
- Rename projects
- Delete projects
- Project member management
- Project-level authorization
- Project activity
- Recent project tracking
- Starred project tracking

### Kanban & Task Management

- Create tasks
- Edit tasks
- Delete tasks
- Move tasks between statuses
- Assign tasks to members
- Add due dates
- Add descriptions
- Open detailed task views
- Track task activity
- View task history

### Comments & Collaboration

- Add comments
- Edit comments
- Delete comments
- Real-time comment synchronization
- Real-time task synchronization
- Activity updates across connected users

### Notifications

- Real-time notification updates
- Unread notification count
- Task assignment notifications
- Comment-related notifications
- Mark notifications as read
- Direct notification deep links
- Automatic task opening from relevant notifications
- Graceful handling of deleted or inaccessible resources

### Navigation & Productivity

- Responsive application shell
- Resizable sidebar
- Collapsible sidebar
- Workspace switcher
- Global Create menu
- My Tasks
- Recent projects
- Starred projects
- Notifications center
- Account Settings
- Help drawer
- Context-aware creation flows
- Deep-linked task navigation

### Responsive Experience

Tevli is designed to work across:

- Desktop
- Laptop
- Tablet
- Mobile

Responsive behavior includes:

- Mobile navigation drawer
- Responsive dialogs
- Responsive task views
- Adaptive workspace/project layouts
- Accessible mobile navigation

---

## Product Highlights

### Real-Time Collaboration

Multiple users can work inside the same project while seeing relevant changes without manually refreshing the page.

For example:

```text
User A creates a task
        ↓
Backend persists the task
        ↓
Socket.IO emits task event
        ↓
User B receives the event
        ↓
User B's interface updates

The same approach is used for tasks, comments, activity, and notifications.

User-Scoped Recent & Starred Projects

Recent and starred projects are associated with the authenticated user's project membership.

This means:

User A can star a project
User B does not automatically inherit User A's starred state
Removing project membership naturally removes the associated user/project preference
Notification Deep Linking

Notifications contain explicit project and task targets where appropriate.

For example:

Task assigned
     ↓
Notification clicked
     ↓
Project opens
     ↓
Task detail opens automatically

This provides a direct workflow from an event to the relevant work item.

Tech Stack
Frontend
React
TypeScript
Vite
Tailwind CSS
React Router
TanStack Query
Backend
Node.js
Express
TypeScript
Socket.IO
Zod
bcrypt
JSON Web Tokens
Database
PostgreSQL
Prisma ORM
Testing
Vitest
Vitest Mock Extended
Backend unit/integration-oriented tests
Browser-based black-box QA
Security
HTTP-only cookies
JWT authentication
CSRF protection
CORS
Helmet
Rate limiting
Zod validation
Resource-level authorization
Socket.IO authentication and room authorization
Architecture

Tevli uses a modular monolith architecture.

                         ┌──────────────────────────┐
                         │       Tevli Frontend     │
                         │ React + TypeScript +     │
                         │ Vite + Tailwind CSS      │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────┴─────────────┐
                         │                          │
                     REST API                  Socket.IO
                         │                          │
                         ▼                          ▼
              ┌────────────────────┐      ┌───────────────────┐
              │    Express API     │      │ Project Rooms    │
              │ Authentication     │      │ Real-Time Events │
              │ Authorization      │      │ & Synchronization│
              │ Controllers        │      └───────────────────┘
              │ Services           │
              │ Validation         │
              └──────────┬─────────┘
                         │
                       Prisma
                         │
                         ▼
                ┌──────────────────┐
                │   PostgreSQL     │
                │ Source of Truth  │
                └──────────────────┘
Request Flow
Client
   │
   │ REST request
   ▼
Express API
   │
   ├── Authentication
   ├── Authorization
   ├── Input validation
   ├── Business logic
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
   │
   └── Persistent state

Successful mutation
   │
   ▼
Socket.IO event
   │
   ▼
Relevant project room
   │
   ▼
Connected clients
Architectural Principle

REST and PostgreSQL are the source of truth.

Socket.IO is used for real-time synchronization and notifications rather than replacing persistent database operations.

Core Data Model

The main entities in Tevli are:

User
 │
 ├── WorkspaceMember
 │        │
 │        └── Workspace
 │               │
 │               └── Project
 │                      │
 │                      ├── ProjectMember
 │                      ├── Task
 │                      │    ├── Comment
 │                      │    └── Activity
 │                      │
 │                      └── Notifications
 │
 └── User-specific Project Preferences
        ├── Recent
        └── Starred
Major Entities
Entity	Purpose
User	Authentication and user identity
Workspace	Top-level organization
WorkspaceMember	Workspace membership and role
Project	Work container inside a workspace
ProjectMember	Project membership, role, and project-specific user state
Task	Unit of work
Comment	Discussion attached to a task
ActivityLog	Project/task activity history
Notification	User-facing event and notification record
Authentication & Authorization

Tevli uses authentication and authorization at multiple levels.

Authentication

Protected routes require a valid authenticated session.

The authentication architecture uses:

JWT
HTTP-only cookies
Password hashing
Protected backend routes
Workspace Authorization

Workspace access is determined by workspace membership.

Workspace roles include:

ADMIN
MEMBER

Administrative operations are restricted appropriately.

Project Authorization

Project access is controlled by project membership.

Project-level administrative operations require appropriate privileges.

Server-Side Enforcement

Authorization is enforced on the backend.

Frontend visibility is treated as a UX feature, not as a security boundary.

A user who attempts to directly call a protected endpoint without the required authorization should still be rejected by the backend.

Real-Time Collaboration

Tevli uses Socket.IO for collaborative synchronization.

Project-specific rooms are used so that users receive events relevant to projects they are currently viewing.

Example Events
Task created
Task updated
Task moved
Task deleted
Comment created
Comment updated
Comment deleted
Activity created
Notification updates
Real-Time Design

The backend performs the actual database mutation first.

After a successful mutation, the appropriate real-time event is emitted.

This prevents Socket.IO state from becoming an independent source of truth.

Security

Security is treated as an important part of the application's architecture.

Current protections include:

HTTP-only authentication cookies
JWT-based sessions
bcrypt password hashing
CSRF protection
CORS configuration
Helmet security headers
API rate limiting
Zod request validation
Workspace-level authorization
Project-level authorization
Resource-level access checks
Socket.IO authentication
Project-room authorization
Notification target authorization
Secure destructive-operation confirmation
Environment secrets excluded from Git

A dedicated security-hardening review is part of the final release process before public production deployment.

Project Structure
Tevli/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── ...
│   │
│   └── package.json
│
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   └── ...
│   │
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md

The internal directory structure may evolve as Tevli continues to develop.

Getting Started
Prerequisites

Make sure the following are installed:

Node.js
npm
PostgreSQL
Clone the Repository
git clone https://github.com/Premanshukusre/Tevli.git
cd Tevli
Install Dependencies

Install the project dependencies according to the root/frontend/backend package configuration.

npm install

If the project setup requires separate installation inside frontend or backend, install dependencies there as well.

Environment Variables

Tevli uses environment variables for configuration and secrets.

Do not commit real .env files.

Typical configuration includes values for:

DATABASE_URL
JWT_SECRET

Additional environment variables may be required depending on the deployment environment.

Use the example environment files provided by the project when available.

Important

Never commit:

.env
.env.local
backend/.env
frontend/.env

Secrets must remain outside version control.

Database Setup

Tevli uses PostgreSQL with Prisma.

Create a PostgreSQL database and configure the DATABASE_URL.

Then synchronize the schema:

cd backend
npx prisma db push

Generate the Prisma client when needed:

npx prisma generate
Running the Application
Start the Backend

From the project root:

npm run dev:backend

The backend runs locally on:

http://localhost:5000
Start the Frontend

In a separate terminal:

npm run dev:frontend

The frontend runs locally on:

http://localhost:5173

Open the frontend URL in your browser.

Testing

The backend uses Vitest.

From the backend directory:

npm test

The test suite covers important areas such as:

authentication
authorization
task operations
project operations
workspace operations
membership behavior
notification behavior
real-time-related backend logic
Production Build

Build the frontend with:

npm run --prefix frontend build

The production build should complete without TypeScript or bundling errors before release.

Quality Assurance

Tevli has gone through multiple levels of verification.

Static Regression Audit

The codebase was inspected for:

broken routes
API contract mismatches
authorization issues
persistence problems
real-time synchronization issues
dead handlers
incomplete features
loading/error-state issues
Black-Box Browser QA

The running application was tested across:

Authentication
Navigation
Workspaces
Workspace settings
Workspace members
Projects
Project settings
Project members
Kanban/task workflows
Comments
Activity
Notifications
Account settings
Recent
Starred
Global Create
Help
Deep links
Responsive layouts
Two-user collaboration
QA Result

The V1.1 baseline reached:

P0 Critical Issues   : 0
P1 Major Issues      : 0
P2 Issues            : 0

A task-search limitation remains intentionally outside the V1.1 scope.

Current Status
Tevli V1.1 — Complete
Authentication             ✅
Workspaces                 ✅
Workspace Members          ✅
Workspace Settings         ✅
Projects                   ✅
Project Members            ✅
Project Settings           ✅
Kanban / Tasks             ✅
Task Assignment            ✅
Due Dates                  ✅
Comments                   ✅
Activity / History         ✅
Real-Time Collaboration    ✅
Notifications              ✅
Notification Deep Links    ✅
Account Settings           ✅
Recent                     ✅
Starred                    ✅
Global Create              ✅
Workspace Creation         ✅
Project Creation           ✅
Help                       ✅
Responsive UI              ✅
Static QA                  ✅
Black-Box Browser QA       ✅
GitHub Baseline            ✅

Current GitHub repository:

https://github.com/Premanshukusre/Tevli

Known Limitation
Global Search

The current V1.1 search experience indexes:

Workspaces
Projects

Task-level search is intentionally not included in the V1.1 search scope.

This is an accepted product limitation, not a broken feature.

Roadmap
V1.1
Core project management
Real-time collaboration
Workspace/project administration
Kanban task management
Comments and activity
Notifications
Recent and Starred
Account Settings
Responsive UI
Initial security baseline
Comprehensive QA
Future Improvements

Potential future enhancements include:

Task-level global search
Labels
Subtasks
List view
Calendar view
Attachments
Templates
Project duplication
Timeline/Gantt view
Automation
Advanced reporting
Third-party integrations
Richer permission systems
AI-assisted project workflows

These features are intentionally outside the current V1.1 scope.

Engineering Principles
REST as the Source of Truth

All persistent operations are performed through the backend API and database.

Real-Time as Synchronization

Socket.IO is used to distribute successful state changes to connected clients.

Server-Side Authorization

Security decisions are enforced by the backend rather than relying on UI restrictions.

Explicit, Real Functionality

Visible product controls should correspond to actual implemented behavior rather than simulated actions.

Multi-User First

The system is designed to support multiple collaborators rather than being limited to a two-user workflow.

Maintainable Architecture

Tevli uses a modular monolith architecture to keep the system understandable while still providing clear separation between frontend, API, business logic, database access, and real-time communication.

Why Tevli?

Tevli was built as a full-stack engineering project focused on the practical challenges of building a collaborative SaaS-style application.

The project demonstrates experience with:

React and TypeScript
REST API design
PostgreSQL data modeling
Prisma ORM
Authentication
Authorization
Secure session handling
Real-time communication
WebSocket room management
Client-side caching
Multi-user collaboration
Error and loading states
Responsive UI design
Automated testing
Browser QA
Git-based development workflow

The goal was to build more than a simple Kanban board and instead understand how the systems required by a modern collaborative product work together.

Author
Premanshu Kusre

GitHub:

https://github.com/Premanshukusre

Tevli:

https://github.com/Premanshukusre/Tevli

License

No open-source license has currently been declared for this repository.

If the project is later released under an open-source license, this section will be updated accordingly.


One thing I deliberately kept out is **deployment instructions and claims about production hosting**, because Te
