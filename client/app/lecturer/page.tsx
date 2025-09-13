import { ProtectedRoute } from "@/components/auth/protected-route"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, ClipboardList, Award, Plus, Upload } from "lucide-react"

const mockActivities = [
  {
    id: "1",
    user: { name: "Mike Student", avatar: "/student-avatar.png" },
    action: "submitted assignment for",
    target: "Data Structures Lab 3",
    timestamp: "1 hour ago",
  },
  {
    id: "2",
    user: { name: "Sarah Wilson", avatar: "/placeholder.svg?key=sarah" },
    action: "enrolled in",
    target: "Advanced Algorithms",
    timestamp: "3 hours ago",
  },
  {
    id: "3",
    user: { name: "John Doe", avatar: "/placeholder.svg?key=john" },
    action: "submitted assignment for",
    target: "Computer Networks",
    timestamp: "5 hours ago",
  },
  {
    id: "4",
    user: { name: "Emma Brown", avatar: "/placeholder.svg?key=emma" },
    action: "asked question in",
    target: "Database Systems",
    timestamp: "1 day ago",
  },
]

export default function LecturerDashboard() {
  return (
    <ProtectedRoute allowedRoles={["LECTURER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lecturer Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and students</p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Syllabus
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="My Courses" value="6" description="Active courses" icon={BookOpen} />
          <StatsCard
            title="Total Students"
            value="156"
            description="Across all courses"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard title="Pending Assignments" value="23" description="Need grading" icon={ClipboardList} />
          <StatsCard
            title="Average Grade"
            value="82%"
            description="This semester"
            icon={Award}
            trend={{ value: 5, isPositive: true }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <RecentActivity activities={mockActivities} title="Student Activity" />

          {/* My Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Data Structures</p>
                    <p className="text-sm text-muted-foreground">45 students • 8 assignments pending</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Advanced Algorithms</p>
                    <p className="text-sm text-muted-foreground">32 students • 5 assignments pending</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Computer Networks</p>
                    <p className="text-sm text-muted-foreground">38 students • 10 assignments pending</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grading Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Grading Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Assignment: Binary Trees Implementation</p>
                  <p className="text-sm text-muted-foreground">Data Structures • Due: 2 days ago • 12 submissions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-600 font-medium">Overdue</span>
                  <Button size="sm">Grade Now</Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Assignment: Network Protocol Analysis</p>
                  <p className="text-sm text-muted-foreground">Computer Networks • Due: Tomorrow • 8 submissions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-orange-600 font-medium">Due Soon</span>
                  <Button size="sm" variant="outline">
                    Grade
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Assignment: Algorithm Complexity</p>
                  <p className="text-sm text-muted-foreground">Advanced Algorithms • Due: Next week • 3 submissions</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-green-600 font-medium">On Time</span>
                  <Button size="sm" variant="outline">
                    Grade
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
