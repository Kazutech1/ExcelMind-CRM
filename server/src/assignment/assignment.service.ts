import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  SubmitAssignmentDto,
  GradeAssignmentDto,
  AssignmentQueryDto,
} from './dto/assignment.dto';
import {
  UserRole,
  AssignmentType,
  SubmissionStatus,
  EnrollmentStatus,
} from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AssignmentService {
  constructor(private prisma: PrismaService) {}

  // LECTURER: Create assignment for their course
  async createAssignment(createAssignmentDto: CreateAssignmentDto, lecturerId: string) {
    const { courseId, ...assignmentData } = createAssignmentDto;

    // Verify lecturer owns the course
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        lecturerId: lecturerId,
      },
    });

    if (!course) {
      throw new ForbiddenException('You can only create assignments for your own courses');
    }

    // Validate weight doesn't exceed 100% total
    const existingAssignments = await this.prisma.assignment.findMany({
      where: { courseId },
      select: { weight: true },
    });

    const totalWeight = existingAssignments.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight + assignmentData.weight > 100) {
      throw new BadRequestException(
        `Total assignment weight would exceed 100%. Current total: ${totalWeight}%`
      );
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        ...assignmentData,
        courseId,
        createdById: lecturerId,
        dueDate: new Date(assignmentData.dueDate),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    // Create empty submissions for all enrolled students
    await this.createEmptySubmissions(assignment.id, courseId);

    return assignment;
  }

  // LECTURER: Update assignment
  async updateAssignment(
    assignmentId: string,
    updateAssignmentDto: UpdateAssignmentDto,
    lecturerId: string,
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.course.lecturerId !== lecturerId) {
      throw new ForbiddenException('You can only update your own assignments');
    }

    // If updating weight, validate total doesn't exceed 100%
    if (updateAssignmentDto.weight !== undefined) {
      const otherAssignments = await this.prisma.assignment.findMany({
        where: {
          courseId: assignment.courseId,
          id: { not: assignmentId },
        },
        select: { weight: true },
      });

      const otherWeight = otherAssignments.reduce((sum, a) => sum + a.weight, 0);
      if (otherWeight + updateAssignmentDto.weight > 100) {
        throw new BadRequestException(
          `Total assignment weight would exceed 100%. Current other assignments total: ${otherWeight}%`
        );
      }
    }

    const updateData: any = { ...updateAssignmentDto };
    if (updateAssignmentDto.dueDate) {
      updateData.dueDate = new Date(updateAssignmentDto.dueDate);
    }

    const updatedAssignment = await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: updateData,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    });

    return updatedAssignment;
  }

  // STUDENT: Submit assignment
  async submitAssignment(
    assignmentId: string,
    studentId: string,
    submitAssignmentDto: SubmitAssignmentDto,
    file?: Express.Multer.File,
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { course: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Check if student is enrolled
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: assignment.courseId,
          studentId,
        },
      },
    });

    if (!enrollment || enrollment.status !== EnrollmentStatus.ENROLLED) {
      throw new ForbiddenException('You must be enrolled in the course to submit assignments');
    }

    // Validate submission type
    const { textSubmission } = submitAssignmentDto;
    
    if (assignment.type === AssignmentType.FILE_UPLOAD && !file) {
      throw new BadRequestException('File upload is required for this assignment');
    }

    if (assignment.type === AssignmentType.TEXT_SUBMISSION && !textSubmission) {
      throw new BadRequestException('Text submission is required for this assignment');
    }

    if (assignment.type === AssignmentType.BOTH && !file && !textSubmission) {
      throw new BadRequestException('Either file upload or text submission is required');
    }

    // Check if due date has passed
    const now = new Date();
    const isLate = now > assignment.dueDate;
    const status = isLate ? SubmissionStatus.LATE_SUBMISSION : SubmissionStatus.SUBMITTED;

    // Prepare submission data
    const submissionData: any = {
      ...submitAssignmentDto,
      status,
      submittedAt: now,
    };

    // Handle file upload
    if (file) {
      submissionData.filePath = file.path;
      submissionData.fileName = file.originalname;
      submissionData.fileSize = file.size;
      submissionData.mimeType = file.mimetype;
    }

    const submission = await this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: submissionData,
      create: {
        assignmentId,
        studentId,
        ...submissionData,
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            type: true,
            dueDate: true,
          },
        },
        student: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return submission;
  }

  // LECTURER: Grade assignment submission
  async gradeSubmission(
    submissionId: string,
    gradeAssignmentDto: GradeAssignmentDto,
    lecturerId: string,
  ) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: { course: true },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.assignment.course.lecturerId !== lecturerId) {
      throw new ForbiddenException('You can only grade submissions for your own courses');
    }

    const gradedSubmission = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: gradeAssignmentDto.grade,
        feedback: gradeAssignmentDto.feedback,
        status: SubmissionStatus.GRADED,
        gradedAt: new Date(),
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            weight: true,
          },
        },
        student: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Update course grade
    await this.updateCourseGrade(
      submission.assignment.courseId,
      submission.studentId,
    );

    return gradedSubmission;
  }

  // Get assignments for a course
  async getCourseAssignments(courseId: string, userId: string, userRole: UserRole) {
    // Check access permissions
    if (userRole === UserRole.STUDENT) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: {
          courseId_studentId: {
            courseId,
            studentId: userId,
          },
        },
      });

      if (!enrollment || enrollment.status !== EnrollmentStatus.ENROLLED) {
        throw new ForbiddenException('You must be enrolled in the course to view assignments');
      }
    } else if (userRole === UserRole.LECTURER) {
      const course = await this.prisma.course.findFirst({
        where: {
          id: courseId,
          lecturerId: userId,
        },
      });

      if (!course) {
        throw new ForbiddenException('You can only view assignments for your own courses');
      }
    }

    const assignments = await this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        submissions: userRole === UserRole.STUDENT ? {
          where: { studentId: userId },
          select: {
            id: true,
            status: true,
            grade: true,
            submittedAt: true,
            gradedAt: true,
          },
        } : {
          select: {
            id: true,
            status: true,
            grade: true,
            student: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    return assignments;
  }

  // Get student's submissions for a course
  async getStudentSubmissions(courseId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId,
        },
      },
    });

    if (!enrollment || enrollment.status !== EnrollmentStatus.ENROLLED) {
      throw new ForbiddenException('You must be enrolled in the course');
    }

    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: {
        studentId,
        assignment: {
          courseId,
        },
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            type: true,
            weight: true,
            dueDate: true,
          },
        },
      },
      orderBy: {
        assignment: {
          dueDate: 'asc',
        },
      },
    });

    return submissions;
  }

  // Get course grades
  async getCourseGrades(courseId: string, lecturerId: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: courseId,
        lecturerId,
      },
    });

    if (!course) {
      throw new ForbiddenException('You can only view grades for your own courses');
    }

    const grades = await this.prisma.courseGrade.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
          },
        },
      }, 
      orderBy: {
        student: {
          email: 'asc',
        },
      },
    });

    return grades;
  }

  // Private helper methods
  private async createEmptySubmissions(assignmentId: string, courseId: string) {
    const enrolledStudents = await this.prisma.enrollment.findMany({
      where: {
        courseId,
        status: EnrollmentStatus.ENROLLED,
      },
      select: { studentId: true },
    });

    const submissionsData = enrolledStudents.map(enrollment => ({
      assignmentId,
      studentId: enrollment.studentId,
      status: SubmissionStatus.NOT_SUBMITTED,
    }));

    if (submissionsData.length > 0) {
      await this.prisma.assignmentSubmission.createMany({
        data: submissionsData,
        skipDuplicates: true,
      });
    }
  }

  private async updateCourseGrade(courseId: string, studentId: string) {
    // Get all graded submissions for the student in this course
    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: {
        studentId,
        assignment: {
          courseId,
        },
        status: SubmissionStatus.GRADED,
        grade: { not: null },
      },
      include: {
        assignment: {
          select: {
            weight: true,
          },
        },
      },
    });

    if (submissions.length === 0) return;

    // Calculate weighted average
    let totalWeightedScore = 0;
    let totalWeight = 0;

    submissions.forEach(submission => {
      const weight = submission.assignment.weight / 100;
      totalWeightedScore += (submission.grade! * weight);
      totalWeight += weight;
    });

    const finalGrade = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    const letterGrade = this.calculateLetterGrade(finalGrade);

    // Upsert course grade
    await this.prisma.courseGrade.upsert({
      where: {
        courseId_studentId: {
          courseId,
          studentId,
        },
      },
      update: {
        finalGrade,
        letterGrade,
      },
      create: {
        courseId,
        studentId,
        finalGrade,
        letterGrade,
      },
    });
  }

  private calculateLetterGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}