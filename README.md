# Developer Team Hub

A Node.js + Express backend capstone project demonstrating core backend development concepts including routing, middleware, authentication, authorization, persistence, events, WebSockets, graceful shutdown, and automated testing.

## Features

- Express REST API
- Project CRUD
- JWT authentication
- Role-based authorization
- bcrypt password hashing
- Custom middleware
- JSON file persistence with `fs`
- EventEmitter-based activity logging
- WebSocket real-time project updates
- Graceful shutdown
- Jest + Supertest testing
- Separate test data and test logs

## Tech Stack

- Node.js
- Express
- bcrypt
- jsonwebtoken
- ws
- dotenv
- Jest
- Supertest

## Installation

```bash
git clone https://github.com/srinathstart/developer-team-hub.git
cd developer-team-hub
npm install
```

Create a `.env` file in the project root:

```env
JWT_SECRET=your-secret-key
```

## Run the Server

```bash
npm start
```

The server runs on:

```text
http://localhost:3000
```

## Run Tests

```bash
npm test
```

Tests use separate project data and activity logs so normal application data is not modified.

## API Routes

### Health

`GET /health`

Example response:

```json
{
  "status": "ok"
}
```

### Authentication

#### Register

`POST /auth/register`

Example request body:

```json
{
  "username": "user1",
  "password": "password123"
}
```

#### Login

`POST /auth/login`

Example request body:

```json
{
  "username": "user1",
  "password": "password123"
}
```

Returns a JWT token:

```json
{
  "message": "Login successful",
  "token": "..."
}
```

## Project Routes

All project routes require an authorization header:

```text
Authorization: Bearer <token>
```

### Get all projects

`GET /projects`

### Get one project

`GET /projects/:id`

### Create project

`POST /projects`

Example request body:

```json
{
  "name": "Backend API"
}
```

### Update project

`PATCH /projects/:id`

Example request body:

```json
{
  "name": "Updated Project"
}
```

### Delete project

`DELETE /projects/:id`

Requires an admin user.

## Authorization

Users have two roles:

- `user`
- `admin`

For this learning project, registering with the username `admin` assigns the admin role.

This is only a demonstration shortcut and should not be used in a production authentication system.

## Real-Time Updates

The server uses WebSockets to broadcast:

- `projectCreated`
- `projectUpdated`
- `projectDeleted`

Run the included WebSocket client:

```bash
node ws-client.js
```

Then create, update, or delete projects to see events arrive in real time.

## Event-Driven Logging

Project changes emit Node.js `EventEmitter` events.

Listeners write activity records such as:

```text
PROJECT_CREATED
PROJECT_UPDATED
PROJECT_DELETED
```

to the activity log.

## Project Structure

```text
developer-team-hub/
├── data/
├── events/
│   ├── projectEvents.js
│   └── projectListeners.js
├── logs/
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
├── index.js
├── ws-client.js
├── package.json
└── .env
```

## Concepts Practiced

This capstone was built to practice:

- Node.js modules
- npm packages
- raw HTTP concepts
- Express
- routers
- middleware
- route parameters
- HTTP status codes
- request validation
- async/await
- `fs`
- `path`
- environment variables
- EventEmitter
- WebSockets
- password hashing
- JWT authentication
- role-based authorization
- error handling
- graceful shutdown
- automated API testing

## Notes

- Project data is stored in JSON files rather than a database.
- Registered users are currently stored in memory and disappear when the server restarts.
- Admin assignment is simplified for learning purposes.
- This is a learning capstone rather than a production-ready authentication system.
