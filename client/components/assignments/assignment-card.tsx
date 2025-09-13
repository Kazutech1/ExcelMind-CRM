"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Assignment } from "@/lib/types"
import { Calendar, Clock, Award, FileText, Users, Edit, Eye } from "lucide-react"

interface AssignmentCardProps {
  assignment: Assignment
  courseName?: string
  submissionCount?: number
  showSubmitButton?: boolean
  showManageButton?: boolean
  onSubmit?: (assignmentId: string) => void
  onManage?: (assignmentId: string) => void
  onView?: (assignmentId: string) => void
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
      case "homework":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "quiz":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "project":
        return "bg-green-100 text-green-800 border-green-200"
      case "exam":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{assignment.title}</CardTitle>
            {courseName && <p className="text-sm text-muted-foreground">{courseName}</p>}
          </div>
          <div className="flex flex-col space-y-1">
            <Badge className={getTypeColor(assignment.type)}>
              {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
            </Badge>
            <Badge className={getStatusColor(assignment.status)}>
              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
            </Badge>
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
            <span>{assignment.maxPoints} points</span>
          </div>
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
          {showSubmitButton && assignment.status === "published" && (
            <Button className="flex-1" onClick={() => onSubmit?.(assignment.id)} disabled={isOverdue}>
              <FileText className="h-4 w-4 mr-2" />
              {isOverdue ? "Overdue" : "Submit"}
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
