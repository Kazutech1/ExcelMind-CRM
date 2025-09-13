"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Course } from "@/lib/types"
import { Users, Clock, MapPin, BookOpen, Download } from "lucide-react"

interface CourseCardProps {
  course: Course
  showEnrollButton?: boolean
  showManageButton?: boolean
  onEnroll?: (courseId: string) => void
  onManage?: (courseId: string) => void
}

export function CourseCard({
  course,
  showEnrollButton = false,
  showManageButton = false,
  onEnroll,
  onManage,
}: CourseCardProps) {
  const enrollmentPercentage = (course.enrolled / course.capacity) * 100

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">{course.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{course.code}</p>
          </div>
          <Badge variant={course.status === "active" ? "default" : "secondary"}>{course.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground line-clamp-3">{course.description}</p>

        {/* Lecturer Info */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={course.lecturer.avatar || "/placeholder.svg"} alt={course.lecturer.name} />
            <AvatarFallback>
              {course.lecturer.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{course.lecturer.name}</p>
            <p className="text-xs text-muted-foreground">{course.lecturer.email}</p>
          </div>
        </div>

        {/* Course Details */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {course.schedule.days.join(", ")} • {course.schedule.time}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{course.schedule.room}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>
              {course.enrolled}/{course.capacity} students ({enrollmentPercentage.toFixed(0)}% full)
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>{course.credits} credits</span>
          </div>
        </div>

        {/* Syllabus */}
        {course.syllabus && (
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center text-sm">
              <Download className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-foreground">{course.syllabus.filename}</span>
            </div>
            <Button size="sm" variant="ghost">
              Download
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2 pt-2">
          {showEnrollButton && (
            <Button
              className="flex-1"
              onClick={() => onEnroll?.(course.id)}
              disabled={course.enrolled >= course.capacity}
            >
              {course.enrolled >= course.capacity ? "Full" : "Enroll"}
            </Button>
          )}
          {showManageButton && (
            <Button className="flex-1 bg-transparent" variant="outline" onClick={() => onManage?.(course.id)}>
              Manage
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
