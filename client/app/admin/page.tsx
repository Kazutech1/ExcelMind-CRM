import { ProtectedRoute } from "@/components/auth/protected-route"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, GraduationCap, TrendingUp, Plus, UserCheck } from "lucide-react"

const mockActivities = [
  {
    id: "1",
    user: { name: "Dr. Sarah Johnson", avatar: "/lecturer-avatar.jpg" },
    action: "created course",
    target: "Advanced Mathematics",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    user: { name: "Mike Student", avatar: "/student-avatar.png" },
    action: "enrolled in",
    target: "Computer Science 101",
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    user: { name: "Dr. Emily Davis", avatar: "/placeholder.svg?key=emily" },
    action: "submitted grades for",
    target: "Physics Lab",
    timestamp: "6 hours ago",
  },
  {
    id: "4",
    user: { name: "Alex Thompson", avatar: "/placeholder.svg?key=alex" },
    action: "requested enrollment in",
    target: "Data Structures",
    timestamp: "1 day ago",
  },
]

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your educational institution</p>
          </div>
          <div className="flex space-x-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button variant="outline">
              <UserCheck className="h-4 w-4 mr-2" />
              Review Enrollments
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Students"
            value="1,234"
            description="Active students"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Total Courses"
            value="89"
            description="Available courses"
            icon={BookOpen}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard
            title="Total Enrollments"
            value="3,456"
            description="This semester"
            icon={GraduationCap}
            trend={{ value: 15, isPositive: true }}
          />
          <StatsCard
            title="Completion Rate"
            value="87%"
            description="Course completion"
            icon={TrendingUp}
            trend={{ value: 3, isPositive: true }}
          />
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <RecentActivity activities={mockActivities} />

          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Course Enrollment</p>
                    <p className="text-sm text-muted-foreground">15 students waiting for approval</p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Lecturer Applications</p>
                    <p className="text-sm text-muted-foreground">3 new applications</p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Course Proposals</p>
                    <p className="text-sm text-muted-foreground">2 new course proposals</p>
                  </div>
                  <Button size="sm">Review</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Users className="h-6 w-6 mb-2" />
                <span className="text-xs">Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <BookOpen className="h-6 w-6 mb-2" />
                <span className="text-xs">Course Catalog</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <GraduationCap className="h-6 w-6 mb-2" />
                <span className="text-xs">Enrollments</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span className="text-xs">Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <UserCheck className="h-6 w-6 mb-2" />
                <span className="text-xs">Approvals</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col bg-transparent">
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-xs">Add Content</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
