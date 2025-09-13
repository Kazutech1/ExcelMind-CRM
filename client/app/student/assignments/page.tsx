"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { AssignmentCard } from "@/components/assignments/assignment-card"
import { SubmitAssignmentDialog } from "@/components/assignments/submit-assignment-dialog"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAssignments, mockSubmissions } from "@/lib/mock-assignments"
import { mockCourses, mockEnrollments } from "@/lib/mock-data"
import { useState } from "react"
import { Search, Filter, ClipboardList, Clock, CheckCircle, AlertTriangle } from "lucide-react"

export default function StudentAssignmentsPage() {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Get student's enrolled courses (mock student ID 3)
  const studentEnrollments = mockEnrollments.filter((e) => e.studentId === "3" && e.status === "approved")
  const enrolledCourseIds = studentEnrollments.map((e) => e.courseId)

  // Filter assignments for enrolled courses
  const availableAssignments = mockAssignments.filter(
    (a) => enrolledCourseIds.includes(a.courseId) && a.status === "published",
  )

  // Get student's submissions
  const studentSubmissions = mockSubmissions.filter((s) => s.studentId === "3")
  const submittedAssignmentIds = studentSubmissions.map((s) => s.assignmentId)

  // Categorize assignments
  const pendingAssignments = availableAssignments.filter((a) => !submittedAssignmentIds.includes(a.id))
  const submittedAssignments = availableAssignments.filter((a) => submittedAssignmentIds.includes(a.id))
  const gradedAssignments = submittedAssignments.filter((a) => {
    const submission = studentSubmissions.find((s) => s.assignmentId === a.id)
    return submission?.grade !== undefined
  })

  const handleSubmit = (assignmentId: string) => {
    setSelectedAssignment(assignmentId)
    setDialogOpen(true)
  }

  const getCourseNameById = (courseId: string) => {
    return mockCourses.find((c) => c.id === courseId)?.title || "Unknown Course"
  }

  const selectedAssignmentData = selectedAssignment ? mockAssignments.find((a) => a.id === selectedAssignment) : null

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Assignments</h1>
            <p className="text-muted-foreground">Track and submit your course assignments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Assignments"
            value={availableAssignments.length}
            description="This semester"
            icon={ClipboardList}
          />
          <StatsCard title="Pending" value={pendingAssignments.length} description="Not submitted" icon={Clock} />
          <StatsCard
            title="Submitted"
            value={submittedAssignments.length}
            description="Awaiting grades"
            icon={CheckCircle}
          />
          <StatsCard title="Graded" value={gradedAssignments.length} description="Completed" icon={AlertTriangle} />
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
              {enrolledCourseIds.map((courseId) => {
                const course = mockCourses.find((c) => c.id === courseId)
                return course ? (
                  <SelectItem key={courseId} value={courseId}>
                    {course.code} - {course.title}
                  </SelectItem>
                ) : null
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Assignment Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingAssignments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="submitted" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Submitted ({submittedAssignments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="graded" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Graded ({gradedAssignments.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  courseName={getCourseNameById(assignment.courseId)}
                  showSubmitButton
                  onSubmit={handleSubmit}
                />
              ))}
            </div>
            {pendingAssignments.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground">You have no pending assignments</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {submittedAssignments
                .filter((a) => {
                  const submission = studentSubmissions.find((s) => s.assignmentId === a.id)
                  return submission?.grade === undefined
                })
                .map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    courseName={getCourseNameById(assignment.courseId)}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gradedAssignments.map((assignment) => {
                const submission = studentSubmissions.find((s) => s.assignmentId === assignment.id)
                return (
                  <div key={assignment.id} className="relative">
                    <AssignmentCard assignment={assignment} courseName={getCourseNameById(assignment.courseId)} />
                    {submission?.grade && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm font-medium">
                        {submission.grade}/{assignment.maxPoints}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Submit Assignment Dialog */}
        {selectedAssignmentData && (
          <SubmitAssignmentDialog assignment={selectedAssignmentData} open={dialogOpen} onOpenChange={setDialogOpen} />
        )}
      </div>
    </ProtectedRoute>
  )
}
