"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { CourseCard } from "@/components/courses/course-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { mockCourses } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, BookOpen } from "lucide-react"

export default function StudentCoursesPage() {
  const { toast } = useToast()

  const handleEnroll = (courseId: string) => {
    const course = mockCourses.find((c) => c.id === courseId)
    toast({
      title: "Enrollment request submitted",
      description: `Your enrollment request for ${course?.title} has been submitted for approval.`,
    })
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Browse Courses</h1>
            <p className="text-muted-foreground">Discover and enroll in available courses</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{mockCourses.length} courses available</Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses by title, code, or lecturer..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="cs">Computer Science</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="physics">Physics</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Credits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Credits</SelectItem>
              <SelectItem value="1-2">1-2 Credits</SelectItem>
              <SelectItem value="3-4">3-4 Credits</SelectItem>
              <SelectItem value="5+">5+ Credits</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockCourses.map((course) => (
            <CourseCard key={course.id} course={course} showEnrollButton onEnroll={handleEnroll} />
          ))}
        </div>

        {mockCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses available</h3>
            <p className="text-muted-foreground">Check back later for new course offerings</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
