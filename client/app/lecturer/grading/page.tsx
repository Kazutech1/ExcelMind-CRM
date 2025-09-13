"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { SubmissionCard } from "@/components/grading/submission-card"
import { GradeSubmissionDialog } from "@/components/grading/grade-submission-dialog"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockAssignments, mockSubmissions } from "@/lib/mock-assignments"
import { mockCourses } from "@/lib/mock-data"
import { useState } from "react"
import { Search, Filter, Clock, CheckCircle, Award, AlertTriangle } from "lucide-react"

export default function LecturerGradingPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filter for current lecturer's courses (lecturer ID 2)
  const lecturerCourses = mockCourses.filter((course) => course.lecturer.id === "2")
  const lecturerCourseIds = lecturerCourses.map((c) => c.id)
  const lecturerAssignments = mockAssignments.filter((a) => lecturerCourseIds.includes(a.courseId))
  const lecturerAssignmentIds = lecturerAssignments.map((a) => a.id)

  // Filter submissions for lecturer's assignments
  const lecturerSubmissions = mockSubmissions.filter((s) => lecturerAssignmentIds.includes(s.assignmentId))

  // Categorize submissions
  const pendingSubmissions = lecturerSubmissions.filter((s) => s.grade === undefined)
  const gradedSubmissions = lecturerSubmissions.filter((s) => s.grade !== undefined)
  const lateSubmissions = lecturerSubmissions.filter((s) => {
    const assignment = lecturerAssignments.find((a) => a.id === s.assignmentId)
    if (!assignment) return false
    return new Date(s.submittedAt) > new Date(assignment.dueDate)
  })

  const handleGrade = (submissionId: string) => {
    setSelectedSubmission(submissionId)
    setDialogOpen(true)
  }

  const handleViewDetails = (submissionId: string) => {
    console.log("Viewing submission details:", submissionId)
    // Navigate to detailed submission view
  }

  const getAssignmentById = (assignmentId: string) => {
    return lecturerAssignments.find((a) => a.id === assignmentId)
  }

  const selectedSubmissionData = selectedSubmission
    ? lecturerSubmissions.find((s) => s.id === selectedSubmission)
    : null
  const selectedAssignmentData = selectedSubmissionData ? getAssignmentById(selectedSubmissionData.assignmentId) : null

  // Calculate average grade
  const averageGrade = gradedSubmissions.length
    ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
    : 0

  return (
    <ProtectedRoute allowedRoles={["LECTURER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grading Center</h1>
            <p className="text-muted-foreground">Review and grade student submissions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Pending Grading"
            value={pendingSubmissions.length}
            description="Need attention"
            icon={Clock}
          />
          <StatsCard title="Graded" value={gradedSubmissions.length} description="Completed" icon={CheckCircle} />
          <StatsCard
            title="Average Grade"
            value={`${averageGrade.toFixed(1)}%`}
            description="All submissions"
            icon={Award}
          />
          <StatsCard
            title="Late Submissions"
            value={lateSubmissions.length}
            description="Past due"
            icon={AlertTriangle}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by student name or assignment..." className="pl-10" />
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
              <SelectValue placeholder="Filter by assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              {lecturerAssignments.map((assignment) => (
                <SelectItem key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Submission Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingSubmissions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="graded" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Graded ({gradedSubmissions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="late" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Late ({lateSubmissions.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingSubmissions.map((submission) => {
                const assignment = getAssignmentById(submission.assignmentId)
                return assignment ? (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    assignment={assignment}
                    onGrade={handleGrade}
                    onViewDetails={handleViewDetails}
                  />
                ) : null
              })}
            </div>
            {pendingSubmissions.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No submissions pending grading</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {gradedSubmissions.map((submission) => {
                const assignment = getAssignmentById(submission.assignmentId)
                return assignment ? (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    assignment={assignment}
                    onGrade={handleGrade}
                    onViewDetails={handleViewDetails}
                  />
                ) : null
              })}
            </div>
          </TabsContent>

          <TabsContent value="late" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lateSubmissions.map((submission) => {
                const assignment = getAssignmentById(submission.assignmentId)
                return assignment ? (
                  <SubmissionCard
                    key={submission.id}
                    submission={submission}
                    assignment={assignment}
                    onGrade={handleGrade}
                    onViewDetails={handleViewDetails}
                  />
                ) : null
              })}
            </div>
            {lateSubmissions.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No late submissions</h3>
                <p className="text-muted-foreground">All submissions were on time</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Grade Submission Dialog */}
        {selectedSubmissionData && selectedAssignmentData && (
          <GradeSubmissionDialog
            submission={selectedSubmissionData}
            assignment={selectedAssignmentData}
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
