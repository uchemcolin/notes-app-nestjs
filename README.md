# NestJS Notes App

A complete REST API for a notes application built with NestJS, Prisma, PostgreSQL, Redis, and JWT authentication.

================================================================================
FEATURES
================================================================================

- User authentication (signup/login with JWT)
- Password hashing with bcrypt
- CRUD operations for notes
- User-specific notes (users can only access their own notes)
- Input validation with class-validator
- PostgreSQL database with Prisma ORM
- Redis caching and Bull queue for background jobs
- Environment configuration
- Error handling

================================================================================
TECH STACK
================================================================================

- Framework: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Queue & Caching: Redis + Bull
- Authentication: JWT + Passport.js
- Password Hashing: bcrypt
- Validation: class-validator + class-transformer
- Language: TypeScript

================================================================================
PREREQUISITES
================================================================================

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v7 or higher)
- npm or yarn

================================================================================
INSTALLATION STEPS
================================================================================

1. Clone the repository

git clone https://github.com/uchemcolin/notes-app-nestjs-v2.git
cd notes-app-nestjs-v2

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file in the root directory with these contents:

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/notesdb?schema=public"
JWT_SECRET="your_super_secret_key_change_this"
JWT_EXPIRES_IN="1d"
REDIS_URL="redis://localhost:6379"

4. Set up PostgreSQL database

Make sure PostgreSQL is running:

createdb notesdb

Or using psql:

psql -U postgres -c "CREATE DATABASE notesdb;"

5. Run Prisma migrations

npx prisma migrate dev --name init
npx prisma generate

6. Start the application

Development mode:
npm run start:dev

Production mode:
npm run build
npm run start:prod

The server will run on http://localhost:3000

================================================================================
API ENDPOINTS
================================================================================

AUTHENTICATION ENDPOINTS

Method   | Endpoint        | Description
POST     | /auth/signup    | Create new user account
POST     | /auth/login     | Login and get JWT token

SIGNUP EXAMPLE:

POST http://localhost:3000/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}

LOGIN EXAMPLE:

POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

LOGIN RESPONSE:

{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

================================================================================
USER ENDPOINTS (Requires Authentication)
================================================================================

Method   | Endpoint              | Description
GET      | /users/profile        | Get current user profile
GET      | /users/profile/notes  | Get user with all their notes
PATCH    | /users/profile        | Update user profile

Headers: Authorization: Bearer YOUR_TOKEN_HERE

================================================================================
NOTES ENDPOINTS (Requires Authentication)
================================================================================

Method   | Endpoint        | Description
GET      | /notes          | Get all notes for logged-in user
POST     | /notes          | Create a new note
GET      | /notes/:id      | Get a specific note
PATCH    | /notes/:id      | Update a note
DELETE   | /notes/:id      | Delete a note

CREATE NOTE EXAMPLE:

POST http://localhost:3000/notes
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my first note"
}

UPDATE NOTE EXAMPLE:

PATCH http://localhost:3000/notes/1
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}

================================================================================
PROJECT STRUCTURE
================================================================================

src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── signup.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategy/
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── notes/
│   ├── dto/
│   │   ├── create-note.dto.ts
│   │   └── update-note.dto.ts
│   ├── notes.controller.ts
│   ├── notes.module.ts
│   └── notes.service.ts
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   └── update-user.dto.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   └── users.service.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── mail/
│   └── mail.service.ts
├── common/
│   └── helpers, pipes, guards, etc.
├── bull-board.ts
├── app.module.ts
└── main.ts

================================================================================
DATABASE SCHEMA
================================================================================

USERS TABLE:

Column      | Type      | Description
id          | Int       | Primary key, auto-increment
firstName   | String    | User's first name
middleName  | String?   | User's middle name (optional)
lastName    | String    | User's last name
email       | String    | Unique email address
password    | String    | Hashed password
createdAt   | DateTime  | Timestamp
updatedAt   | DateTime  | Timestamp

NOTES TABLE:

Column      | Type      | Description
id          | Int       | Primary key, auto-increment
title       | String    | Note title
content     | String    | Note content
userId      | Int       | Foreign key to users
createdAt   | DateTime  | Timestamp
updatedAt   | DateTime  | Timestamp

================================================================================
ERROR RESPONSES
================================================================================

VALIDATION ERROR (400):

{
  "statusCode": 400,
  "message": ["Title must be at least 3 characters"],
  "error": "Bad Request"
}

AUTHENTICATION ERROR (401):

{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}

NOT FOUND ERROR (404):

{
  "statusCode": 404,
  "message": "Note with ID 999 not found",
  "error": "Not Found"
}

================================================================================
USEFUL COMMANDS
================================================================================

Generate Prisma client:
npx prisma generate

Open Prisma Studio (database GUI):
npx prisma studio

Create migration:
npx prisma migrate dev --name migration_name

Reset database:
npx prisma migrate reset

Format Prisma schema:
npx prisma format

Build project:
npm run build

Run in development:
npm run start:dev

Run in production:
npm run start:prod

Run tests (if configured):
npm run test

================================================================================
ENVIRONMENT VARIABLES
================================================================================

Variable          | Description                           | Default
DATABASE_URL      | PostgreSQL connection string          | Required
JWT_SECRET        | Secret key for JWT tokens             | Required
JWT_EXPIRES_IN    | Token expiration time                 | 1d
REDIS_URL         | Redis connection string               | Required

================================================================================
SECURITY FEATURES
================================================================================

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- Protected routes with guards
- User isolation (users only see their own data)
- Input validation on all endpoints
- Environment variables for secrets
- HTTP-only cookies ready for implementation

================================================================================
DEPLOYMENT
================================================================================

Using Docker (Optional):

Create a Dockerfile:

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]

Deploy to platforms:
- Railway: Auto-deploys from GitHub
- Render: Easy PostgreSQL integration
- Heroku: Traditional hosting
- Vercel: Serverless functions support
- AWS EC2: Full control

================================================================================
POSTMAN COLLECTION
================================================================================

Copy this JSON to import into Postman:

{
  "info": {
    "name": "Notes App API",
    "schema": "https://schema.getpostman.com/collection/v2.1.0/collection.json"
  },
  "item": [...]
}

================================================================================
FUTURE IMPROVEMENTS
================================================================================

- [ ] Email notifications with queue system
- [ ] Password reset functionality
- [ ] Rate limiting
- [ ] API versioning
- [ ] Swagger/OpenAPI documentation
- [ ] Unit and e2e tests
- [ ] Refresh tokens
- [ ] Pagination for notes
- [ ] Search functionality
- [ ] Note sharing between users
- [ ] Categories/tags for notes
- [ ] File attachments
- [ ] Real-time updates with WebSockets
- [ ] Redis caching

================================================================================
LICENSE
================================================================================

MIT License - feel free to use this project for learning or production.

================================================================================
ACKNOWLEDGMENTS
================================================================================

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- All contributors to the open-source packages used

================================================================================

Happy Coding! 🚀
GitHub URL: https://github.com/uchemcolin/notes-app-nestjs-v2