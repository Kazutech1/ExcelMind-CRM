"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, BookOpen, Eye } from "lucide-react"

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
  }
}

interface CourseCardProps {
  course: Course
  showEnrollButton?: boolean
  showManageButton?: boolean
  showViewButton?: boolean
  onEnroll?: (courseId: string) => void
  onManage?: (courseId: string) => void
  onView?: (courseId: string) => void
  onClick?: (courseId: string) => void
}

export function CourseCard({
  course,
  showEnrollButton = false,
  showManageButton = false,
  showViewButton = true,
  onEnroll,
  onManage,
  onView,
  onClick,
}: CourseCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(course.id)
    }
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when button is clicked
    if (onView) {
      onView(course.id)
    }
  }

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when button is clicked
    if (onEnroll) {
      onEnroll(course.id)
    }
  }

  const handleManageClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click when button is clicked
    if (onManage) {
      onManage(course.id)
    }
  }

  return (
    <Card 
      className={`h-full transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/20' : ''
      }`}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground line-clamp-3">{course.syllabus}</p>

        {/* Lecturer Info */}
        {course.lecturer && (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {course.lecturer.email.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{course.lecturer.email}</p>
              <p className="text-xs text-muted-foreground">{course.lecturer.role}</p>
            </div>
          </div>
        )}

        {/* Course Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>{course.credits} credits</span>
          </div>
          {course._count && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              <span>{course._count.enrollments} students enrolled</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {showViewButton && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleViewClick}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          )}
          {showEnrollButton && (
            <Button
              className="flex-1"
              onClick={handleEnrollClick}
            >
              Enroll
            </Button>
          )}
          {showManageButton && (
            <Button 
              className="flex-1" 
              variant="outline" 
              onClick={handleManageClick}
            >
              Manage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}