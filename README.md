# 🚀 Tevli

<p align="center">
  <strong>Real-time collaborative project management for modern teams.</strong>
</p>

<p align="center">
  <a href="https://github.com/Premanshukusre/Tevli">
    <img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github" alt="GitHub Repository" />
  </a>
  <img src="https://img.shields.io/badge/Status-V1.1%20Complete-10B981?style=for-the-badge" alt="Project Status" />
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react" alt="Frontend" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js" alt="Backend" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Socket.IO-Real--Time-010101?style=flat-square&logo=socket.io" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-UI-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vitest-Testing-6E9F18?style=flat-square&logo=vitest" alt="Vitest" />
</p>

---

## ✨ What is Tevli?

**Tevli** is a full-stack, real-time collaborative project management platform built for teams that need a structured way to organize projects, tasks, communication, and progress.

It combines:

- 🏢 **Workspaces** for team organization
- 📁 **Projects** for structured work
- 📋 **Kanban tasks** for execution
- 💬 **Comments** for collaboration
- 📝 **Activity history** for visibility
- 🔔 **Real-time notifications** for important events
- ⭐ **Starred projects** for quick access
- 🕘 **Recent projects** for fast navigation
- 👥 **Multi-user collaboration** with role-based access control

The application is designed with a **production-minded engineering approach** while keeping the architecture understandable, maintainable, and suitable for a software engineering portfolio project.

---

# 🎯 Product Vision

The goal of Tevli is simple:

> **Give teams one focused place to organize work, collaborate in real time, and understand what is happening across their projects.**

Instead of treating project management as only a task board, Tevli brings together:

```text
Workspace
    ↓
Projects
    ↓
Tasks
    ├── Assignment
    ├── Due Dates
    ├── Comments
    └── Activity
            ↓
      Notifications
````

This creates a connected workflow rather than a collection of unrelated screens.

---

# 🧩 Core Features

## 🔐 Authentication & Account Management

Tevli provides a complete authenticated application experience.

* Email/password authentication
* Password hashing with bcrypt
* JWT-based authentication
* HTTP-only session cookies
* Protected frontend routes
* Protected backend routes
* Logout/session handling
* Password change
* Account Settings
* Profile name updates

---

## 🏢 Workspace Management

A workspace represents a team's larger working environment.

### Workspace capabilities

* Create workspaces
* Rename workspaces
* Delete workspaces
* Workspace administration
* Workspace member management
* Admin/member roles
* Protection against removing the final administrator
* Safe workspace deletion and dependent-data cleanup

### Workspace concept

```text
Workspace
├── Members
├── Projects
├── Settings
└── Activity
```

---

## 📁 Project Management

Projects organize work within a workspace.

### Project capabilities

* Create projects
* Rename projects
* Delete projects
* Manage project members
* Project-level authorization
* Project activity
* Star projects
* Recent project tracking

```text
Workspace
├── Project A
├── Project B
└── Project C
```

---

## 📋 Kanban Task Management

Tasks are the main units of work inside projects.

### Task capabilities

* Create tasks
* Edit tasks
* Delete tasks
* Move tasks between statuses
* Assign tasks to users
* Add due dates
* Add descriptions
* Open detailed task views
* View task history
* Track task activity

### Kanban workflow

```text
┌──────────────┐
│     TODO     │
├──────────────┤
│ Task A       │
│ Task B       │
└──────────────┘

┌──────────────┐
│ IN PROGRESS  │
├──────────────┤
│ Task C       │
└──────────────┘

┌──────────────┐
│     DONE     │
├──────────────┤
│ Task D       │
└──────────────┘
```

---

## 💬 Comments & Activity

Teams can collaborate directly inside tasks.

### Comments

* Add comments
* Edit comments
* Delete comments
* Real-time comment synchronization

### Activity

Tevli records meaningful project actions such as:

* Task creation
* Task movement
* Assignment
* Task updates
* Task deletion
* Comments

This provides a history of what happened inside a project.

---

## 🔔 Real-Time Notifications

Notifications keep users informed about relevant changes.

Supported notification scenarios include:

* Task assignments
* Comment-related events
* Unread notification count
* Read/unread state
* Real-time notification updates
* Direct notification navigation

### Notification deep linking

When a notification targets a specific task:

```text
Notification
     ↓
Project opens
     ↓
Task is identified
     ↓
Task details open automatically
```

This removes unnecessary navigation steps.

---

## ⭐ Starred Projects

Users can star projects they access frequently.

Starred state is user-specific.

For example:

```text
User A → Project X → ⭐
User B → Project X → ☆
```

One user's starred state does not automatically affect another user's view.

---

## 🕘 Recent Projects

Tevli tracks recently accessed projects to make navigation faster.

Recent projects are also user-specific and persist through the backend.

---

## 🧭 Productivity & Navigation

Tevli includes a modern application shell designed for fast navigation.

### Navigation features

* Workspace switcher
* Resizable sidebar
* Collapsible sidebar
* Home
* My Tasks
* Recent
* Starred
* Notifications
* Global Create
* Profile menu
* Account Settings
* Help drawer

---

## 🆘 Built-in Help

Tevli includes a lightweight help drawer containing practical guidance for:

* Workspaces & Projects
* Tasks & Kanban
* Collaboration
* Keyboard shortcuts

It can be opened directly from the navigation bar.

---

# 👥 Multi-User Collaboration

Tevli is designed for **multiple users**, not a fixed two-user demo.

Users can have different levels of access based on workspace and project membership.

Example:

```text
Workspace
│
├── Admin
│
├── Member A
│
├── Member B
│
└── Member C
```

Project membership is separately controlled where appropriate.

This allows teams to collaborate without giving every user unrestricted access.

---

# ⚡ Real-Time Collaboration Architecture

Tevli uses **Socket.IO** for real-time synchronization.

The important architectural rule is:

> **REST + PostgreSQL are the source of truth. Socket.IO is the synchronization layer.**

### Example

```text
User A
  │
  │ Create Task
  ▼
Express API
  │
  ├── Validate
  ├── Authorize
  ├── Persist
  ▼
PostgreSQL
  │
  └── Success
        │
        ▼
   Socket.IO Event
        │
        ▼
Project Room
        │
        ▼
User B
```

This prevents WebSocket state from becoming an independent source of truth.

---

# 🏗️ Architecture

Tevli follows a **modular monolith** architecture.

```text
                         ┌─────────────────────────────┐
                         │        Tevli Frontend       │
                         │                             │
                         │ React                       │
                         │ TypeScript                  │
                         │ Vite                        │
                         │ Tailwind CSS                │
                         │ React Router                │
                         │ TanStack Query              │
                         └──────────────┬──────────────┘
                                        │
                           ┌────────────┴────────────┐
                           │                         │
                           │ REST API                │ Socket.IO
                           │                         │
                           ▼                         ▼
                 ┌──────────────────────┐   ┌─────────────────────┐
                 │    Express Server    │   │   Project Rooms    │
                 │                      │   │                     │
                 │ Authentication       │   │ Real-time Events    │
                 │ Authorization        │   │ Synchronization     │
                 │ Validation           │   │ Notifications       │
                 │ Controllers          │   └─────────────────────┘
                 │ Services             │
                 └──────────┬───────────┘
                            │
                          Prisma
                            │
                            ▼
                   ┌───────────────────┐
                   │    PostgreSQL     │
                   │  Source of Truth  │
                   └───────────────────┘
```

---

# 🔄 Request Flow

For a normal mutation:

```text
Client
  │
  │ HTTP request
  ▼
Express
  │
  ├── Authentication
  ├── Authorization
  ├── Validation
  └── Business Logic
          │
          ▼
       Prisma
          │
          ▼
     PostgreSQL
```

After a successful mutation:

```text
Database mutation
       ↓
Socket.IO event
       ↓
Relevant project room
       ↓
Connected clients
       ↓
React Query cache/state update
```

---

# 🗃️ Core Data Model

The primary entities are:

| Entity            | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `User`            | Authentication and user identity                           |
| `Workspace`       | Top-level team organization                                |
| `WorkspaceMember` | Workspace membership and roles                             |
| `Project`         | Work container inside a workspace                          |
| `ProjectMember`   | Project membership, roles, and user-specific project state |
| `Task`            | Unit of work                                               |
| `Comment`         | Task discussion                                            |
| `ActivityLog`     | Project/task activity history                              |
| `Notification`    | User-facing event information                              |

### Relationship overview

```text
User
 │
 ├── WorkspaceMember
 │       │
 │       └── Workspace
 │              │
 │              └── Project
 │                     │
 │                     ├── ProjectMember
 │                     ├── Task
 │                     │    ├── Comment
 │                     │    └── Activity
 │                     │
 │                     └── Notifications
 │
 └── User-specific Project State
        ├── Recent
        └── Starred
```

---

# 🔒 Authentication & Authorization

Tevli uses multiple authorization boundaries.

## Authentication

Protected routes require a valid authenticated session.

Authentication uses:

* JWT
* HTTP-only cookies
* Password hashing
* Protected backend routes

## Workspace Authorization

Workspace access depends on workspace membership.

Roles:

* `ADMIN`
* `MEMBER`

Administrative operations are protected accordingly.

## Project Authorization

Project access depends on project membership.

Project administration is separately controlled.

## Important Security Principle

Frontend visibility is **not** considered a security boundary.

A user should not be able to bypass authorization simply by manually calling an API endpoint.

Authorization is enforced by the backend.

---

# 🛡️ Security

Tevli already includes several security-oriented protections:

* HTTP-only authentication cookies
* JWT authentication
* bcrypt password hashing
* CSRF protection
* CORS configuration
* Helmet security headers
* Rate limiting
* Zod request validation
* Workspace authorization
* Project authorization
* Resource-level authorization
* Socket.IO authentication
* Project-room authorization
* Notification target authorization
* Protected destructive operations
* Secrets excluded from Git

A dedicated security-hardening phase will be performed before public production deployment.

---

# 🧪 Testing & Quality Assurance

Tevli has gone through both static and runtime validation.

## Static regression audit

The codebase was reviewed for:

* broken routes
* API mismatches
* authorization problems
* persistence issues
* real-time synchronization issues
* dead handlers
* incomplete functionality
* loading/error-state problems

## Black-box browser QA

The running application was tested across:

* Authentication
* Navigation
* Workspaces
* Workspace Settings
* Workspace Members
* Projects
* Project Settings
* Project Members
* Kanban / Tasks
* Comments
* Activity
* Notifications
* Account Settings
* Recent
* Starred
* Global Create
* Help
* Deep links
* Responsive layouts
* Two-user collaboration

### QA status

```text
P0 Critical Issues    0
P1 Major Issues      0
P2 Issues            0
```

---

# 🧰 Tech Stack

## Frontend

| Technology     | Purpose                  |
| -------------- | ------------------------ |
| React          | UI framework             |
| TypeScript     | Type safety              |
| Vite           | Frontend tooling         |
| Tailwind CSS   | Styling                  |
| React Router   | Routing                  |
| TanStack Query | Server state and caching |

## Backend

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Node.js    | Runtime                 |
| Express    | REST API                |
| TypeScript | Type safety             |
| Socket.IO  | Real-time communication |
| Zod        | Validation              |
| bcrypt     | Password hashing        |
| JWT        | Authentication          |

## Database

| Technology | Purpose                 |
| ---------- | ----------------------- |
| PostgreSQL | Relational database     |
| Prisma     | ORM and database access |

## Testing

| Technology                    | Purpose         |
| ----------------------------- | --------------- |
| Vitest                        | Backend testing |
| Vitest Mock Extended          | Mocking         |
| Playwright/browser automation | Black-box QA    |

---

# 📂 Project Structure

```text
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
```

---

# 🚀 Getting Started

## Prerequisites

Install:

* Node.js
* npm
* PostgreSQL
* Git

---

## 1. Clone the repository

```bash
git clone https://github.com/Premanshukusre/Tevli.git
cd Tevli
```

---

## 2. Install dependencies

Install dependencies according to the project's root, frontend, and backend package configuration.

```bash
npm install
```

If required by the package structure, install dependencies inside:

```bash
cd frontend
npm install

cd ../backend
npm install
```

---

# 🔑 Environment Variables

Tevli uses environment variables for sensitive configuration.

Typical values include:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Additional variables may be required depending on the environment.

### Never commit:

```text
.env
.env.local
backend/.env
frontend/.env
```

Use `.env.example` files for documenting configuration without exposing secrets.

---

# 🗄️ Database Setup

Tevli uses PostgreSQL with Prisma.

Create a PostgreSQL database and configure:

```env
DATABASE_URL=...
```

Then:

```bash
cd backend
npx prisma db push
```

Generate the Prisma client:

```bash
npx prisma generate
```

---

# ▶️ Run Tevli Locally

## Start the backend

From the project root:

```bash
npm run dev:backend
```

Backend:

```text
http://localhost:5000
```

## Start the frontend

In another terminal:

```bash
npm run dev:frontend
```

Frontend:

```text
http://localhost:5173
```

Open:

```text
http://localhost:5173
```

---

# 🧪 Run Tests

From the backend directory:

```bash
npm test
```

The test suite covers critical areas such as:

* Authentication
* Authorization
* Workspace operations
* Project operations
* Task operations
* Membership operations
* Notifications
* Collaboration-related backend behavior

---

# 📦 Production Build

Build the frontend:

```bash
npm run --prefix frontend build
```

The build should complete successfully before deployment.

---

# 📈 Current Project Status

## V1.1 — Complete ✅

| Area                    | Status |
| ----------------------- | ------ |
| Authentication          | ✅      |
| Workspaces              | ✅      |
| Workspace Members       | ✅      |
| Workspace Settings      | ✅      |
| Projects                | ✅      |
| Project Members         | ✅      |
| Project Settings        | ✅      |
| Kanban / Tasks          | ✅      |
| Task Assignment         | ✅      |
| Due Dates               | ✅      |
| Comments                | ✅      |
| Activity / History      | ✅      |
| Real-Time Collaboration | ✅      |
| Notifications           | ✅      |
| Notification Deep Links | ✅      |
| Account Settings        | ✅      |
| Recent                  | ✅      |
| Starred                 | ✅      |
| Global Create           | ✅      |
| Workspace Creation      | ✅      |
| Project Creation        | ✅      |
| Help                    | ✅      |
| Responsive UI           | ✅      |
| Static QA               | ✅      |
| Browser QA              | ✅      |
| GitHub Baseline         | ✅      |

---

# ⚠️ Known Limitation

## Global Search

The current V1.1 global search supports:

* Workspace search
* Project search

Task-level search is intentionally outside the V1.1 scope.

This is an accepted product limitation rather than a broken feature.

---

# 🛣️ Roadmap

## V1.1 — Current

✅ Collaborative project management
✅ Real-time updates
✅ Workspace management
✅ Project management
✅ Kanban tasks
✅ Comments
✅ Activity
✅ Notifications
✅ Account Settings
✅ Recent & Starred
✅ Responsive interface
✅ QA validation

## Future Enhancements

Potential future additions include:

* 🔎 Task-level global search
* 🏷️ Labels
* ✅ Subtasks
* 📑 List view
* 📅 Calendar view
* 📎 Attachments
* 📋 Project templates
* 📑 Project duplication
* 📊 Timeline / Gantt
* ⚙️ Automations
* 📈 Advanced reporting
* 🔌 Third-party integrations
* 🔐 Advanced permission controls
* 🤖 AI-assisted project workflows

These features are intentionally outside the current V1.1 scope.

---

# 🧠 Engineering Principles

## 1. REST is the source of truth

Persistent state lives in the backend and PostgreSQL.

## 2. Socket.IO is the synchronization layer

Real-time events inform connected clients about successful backend mutations.

## 3. Authorization belongs on the server

Frontend restrictions improve UX, but backend authorization is the actual security boundary.

## 4. Real functionality over visual placeholders

Visible actions should correspond to real application behavior.

## 5. Multi-user by design

Tevli is structured around real team collaboration rather than a two-user-only implementation.

## 6. Keep the architecture understandable

The modular monolith approach keeps frontend, backend, database, and real-time communication clearly separated without unnecessary distributed-system complexity.

---

# 💡 Why Tevli?

Tevli was built to explore the engineering challenges behind a modern collaborative SaaS application.

The project demonstrates practical experience with:

* React + TypeScript
* REST API architecture
* PostgreSQL data modeling
* Prisma ORM
* Authentication
* Authorization
* Session security
* Real-time communication
* Socket.IO rooms
* Server-state caching
* Multi-user collaboration
* Responsive UI engineering
* Error handling
* Automated testing
* Browser-based QA
* Git and version control

The goal was not simply to build a Kanban board.

The goal was to understand how the major pieces of a collaborative web product work together:

```text
Authentication
      +
Authorization
      +
Database
      +
REST APIs
      +
Real-Time Events
      +
Client State
      +
Responsive UI
      =
Collaborative Product
```

---

# 👨‍💻 Author

## Premanshu Kusre

GitHub:

**[https://github.com/Premanshukusre](https://github.com/Premanshukusre)**

Project Repository:

**[https://github.com/Premanshukusre/Tevli](https://github.com/Premanshukusre/Tevli)**

---

# 📄 License

No open-source license has currently been declared for Tevli.

---


This version is intentionally structured around **visual hierarchy + easy scanning**: project identity first, then what it does, how it works, security, setup, QA, current status, and roadmap. It also stays aligned with the content already in your current README rather than inventing new capabilities. 

One note: the README currently claims “V1.1 — Complete” and “P2 Issues: 0,” which matches the state you reported after fixing BUG-003. It also preserves the accepted global-search limitation. 
