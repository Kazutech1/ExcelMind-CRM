import { ProtectedRoute } from "@/components/auth/protected-route"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { mockAssignments, mockSubmissions } from "@/lib/mock-assignments"
import { mockCourses, mockEnrollments } from "@/lib/mock-data"
import { Award, TrendingUp, BookOpen, Target } from "lucide-react"

export default function StudentGradesPage() {
  // Get student's enrolled courses (mock student ID 3)
  const studentEnrollments = mockEnrollments.filter((e) => e.studentId === "3" && e.status === "approved")
  const enrolledCourseIds = studentEnrollments.map((e) => e.courseId)
  const enrolledCourses = mockCourses.filter((c) => enrolledCourseIds.includes(c.id))

  // Get student's submissions
  const studentSubmissions = mockSubmissions.filter((s) => s.studentId === "3")
  const gradedSubmissions = studentSubmissions.filter((s) => s.grade !== undefined)

  // Calculate course grades using weighted average
  const calculateCourseGrade = (courseId: string) => {
    const courseAssignments = mockAssignments.filter((a) => a.courseId === courseId && a.status === "published")
    const courseSubmissions = studentSubmissions.filter((s) =>
      courseAssignments.some((a) => a.id === s.assignmentId && s.grade !== undefined),
    )

    if (courseSubmissions.length === 0) return null

    // Simple weighted average (all assignments equal weight for demo)
    const totalPoints = courseSubmissions.reduce((sum, submission) => {
      const assignment = courseAssignments.find((a) => a.id === submission.assignmentId)
      return sum + (assignment?.maxPoints || 0)
    }, 0)

    const earnedPoints = courseSubmissions.reduce((sum, submission) => sum + (submission.grade || 0), 0)

    return totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0
  }

  // Calculate overall GPA
  const courseGrades = enrolledCourses
    .map((course) => ({
      course,
      grade: calculateCourseGrade(course.id),
      credits: course.credits,
    }))
    .filter((cg) => cg.grade !== null)

  const totalCredits = courseGrades.reduce((sum, cg) => sum + cg.credits, 0)
  const weightedGradeSum = courseGrades.reduce((sum, cg) => sum + (cg.grade || 0) * cg.credits, 0)
  const overallGPA = totalCredits > 0 ? (weightedGradeSum / totalCredits / 100) * 4.0 : 0

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getLetterGrade = (percentage: number) => {
    if (percentage >= 97) return "A+"
    if (percentage >= 93) return "A"
    if (percentage >= 90) return "A-"
    if (percentage >= 87) return "B+"
    if (percentage >= 83) return "B"
    if (percentage >= 80) return "B-"
    if (percentage >= 77) return "C+"
    if (percentage >= 73) return "C"
    if (percentage >= 70) return "C-"
    if (percentage >= 67) return "D+"
    if (percentage >= 65) return "D"
    return "F"
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Grades</h1>
            <p className="text-muted-foreground">Track your academic performance</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard title="Overall GPA" value={overallGPA.toFixed(2)} description="Current semester" icon={Award} />
          <StatsCard
            title="Courses with Grades"
            value={courseGrades.length}
            description={`Out of ${enrolledCourses.length} enrolled`}
            icon={BookOpen}
          />
          <StatsCard
            title="Graded Assignments"
            value={gradedSubmissions.length}
            description="Total completed"
            icon={Target}
          />
          <StatsCard
            title="Average Score"
            value={`${gradedSubmissions.length > 0 ? (gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length).toFixed(1) : 0}%`}
            description="All assignments"
            icon={TrendingUp}
          />
        </div>

        {/* Course Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Course Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrolledCourses.map((course) => {
                const courseGrade = calculateCourseGrade(course.id)
                const courseAssignments = mockAssignments.filter(
                  (a) => a.courseId === course.id && a.status === "published",
                )
                const gradedAssignmentsCount = studentSubmissions.filter(
                  (s) => courseAssignments.some((a) => a.id === s.assignmentId) && s.grade !== undefined,
                ).length

                return (
                  <div key={course.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-foreground">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {course.code} • {course.credits} credits • {course.lecturer.name}
                        </p>
                      </div>
                      <div className="text-right">
                        {courseGrade !== null ? (
                          <>
                            <div className={`text-2xl font-bold ${getGradeColor(courseGrade)}`}>
                              {getLetterGrade(courseGrade)}
                            </div>
                            <div className="text-sm text-muted-foreground">{courseGrade.toFixed(1)}%</div>
                          </>
                        ) : (
                          <Badge variant="outline">No grades yet</Badge>
                        )}
                      </div>
                    </div>

                    {courseGrade !== null && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="text-muted-foreground">
                            {gradedAssignmentsCount}/{courseAssignments.length} assignments graded
                          </span>
                        </div>
                        <Progress value={courseGrade} className="h-2" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Grades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {gradedSubmissions
                .sort((a, b) => new Date(b.gradedAt || "").getTime() - new Date(a.gradedAt || "").getTime())
                .slice(0, 10)
                .map((submission) => {
                  const assignment = mockAssignments.find((a) => a.id === submission.assignmentId)
                  const course = mockCourses.find((c) => c.id === assignment?.courseId)
                  const percentage = assignment ? (submission.grade! / assignment.maxPoints) * 100 : 0

                  return (
                    <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{assignment?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course?.code} • Graded {new Date(submission.gradedAt || "").toLocaleDateString()}
                        </p>
                        {submission.feedback && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{submission.feedback}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getGradeColor(percentage)}`}>
                          {submission.grade}/{assignment?.maxPoints}
                        </div>
                        <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
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
