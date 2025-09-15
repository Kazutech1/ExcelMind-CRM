# University CRM Backend

A complete NestJS backend with Prisma and PostgreSQL for a university CRM system.

## 📁 Project Structure

```
src/
├── auth/
│   ├── dto/
│   │   └── auth.dto.ts          # Data transfer objects for auth
│   ├── guards/
│   │   └── auth.guards.ts       # JWT and Role guards
│   ├── strategies/
│   │   └── jwt.strategy.ts      # JWT Passport strategy
│   ├── auth.controller.ts       # Auth endpoints (register, login)
│   ├── auth.service.ts          # Auth business logic
│   └── auth.module.ts           # Auth module configuration
├── prisma/
│   ├── prisma.service.ts        # Prisma client service
│   └── prisma.module.ts         # Prisma module (global)
├── courses/
│   └── courses.controller.ts    # Example protected routes
├── app.module.ts                # Main app module
└── main.ts                      # Application entry point

prisma/
└── schema.prisma               # Database schema

.env                            # Environment variables
package.json                    # Dependencies and scripts
```

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup PostgreSQL Database
Make sure you have PostgreSQL running locally or use a cloud service like Railway, Supabase, or PlanetScale.

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/university_crm?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# App
PORT=3000
NODE_ENV="development"
```

### 4. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 5. Start the Server
```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run start:prod
```

## 🔑 Authentication Endpoints

### Register a New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "password123",
  "role": "STUDENT"
}
```

**Roles Available:** `STUDENT`, `LECTURER`, `ADMIN`

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "student@university.edu",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "clrx...",
    "email": "student@university.edu",
    "role": "STUDENT"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer your-jwt-token
```

## 🔒 Role-Based Access Control

### Using Guards in Controllers

```typescript
import { UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/auth.guards';

@Controller('courses')
@UseGuards(JwtAuthGuard) // Require authentication
export class CoursesController {
  
  // Anyone authenticated can access
  @Get()
  getAllCourses() {
    return { courses: [] };
  }
  
  // Only lecturers and admins
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER, UserRole.ADMIN)
  createCourse() {
    return { message: 'Course created' };
  }
  
  // Only admins
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  deleteCourse() {
    return { message: 'Course deleted' };
  }
}
```

## 📊 Database Schema

### User Model
- `id`: Unique identifier (CUID)
- `email`: User email (unique)
- `password`: Hashed password
- `role`: STUDENT | LECTURER | ADMIN
- `createdAt`, `updatedAt`: Timestamps

### Course Model
- `id`: Unique identifier
- `title`: Course title
- `credits`: Number of credits
- `lecturerId`: Reference to lecturer
- `syllabus`: Course description (optional)

### Enrollment Model
- `id`: Unique identifier
- `courseId`: Reference to course
- `studentId`: Reference to student
- `status`: ENROLLED | COMPLETED | DROPPED

### Assignment Model
- `id`: Unique identifier
- `courseId`: Reference to course
- `studentId`: Reference to student
- `file`: File path or URL
- `grade`: Grade out of 100 (optional)

## 🛡️ Security Features

### Password Hashing
- Uses bcrypt with salt rounds of 12
- Passwords are never stored in plain text

### JWT Authentication
- Tokens expire in 7 days (configurable)
- Include user ID, email, and role in payload
- Stateless authentication

### Role-Based Authorization
- Three user roles: Student, Lecturer, Admin
- Guards prevent unauthorized access
- Role checks at route level

## 🧪 Testing the API

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123",
    "role": "ADMIN"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123"
  }'
```

**Access Protected Route:**
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman or Thunder Client

1. **Register** a new user with role `ADMIN`
2. **Login** to get the JWT token
3. **Copy the access_token** from the response
4. **Add Authorization header**: `Bearer YOUR_TOKEN`
5. **Test protected routes** with different roles

## 📝 Common Commands

```bash
# Database commands
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema changes (dev)
npm run db:migrate    # Create and run migrations
npm run db:studio     # Open Prisma Studio

# Development
npm run start:dev     # Start with hot reload
npm run start:debug   # Start in debug mode

# Code quality
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
```

## 🔧 Environment Setup for Production

### 1. Strong JWT Secret
Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Database Connection
For production, use connection pooling:
```env
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=60"
```

### 3. Environment Variables
```env
NODE_ENV="production"
JWT_SECRET="your-64-character-random-secret"
JWT_EXPIRES_IN="24h"
DATABASE_URL="your-production-database-url"
PORT=3000
```

## 🎯 Next Steps

### Extend the API:
1. **Course Management**: Create full CRUD for courses
2. **Enrollment System**: Student enrollment endpoints
3. **Assignment Submission**: File upload handling
4. **Grading System**: Lecturer grading functionality
5. **Notifications**: Email/SMS notifications
6. **Reports**: Analytics and reporting features

### Add Features:
- File upload for assignments (using multer)
- Email verification for registration
- Password reset functionality
- Rate limiting and request throttling
- API documentation with Swagger
- Unit and integration tests

### Security Enhancements:
- Refresh token implementation
- Account lockout after failed attempts
- IP-based rate limiting
- Input sanitization and validation
- HTTPS enforcement
- Security headers (helmet.js)

## 🐛 Troubleshooting

### Common Issues:

**Database Connection Error:**
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Ensure database exists

**JWT Token Invalid:**
- Check JWT_SECRET in .env
- Verify token hasn't expired
- Ensure Bearer prefix in Authorization header

**Permission Denied:**
- Check user role matches required roles
- Verify JWT token is valid
- Ensure user exists in database

**Prisma Generate Error:**
- Run `npm run db:generate`
- Check schema.prisma syntax
- Restart TypeScript server in VS Code




# Course Management API Testing Guide

## 🚀 **Complete API Endpoints Overview**

### **Authentication Required Headers:**
```
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

---

## 📚 **COURSE MANAGEMENT ENDPOINTS**

### **1. Browse All Courses (Any Role)**
```http
GET /courses?search=math&credits=3&page=1&limit=10
```

**Query Parameters:**
- `search` - Search in title, syllabus, lecturer email
- `lecturerId` - Filter by specific lecturer
- `credits` - Filter by credit hours
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)

**Response:**
```json
{
  "courses": [
    {
      "id": "course-uuid",
      "title": "Advanced Mathematics",
      "credits": 3,
      "syllabus": "Advanced mathematical concepts...",
      "lecturer": {
        "id": "lecturer-uuid",
        "email": "prof.smith@university.edu",
        "role": "LECTURER"
      },
      "_count": {
        "enrollments": 25
      },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### **2. Get Single Course Details (Any Role)**
```http
GET /courses/course-uuid
```

**Response:**
```json
{
  "id": "course-uuid",
  "title": "Advanced Mathematics",
  "credits": 3,
  "syllabus": "Complete course description...",
  "lecturer": {
    "id": "lecturer-uuid",
    "email": "prof.smith@university.edu",
    "role": "LECTURER"
  },
  "enrollments": [
    {
      "id": "enrollment-uuid",
      "status": "ENROLLED",
      "student": {
        "id": "student-uuid",
        "email": "john@student.edu",
        "role": "STUDENT"
      },
      "createdAt": "2025-01-10T09:00:00.000Z"
    }
  ],
  "_count": {
    "enrollments": 25,
    "assignments": 8
  }
}
```

---

## 👨‍🏫 **LECTURER ENDPOINTS**

### **3. Create Course (LECTURER Only)**
```http
POST /courses
Authorization: Bearer lecturer_jwt_token
Content-Type: application/json

{
  "title": "Database Systems",
  "credits": 4,
  "syllabus": "Introduction to relational databases, SQL, normalization..."
}
```

**Response:**
```json
{
  "id": "new-course-uuid",
  "title": "Database Systems",
  "credits": 4,
  "syllabus": "Introduction to relational databases...",
  "lecturerId": "lecturer-uuid",
  "lecturer": {
    "id": "lecturer-uuid",
    "email": "prof.johnson@university.edu",
    "role": "LECTURER"
  },
  "_count": {
    "enrollments": 0
  },
  "createdAt": "2025-01-15T14:30:00.000Z"
}
```

### **4. Update Own Course (LECTURER Only)**
```http
PUT /courses/course-uuid
Authorization: Bearer lecturer_jwt_token
Content-Type: application/json

{
  "title": "Advanced Database Systems",
  "credits": 5,
  "syllabus": "Updated syllabus with NoSQL databases..."
}
```

### **5. Get Lecturer's Own Courses**
```http
GET /courses/lecturer/my-courses
Authorization: Bearer lecturer_jwt_token
```

**Response:**
```json
[
  {
    "id": "course-uuid-1",
    "title": "Database Systems",
    "credits": 4,
    "syllabus": "Database course description...",
    "_count": {
      "enrollments": 30,
      "assignments": 5
    },
    "createdAt": "2025-01-01T10:00:00.000Z"
  }
]
```

---

## 👨‍🎓 **STUDENT ENDPOINTS**

### **6. Enroll in Course (STUDENT Only)**
```http
POST /courses/course-uuid/enroll
Authorization: Bearer student_jwt_token
```

**Response:**
```json
{
  "id": "enrollment-uuid",
  "status": "ENROLLED",
  "course": {
    "id": "course-uuid",
    "title": "Database Systems",
    "credits": 4
  },
  "student": {
    "id": "student-uuid",
    "email": "jane@student.edu"
  },
  "createdAt": "2025-01-15T16:00:00.000Z"
}
```

### **7. Drop from Course (STUDENT Only)**
```http
DELETE /courses/course-uuid/drop
Authorization: Bearer student_jwt_token
```

**Response:**
```json
{
  "id": "enrollment-uuid",
  "status": "DROPPED",
  "course": {
    "id": "course-uuid",
    "title": "Database Systems",
    "credits": 4
  },
  "student": {
    "id": "student-uuid",
    "email": "jane@student.edu"
  },
  "updatedAt": "2025-01-15T17:00:00.000Z"
}
```

### **8. Get Student's Enrollments**
```http
GET /courses/student/my-enrollments
Authorization: Bearer student_jwt_token
```

**Response:**
```json
[
  {
    "id": "enrollment-uuid",
    "status": "ENROLLED",
    "course": {
      "id": "course-uuid",
      "title": "Database Systems",
      "credits": 4,
      "lecturer": {
        "id": "lecturer-uuid",
        "email": "prof.johnson@university.edu"
      }
    },
    "createdAt": "2025-01-15T16:00:00.000Z"
  }
]
```

---

## 👨‍💼 **ADMIN ENDPOINTS**

### **9. Assign Lecturer to Course (ADMIN Only)**
```http
PUT /courses/course-uuid/assign-lecturer
Authorization: Bearer admin_jwt_token
Content-Type: application/json

{
  "lecturerId": "new-lecturer-uuid"
}
```

**Response:**
```json
{
  "id": "course-uuid",
  "title": "Database Systems",
  "credits": 4,
  "lecturer": {
    "id": "new-lecturer-uuid",
    "email": "prof.williams@university.edu",
    "role": "LECTURER"
  },
  "_count": {
    "enrollments": 30
  },
  "updatedAt": "2025-01-15T18:00:00.000Z"
}
```

### **10. Get All Enrollments (ADMIN Only)**
```http
GET /courses/admin/enrollments?page=1&limit=20
Authorization: Bearer admin_jwt_token
```

**Response:**
```json
{
  "enrollments": [
    {
      "id": "enrollment-uuid",
      "status": "ENROLLED",
      "course": {
        "id": "course-uuid",
        "title": "Database Systems",
        "credits": 4
      },
      "student": {
        "id": "student-uuid",
        "email": "jane@student.edu"
      },
      "createdAt": "2025-01-15T16:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

### **11. Update Enrollment Status (ADMIN Only)**
```http
PUT /enrollments/enrollment-uuid/status
Authorization: Bearer admin_jwt_token
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

**Available Status Values:**
- `ENROLLED` - Active enrollment
- `COMPLETED` - Course completed
- `DROPPED` - Student dropped

**Response:**
```json
{
  "id": "enrollment-uuid",
  "status": "COMPLETED",
  "course": {
    "id": "course-uuid",
    "title": "Database Systems",
    "credits": 4
  },
  "student": {
    "id": "student-uuid",
    "email": "jane@student.edu"
  },
  "updatedAt": "2025-01-15T19:00:00.000Z"
}
```

---

## 🧪 **Complete Testing Workflow**

### **1. Setup Test Users**
```bash
# Create Admin
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123",
    "role": "ADMIN"
  }'

# Create Lecturer
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prof.smith@university.edu",
    "password": "lecturer123",
    "role": "LECTURER"
  }'

# Create Student
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@student.edu",
    "password": "student123",
    "role": "STUDENT"
  }'
```

### **2. Login and Get Tokens**
```bash
# Login as Lecturer
LECTURER_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prof.smith@university.edu",
    "password": "lecturer123"
  }' | jq -r '.access_token')

# Login as Student
STUDENT_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@student.edu",
    "password": "student123"
  }' | jq -r '.access_token')

# Login as Admin
ADMIN_TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123"
  }' | jq -r '.access_token')
```

### **3. Test Course Lifecycle**

**Step 1: Lecturer Creates Course**
```bash
COURSE_ID=$(curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $LECTURER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Web Development",
    "credits": 3,
    "syllabus": "HTML, CSS, JavaScript, React, Node.js"
  }' | jq -r '.id')

echo "Created course: $COURSE_ID"
```

**Step 2: Student Enrolls**
```bash
curl -X POST http://localhost:3000/courses/$COURSE_ID/enroll \
  -H "Authorization: Bearer $STUDENT_TOKEN"
```

**Step 3: View Course with Enrollments**
```bash
curl -X GET http://localhost:3000/courses/$COURSE_ID \
  -H "Authorization: Bearer $LECTURER_TOKEN"
```

**Step 4: Admin Assigns Different Lecturer**
```bash
# First get lecturer ID from a login response or user list
curl -X PUT http://localhost:3000/courses/$COURSE_ID/assign-lecturer \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lecturerId": "different-lecturer-uuid"
  }'
```

---

## 🚨 **Error Handling Examples**

### **Validation Errors (400)**
```bash
# Invalid credits (must be 1-10)
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $LECTURER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Course",
    "credits": 15
  }'

# Response:
{
  "statusCode": 400,
  "message": ["credits must not be greater than 10"],
  "error": "Bad Request"
}
```

### **Authorization Errors (403)**
```bash
# Student trying to create course
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Unauthorized Course",
    "credits": 3
  }'

# Response:
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### **Conflict Errors (409)**
```bash
# Student enrolling in same course twice
curl -X POST http://localhost:3000/courses/$COURSE_ID/enroll \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Response:
{
  "statusCode": 409,
  "message": "You are already enrolled in this course",
  "error": "Conflict"
}
```

---

## 📊 **Advanced Query Examples**

### **Search Courses**
```bash
# Search by title and lecturer
curl -G http://localhost:3000/courses \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  --data-urlencode "search=database" \
  --data-urlencode "credits=4" \
  --data-urlencode "page=1" \
  --data-urlencode "limit=5"
```

### **Filter by Lecturer**
```bash
# Get all courses by specific lecturer
curl -G http://localhost:3000/courses \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  --data-urlencode "lecturerId=lecturer-uuid-here"
```

### **Pagination Example**
```bash
# Get page 2 with 15 items per page
curl -G http://localhost:3000/courses \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  --data-urlencode "page=2" \
  --data-urlencode "limit=15"
```

---

## 🛡️ **Security Features Implemented**

### **Role-Based Access Control**
- ✅ **LECTURER**: Can create/update own courses only
- ✅ **STUDENT**: Can enroll/drop, view enrollments only
- ✅ **ADMIN**: Full control over courses and enrollments
- ✅ **ALL**: Can browse and view course details

### **Data Validation**
- ✅ Course titles are required and non-empty
- ✅ Credits must be between 1-10
- ✅ UUIDs validated for all ID parameters
- ✅ Enum validation for enrollment status

### **Business Logic Protection**
- ✅ Lecturers can only modify their own courses
- ✅ Students cannot enroll twice in same course
- ✅ Cannot drop completed courses
- ✅ Duplicate course titles prevented per lecturer
- ✅ Only lecturers can be assigned to courses

### **Error Handling**
- ✅ Proper HTTP status codes
- ✅ Descriptive error messages
- ✅ Input validation with class-validator
- ✅ Database constraint handling

---

## 🚀 **Next Steps & Extensions**

### **File Upload for Syllabus**
Add file upload functionality for PDF/DOCX syllabus files:

```typescript
// In CoursesController
@Post('upload-syllabus/:id')
@UseGuards(RolesGuard)
@Roles(UserRole.LECTURER)
@UseInterceptors(FileInterceptor('file'))
async uploadSyllabus(
  @Param('id') courseId: string,
  @UploadedFile() file: Express.Multer.File,
  @Request() req,
) {
  // Implementation for file upload
}
```

### **Notification System**
- Email notifications for enrollment approvals
- Deadline reminders for assignments
- Course update notifications

### **Advanced Features**
- Course prerequisites handling
- Waiting lists for full courses
- Grade management integration
- Course evaluation/rating system
- Bulk enrollment management

### **Performance Optimizations**
- Database indexing for search queries
- Caching for frequently accessed courses
- Pagination optimization
- Query optimization with Prisma

This complete Course Management system provides a solid foundation for your University CRM with proper security, validation, and extensibility!



# 📁 File Upload System - Complete Testing Guide

## 🎯 **File Upload Features Implemented**

### ✅ **Secure File Upload:**
- **File Types**: PDF, DOC, DOCX only
- **File Size**: Maximum 5MB
- **Security**: MIME type validation, file extension checking
- **Storage**: Local filesystem with organized directory structure
- **Naming**: Auto-generated unique filenames to prevent conflicts

### ✅ **RBAC Integration:**
- **LECTURERS**: Upload/delete syllabus for their own courses
- **ALL AUTHENTICATED**: Download syllabus files
- **AUTOMATIC CLEANUP**: Old files deleted when new ones uploaded

### ✅ **File Management:**
- Upload syllabus for course
- Replace existing syllabus  
- Delete syllabus file
- Download syllabus with friendly filename
- File statistics for lecturers

---

## 🚀 **Installation & Setup**

### **1. Install Additional Dependencies**
```bash
npm install multer




# LECTURER: Create an assignment
curl -X POST http://localhost:3000/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Final Project",
    "description": "Build a full-stack web application",
    "type": "BOTH",
    "weight": 40,
    "dueDate": "2024-12-15T23:59:59.000Z",
    "courseId": "course-uuid-here"
  }'

# LECTURER: Update assignment
curl -X PUT http://localhost:3000/assignments/assignment-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated Final Project",
    "weight": 50
  }'

# STUDENT: Submit text-only assignment
curl -X POST http://localhost:3000/assignments/assignment-uuid/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "textSubmission": "My assignment submission text here...",
    "notes": "Completed ahead of deadline"
  }'

# STUDENT: Submit assignment with file
curl -X POST http://localhost:3000/assignments/assignment-uuid/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/assignment.pdf" \
  -F "textSubmission=Additional notes about the file" \
  -F "notes=Please review the PDF attachment"

# LECTURER: Grade a submission
curl -X PUT http://localhost:3000/assignments/submissions/submission-uuid/grade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "grade": 85,
    "feedback": "Great work! Consider improving the user interface design."
  }'

# Get assignments for a course (Students/Lecturers)
curl -X GET http://localhost:3000/assignments/course/course-uuid \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# STUDENT: Get my submissions for a course
curl -X GET http://localhost:3000/assignments/course/course-uuid/my-submissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# LECTURER: Get course grades
curl -X GET http://localhost:3000/assignments/course/course-uuid/grades \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Download assignment file
curl -X GET http://localhost:3000/files/assignments/filename.pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output downloaded-file.pdf