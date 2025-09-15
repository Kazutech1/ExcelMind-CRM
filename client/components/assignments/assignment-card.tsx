"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Award, FileText, Users, Edit, Eye } from "lucide-react"

// Define types based on your backend
interface Assignment {
  id: string;
  title: string;
  description: string;
  type: 'FILE_UPLOAD' | 'TEXT_SUBMISSION' | 'BOTH';
  status: string;
  dueDate: string;
  maxPoints: number;
  weight: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
  };
  createdBy?: {
    id: string;
    email: string;
  };
  _count?: {
    submissions: number;
  };
  submissions?: Array<{
    id: string;
    status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'LATE_SUBMISSION' | 'GRADED';
    grade: number | null;
    submittedAt: string | null;
    gradedAt: string | null;
  }>;
}

interface AssignmentCardProps {
  assignment: Assignment;
  courseName?: string;
  submissionCount?: number;
  showSubmitButton?: boolean;
  showManageButton?: boolean;
  onSubmit?: (assignmentId: string) => void;
  onManage?: (assignmentId: string) => void;
  onView?: (assignmentId: string) => void;
}

export function AssignmentCard({
  assignment,
  courseName,
  submissionCount,
  showSubmitButton = false,
  showManageButton = false,
  onSubmit,
  onManage,
  onView,
}: AssignmentCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "FILE_UPLOAD":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "TEXT_SUBMISSION":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "BOTH":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeDisplayName = (type: string) => {
    switch (type) {
      case "FILE_UPLOAD":
        return "File Upload"
      case "TEXT_SUBMISSION":
        return "Text Submission"
      case "BOTH":
        return "File & Text"
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 border-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDaysUntilDue = () => {
    const dueDate = new Date(assignment.dueDate)
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const daysUntilDue = getDaysUntilDue()
  const isOverdue = daysUntilDue < 0
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0

  // Get submission status for student view
  const studentSubmission = assignment.submissions && assignment.submissions.length > 0 
    ? assignment.submissions[0] 
    : null

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{assignment.title}</CardTitle>
            {courseName && <p className="text-sm text-muted-foreground">{courseName}</p>}
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge className={getTypeColor(assignment.type)}>
              {getTypeDisplayName(assignment.type)}
            </Badge>
            {/* <Badge className={getStatusColor(assignment.status)}>
              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1).toLowerCase()}
            </Badge> */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground line-clamp-3">{assignment.description}</p>

        {/* Assignment Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Due: {formatDate(assignment.dueDate)}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Award className="h-4 w-4 mr-2" />
            <span>{assignment.maxPoints} points • {assignment.weight}% of total grade</span>
          </div>
          
          {/* Show submission status for students */}
          {studentSubmission && (
            <div className="flex items-center text-sm">
              <Badge 
                variant="outline" 
                className={
                  studentSubmission.status === 'GRADED' ? 'bg-green-100 text-green-800 border-green-200' :
                  studentSubmission.status === 'LATE_SUBMISSION' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  studentSubmission.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }
              >
                {studentSubmission.status === 'GRADED' && `Graded: ${studentSubmission.grade}/${assignment.maxPoints}`}
                {studentSubmission.status === 'LATE_SUBMISSION' && 'Submitted Late'}
                {studentSubmission.status === 'SUBMITTED' && 'Submitted'}
                {studentSubmission.status === 'NOT_SUBMITTED' && 'Not Submitted'}
              </Badge>
            </div>
          )}
          
          {/* Show submission count for lecturers */}
          {submissionCount !== undefined && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{submissionCount} submissions</span>
            </div>
          )}
        </div>

        {/* Due Date Warning */}
        {assignment.status === "published" && (
          <div
            className={`p-2 rounded-lg text-sm ${
              isOverdue
                ? "bg-red-50 text-red-700 border border-red-200"
                : isDueSoon
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "bg-green-50 text-green-700 border border-green-200"
            }`}
          >
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                {isOverdue
                  ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? "s" : ""}`
                  : isDueSoon
                    ? `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`
                    : `${daysUntilDue} days remaining`}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {showSubmitButton && assignment.status.toLowerCase() === "published" && (
            <Button 
              className="flex-1" 
              onClick={() => onSubmit?.(assignment.id)} 
              disabled={isOverdue && studentSubmission?.status !== 'NOT_SUBMITTED'}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isOverdue ? "Overdue" : studentSubmission ? "Resubmit" : "Submit"}
            </Button>
          )}
          {showManageButton && (
            <>
              <Button className="flex-1 bg-transparent" variant="outline" onClick={() => onManage?.(assignment.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Manage
              </Button>
              <Button variant="outline" onClick={() => onView?.(assignment.id)}>
                <Eye className="h-4 w-4" />
              </Button>
            </>
          )}
          {!showSubmitButton && !showManageButton && (
            <Button className="flex-1 bg-transparent" variant="outline" onClick={() => onView?.(assignment.id)}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}