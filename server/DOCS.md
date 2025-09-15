University CRM Backend - Complete Documentation
📚 Overview
The University CRM Backend is a comprehensive NestJS application that provides a complete backend solution for managing university courses, enrollments, assignments, and file uploads. It features role-based access control (RBAC) with three user roles: Student, Lecturer, and Admin.

🏗️ Architecture
Technology Stack
Framework: NestJS

Database: PostgreSQL with Prisma ORM

Authentication: JWT with Passport

File Upload: Multer

Validation: class-validator and class-transformer

Project Structure
text
src/
├── auth/                 # Authentication module
├── courses/             # Course management
├── assignments/         # Assignment system
├── files/              # File upload/download
├── prisma/             # Database configuration
├── common/             # Shared utilities and decorators
└── main.ts             # Application entry point
🔐 Authentication & Authorization
User Roles
STUDENT: Can enroll in courses, submit assignments, view their submissions

LECTURER: Can create/manage courses, create assignments, grade submissions

ADMIN: Full system access, can manage all entities

JWT Token Structure
typescript
{
  "sub": "user-id",      // User identifier
  "email": "user@email.com",
  "role": "STUDENT",     // User role
  "iat": 1633042800,     // Issued at timestamp
  "exp": 1633647600      // Expiration timestamp
}
📊 Database Schema
Core Models
prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  role      UserRole
  courses   Course[] @relation("LecturerCourses")
  enrollments Enrollment[]
  submissions Submission[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Course {
  id          String   @id @default(cuid())
  title       String
  credits     Int
  syllabus    String?
  lecturer    User     @relation("LecturerCourses", fields: [lecturerId], references: [id])
  lecturerId  String
  enrollments Enrollment[]
  assignments Assignment[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Enrollment {
  id        String   @id @default(cuid())
  status    EnrollmentStatus
  course    Course   @relation(fields: [courseId], references: [id])
  courseId  String
  student   User     @relation(fields: [studentId], references: [id])
  studentId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Assignment {
  id          String       @id @default(cuid())
  title       String
  description String?
  type        AssignmentType
  weight      Int
  dueDate     DateTime
  course      Course       @relation(fields: [courseId], references: [id])
  courseId    String
  submissions Submission[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Submission {
  id           String     @id @default(cuid())
  textSubmission String?
  filePath     String?
  notes        String?
  grade        Int?
  feedback     String?
  assignment   Assignment @relation(fields: [assignmentId], references: [id])
  assignmentId String
  student      User       @relation(fields: [studentId], references: [id])
  studentId    String
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
}
Enums
prisma
enum UserRole {
  STUDENT
  LECTURER
  ADMIN
}

enum EnrollmentStatus {
  ENROLLED
  COMPLETED
  DROPPED
}

enum AssignmentType {
  TEXT
  FILE
  BOTH
}
🚀 API Endpoints
Authentication Endpoints
Register a New User
http
POST /auth/register
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "password123",
  "role": "STUDENT"
}
Login
http
POST /auth/login
Content-Type: application/json

{
  "email": "user@university.edu",
  "password": "password123"
}
Get User Profile
http
GET /auth/profile
Authorization: Bearer <jwt-token>
Course Management Endpoints
Browse All Courses
http
GET /courses?search=math&credits=3&page=1&limit=10
Authorization: Bearer <jwt-token>
Get Course Details
http
GET /courses/:courseId
Authorization: Bearer <jwt-token>
Create Course (Lecturer Only)
http
POST /courses
Authorization: Bearer <lecturer-token>
Content-Type: application/json

{
  "title": "Database Systems",
  "credits": 4,
  "syllabus": "Introduction to relational databases..."
}
Update Course (Lecturer Only)
http
PUT /courses/:courseId
Authorization: Bearer <lecturer-token>
Content-Type: application/json

{
  "title": "Advanced Database Systems",
  "credits": 5
}
Enroll in Course (Student Only)
http
POST /courses/:courseId/enroll
Authorization: Bearer <student-token>
Drop Course (Student Only)
http
DELETE /courses/:courseId/drop
Authorization: Bearer <student-token>
Get Lecturer's Courses
http
GET /courses/lecturer/my-courses
Authorization: Bearer <lecturer-token>
Get Student's Enrollments
http
GET /courses/student/my-enrollments
Authorization: Bearer <student-token>
Assign Lecturer to Course (Admin Only)
http
PUT /courses/:courseId/assign-lecturer
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "lecturerId": "lecturer-uuid"
}
Assignment Management Endpoints
Create Assignment (Lecturer Only)
http
POST /assignments
Authorization: Bearer <lecturer-token>
Content-Type: application/json

{
  "title": "Final Project",
  "description": "Build a full-stack application",
  "type": "BOTH",
  "weight": 40,
  "dueDate": "2024-12-15T23:59:59.000Z",
  "courseId": "course-uuid"
}
Update Assignment (Lecturer Only)
http
PUT /assignments/:assignmentId
Authorization: Bearer <lecturer-token>
Content-Type: application/json

{
  "title": "Updated Final Project",
  "weight": 50
}
Submit Assignment (Student Only)
Text-only submission:

http
POST /assignments/:assignmentId/submit
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "textSubmission": "My assignment submission...",
  "notes": "Completed ahead of schedule"
}
File submission:

http
POST /assignments/:assignmentId/submit
Authorization: Bearer <student-token>
Content-Type: multipart/form-data

file: @/path/to/assignment.pdf
textSubmission: "Additional notes about the submission"
notes: "Please review the attached PDF"
Grade Submission (Lecturer Only)
http
PUT /assignments/submissions/:submissionId/grade
Authorization: Bearer <lecturer-token>
Content-Type: application/json

{
  "grade": 85,
  "feedback": "Excellent work! Consider improving the UI design."
}
Get Course Assignments
http
GET /assignments/course/:courseId
Authorization: Bearer <jwt-token>
Get Student's Submissions
http
GET /assignments/course/:courseId/my-submissions
Authorization: Bearer <student-token>
Get Course Grades (Lecturer Only)
http
GET /assignments/course/:courseId/grades
Authorization: Bearer <lecturer-token>
File Management Endpoints
Upload Syllabus (Lecturer Only)
http
POST /courses/:courseId/syllabus/upload
Authorization: Bearer <lecturer-token>
Content-Type: multipart/form-data

file: @/path/to/syllabus.pdf
Download Syllabus
http
GET /files/syllabus/:filename
Authorization: Bearer <jwt-token>
Download Assignment File
http
GET /files/assignments/:filename
Authorization: Bearer <jwt-token>
🔧 Configuration
Environment Variables
env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/university_crm"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="./uploads"
ALLOWED_FILE_TYPES="pdf,doc,docx"
File Upload Configuration
The system supports file uploads with the following restrictions:

Maximum file size: 5MB

Allowed file types: PDF, DOC, DOCX

Storage: Local filesystem with organized directory structure

Security: MIME type validation and file extension checking

🛡️ Security Features
Authentication
JWT-based stateless authentication

Password hashing with bcrypt (salt rounds: 12)

Token expiration with configurable duration

Authorization
Role-based access control (RBAC)

Resource-level ownership checks

Guards for route protection

Input Validation
Class-validator for DTO validation

UUID parameter validation

File type and size validation

File Security
Secure file naming to prevent path traversal

MIME type validation to prevent malicious uploads

Authorization checks before file access

📝 Error Handling
The API returns consistent error responses with appropriate HTTP status codes:

Common Error Responses
json
{
  "statusCode": 400,
  "message": ["Validation error details"],
  "error": "Bad Request"
}

{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}

{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}

{
  "statusCode": 404,
  "message": "Course not found",
  "error": "Not Found"
}

{
  "statusCode": 409,
  "message": "User is already enrolled in this course",
  "error": "Conflict"
}
🧪 Testing
Automated Testing Setup
bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
Manual Testing with cURL
Create Test Users
bash
# Create admin user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@university.edu", "password": "admin123", "role": "ADMIN"}'

# Create lecturer user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "lecturer@university.edu", "password": "lecturer123", "role": "LECTURER"}'

# Create student user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "student@university.edu", "password": "student123", "role": "STUDENT"}'
Extract JWT Tokens
bash
# Login and extract token
LECTURER_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "lecturer@university.edu", "password": "lecturer123"}' | \
  jq -r '.access_token')

STUDENT_TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@university.edu", "password": "student123"}' | \
  jq -r '.access_token')
Test Course Creation and Enrollment
bash
# Create a course
COURSE_ID=$(curl -s -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $LECTURER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Course", "credits": 3, "syllabus": "Test syllabus"}' | \
  jq -r '.id')

# Enroll in the course
curl -X POST http://localhost:3000/courses/$COURSE_ID/enroll \
  -H "Authorization: Bearer $STUDENT_TOKEN"
🚀 Deployment
Production Considerations
Environment Variables: Set production values for all environment variables

Database: Use a managed PostgreSQL service with connection pooling

File Storage: Consider cloud storage (S3, Cloud Storage) instead of local filesystem

HTTPS: Always use HTTPS in production

CORS: Configure CORS for your frontend domain

Rate Limiting: Implement rate limiting to prevent abuse

Monitoring: Set up logging and monitoring

Docker Deployment
dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY prisma/ ./prisma/
COPY uploads/ ./uploads/

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/main"]
📈 Monitoring and Logging
Recommended Setup
Logging: Use Winston or NestJS built-in logger with structured logging

Monitoring: Integrate with Prometheus and Grafana

Error Tracking: Use Sentry or similar service

Performance: Implement APM tools like New Relic or DataDog

🔄 API Versioning
The API uses URI versioning:

text
/api/v1/courses
/api/v1/assignments
📋 Rate Limiting
Implement rate limiting to protect against abuse:

typescript
// Example rate limiting configuration
ThrottlerModule.forRoot({
  ttl: 60,        // Time-to-live in seconds
  limit: 10,      // Maximum requests per TTL
}),
