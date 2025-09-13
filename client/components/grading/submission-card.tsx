"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { AssignmentSubmission, Assignment } from "@/lib/types"
import { Calendar, FileText, Download, MessageSquare, Award } from "lucide-react"

interface SubmissionCardProps {
  submission: AssignmentSubmission
  assignment: Assignment
  onGrade?: (submissionId: string) => void
  onViewDetails?: (submissionId: string) => void
}

export function SubmissionCard({ submission, assignment, onGrade, onViewDetails }: SubmissionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getGradeColor = (grade: number, maxPoints: number) => {
    const percentage = (grade / maxPoints) * 100
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const isLateSubmission = () => {
    const submittedDate = new Date(submission.submittedAt)
    const dueDate = new Date(assignment.dueDate)
    return submittedDate > dueDate
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt={submission.student.name} />
              <AvatarFallback>
                {submission.student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">{submission.student.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{submission.student.email}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            {submission.grade !== undefined ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">Graded</Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
            )}
            {isLateSubmission() && <Badge variant="destructive">Late</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assignment Info */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="font-medium text-foreground">{assignment.title}</p>
          <p className="text-sm text-muted-foreground">Max Points: {assignment.maxPoints}</p>
        </div>

        {/* Submission Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Submitted: {formatDate(submission.submittedAt)}</span>
          </div>
          {submission.gradedAt && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Award className="h-4 w-4 mr-2" />
              <span>Graded: {formatDate(submission.gradedAt)}</span>
            </div>
          )}
        </div>

        {/* Content Preview */}
        {submission.content && (
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-foreground">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>Written Response</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3 bg-muted p-2 rounded">{submission.content}</p>
          </div>
        )}

        {/* Attachments */}
        {submission.attachments && submission.attachments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 mr-2" />
              <span>Attachments ({submission.attachments.length})</span>
            </div>
            <div className="space-y-1">
              {submission.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                  <span className="text-foreground">{attachment.filename}</span>
                  <Button size="sm" variant="ghost">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grade Display */}
        {submission.grade !== undefined && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Grade</span>
              <span className={`text-lg font-bold ${getGradeColor(submission.grade, assignment.maxPoints)}`}>
                {submission.grade}/{assignment.maxPoints}
              </span>
            </div>
            {submission.feedback && (
              <div className="space-y-1">
                <span className="text-sm font-medium text-foreground">Feedback</span>
                <p className="text-sm text-muted-foreground">{submission.feedback}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          <Button className="flex-1 bg-transparent" variant="outline" onClick={() => onViewDetails?.(submission.id)}>
            View Details
          </Button>
          {submission.grade === undefined ? (
            <Button className="flex-1" onClick={() => onGrade?.(submission.id)}>
              Grade Now
            </Button>
          ) : (
            <Button className="flex-1 bg-transparent" variant="outline" onClick={() => onGrade?.(submission.id)}>
              Update Grade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
