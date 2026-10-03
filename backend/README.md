# ICEM Smart Notice Portal - Shared Backend API

A unified, secure, scalable REST backend built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM, serving both the **Admin Portal** and the **Student Portal**.

---

## Architecture Overview
- **Runtime:** Node.js (v20+ recommended)
- **Framework:** Express with TypeScript
- **Database & ORM:** PostgreSQL with Prisma ORM
- **Authentication:** JWT (Short-lived Access Tokens + Long-lived Refresh Tokens)
- **Password Hashing:** bcrypt (10 salt rounds)
- **File Uploads:** Multer with mime-type validation, size limits, and disk storage
- **Validation:** Zod schemas
- **Security:** Helmet, CORS, parameterized queries, sanitized responses

---

## Prerequisites
1. **Node.js** (v18 or higher)
2. **PostgreSQL** running locally or on a cloud provider (e.g., Neon, Supabase, Railway, AWS RDS)

---

## Setup & Installation

### 1. Configure Environment Variables
Create a `.env` file inside the `backend/` directory by copying `.env.example`:
```bash
cp .env.example .env
```

Edit `backend/.env` with your PostgreSQL database credentials:
```env
PORT=5000
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/icem_notice_db?schema=public"

# JWT configuration
JWT_SECRET="your-jwt-access-secret-key"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key"
JWT_REFRESH_EXPIRES_IN="7d"

# Allowed frontend URLs (CORS)
CLIENT_URLS="http://localhost:5173,http://localhost:5174"

# File upload configuration
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=15
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Generate Prisma Client & Push Database Schema
```bash
npm run prisma:generate
npm run prisma:push
```
Or run migrations:
```bash
npm run prisma:migrate
```

### 4. Seed the Database
Populates the database with realistic demo notices across all academic categories, demo admin and student users, campus banners/events, timetable items, and official college documents:
```bash
npm run prisma:seed
```

### 5. Start the Server
- **Development (with hot reload via `tsx`):**
  ```bash
  npm run dev
  ```
- **Production Build & Run:**
  ```bash
  npm run build
  npm start
  ```

---

## Demo Credentials (from Seed)

| Role | Username | Email | Default Password |
|---|---|---|---|
| **ADMIN** | `admin` | `admin@icem.ac.in` | `Admin@123` |
| **STUDENT** | `student01` | `student01@icem.ac.in` | `Student@123` |
| **STUDENT** | `student02` | `student02@icem.ac.in` | `Student@123` |

*Security Notice: These credentials exist solely in development seed data. Passwords are never hardcoded in source code.*

---

## API Endpoints Overview (Base URL: `/api/v1`)

### Authentication (`/api/v1/auth`)
- `POST /auth/register`: Register new student or admin
- `POST /auth/login`: Authenticate with username/email and password
- `GET /auth/me`: Get authenticated user profile (`Bearer <token>`)
- `POST /auth/refresh-token`: Renew access token with refresh token
- `POST /auth/logout`: Invalidate session

### Notices (`/api/v1/notices`)
- `GET /notices`: Paginated list of circulars (supports search, category, department, date filters)
- `GET /notices/stats`: Notice statistics (Admin only)
- `GET /notices/action-required`: Notices requiring student action for marquee ticker
- `GET /notices/calendar`: Notices indexed for calendar display
- `GET /notices/:id`: Full notice detail with attachments and related circulars
- `POST /notices`: Create notice (Admin only)
- `PUT /notices/:id`: Update notice (Admin only)
- `PATCH /notices/:id/status`: Toggle Published ↔ Archived (Admin only)
- `DELETE /notices/:id`: Delete notice (Admin only)

### Student Interactions (`/api/v1/notices/:id` & `/api/v1/student`)
- `POST /notices/:id/acknowledge`: Toggle student notice acknowledgement (Student only)
- `POST /notices/:id/bookmark`: Toggle notice bookmark (Student only)
- `GET /student/bookmarks`: Retrieve student's saved notices (Student only)
- `GET /student/acknowledgements`: Retrieve student's acknowledged notice IDs (Student only)

### Banners & Events (`/api/v1/banners`)
- `GET /banners`: Retrieve active banners for student carousel and events page
- `GET /banners/admin`: Retrieve all banners including inactive (Admin only)
- `GET /banners/:id`: Get single banner detail
- `POST /banners`: Create banner/event (Admin only)
- `PUT /banners/:id`: Update banner/event (Admin only)
- `PATCH /banners/:id/status`: Toggle active status (Admin only)
- `DELETE /banners/:id`: Delete banner (Admin only)
- `POST /banners/reset`: Reset banners to default institutional presets (Admin only)

### College Documents (`/api/v1/documents`)
- `GET /documents`: List official downloadable forms and policies
- `POST /documents`: Upload new document (Admin only)
- `DELETE /documents/:id`: Remove document (Admin only)

### Timetable (`/api/v1/timetable`)
- `GET /timetable`: List schedule items (supports `department` and `day` filters)

### Newsletter (`/api/v1/subscriptions`)
- `POST /subscriptions`: Subscribe email to notice updates

### File Uploads (`/api/v1/upload`)
- `POST /upload/attachments`: Upload up to 10 notice attachments (PDF, DOC, XLS, Images)
- `POST /upload/banner-image`: Upload banner graphic
- `POST /upload/document`: Upload official document
