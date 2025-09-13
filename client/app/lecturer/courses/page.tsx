import { ProtectedRoute } from "@/components/auth/protected-route"
import { CourseCard } from "@/components/courses/course-card"
import { CreateCourseDialog } from "@/components/courses/create-course-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCourses } from "@/lib/mock-data"
import { Search, Filter, Plus } from "lucide-react"

export default function LecturerCoursesPage() {
  // Filter courses for current lecturer (mock data shows lecturer ID 2)
  const lecturerCourses = mockCourses.filter((course) => course.lecturer.id === "2")

  const handleManageCourse = (courseId: string) => {
    console.log("Managing course:", courseId)
    // Navigate to course management page
  }

  return (
    <ProtectedRoute allowedRoles={["LECTURER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground">Manage your courses and upload materials</p>
          </div>
          <CreateCourseDialog />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search courses..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lecturerCourses.map((course) => (
            <CourseCard key={course.id} course={course} showManageButton onManage={handleManageCourse} />
          ))}
        </div>

        {lecturerCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">Create your first course to get started</p>
            <CreateCourseDialog trigger={<Button>Create Your First Course</Button>} />
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
