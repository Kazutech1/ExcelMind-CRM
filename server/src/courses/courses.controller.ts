import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UserRole, EnrollmentStatus } from '@prisma/client';
import { CoursesService } from './courses.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/auth.guards';
import {
  CreateCourseDto,
  UpdateCourseDto,
  AssignLecturerDto,
  UpdateEnrollmentDto,
  CourseQueryDto,
} from './dto/course.dto';

@Controller('courses')
@UseGuards(JwtAuthGuard) // All routes require authentication
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // PUBLIC (authenticated): Browse all courses with filtering
  @Get()
  async getAllCourses(@Query() query: CourseQueryDto) {
    return this.coursesService.getAllCourses(query);
  }

  // PUBLIC (authenticated): Get single course details
  @Get(':id')
  async getCourseById(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.getCourseById(id);
  }

  // LECTURER ONLY: Create a new course
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  @HttpCode(HttpStatus.CREATED)
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
    @Request() req,
  ) {
    return this.coursesService.createCourse(createCourseDto, req.user.id);
  }

  // LECTURER ONLY: Update their own course
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  async updateCourse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @Request() req,
  ) {
    return this.coursesService.updateCourse(id, updateCourseDto, req.user.id);
  }

  // LECTURER ONLY: Get their own courses
  @Get('lecturer/my-courses')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  async getLecturerCourses(@Request() req) {
    return this.coursesService.getLecturerCourses(req.user.id);
  }

  // STUDENT ONLY: Request enrollment in a course (now creates PENDING request)
  @Post(':id/enroll')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  async enrollInCourse(
    @Param('id', ParseUUIDPipe) courseId: string,
    @Request() req,
  ) {
    return this.coursesService.requestEnrollment(courseId, req.user.id);
  }

  // STUDENT ONLY: Drop from a course (or cancel pending request)
  @Delete(':id/drop')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async dropFromCourse(
    @Param('id', ParseUUIDPipe) courseId: string,
    @Request() req,
  ) {
    return this.coursesService.dropFromCourse(courseId, req.user.id);
  }

  // STUDENT ONLY: Get their enrollments
  @Get('student/my-enrollments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async getStudentEnrollments(@Request() req) {
    return this.coursesService.getStudentEnrollments(req.user.id);
  }

  // ADMIN ONLY: Assign lecturer to course
  @Put(':id/assign-lecturer')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async assignLecturer(
    @Param('id', ParseUUIDPipe) courseId: string,
    @Body() assignLecturerDto: AssignLecturerDto,
  ) {
    return this.coursesService.assignLecturer(courseId, assignLecturerDto);
  }

  // ADMIN ONLY: Get all enrollments for management (with optional status filter)
  @Get('admin/enrollments')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllEnrollments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: EnrollmentStatus,
  ) {
    return this.coursesService.getAllEnrollments(page, limit, status);
  }

  // ADMIN ONLY: Get pending enrollment requests
  @Get('admin/enrollments/pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingEnrollments(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.coursesService.getPendingEnrollments(page, limit);
  }
}

// Separate controller for enrollment management
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentsController {
  constructor(private coursesService: CoursesService) {}

  // ADMIN ONLY: Update enrollment status (approve/reject)
  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateEnrollmentStatus(
    @Param('id', ParseUUIDPipe) enrollmentId: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    return this.coursesService.updateEnrollmentStatus(
      enrollmentId,
      updateEnrollmentDto,
    );
  }

  // ADMIN ONLY: Get enrollment by ID
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getEnrollmentById(@Param('id', ParseUUIDPipe) id: string) {
    // This could be implemented if needed
    throw new Error('Not implemented yet');
  }
}