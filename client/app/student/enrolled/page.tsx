"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { EnrollmentCard } from "@/components/enrollments/enrollment-card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCourses } from "@/hooks/useCourses"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, Filter } from "lucide-react"

export default function StudentEnrolledPage() {
  const { enrollments, isLoading, getStudentEnrollments, dropFromCourse } = useCourses()
  const { toast } = useToast()
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    getStudentEnrollments()
  }, [getStudentEnrollments])

  const handleDrop = async (courseId: string) => {
    try {
      await dropFromCourse(courseId)
      toast({
        title: "Success",
        description: "Successfully dropped from course",
      })
      // Refresh enrollments after dropping
      getStudentEnrollments()
    } catch (error) {
      // Error is already handled in the hook
      console.error('Drop failed:', error)
    }
  }

  // Filter enrollments based on status
  const filteredEnrollments = enrollments?.filter(enrollment => {
    if (statusFilter === "all") return true
    return enrollment.status === statusFilter
  }) || []

  // Get enrollment counts by status
  const enrollmentCounts = enrollments?.reduce((acc, enrollment) => {
    acc[enrollment.status] = (acc[enrollment.status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Enrollments</h1>
            <p className="text-muted-foreground">
              Your enrolled courses and enrollment requests
            </p>
          </div>
          <Button asChild>
            <a href="/student/courses">Browse Courses</a>
          </Button>
        </div>

        {/* Filter and Stats */}
        {enrollments && enrollments.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Total: {enrollments.length}</span>
              {enrollmentCounts.ENROLLED && (
                <span>Enrolled: {enrollmentCounts.ENROLLED}</span>
              )}
              {enrollmentCounts.PENDING && (
                <span>Pending: {enrollmentCounts.PENDING}</span>
              )}
              {enrollmentCounts.COMPLETED && (
                <span>Completed: {enrollmentCounts.COMPLETED}</span>
              )}
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value === "all" ? "all" : value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Enrollments</SelectItem>
                <SelectItem value="ENROLLED">Enrolled</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="DROPPED">Dropped</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="mt-4">Loading enrollments...</p>
          </div>
        ) : filteredEnrollments && filteredEnrollments.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEnrollments.map((enrollment) => (
                <EnrollmentCard 
                  key={enrollment.id} 
                  enrollment={enrollment} 
                  course={enrollment.course} 
                  onDrop={() => handleDrop(enrollment.courseId)} 
                />
              ))}
            </div>
            
            {statusFilter !== "all" && (
              <div className="text-center text-sm text-muted-foreground">
                Showing {filteredEnrollments.length} {statusFilter.toLowerCase()} enrollment{filteredEnrollments.length !== 1 ? 's' : ''}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="space-y-4">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">
                  {statusFilter === "all" 
                    ? "No enrollments found" 
                    : `No ${statusFilter.toLowerCase()} enrollments`
                  }
                </h3>
                <p className="text-muted-foreground">
                  {statusFilter === "all" 
                    ? "You haven't enrolled in any courses yet" 
                    : `You don't have any ${statusFilter.toLowerCase()} enrollments`
                  }
                </p>
              </div>
              <div className="flex gap-2 justify-center">
                {statusFilter !== "all" && (
                  <Button 
                    variant="outline" 
                    onClick={() => setStatusFilter("all")}
                  >
                    Show All Enrollments
                  </Button>
                )}
                <Button asChild>
                  <a href="/student/courses">Browse Available Courses</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}