import type { Assignment, AssignmentSubmission } from "./types"

export const mockAssignments: Assignment[] = [
  {
    id: "1",
    courseId: "1", // Data Structures
    title: "Binary Trees Implementation",
    description:
      "Implement a binary search tree with insert, delete, and search operations. Include proper documentation and test cases.",
    dueDate: "2024-09-15T23:59:00Z",
    maxPoints: 100,
    type: "project",
    status: "published",
  },
  {
    id: "2",
    courseId: "1", // Data Structures
    title: "Algorithm Complexity Quiz",
    description: "Complete the quiz on Big O notation and algorithm analysis. You have 60 minutes to complete.",
    dueDate: "2024-09-20T14:00:00Z",
    maxPoints: 50,
    type: "quiz",
    status: "published",
  },
  {
    id: "3",
    courseId: "2", // Advanced Mathematics
    title: "Calculus Problem Set 5",
    description: "Solve problems 1-15 from Chapter 8. Show all work and provide detailed explanations.",
    dueDate: "2024-09-18T17:00:00Z",
    maxPoints: 75,
    type: "homework",
    status: "published",
  },
  {
    id: "4",
    courseId: "3", // Computer Networks
    title: "Network Protocol Analysis",
    description: "Analyze the provided network packet capture and write a detailed report on the protocols used.",
    dueDate: "2024-09-25T23:59:00Z",
    maxPoints: 80,
    type: "project",
    status: "published",
  },
  {
    id: "5",
    courseId: "1", // Data Structures
    title: "Midterm Exam",
    description: "Comprehensive exam covering all topics from weeks 1-8.",
    dueDate: "2024-10-01T10:00:00Z",
    maxPoints: 200,
    type: "exam",
    status: "draft",
  },
]

export const mockSubmissions: AssignmentSubmission[] = [
  {
    id: "1",
    assignmentId: "1",
    studentId: "3",
    student: {
      name: "Mike Student",
      email: "student@university.edu",
    },
    content:
      "I have implemented the binary search tree as requested. The implementation includes all required operations with proper error handling.",
    attachments: [
      {
        filename: "binary_tree.py",
        url: "/placeholder-file.py",
      },
      {
        filename: "test_cases.py",
        url: "/placeholder-test.py",
      },
    ],
    submittedAt: "2024-09-14T20:30:00Z",
    grade: 85,
    feedback:
      "Good implementation overall. The insert and search functions work correctly. However, the delete function has a minor bug when handling nodes with two children. Also, consider adding more edge case tests.",
    gradedAt: "2024-09-16T14:20:00Z",
  },
  {
    id: "2",
    assignmentId: "3",
    studentId: "3",
    student: {
      name: "Mike Student",
      email: "student@university.edu",
    },
    content: "Please find my solutions to the calculus problems attached. I have shown all work as requested.",
    attachments: [
      {
        filename: "calculus_solutions.pdf",
        url: "/placeholder-solutions.pdf",
      },
    ],
    submittedAt: "2024-09-17T16:45:00Z",
    grade: 92,
    feedback:
      "Excellent work! Your solutions are correct and well-explained. Great attention to detail in showing all steps.",
    gradedAt: "2024-09-19T10:15:00Z",
  },
  {
    id: "3",
    assignmentId: "2",
    studentId: "6",
    student: {
      name: "Sarah Wilson",
      email: "sarah.wilson@university.edu",
    },
    content: "Quiz completed. I found the questions on space complexity particularly challenging.",
    submittedAt: "2024-09-20T13:45:00Z",
  },
  {
    id: "4",
    assignmentId: "4",
    studentId: "7",
    student: {
      name: "Alex Thompson",
      email: "alex.thompson@university.edu",
    },
    content: "Network analysis report attached. I identified TCP, HTTP, and DNS protocols in the capture.",
    attachments: [
      {
        filename: "network_analysis_report.docx",
        url: "/placeholder-report.docx",
      },
    ],
    submittedAt: "2024-09-24T22:15:00Z",
  },
]
