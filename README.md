# Developer Team Hub

Developer Team Hub is a full-stack learning capstone built with **React, Node.js, and Express**.

It demonstrates how a frontend and backend work together through authentication, protected routes, CRUD operations, real-time WebSocket updates, file persistence, middleware, events, and automated testing.

## Features

### Frontend
- React frontend built with Vite
- React Router
- Login form
- JWT stored in browser `localStorage`
- Protected `/projects` page
- Create, edit, and delete projects
- Logout
- Real-time WebSocket project updates
- Reusable React components
- Basic responsive styling

### Backend
- Express REST API
- JWT authentication
- bcrypt password hashing
- Role-based authorization
- Project CRUD
- Custom middleware
- Request validation
- JSON file persistence with `fs`
- Node.js `EventEmitter`
- Activity logging
- WebSocket broadcasting
- Environment variables with dotenv
- Graceful shutdown
- Jest + Supertest integration tests
- Separate test data and test logs

## Tech Stack

### Frontend
- React
- Vite
- React Router
- JavaScript
- HTML
- CSS

### Backend
- Node.js
- Express
- bcrypt
- jsonwebtoken
- ws
- dotenv
- cors

### Testing
- Jest
- Supertest

### Storage
- JSON files for project data
- In-memory storage for users

## Project Structure

```text
developer-team-hub/
├── data/
│   ├── projects.json
│   └── projects.test.json
├── events/
│   ├── projectEvents.js
│   └── projectListeners.js
├── logs/
│   ├── activity.log
│   └── activity.test.log
├── middleware/
│   ├── adminOnly.js
│   ├── auth.js
│   ├── errorHandler.js
│   ├── logger.js
│   └── validateProject.js
├── routes/
│   ├── auth.js
│   └── projects.js
├── tests/
│   ├── auth.test.js
│   ├── health.test.js
│   └── projects.test.js
├── utils/
│   └── activityLogger.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   └── ProjectItem.jsx
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
├── index.js
├── ws-client.js
├── package.json
├── .env.example
└── README.md
```

## Installation

Clone the repository:

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

## Environment Variables

Create a `.env` file in the project root.

```bash
cp .env.example .env
```

Make sure it contains:

```env
JWT_SECRET=your-secret-key
```

Do not commit your real `.env` file.

## Running the Application

The frontend and backend run as two separate development servers.

### Terminal 1 — Backend

From the project root:

```bash
npm start
```

Backend:

```text
http://localhost:3000
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Open:

```text
http://localhost:5173/login
```

## Register a User

The current frontend includes login but does not include a registration page yet.

Register a normal user through the backend:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"srinath","password":"hello123"}'
```

Then log in through the React frontend with:

```text
Username: srinath
Password: hello123
```

## Admin User

For this learning project, registering with the username `admin` automatically assigns the admin role.

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Then log in through the frontend using:

```text
Username: admin
Password: admin123
```

The admin user can delete projects.

> This admin assignment is intentionally simplified for learning and should not be used in a production authentication system.

## Frontend Routes

### Login

```text
/login
```

The login page sends credentials to:

```text
POST /auth/login
```

When login succeeds:

1. The backend returns a JWT.
2. React stores the token in `localStorage`.
3. React navigates to `/projects`.

### Projects

```text
/projects
```

The page checks for a stored token.

If there is no token, or if the backend rejects it, the user is redirected to `/login`.

## API Routes

### Health Check

```text
GET /health
```

Example response:

```json
{
  "status": "ok"
}
```

## Authentication

### Register

```text
POST /auth/register
```

Example request body:

```json
{
  "username": "user1",
  "password": "password123"
}
```

### Login

```text
POST /auth/login
```

Example request:

```json
{
  "username": "user1",
  "password": "password123"
}
```

Example response:

```json
{
  "message": "Login successful",
  "token": "..."
}
```

## Protected Project API

Project routes require:

```text
Authorization: Bearer <token>
```

### Get all projects

```text
GET /projects
```

### Get one project

```text
GET /projects/:id
```

### Create a project

```text
POST /projects
```

Example body:

```json
{
  "name": "React Dashboard"
}
```

### Update a project

```text
PATCH /projects/:id
```

Example body:

```json
{
  "name": "Updated Project"
}
```

### Delete a project

```text
DELETE /projects/:id
```

Requires an authenticated admin user.

## React Component Structure

```text
App
├── Login
└── Projects
    ├── ProjectForm
    └── ProjectItem
```

### `Login.jsx`

Handles username/password state, login submission, saving the JWT, and navigation to `/projects`.

### `Projects.jsx`

Handles project loading, authentication checks, API requests, WebSocket connection, project state, logout, and CRUD logic.

### `ProjectForm.jsx`

Handles the create-project form and passes the new project name to `Projects.jsx` through a function prop.

### `ProjectItem.jsx`

Displays one project and handles the edit/delete UI.

## Real-Time WebSocket Updates

The backend broadcasts:

```text
projectCreated
projectUpdated
projectDeleted
```

The React frontend keeps a WebSocket connection open at:

```text
ws://localhost:3000
```

Flow:

```text
HTTP request
→ Express updates project
→ EventEmitter emits event
→ WebSocket broadcasts event
→ React receives event
→ React state updates
→ UI updates automatically
```

## Event-Driven Activity Logging

Project changes also emit Node.js `EventEmitter` events.

Listeners record activity such as:

```text
PROJECT_CREATED
PROJECT_UPDATED
PROJECT_DELETED
```

to the activity log.

## CORS

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:3000`.

Because these are different origins, the Express backend uses CORS to allow requests from the React frontend.

## Testing

Run backend tests with:

```bash
npm test
```

The test suite covers:

- health endpoint
- user registration
- user login
- JWT-protected project access
- project creation
- normal-user delete authorization
- admin delete authorization

Test project data and activity logs are separated from normal application data.

## Concepts Practiced

This capstone demonstrates:

- Node.js modules
- npm
- Express
- REST APIs
- HTTP methods and status codes
- routers
- middleware
- route parameters
- validation
- error handling
- async/await
- `fs`
- `path`
- environment variables
- bcrypt password hashing
- JWT authentication
- authorization
- EventEmitter
- WebSockets
- graceful shutdown
- Jest
- Supertest
- React components
- JSX
- props
- state
- events
- forms
- conditional rendering
- list rendering
- `useEffect`
- `fetch`
- React Router
- protected frontend routes
- `localStorage`
- parent-child component communication
- basic CSS layout

## Current Limitations

This is a learning capstone, not a production-ready application.

Current limitations include:

- users are stored in memory and disappear when the backend restarts
- project data is stored in JSON instead of a database
- the frontend does not currently have a registration page
- admin assignment is simplified
- JWT is stored in `localStorage`
- frontend error messages are basic
- there is no production deployment configuration yet

## Future Improvements

Possible next steps:

- PostgreSQL database
- persistent user accounts
- frontend registration page
- improved form validation and error messages
- loading states
- frontend tests
- improved authentication design
- deployment
- Docker
- CI/CD

## Quick Run Summary

```text
Terminal 1:
npm start
→ backend on localhost:3000

Terminal 2:
cd frontend
npm run dev
→ frontend on localhost:5173
```

Then open:

```text
http://localhost:5173/login
```
