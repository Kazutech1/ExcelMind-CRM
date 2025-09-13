import { ProtectedRoute } from "@/components/auth/protected-route"
import { AssignmentCard } from "@/components/assignments/assignment-card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockAssignments, mockSubmissions } from "@/lib/mock-assignments"
import { mockCourses } from "@/lib/mock-data"
import { Search, Filter, ClipboardList, Users, Clock, Plus } from "lucide-react"

export default function LecturerAssignmentsPage() {
  // Filter assignments for current lecturer's courses (lecturer ID 2)
  const lecturerCourses = mockCourses.filter((course) => course.lecturer.id === "2")
  const lecturerCourseIds = lecturerCourses.map((c) => c.id)
  const lecturerAssignments = mockAssignments.filter((a) => lecturerCourseIds.includes(a.courseId))

  // Get submission counts
  const getSubmissionCount = (assignmentId: string) => {
    return mockSubmissions.filter((s) => s.assignmentId === assignmentId).length
  }

  const totalSubmissions = mockSubmissions.filter((s) =>
    lecturerAssignments.some((a) => a.id === s.assignmentId),
  ).length

  const pendingGrading = mockSubmissions.filter(
    (s) => lecturerAssignments.some((a) => a.id === s.assignmentId) && s.grade === undefined,
  ).length

  const handleManage = (assignmentId: string) => {
    console.log("Managing assignment:", assignmentId)
    // Navigate to assignment management page
  }

  const handleView = (assignmentId: string) => {
    console.log("Viewing assignment:", assignmentId)
    // Navigate to assignment details page
  }

  const getCourseNameById = (courseId: string) => {
    return mockCourses.find((c) => c.id === courseId)?.title || "Unknown Course"
  }

  return (
    <ProtectedRoute allowedRoles={["LECTURER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Assignment Management</h1>
            <p className="text-muted-foreground">Create and manage course assignments</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Assignments"
            value={lecturerAssignments.length}
            description="All courses"
            icon={ClipboardList}
          />
          <StatsCard title="Total Submissions" value={totalSubmissions} description="All assignments" icon={Users} />
          <StatsCard title="Pending Grading" value={pendingGrading} description="Need attention" icon={Clock} />
          <StatsCard
            title="Published"
            value={lecturerAssignments.filter((a) => a.status === "published").length}
            description="Active assignments"
            icon={ClipboardList}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search assignments..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {lecturerCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignments Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lecturerAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              courseName={getCourseNameById(assignment.courseId)}
              submissionCount={getSubmissionCount(assignment.id)}
              showManageButton
              onManage={handleManage}
              onView={handleView}
            />
          ))}
        </div>

        {lecturerAssignments.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No assignments yet</h3>
            <p className="text-muted-foreground mb-4">Create your first assignment to get started</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>
        )}

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockSubmissions
                .filter((s) => lecturerAssignments.some((a) => a.id === s.assignmentId))
                .slice(0, 5)
                .map((submission) => {
                  const assignment = lecturerAssignments.find((a) => a.id === submission.assignmentId)
                  return (
                    <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{submission.student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {assignment?.title} • Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {submission.grade ? (
                          <span className="text-sm font-medium text-green-600">
                            Graded: {submission.grade}/{assignment?.maxPoints}
                          </span>
                        ) : (
                          <span className="text-sm text-orange-600 font-medium">Pending</span>
                        )}
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
