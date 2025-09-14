"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, BookOpen, Calendar, Clock } from "lucide-react"
import { useCourses } from "@/hooks/useCourses"
import { useEffect, useState } from "react"

interface Course {
  id: string
  title: string
  credits: number
  syllabus: string
  lecturerId: string
  createdAt: string
  updatedAt: string
  lecturer?: {
    id: string
    email: string
    role: 'LECTURER'
  }
  _count?: {
    enrollments: number
    assignments?: number
  }
  enrollments?: Array<{
    id: string
    status: string
    student: {
      id: string
      email: string
    }
  }>
}

interface CourseDetailModalProps {
  courseId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  showEnrollButton?: boolean
  onEnroll?: (courseId: string) => void
}

export function CourseDetailModal({
  courseId,
  open,
  onOpenChange,
  showEnrollButton = false,
  onEnroll,
}: CourseDetailModalProps) {
  const { getCourseById, isLoading } = useCourses()
  const [course, setCourse] = useState<Course | null>(null)

  useEffect(() => {
    if (courseId && open) {
      getCourseById(courseId).then(setCourse).catch(() => setCourse(null))
    }
  }, [courseId, open, getCourseById])

  if (!open || !courseId) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Course Details</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <p>Loading course details...</p>
          </div>
        ) : course ? (
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6">
              {/* Course Title and Basic Info */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{course.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.credits} credits</span>
                  </div>
                  {course._count && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course._count.enrollments} enrolled</span>
                    </div>
                  )}
                  {course._count?.assignments && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course._count.assignments} assignments</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Lecturer Information */}
              {course.lecturer && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Instructor</h3>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {course.lecturer.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{course.lecturer.email}</p>
                      <Badge variant="secondary" className="text-xs">
                        {course.lecturer.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Course Description/Syllabus */}
              <div className="space-y-2">
                <h3 className="font-semibold">Course Description</h3>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {course.syllabus}
                </div>
              </div>

              <Separator />

              {/* Course Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Created</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(course.createdAt)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">Last Updated</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(course.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Enrolled Students (if available and not too many) */}
              {course.enrollments && course.enrollments.length > 0 && course.enrollments.length <= 10 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold">Enrolled Students</h3>
                    <div className="space-y-2">
                      {course.enrollments
                        .filter(enrollment => enrollment.status === 'ENROLLED')
                        .map((enrollment) => (
                        <div key={enrollment.id} className="flex items-center space-x-3 text-sm">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {enrollment.student.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{enrollment.student.email}</span>
                          <Badge variant="outline" className="text-xs">
                            {enrollment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              {showEnrollButton && onEnroll && (
                <>
                  <Separator />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Close
                    </Button>
                    <Button onClick={() => onEnroll(course.id)}>
                      Enroll in Course
                    </Button>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12">
            <p>Course not found or failed to load.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}