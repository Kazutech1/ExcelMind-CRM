import { ProtectedRoute } from "@/components/auth/protected-route"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, GraduationCap, ClipboardList, Award, Search, Calendar } from "lucide-react"

const mockActivities = [
  {
    id: "1",
    user: { name: "You", avatar: "/student-avatar.png" },
    action: "submitted assignment for",
    target: "Data Structures Lab 3",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    user: { name: "Dr. Sarah Johnson", avatar: "/lecturer-avatar.jpg" },
    action: "graded your assignment in",
    target: "Advanced Mathematics",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    user: { name: "You", avatar: "/student-avatar.png" },
    action: "enrolled in",
    target: "Computer Networks",
    timestamp: "2 days ago",
  },
  {
    id: "4",
    user: { name: "Dr. Emily Davis", avatar: "/placeholder.svg?key=emily" },
    action: "posted new material in",
    target: "Physics Lab",
    timestamp: "3 days ago",
  },
]

export default function StudentDashboard() {
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">Track your academic progress</p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Browse Courses
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 ">
          <StatsCard title="Enrolled Courses" value="5" description="This semester" icon={BookOpen} />
          <StatsCard title="Pending Assignments" value="8" description="Due this week" icon={ClipboardList} />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}

        
        </div>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Binary Trees Implementation</p>
                  <p className="text-sm text-muted-foreground">Data Structures • Due: Tomorrow at 11:59 PM</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-600 font-medium">Due Soon</span>
                  <Button size="sm">Submit</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Calculus Problem Set 5</p>
                  <p className="text-sm text-muted-foreground">Advanced Mathematics • Due: Friday at 5:00 PM</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-orange-600 font-medium">3 days left</span>
                  <Button size="sm" variant="outline">
                    Start
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Network Protocol Analysis</p>
                  <p className="text-sm text-muted-foreground">Computer Networks • Due: Next Monday</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium">1 week left</span>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Search className="h-6 w-6 mb-2" />
                <span className="text-xs">Browse Courses</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <BookOpen className="h-6 w-6 mb-2" />
                <span className="text-xs">My Courses</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <ClipboardList className="h-6 w-6 mb-2" />
                <span className="text-xs">Assignments</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Award className="h-6 w-6 mb-2" />
                <span className="text-xs">Grades</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
