"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Enrollment, Course } from "@/lib/types"
import { Clock, User, BookOpen, Calendar, Check, X, Trash2 } from "lucide-react"

interface EnrollmentCardProps {
  enrollment: Enrollment
  course: Course
  student?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  showActions?: boolean
  onApprove?: (enrollmentId: string) => void
  onReject?: (enrollmentId: string) => void
  onDrop?: (enrollmentId: string) => void
}

export function EnrollmentCard({
  enrollment,
  course,
  student,
  showActions = false,
  onApprove,
  onReject,
  onDrop,
}: EnrollmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "dropped":
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{course.code}</p>
          </div>
          <Badge className={getStatusColor(enrollment.status)}>
            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Student Info (for admin view) */}
        {student && (
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
              <AvatarFallback>
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{student.name}</p>
              <p className="text-xs text-muted-foreground">{student.email}</p>
            </div>
          </div>
        )}

        {/* Course Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-2" />
            <span>{course.lecturer.name}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {course.schedule.days.join(", ")} • {course.schedule.time}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>{course.credits} credits</span>
          </div>
        </div>

        {/* Enrollment Timeline */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-2" />
            <span>Enrolled: {formatDate(enrollment.enrolledAt)}</span>
          </div>
          {enrollment.approvedAt && (
            <div className="flex items-center">
              <Check className="h-3 w-3 mr-2" />
              <span>Approved: {formatDate(enrollment.approvedAt)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && enrollment.status === "pending" && (
          <div className="flex space-x-2 pt-2">
            <Button size="sm" onClick={() => onApprove?.(enrollment.id)} className="flex-1">
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onReject?.(enrollment.id)} className="flex-1">
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {/* Drop Course (for students) */}
        {!showActions && enrollment.status === "approved" && (
          <Button size="sm" variant="outline" onClick={() => onDrop?.(enrollment.id)} className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Drop Course
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
