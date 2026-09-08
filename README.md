# Developer Team Hub

Developer Team Hub is my first full-stack learning project. It is a small project-management application built to practise how a React frontend, a Node.js API, and a PostgreSQL database work together.

Users can create projects, invite registered users as members, assign roles and tasks, track deadlines, and see changes in real time.

## Features

### Accounts and security

- Register and log in with a username and password
- Passwords are hashed with bcrypt
- Protected API routes use JSON Web Tokens (JWT) in HttpOnly cookies
- Usernames are trimmed and authentication input is validated
- Authenticated WebSocket connections
- Project events are sent only to the project owner, its members, and administrators

### Projects

- Create, view, edit, and delete projects
- Project statuses: `planned`, `in-progress`, and `completed`
- Optional project due dates
- Search projects by name
- Filter projects by status
- Sort projects from newest or oldest
- Owners can delete their own projects; administrators can delete any project

### Members and permissions

- Add an existing registered user by username
- Assign `viewer` or `editor` roles
- Change a member's role
- Remove a member
- Removing a member automatically unassigns their tasks in that project
- Viewers can view project tasks
- Editors can create, edit, and delete tasks
- Project owners manage the project and its members

### Tasks

- Create, view, edit, and delete tasks
- Task statuses: `todo`, `in-progress`, and `done`
- Priorities: `low`, `medium`, and `high`
- Optional due dates
- Assign a task to the project owner or a project member by username
- Filter tasks by status and priority

### Dashboard and activity

- Project and task statistics
- Planned, in-progress, and completed project totals
- Shared-project, completed-task, and overdue-task totals
- Project activity history for project, task, and member changes
- Real-time project creation, update, and deletion events

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Lucide React icons
- JavaScript and CSS

### Backend

- Node.js
- Express
- PostgreSQL with `pg`
- bcrypt
- JSON Web Tokens
- `ws` WebSockets
- dotenv
- CORS
- Node.js `EventEmitter`

### Existing automated checks

- Jest and Supertest for the backend
- Vitest and Testing Library dependencies in the frontend
- ESLint and Vite production builds

## Project Structure

```text
developer-team-hub/
├── events/
│   └── projectEvents.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── logger.js
│   └── validateProject.js
├── migrations/
│   ├── 001_add_task_assignee.sql
│   ├── 002_add_task_due_date.sql
│   └── 003_expand_activity_action.sql
├── routes/
│   ├── activity.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── members.js
│   ├── projects.js
│   └── tasks.js
├── tests/
│   ├── activity.test.js
│   ├── auth.test.js
│   ├── dashboard.test.js
│   ├── health.test.js
│   ├── members.test.js
│   ├── projects.test.js
│   ├── tasks.test.js
│   └── websocket.test.js
├── utils/
│   └── activityLogger.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityList.jsx
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MemberForm.jsx
│   │   │   ├── MemberList.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── ProjectItem.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── TaskFilters.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskList.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   ├── .env.example
│   └── package.json
├── .env.example
├── db.js
├── index.js
├── schema.sql
├── websocket.js
├── package.json
└── README.md
```

The old `data/` and `logs/` files are leftovers from an earlier learning stage. The current application stores users, projects, members, tasks, and activity records in PostgreSQL.

## Prerequisites

Install these before starting:

- Node.js
- npm
- PostgreSQL

The installed Vite version expects Node.js `20.19+` or `22.12+`.

## Installation

Clone the repository and enter it:

```bash
git clone https://github.com/srinathstart/developer-team-hub.git
cd developer-team-hub
```

Install backend dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

## Database Setup

Create the development database:

```bash
createdb developer_team_hub
```

Create all current tables from the baseline schema:

```bash
psql -d developer_team_hub -f schema.sql
```

`schema.sql` is intended for a new, empty database. The files in `migrations/` document changes that were added to an older database during development; do not run them after `schema.sql`, because the baseline already includes those columns.

## Backend Environment Variables

Create the backend environment file from the project root:

```bash
cp .env.example .env
```

Example:

```env
JWT_SECRET=replace-this-with-a-long-random-secret
FRONTEND_URL=http://localhost:5173
PORT=3000
DATABASE_URL=postgresql://localhost:5432/developer_team_hub
TEST_DATABASE_URL=postgresql://localhost:5432/developer_team_hub_test
```

- `JWT_SECRET` signs and verifies login tokens.
- `FRONTEND_URL` is the origin allowed by CORS.
- `PORT` is optional and defaults to `3000`.
- `DATABASE_URL` is optional and defaults to the local `developer_team_hub` database.
- `TEST_DATABASE_URL` is read only when `NODE_ENV=test` and defaults to the local `developer_team_hub_test` database.

Do not commit the real `.env` file.

## Frontend Environment Variables

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Its local values are:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

Restart the frontend development server after changing a Vite environment variable.

## Running the Application

The backend and frontend are separate development servers, so keep both terminals open.

### Terminal 1 — backend

From the project root:

```bash
npm start
```

The default backend address is `http://localhost:3000`.

### Terminal 2 — frontend

From the project root:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173/register` to create an account, or `http://localhost:5173/login` if an account already exists.

## First Use

1. Register at `/register`. A password must contain at least eight characters, one uppercase letter, one lowercase letter, and one number.
2. Log in at `/login`.
3. Create a project with a name, description, status, and optional due date.
4. To collaborate, register a second account in another browser/private window.
5. From the project owner's account, add the second account by username and choose `viewer` or `editor`.
6. Open the project tasks to create tasks, set priority and due date, and optionally assign a project user.
7. Use the activity view to see recorded changes.

Normal registration always creates a user with the `user` role. The application does not grant administrator access based on a special username.

## Frontend Routes

| Route | Purpose |
| --- | --- |
| `/register` | Create a user account |
| `/login` | Log in and receive an HttpOnly authentication cookie |
| `/projects` | View the authenticated project dashboard |

If a token is missing or rejected, the projects page redirects to `/login`.

## API Overview

Except for registration, login, the root route, and the health check, browser API requests use the HttpOnly authentication cookie automatically. Non-browser API clients can also authenticate with this header:

```text
Authorization: Bearer <token>
```

### Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Basic API message |
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Log in and receive a JWT |

### Project routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/projects?status=&sort=` | List accessible projects with optional filtering and sorting |
| `GET` | `/projects/:id` | Get one accessible project |
| `POST` | `/projects` | Create a project |
| `PATCH` | `/projects/:id` | Update a project owned by the user |
| `DELETE` | `/projects/:id` | Delete an owned project, or any project as an administrator |

Valid project statuses are `planned`, `in-progress`, and `completed`. Valid sort values are `newest` and `oldest`. API date values use `YYYY-MM-DD`.

Example project body:

```json
{
  "name": "Developer Team Hub",
  "description": "Build and learn a full-stack application",
  "status": "in-progress",
  "due_date": "2026-10-15"
}
```

### Member routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/projects/:projectId/members` | List members of an accessible project |
| `POST` | `/projects/:projectId/members` | Add a registered user by username (owner only) |
| `PATCH` | `/projects/:projectId/members/:userId` | Change a member role (owner only) |
| `DELETE` | `/projects/:projectId/members/:userId` | Remove a member and unassign their project tasks (owner only) |

Example add-member body:

```json
{
  "username": "teammate",
  "role": "editor"
}
```

### Task routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/projects/:projectId/tasks?priority=&status=` | List and filter tasks in an accessible project |
| `POST` | `/projects/:projectId/tasks` | Create a task as the owner or an editor |
| `PATCH` | `/tasks/:id` | Update a task as the owner or an editor |
| `DELETE` | `/tasks/:id` | Delete a task as the owner or an editor |

Valid task statuses are `todo`, `in-progress`, and `done`. Valid priorities are `low`, `medium`, and `high`.

Example task body:

```json
{
  "title": "Finish activity history",
  "status": "todo",
  "priority": "high",
  "assigneeUsername": "teammate",
  "due_date": "2026-10-12"
}
```

Use an empty `assigneeUsername` to leave or make a task unassigned. An assignee must be the project owner or a current project member.

### Activity and dashboard routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/projects/:projectId/activity` | View activity for an accessible project |
| `GET` | `/dashboard/stats` | Get statistics for projects visible to the current user |

## Permissions

| Action | Owner | Editor | Viewer | Administrator |
| --- | --- | --- | --- | --- |
| View an accessible project and its tasks | Yes | Yes | Yes | All projects in the project list |
| Edit project details | Yes | No | No | Only when also the owner |
| Delete project | Yes | No | No | Yes |
| Manage members | Yes | No | No | Only when also the owner |
| Create, edit, or delete tasks | Yes | Yes | No | Only with project access |
| View project activity | Yes | Yes | Yes | Only with project access |

The administrator role currently gives global project listing, dashboard statistics, project deletion, and WebSocket visibility. Other routes still require ownership or project membership as shown above.

## Real-Time WebSocket Updates

The backend emits these project events:

```text
projectCreated
projectUpdated
projectDeleted
```

The browser automatically sends its HttpOnly cookie when opening the WebSocket. The backend verifies the JWT inside it before accepting the connection and sends each event only to administrators, the project owner, and current project members.

```text
Project HTTP request
→ PostgreSQL is updated
→ EventEmitter emits a project event
→ WebSocket sends it to authorized connections
→ React updates the visible project list
```

## Activity History

Activity records are stored in PostgreSQL. They describe actions such as:

- Creating or updating a project
- Creating, updating, or deleting a task
- Assigning a task or changing its due date
- Adding, changing, or removing a project member

Deleting a project also deletes its related tasks, members, and activity records through PostgreSQL foreign-key rules.

## Existing Backend Test Command

The backend test setup deletes records from its configured test database between tests. Never point `TEST_DATABASE_URL` at a development or production database.

To run the existing backend suite:

```bash
npm test
```

By default, it uses `developer_team_hub_test`. That database must exist and contain the current schema.

## Current Limitations

This is a learning project, not a production-ready application.

- Cookie-based authentication still needs additional CSRF review if the frontend and backend are later deployed on different sites.
- There is no password reset or email verification.
- There is no dedicated administrator-management interface.
- Frontend error handling and accessibility can be improved.
- The main `Projects.jsx` component is large and should be split into smaller hooks/components.
- Deployment, Docker, and CI/CD are not configured yet.

## Concepts Practised

- React components, props, state, forms, and effects
- React Router and protected pages
- Fetch requests and JWT authentication
- REST APIs and HTTP status codes
- Express routers and middleware
- Validation and error handling
- Async/await
- PostgreSQL queries, relationships, and transactions
- Password hashing and role-based permissions
- EventEmitter and authenticated WebSockets
- Environment-based configuration
- Graceful shutdown

## Quick Start Summary

```text
1. Install backend and frontend dependencies
2. Create developer_team_hub in PostgreSQL
3. Apply schema.sql to the empty database
4. Create the backend and frontend .env files
5. Run npm start in the project root
6. Run npm run dev inside frontend/
7. Open http://localhost:5173/register
```
