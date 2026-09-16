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
