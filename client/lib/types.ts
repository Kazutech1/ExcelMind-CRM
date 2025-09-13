export interface Course {
  id: string
  title: string
  code: string
  description: string
  credits: number
  lecturer: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  syllabus?: {
    filename: string
    url: string
    uploadedAt: string
  }
  schedule: {
    days: string[]
    time: string
    room: string
  }
  capacity: number
  enrolled: number
  status: "active" | "inactive" | "draft"
  semester: string
  year: number
  createdAt: string
  updatedAt: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: string
  maxPoints: number
  type: "homework" | "quiz" | "project" | "exam"
  status: "draft" | "published"
  submissions?: AssignmentSubmission[]
}

export interface AssignmentSubmission {
  id: string
  assignmentId: string
  studentId: string
  student: {
    name: string
    email: string
  }
  content: string
  attachments?: {
    filename: string
    url: string
  }[]
  submittedAt: string
  grade?: number
  feedback?: string
  gradedAt?: string
}

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  status: "pending" | "approved" | "rejected" | "dropped"
  enrolledAt: string
  approvedAt?: string
  approvedBy?: string
}
