"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { EnrollmentCard } from "@/components/enrollments/enrollment-card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockEnrollments, mockCourses } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { Search, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react"

export default function StudentEnrolledPage() {
  const { toast } = useToast()

  // Filter enrollments for current student (mock student ID 3)
  const studentEnrollments = mockEnrollments.filter((e) => e.studentId === "3")
  const pendingEnrollments = studentEnrollments.filter((e) => e.status === "pending")
  const approvedEnrollments = studentEnrollments.filter((e) => e.status === "approved")
  const rejectedEnrollments = studentEnrollments.filter((e) => e.status === "rejected")

  const handleDrop = (enrollmentId: string) => {
    const enrollment = mockEnrollments.find((e) => e.id === enrollmentId)
    const course = mockCourses.find((c) => c.id === enrollment?.courseId)

    toast({
      title: "Course dropped",
      description: `You have been unenrolled from ${course?.title}`,
      variant: "destructive",
    })
  }

  const getEnrollmentWithCourse = (enrollment: any) => {
    const course = mockCourses.find((c) => c.id === enrollment.courseId)
    return { enrollment, course }
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Enrollments</h1>
            <p className="text-muted-foreground">Track your course enrollments and status</p>
          </div>
          <Button asChild>
            <a href="/student/courses">Browse More Courses</a>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Enrolled Courses"
            value={approvedEnrollments.length}
            description="Currently enrolled"
            icon={BookOpen}
          />
          <StatsCard
            title="Pending Approval"
            value={pendingEnrollments.length}
            description="Awaiting approval"
            icon={Clock}
          />
          <StatsCard
            title="Total Credits"
            value={approvedEnrollments.reduce((sum, e) => {
              const course = mockCourses.find((c) => c.id === e.courseId)
              return sum + (course?.credits || 0)
            }, 0)}
            description="This semester"
            icon={CheckCircle}
          />
          <StatsCard title="Rejected" value={rejectedEnrollments.length} description="This semester" icon={XCircle} />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search your courses..." className="pl-10" />
        </div>

        {/* Enrollment Tabs */}
        <Tabs defaultValue="enrolled" className="space-y-4">
          <TabsList>
            <TabsTrigger value="enrolled" className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Enrolled ({approvedEnrollments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingEnrollments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected ({rejectedEnrollments.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrolled" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedEnrollments.map((enrollment) => {
                const { course } = getEnrollmentWithCourse(enrollment)
                return course ? (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} course={course} onDrop={handleDrop} />
                ) : null
              })}
            </div>
            {approvedEnrollments.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No enrolled courses</h3>
                <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet</p>
                <Button asChild>
                  <a href="/student/courses">Browse Available Courses</a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingEnrollments.map((enrollment) => {
                const { course } = getEnrollmentWithCourse(enrollment)
                return course ? <EnrollmentCard key={enrollment.id} enrollment={enrollment} course={course} /> : null
              })}
            </div>
            {pendingEnrollments.length === 0 && (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No pending enrollments</h3>
                <p className="text-muted-foreground">All your enrollment requests have been processed</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedEnrollments.map((enrollment) => {
                const { course } = getEnrollmentWithCourse(enrollment)
                return course ? <EnrollmentCard key={enrollment.id} enrollment={enrollment} course={course} /> : null
              })}
            </div>
            {rejectedEnrollments.length === 0 && (
              <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No rejected enrollments</h3>
                <p className="text-muted-foreground">None of your enrollment requests have been rejected</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
