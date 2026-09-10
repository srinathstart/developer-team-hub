# Developer Team Hub

Developer Team Hub is a full-stack project-management application built with React, Node.js, Express, and PostgreSQL.

Users can create projects, invite registered users as members, assign roles and tasks, track deadlines, and see changes in real time.

## Features

### Accounts and security

- Register and log in with a username and password
- Passwords are hashed with bcrypt
- Protected API routes use JSON Web Tokens (JWT)
- The deployed frontend uses bearer-token authentication stored for the browser session
- Same-site clients can use HttpOnly authentication cookies with CSRF protection
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

### Administration

- Administrators can search registered users and change their `user` or `admin` role
- Administrators cannot remove their own administrator role through the interface
- Role changes are stored in an administrator audit history
- The administration page and API routes reject non-administrator accounts

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
- Vitest and Testing Library for frontend component checks
- ESLint and Vite production builds
- GitHub Actions continuous integration on pushes and pull requests

## Project Structure

```text
developer-team-hub/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .dockerignore
├── Dockerfile
├── compose.yaml
├── render.yaml
├── events/
│   └── projectEvents.js
├── middleware/
│   ├── adminOnly.js
│   ├── auth.js
│   ├── csrf.js
│   ├── errorHandler.js
│   ├── logger.js
│   └── validateProject.js
├── migrations/
│   ├── 001_add_task_assignee.sql
│   ├── 002_add_task_due_date.sql
│   ├── 003_expand_activity_action.sql
│   └── 004_add_admin_audit_logs.sql
├── routes/
│   ├── activity.js
│   ├── admin.js
│   ├── auth.js
│   ├── dashboard.js
│   ├── members.js
│   ├── projects.js
│   └── tasks.js
├── scripts/
│   └── initializeDatabase.js
├── tests/
│   ├── activity.test.js
│   ├── admin.test.js
│   ├── auth.test.js
│   ├── dashboard.test.js
│   ├── health.test.js
│   ├── helpers.js
│   ├── members.test.js
│   ├── projects.test.js
│   ├── setup.js
│   ├── tasks.test.js
│   └── websocket.test.js
├── utils/
│   ├── activityLogger.js
│   └── cookies.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ActivityList.jsx
│   │   │   ├── AdminUsers.jsx
│   │   │   ├── DashboardStats.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MemberForm.jsx
│   │   │   ├── MemberList.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── ProjectForm.test.jsx
│   │   │   ├── ProjectHeader.jsx
│   │   │   ├── ProjectItem.jsx
│   │   │   ├── ProjectToolbar.jsx
│   │   │   ├── ProjectWorkspace.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── TaskFilters.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   └── TaskList.jsx
│   │   ├── hooks/
│   │   │   ├── useProjectActivity.js
│   │   │   ├── useProjectCreation.js
│   │   │   ├── useProjectDeletion.js
│   │   │   ├── useProjectEditing.js
│   │   │   ├── useProjectMembers.js
│   │   │   ├── useProjectTasks.js
│   │   │   ├── useProjectsData.js
│   │   │   ├── useTaskDeletion.js
│   │   │   └── useTaskEditing.js
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .dockerignore
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json
│   └── package.json
├── .env.example
├── db.js
├── index.js
├── schema.sql
├── websocket.js
├── package.json
└── README.md
```

Files in `data/` and `logs/` are legacy artifacts and are not used at runtime. The application stores users, projects, members, tasks, activity records, and administrator audit records in PostgreSQL.

## Prerequisites

Install these before starting:

- Node.js
- npm
- PostgreSQL

The installed Vite version expects Node.js `20.19+` or `22.12+`.

Alternatively, the Docker workflow requires Docker Desktop and does not require running Node.js or PostgreSQL directly on the host.

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

## Running with Docker

Docker Compose can run the frontend, backend, and PostgreSQL together. Docker Desktop must be installed and running.

From the project root, build and start all three containers:

```bash
docker compose up -d --build
```

Open the Docker frontend at `http://127.0.0.1:5174/register`.

| Service | Address | Purpose |
| --- | --- | --- |
| Frontend | `http://127.0.0.1:5174` | React production build served by Nginx |
| Backend | `http://127.0.0.1:3001` | Node.js and Express API |
| PostgreSQL | `localhost:5434` | Docker development database |

The Docker database is separate from the normal local database on port `5432`. Its records remain available after containers stop because Compose stores them in the named `postgres_data` volume.

View the running containers:

```bash
docker compose ps
```

Stop and remove the containers while keeping the database data:

```bash
docker compose down
```

To start again later, run `docker compose up -d`. Use `docker compose down -v` only when you intentionally want to delete the Docker database volume and all records stored in it.

The credentials and JWT secret in `compose.yaml` are for local Docker development only. Use securely managed values in deployed environments.

## Live Demo

| Service | URL |
| --- | --- |
| Frontend | [developer-team-hub.vercel.app](https://developer-team-hub.vercel.app/) |
| Backend health check | [developer-team-hub-api.onrender.com/health](https://developer-team-hub-api.onrender.com/health) |

The React frontend is deployed on Vercel. The Express API and PostgreSQL database are hosted on Render.

## First Use

1. Register at `/register`. A password must contain at least eight characters, one uppercase letter, one lowercase letter, and one number.
2. Log in at `/login`.
3. Create a project with a name, description, status, and optional due date.
4. To collaborate, register a second account in another browser/private window.
5. From the project owner's account, add the second account by username and choose `viewer` or `editor`.
6. Open the project tasks to create tasks, set priority and due date, and optionally assign a project user.
7. Use the activity view to see recorded changes.

Normal registration always creates a user with the `user` role. The application does not grant administrator access based on a special username.

### Creating the first administrator

Because only an existing administrator can change roles through the application, register the account first and then run this statement through `psql` while connected to the intended database:

```sql
UPDATE users
SET role = 'admin'
WHERE username = 'your_username';
```

Log out and log in again afterward so the new JWT contains the updated role. From then on, that administrator can manage roles at `/admin`.

## Frontend Routes

| Route | Purpose |
| --- | --- |
| `/register` | Create a user account |
| `/login` | Log in and start an authenticated browser session |
| `/projects` | View the authenticated project dashboard |
| `/admin` | Manage user roles and view role-change history as an administrator |

If authentication is missing or rejected, protected frontend pages redirect to `/login`. A signed-in non-administrator who opens `/admin` is redirected to `/projects`.

## API Overview

Except for registration, login, the root route, and the health check, API routes require a valid JWT. The deployed frontend stores the token in `sessionStorage` and sends it with this header:

```text
Authorization: Bearer <token>
```

The token is removed when the user logs out and is not retained after the browser session ends. The backend also supports HttpOnly authentication cookies for same-site clients. Cookie-authenticated `POST`, `PUT`, `PATCH`, and `DELETE` requests require the matching `csrfToken` cookie value in the `X-CSRF-Token` header. Registration and login are exempt from this CSRF check.

### Public routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/` | Basic API message |
| `GET` | `/health` | Health check |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Log in and receive a JWT in the response; authentication and CSRF cookies are also set |

### Authentication routes

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/auth/me` | Get the currently authenticated user |
| `POST` | `/auth/logout` | Clear the authentication and CSRF cookies |

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
  "description": "Coordinate delivery across the engineering team",
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

### Administrator routes

All administrator routes require an authenticated account with the `admin` role.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/admin/users` | List registered users |
| `PATCH` | `/admin/users/:id/role` | Change a user's `user` or `admin` role |
| `GET` | `/admin/audit` | View administrator role-change history |

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

The deployed frontend adds the session JWT to the WebSocket connection URL because the browser WebSocket API cannot set an `Authorization` header. Same-site clients can authenticate with the HttpOnly cookie instead. The backend verifies the JWT before accepting the connection and sends each event only to administrators, the project owner, and current project members.

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

## Continuous Integration

The GitHub Actions workflow in `.github/workflows/ci.yml` runs automatically on every push and pull request. It contains three independent jobs:

- **Backend tests:** starts a temporary PostgreSQL 16 service, applies `schema.sql`, and runs the existing Jest suite.
- **Frontend checks:** uses Node.js 22, runs ESLint, and creates a Vite production build.
- **Docker builds:** builds the backend and frontend images with Docker Compose without publishing or deploying them.

The workflow uses temporary GitHub-hosted environments and does not connect to the local development database.

## Technical Highlights

- React components, props, state, forms, and effects
- React Router and protected pages
- Fetch requests and JWT bearer authentication
- REST APIs and HTTP status codes
- Express routers and middleware
- Validation and error handling
- Async/await
- PostgreSQL queries, relationships, and transactions
- Password hashing and role-based permissions
- HttpOnly authentication cookies and CSRF protection
- EventEmitter and authenticated WebSockets
- Environment-based configuration
- Continuous integration with GitHub Actions
- Multi-container development with Docker Compose
- Vercel and Render deployment
- Graceful shutdown

## Quick Start Summary

Manual development setup:

```text
1. Install backend and frontend dependencies
2. Create developer_team_hub in PostgreSQL
3. Apply schema.sql to the empty database
4. Create the backend and frontend .env files
5. Run npm start in the project root
6. Run npm run dev inside frontend/
7. Open http://localhost:5173/register
```

Docker setup:

```text
1. Start Docker Desktop
2. Run docker compose up -d --build
3. Open http://127.0.0.1:5174/register
```
