import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  ConflictException,
  BadRequestException 
} from '@nestjs/common';
import { UserRole, EnrollmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { 
  CreateCourseDto, 
  UpdateCourseDto, 
  AssignLecturerDto, 
  UpdateEnrollmentDto,
  CourseQueryDto 
} from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // LECTURER: Create a new course
  async createCourse(createCourseDto: CreateCourseDto, lecturerId: string) {
    const { title, credits, syllabus } = createCourseDto;

    // Check if course with same title exists for this lecturer
    const existingCourse = await this.prisma.course.findFirst({
      where: {
        title,
        lecturerId,
      },
    });

    if (existingCourse) {
      throw new ConflictException('You already have a course with this title');
    }

    const course = await this.prisma.course.create({
      data: {
        title,
        credits,
        syllabus,
        lecturerId,
      },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return course;
  }

  // LECTURER: Update their own course
  async updateCourse(id: string, updateCourseDto: UpdateCourseDto, lecturerId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (course.lecturerId !== lecturerId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id },
      data: updateCourseDto,
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return updatedCourse;
  }

  // STUDENT/ALL: Browse courses with filtering and pagination
  async getAllCourses(query: CourseQueryDto) {
    const { search, lecturerId, credits, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { syllabus: { contains: search, mode: 'insensitive' } },
        { lecturer: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (lecturerId) {
      where.lecturerId = lecturerId;
    }

    if (credits) {
      where.credits = credits;
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          lecturer: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          _count: {
            select: {
              enrollments: {
                where: {
                  status: EnrollmentStatus.ENROLLED,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Get single course by ID
  async getCourseById(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
  }

  // LECTURER: Get their own courses
  async getLecturerCourses(lecturerId: string) {
    const courses = await this.prisma.course.findMany({
      where: { lecturerId },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                status: EnrollmentStatus.ENROLLED,
              },
            },
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses;
  }

 // STUDENT: Request enrollment in a course
  async requestEnrollment(courseId: string, studentId: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if student is already enrolled or has existing request
    const existingEnrollment = await this.prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId,
        },
      },
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === EnrollmentStatus.ENROLLED) {
        throw new ConflictException('You are already enrolled in this course');
      }
      if (existingEnrollment.status === EnrollmentStatus.COMPLETED) {
        throw new ConflictException('You have already completed this course');
      }
      if (existingEnrollment.status === EnrollmentStatus.PENDING) {
        throw new ConflictException('You already have a pending enrollment request for this course');
      }
      
      // If DROPPED or REJECTED, allow new request
      if (existingEnrollment.status === EnrollmentStatus.DROPPED || 
          existingEnrollment.status === EnrollmentStatus.REJECTED) {
        const enrollment = await this.prisma.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { 
            status: EnrollmentStatus.PENDING,
            updatedAt: new Date(),
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                credits: true,
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
        return enrollment;
      }
    }

    // Create new enrollment request with PENDING status
    const enrollment = await this.prisma.enrollment.create({
      data: {
        courseId,
        studentId,
        status: EnrollmentStatus.PENDING, // Changed from ENROLLED to PENDING
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            credits: true,
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

    return enrollment;
  }

  // STUDENT: Drop from a course
  async dropFromCourse(courseId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    if (enrollment.status === EnrollmentStatus.DROPPED) {
      throw new ConflictException('You have already dropped this course');
    }

    if (enrollment.status === EnrollmentStatus.COMPLETED) {
      throw new ConflictException('Cannot drop a completed course');
    }

    // Allow dropping from both ENROLLED and PENDING status
    if (enrollment.status === EnrollmentStatus.REJECTED) {
      throw new ConflictException('Cannot drop a rejected enrollment request');
    }

    const updatedEnrollment = await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { status: EnrollmentStatus.DROPPED },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            credits: true,
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

    return updatedEnrollment;
  }

  // ADMIN: Update enrollment status (approve/reject)
  async updateEnrollmentStatus(enrollmentId: string, updateEnrollmentDto: UpdateEnrollmentDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
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

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // Only allow status updates for PENDING enrollments
    if (enrollment.status !== EnrollmentStatus.PENDING) {  
      throw new BadRequestException('Can only approve or reject pending enrollment requests');
    }

    // Validate the new status
    // const allowedStatuses = [EnrollmentStatus.ENROLLED, EnrollmentStatus.REJECTED];
    // if (!allowedStatuses.includes(updateEnrollmentDto.status)) {
    //   throw new BadRequestException('Invalid status. Only ENROLLED or REJECTED are allowed');
    // }

    const updatedEnrollment = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: updateEnrollmentDto.status },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            credits: true,
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

    return updatedEnrollment;
  }

  // ADMIN: Get pending enrollment requests
  async getPendingEnrollments(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: {
          status: EnrollmentStatus.PENDING,
        },
        skip,
        take: limit,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              credits: true,
            },
          },
          student: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.enrollment.count({
        where: {
          status: EnrollmentStatus.PENDING,
        },
      }),
    ]);

    return {
      enrollments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // ADMIN: Assign lecturer to course
  async assignLecturer(courseId: string, assignLecturerDto: AssignLecturerDto) {
    const { lecturerId } = assignLecturerDto;

    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if lecturer exists and has lecturer role
    const lecturer = await this.prisma.user.findUnique({
      where: { id: lecturerId },
    });

    if (!lecturer) {
      throw new NotFoundException('Lecturer not found');
    }

    if (lecturer.role !== UserRole.LECTURER) {
      throw new BadRequestException('User is not a lecturer');
    }

    const updatedCourse = await this.prisma.course.update({
      where: { id: courseId },
      data: { lecturerId },
      include: {
        lecturer: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    return updatedCourse;
  }

  // STUDENT: Get their enrollments
  async getStudentEnrollments(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            lecturer: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return enrollments;
  }

  // ADMIN: Get all enrollments for management
  async getAllEnrollments(page: number = 1, limit: number = 20, status?: EnrollmentStatus) {
    const skip = (page - 1) * limit;

    const whereClause = status ? { status } : {};

    const [enrollments, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              credits: true,
            },
          },
          student: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.enrollment.count({
        where: whereClause,
      }),
    ]);

    return {
      enrollments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}