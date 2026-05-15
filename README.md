# NestJS Notes App

A complete REST API for a notes application built with NestJS, Prisma, PostgreSQL, Redis, Bull queues, and JWT authentication, featuring pagination, search functionality, email services, and real-time job monitoring.

================================================================================
FEATURES
================================================================================

- User authentication (signup/login with JWT)
- Password hashing with bcrypt
- CRUD operations for notes
- User-specific notes (users can only access their own notes)
- **Pagination for notes listing** (page, limit, total count, hasNext/hasPrevious)
- **Search functionality** (search by title, content, or both with case-insensitive matching)
- Input validation with class-validator
- PostgreSQL database with Prisma ORM
- Redis caching and Bull queue for background jobs
- Email notifications using Nodemailer (SMTP) or Resend API
- Password reset functionality
- Environment configuration
- Error handling with detailed responses

================================================================================
TECH STACK
================================================================================

- Framework: NestJS
- Database: PostgreSQL
- ORM: Prisma
- Queue & Caching: Redis + Bull
- Email: Nodemailer (SMTP) / Resend API
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
- Email account (Gmail recommended) or Resend API key

================================================================================
INSTALLATION STEPS
================================================================================

1. Clone the repository

git clone https://github.com/uchemcolin/notes-app-nestjs.git
cd notes-app-nestjs

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file in the root directory with these contents:

DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/nestjs_notes_app?schema=public"
JWT_SECRET="supersecretkey"
JWT_EXPIRES_IN="1d"

# Email Configuration (choose one method)
# Method 1: SMTP (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
SMTP_FROM=noreply@notesapp.com

# Method 2: Resend API
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev

# Redis for Queue
REDIS_HOST=localhost
REDIS_PORT=6379

# Base URL
APP_BASE_URL=http://localhost:3000

4. Set up PostgreSQL database

Make sure PostgreSQL is running:

createdb nestjs_notes_app

Or using psql:

psql -U postgres -c "CREATE DATABASE nestjs_notes_app;"

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

Method   | Endpoint              | Description
POST     | /auth/signup          | Create new user account
POST     | /auth/login           | Login and get JWT token
POST     | /auth/forgot-password | Request password reset email
POST     | /auth/reset-password  | Reset password with token

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

Method   | Endpoint                                    | Description
GET      | /notes?page=1&limit=10                      | Get all notes (paginated)
GET      | /notes?search=keyword&page=1&limit=10       | Search notes (paginated)
POST     | /notes                                      | Create a new note
GET      | /notes/:id                                  | Get a specific note
PATCH    | /notes/:id                                  | Update a note
DELETE   | /notes/:id                                  | Delete a note

**QUERY PARAMETERS:**

Parameter  | Type    | Default | Description
page       | number  | 1       | Page number (minimum: 1)
limit      | number  | 10      | Items per page (minimum: 1, maximum: 100)
search     | string  | null    | Search keyword for filtering notes
searchBy   | string  | 'both'  | Search field: 'title', 'content', or 'both'

**GET NOTES EXAMPLE (WITH PAGINATION ONLY):**

GET http://localhost:3000/notes?page=2&limit=5
Authorization: Bearer YOUR_TOKEN_HERE

**SEARCH NOTES EXAMPLE:**

GET http://localhost:3000/notes?search=meeting&searchBy=title&page=1&limit=10
Authorization: Bearer YOUR_TOKEN_HERE

GET http://localhost:3000/notes?search=important&searchBy=content&page=1&limit=10
Authorization: Bearer YOUR_TOKEN_HERE

GET http://localhost:3000/notes?search=project&page=1&limit=10
Authorization: Bearer YOUR_TOKEN_HERE

**PAGINATED RESPONSE:**

{
  "success": true,
  "message": "Notes retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "My First Note",
      "content": "This is the content",
      "userId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 2,
    "limit": 5,
    "totalPages": 5,
    "hasNext": true,
    "hasPrevious": true
  }
}

**SEARCH RESPONSE (with metadata):**

{
  "success": true,
  "message": "Notes matching \"project\" retrieved successfully",
  "data": [...],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false,
    "search": "project",
    "searchBy": "both"
  }
}

**CREATE NOTE EXAMPLE:**

POST http://localhost:3000/notes
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my first note"
}

**CREATE NOTE RESPONSE:**

{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": 1,
    "title": "My First Note",
    "content": "This is the content of my first note",
    "userId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}

**UPDATE NOTE EXAMPLE:**

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
│   │   ├── signup.dto.ts
│   │   ├── forgot-password.dto.ts
│   │   └── reset-password.dto.ts
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
│   ├── dto/
│   │   ├── pagination.dto.ts
│   │   └── paginated-response.dto.ts
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
title       | String    | Note title (trimmed, cannot be empty)
content     | String    | Note content (trimmed, cannot be empty)
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

FORBIDDEN ERROR (403):

{
  "statusCode": 403,
  "message": "You do not have permission to access this note",
  "error": "Forbidden"
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
SMTP_HOST         | SMTP server host (for email)          | Optional
SMTP_PORT         | SMTP server port                      | Optional
SMTP_USER         | SMTP authentication user              | Optional
SMTP_PASSWORD     | SMTP authentication password          | Optional
SMTP_FROM         | Default sender email address          | Optional
RESEND_API_KEY    | Resend API key (alternative to SMTP)  | Optional
RESEND_FROM_EMAIL | Sender email for Resend               | Optional
REDIS_HOST        | Redis server host                     | localhost
REDIS_PORT        | Redis server port                     | 6379
APP_BASE_URL      | Base URL for the application          | http://localhost:3000

================================================================================
SEARCH FEATURES
================================================================================

The search functionality includes:
- **Case-insensitive** searching
- **Partial matching** (contains keyword)
- **Three search modes**:
  - `searchBy=title` - Search only in note titles
  - `searchBy=content` - Search only in note content
  - `searchBy=both` - Search in both title and content (default)
- **Integrated with pagination** - Search results are paginated
- **Search metadata** - Response includes search term and search field used

Example search requests:
- `GET /notes?search=meeting&searchBy=title` - Find notes with "meeting" in title
- `GET /notes?search=urgent&searchBy=content` - Find notes with "urgent" in content
- `GET /notes?search=project&page=2&limit=5` - Paginated search results

================================================================================
SECURITY FEATURES
================================================================================

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiration
- Protected routes with guards
- User isolation (users only see their own data)
- Input validation on all endpoints
- Environment variables for secrets
- Email validation and sanitization
- Title and content trimming to prevent empty submissions
- Maximum limit of 100 items per page to prevent abuse
- Search term sanitization and trimming

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
IMPLEMENTED FEATURES
================================================================================

- ✅ User authentication (signup/login with JWT)
- ✅ Password hashing with bcrypt
- ✅ CRUD operations for notes
- ✅ User-specific notes isolation
- ✅ Input validation with class-validator
- ✅ PostgreSQL with Prisma ORM
- ✅ Redis + Bull queue for background jobs
- ✅ Pagination with metadata (total, page, limit, totalPages, hasNext, hasPrevious)
- ✅ **Search functionality (title, content, or both with case-insensitive matching)**
- ✅ Email notifications (password reset)
- ✅ Environment configuration
- ✅ Comprehensive error handling

================================================================================
FUTURE IMPROVEMENTS
================================================================================

- [ ] Rate limiting
- [ ] API versioning
- [ ] Swagger/OpenAPI documentation
- [ ] Unit and e2e tests
- [ ] Refresh tokens
- [ ] Note sharing between users
- [ ] Categories/tags for notes
- [ ] File attachments
- [ ] Real-time updates with WebSockets
- [ ] Advanced Redis caching strategies
- [ ] Full-text search indexes for better performance
- [ ] Search suggestions and autocomplete

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
GitHub URL: https://github.com/uchemcolin/notes-app-nestjs