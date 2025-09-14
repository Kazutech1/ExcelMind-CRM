"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Users, BookOpen, Calendar, UserX } from "lucide-react"

interface Course {
  id: string
  title: string
  credits: number
  syllabus?: string
  lecturer?: {
    id: string
    email: string
  }
}

interface Enrollment {
  id: string
  courseId: string
  studentId: string
  status: 'PENDING' | 'ENROLLED' | 'COMPLETED' | 'DROPPED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  course?: Course
}

interface EnrollmentCardProps {
  enrollment: Enrollment
  course?: Course
  onDrop: () => void
}

export function EnrollmentCard({
  enrollment,
  course,
  onDrop,
}: EnrollmentCardProps) {
  // Use course from enrollment if not provided directly
  const courseData = course || enrollment.course

  if (!courseData) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Course data not available</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'DROPPED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'Enrolled'
      case 'PENDING':
        return 'Pending Approval'
      case 'COMPLETED':
        return 'Completed'
      case 'DROPPED':
        return 'Dropped'
      case 'REJECTED':
        return 'Rejected'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const canDrop = enrollment.status === 'ENROLLED' || enrollment.status === 'PENDING'

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold">{courseData.title}</CardTitle>
            <Badge 
              variant="outline" 
              className={`text-xs ${getStatusColor(enrollment.status)}`}
            >
              {getStatusText(enrollment.status)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Course Description */}
        {courseData.syllabus && (
          <p className="text-sm text-foreground line-clamp-3">{courseData.syllabus}</p>
        )}

        {/* Lecturer Info */}
        {courseData.lecturer && (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {courseData.lecturer.email.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{courseData.lecturer.email}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
          </div>
        )}

        {/* Course Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>{courseData.credits} credits</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Enrolled {formatDate(enrollment.createdAt)}</span>
          </div>
        </div>

        {/* Actions */}
        {canDrop && (
          <div className="pt-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full" size="sm">
                  <UserX className="h-4 w-4 mr-2" />
                  {enrollment.status === 'PENDING' ? 'Cancel Request' : 'Drop Course'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {enrollment.status === 'PENDING' 
                      ? 'Cancel Enrollment Request?' 
                      : 'Drop from Course?'
                    }
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {enrollment.status === 'PENDING' 
                      ? `Are you sure you want to cancel your enrollment request for "${courseData.title}"? This action cannot be undone.`
                      : `Are you sure you want to drop from "${courseData.title}"? This action cannot be undone and you may need to re-enroll if you want to take this course again.`
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onDrop}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {enrollment.status === 'PENDING' ? 'Cancel Request' : 'Drop Course'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Show message for non-droppable statuses */}
        {!canDrop && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center">
              {enrollment.status === 'COMPLETED' && 'Course completed'}
              {enrollment.status === 'DROPPED' && 'Course dropped'}
              {enrollment.status === 'REJECTED' && 'Enrollment was rejected'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}