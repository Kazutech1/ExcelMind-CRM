"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { EnrollmentCard } from "@/components/enrollments/enrollment-card"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockEnrollments, mockCourses } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, UserCheck, Clock, CheckCircle, XCircle } from "lucide-react"

// Mock student data
const mockStudents = [
  {
    id: "3",
    name: "Mike Student",
    email: "student@university.edu",
    avatar: "/student-avatar.png",
  },
  {
    id: "6",
    name: "Sarah Wilson",
    email: "sarah.wilson@university.edu",
    avatar: "/placeholder.svg?key=sarah",
  },
  {
    id: "7",
    name: "Alex Thompson",
    email: "alex.thompson@university.edu",
    avatar: "/placeholder.svg?key=alex",
  },
]

export default function AdminEnrollmentsPage() {
  const { toast } = useToast()

  const pendingEnrollments = mockEnrollments.filter((e) => e.status === "pending")
  const approvedEnrollments = mockEnrollments.filter((e) => e.status === "approved")
  const rejectedEnrollments = mockEnrollments.filter((e) => e.status === "rejected")

  const handleApprove = (enrollmentId: string) => {
    const enrollment = mockEnrollments.find((e) => e.id === enrollmentId)
    const course = mockCourses.find((c) => c.id === enrollment?.courseId)
    const student = mockStudents.find((s) => s.id === enrollment?.studentId)

    toast({
      title: "Enrollment approved",
      description: `${student?.name} has been enrolled in ${course?.title}`,
    })
  }

  const handleReject = (enrollmentId: string) => {
    const enrollment = mockEnrollments.find((e) => e.id === enrollmentId)
    const course = mockCourses.find((c) => c.id === enrollment?.courseId)
    const student = mockStudents.find((s) => s.id === enrollment?.studentId)

    toast({
      title: "Enrollment rejected",
      description: `${student?.name}'s enrollment request for ${course?.title} has been rejected`,
      variant: "destructive",
    })
  }

  const getEnrollmentWithDetails = (enrollment: any) => {
    const course = mockCourses.find((c) => c.id === enrollment.courseId)
    const student = mockStudents.find((s) => s.id === enrollment.studentId)
    return { enrollment, course, student }
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Enrollment Management</h1>
            <p className="text-muted-foreground">Review and manage student enrollments</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Pending Approvals"
            value={pendingEnrollments.length}
            description="Awaiting review"
            icon={Clock}
          />
          <StatsCard
            title="Approved"
            value={approvedEnrollments.length}
            description="This semester"
            icon={CheckCircle}
          />
          <StatsCard title="Rejected" value={rejectedEnrollments.length} description="This semester" icon={XCircle} />
          <StatsCard title="Total Enrollments" value={mockEnrollments.length} description="All time" icon={UserCheck} />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by student name or course..." className="pl-10" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {mockCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} - {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Enrollment Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingEnrollments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Approved ({approvedEnrollments.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected ({rejectedEnrollments.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingEnrollments.map((enrollment) => {
                const { course, student } = getEnrollmentWithDetails(enrollment)
                return course && student ? (
                  <EnrollmentCard
                    key={enrollment.id}
                    enrollment={enrollment}
                    course={course}
                    student={student}
                    showActions
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ) : null
              })}
            </div>
            {pendingEnrollments.length === 0 && (
              <div className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No pending enrollments</h3>
                <p className="text-muted-foreground">All enrollment requests have been processed</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {approvedEnrollments.map((enrollment) => {
                const { course, student } = getEnrollmentWithDetails(enrollment)
                return course && student ? (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} course={course} student={student} />
                ) : null
              })}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rejectedEnrollments.map((enrollment) => {
                const { course, student } = getEnrollmentWithDetails(enrollment)
                return course && student ? (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} course={course} student={student} />
                ) : null
              })}
            </div>
            {rejectedEnrollments.length === 0 && (
              <div className="text-center py-12">
                <XCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No rejected enrollments</h3>
                <p className="text-muted-foreground">No enrollment requests have been rejected</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
