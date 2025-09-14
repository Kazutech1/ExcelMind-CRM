import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Response,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserRole } from '@prisma/client';
import { AssignmentService } from './assignment.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards/auth.guards';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  SubmitAssignmentDto,
  GradeAssignmentDto,
  AssignmentQueryDto,
} from './dto/assignment.dto';

// Multer configuration for file uploads
const storage = diskStorage({
  destination: './uploads/assignments',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentController {
  constructor(private assignmentService: AssignmentService) {}

  // LECTURER: Create assignment
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  @HttpCode(HttpStatus.CREATED)
  async createAssignment(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @Request() req,
  ) {
    return this.assignmentService.createAssignment(createAssignmentDto, req.user.id);
  }

  // LECTURER: Update assignment
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  async updateAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @Request() req,
  ) {
    return this.assignmentService.updateAssignment(id, updateAssignmentDto, req.user.id);
  }

  // Get assignments for a course (Students and Lecturers)
  @Get('course/:courseId')
  async getCourseAssignments(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Request() req,
  ) {
    return this.assignmentService.getCourseAssignments(
      courseId,
      req.user.id,
      req.user.role,
    );
  }

  // STUDENT: Submit assignment (with optional file upload)
  @Post(':id/submit')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  @UseInterceptors(FileInterceptor('file', { storage }))
  @HttpCode(HttpStatus.CREATED)
  async submitAssignment(
    @Param('id', ParseUUIDPipe) assignmentId: string,
    @Body() submitAssignmentDto: SubmitAssignmentDto,
    @Request() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({
            fileType: /(jpg|jpeg|png|gif|pdf|doc|docx|txt|zip|rar)$/,
          }),
        ],
        fileIsRequired: false, // File is optional since assignment might be text-only
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.assignmentService.submitAssignment(
      assignmentId,
      req.user.id,
      submitAssignmentDto,
      file,
    );
  }

  // LECTURER: Grade submission
  @Put('submissions/:submissionId/grade')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  async gradeSubmission(
    @Param('submissionId', ParseUUIDPipe) submissionId: string,
    @Body() gradeAssignmentDto: GradeAssignmentDto,
    @Request() req,
  ) {
    return this.assignmentService.gradeSubmission(
      submissionId,
      gradeAssignmentDto,
      req.user.id,
    );
  }

  // STUDENT: Get my submissions for a course
  @Get('course/:courseId/my-submissions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async getMySubmissions(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Request() req,
  ) {
    return this.assignmentService.getStudentSubmissions(courseId, req.user.id);
  }

  // LECTURER: Get course grades
  @Get('course/:courseId/grades')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  async getCourseGrades(
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Request() req,
  ) {
    return this.assignmentService.getCourseGrades(courseId, req.user.id);
  }

  // Get single assignment details
  @Get(':id')
  async getAssignmentById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    // This would need to be implemented in the service
    // For now, you can get it through the course assignments endpoint
    throw new Error('Not implemented - use course assignments endpoint');
  }

  // LECTURER: Delete assignment
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.LECTURER)
  async deleteAssignment(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    // This would need to be implemented in the service
    throw new Error('Not implemented yet');
  }
}

// Separate controller for file downloads
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileController {
  @Get('assignments/:filename')
  async downloadFile(
    @Param('filename') filename: string,
    @Request() req,
    @Response() res,
  ) {
    // This would need proper file access control
    // Check if user has permission to access the file
    const filePath = `./uploads/assignments/${filename}`;
    return res.sendFile(filePath, { root: '.' });
  }
}