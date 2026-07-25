# Digital Heroes Project

This repository contains the backend and frontend code for the Digital Heroes web application.

## Data Model

The application uses **PostgreSQL** as its database, managed and accessed through the **Prisma ORM**. The data model consists of two primary entities:

### 1. `Lead`
Represents a user who has submitted a consultation request via the frontend landing page.
- **`id`** (String, UUID): Primary key.
- **`name`** (String): Full name of the prospect.
- **`email`** (String): Email address of the prospect.
- **`budget_range`** (String): Expected budget range for their project.
- **`source`** (String, Optional): Where the prospect heard about Digital Heroes.
- **`message`** (String): Details regarding their project or request.
- **`status`** (String): Current stage of the lead in the pipeline. Defaults to `"NEW"`. Valid transitions are `"CONTACTED"` or `"CLOSED"`.
- **`created_at`** (DateTime): Timestamp of when the request was submitted.

### 2. `User`
Represents an administrative user with access to the Admin Dashboard to manage leads.
- **`id`** (String, UUID): Primary key.
- **`email`** (String, Unique): Admin's email address used for login.
- **`password_hash`** (String): Securely hashed password.

---

## Authentication Approach

The application uses **JSON Web Tokens (JWT)** for securing administrative API routes.

1. **Password Security**: Admin passwords are never stored in plain text. They are hashed using `bcrypt` during user creation/seeding.
2. **Login Process**:
   - The admin logs in by making a POST request to `/api/auth/login` with their `email` and `password`.
   - The backend validates the request body using `zod`.
   - The password is authenticated against the stored `password_hash` using `bcrypt.compare`.
   - Upon success, the server generates a JWT containing the user's `id` and `email`, signed with a secret key (`JWT_SECRET`), which expires in 24 hours.
3. **Protected Routes**:
   - Routes that access sensitive data (like `GET /api/leads` and `PATCH /api/leads/:id/status`) are protected by the `authenticateToken` middleware.
   - The frontend must include the JWT in the `Authorization` header of the request, formatted as `Bearer <token>`.
   - The middleware verifies the token using `jsonwebtoken`. If the token is missing, invalid, or expired, the request is rejected with a `401 Unauthorized` or `403 Forbidden` response.
