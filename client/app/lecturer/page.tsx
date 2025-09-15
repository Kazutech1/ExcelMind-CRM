"use client"

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { useCourses } from "@/hooks/useCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface CreateCourseFormData {
  title: string;
  credits: number;
  syllabus: string;
}

export default function LecturerDashboard() {
  const {
    courses,
    isLoading,
    createCourse,
    getLecturerCourses
  } = useCourses();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [createForm, setCreateForm] = useState<CreateCourseFormData>({
    title: "",
    credits: 3,
    syllabus: ""
  });

  // Load lecturer's courses on component mount
  useEffect(() => {
    getLecturerCourses();
  }, [getLecturerCourses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'credits') {
      setCreateForm(prev => ({ ...prev, [name]: parseInt(value) || 3 }));
    } else {
      setCreateForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSyllabusFile(e.target.files[0]);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let syllabusContent = createForm.syllabus;
      
      // If a file was uploaded, read it as text
      if (syllabusFile) {
        syllabusContent = await readFileAsText(syllabusFile);
      }

      await createCourse({
        title: createForm.title,
        credits: createForm.credits,
        syllabus: syllabusContent
      });

      // Reset form and close dialog
      setCreateForm({
        title: "",
        credits: 3,
        syllabus: ""
      });
      setSyllabusFile(null);
      setIsCreateDialogOpen(false);
      
      // Refresh courses list
      getLecturerCourses();
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  // Calculate dashboard stats from actual course data
  const totalStudents = courses.reduce((sum, course) => sum + (course._count?.enrollments || 0), 0);
  const totalAssignments = courses.reduce((sum, course) => sum + (course._count?.assignments || 0), 0);

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
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Fill in the course details below. You can type the syllabus directly or upload a text file.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">
                        Title
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        value={createForm.title}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                        placeholder="e.g., Introduction to Computer Science"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="credits" className="text-right">
                        Credits
                      </Label>
                      <Input
                        id="credits"
                        name="credits"
                        type="number"
                        min="1"
                        max="6"
                        value={createForm.credits}
                        onChange={handleInputChange}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="syllabus" className="text-right pt-2">
                        Syllabus
                      </Label>
                      <div className="col-span-3 space-y-2">
                        <Textarea
                          id="syllabus"
                          name="syllabus"
                          value={createForm.syllabus}
                          onChange={handleInputChange}
                          rows={6}
                          placeholder="Enter course syllabus content..."
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Or upload file:</span>
                          <Input
                            type="file"
                            onChange={handleFileChange}
                            accept=".txt,.md,.doc,.docx,.pdf"
                            className="w-auto"
                          />
                        </div>
                        {syllabusFile && (
                          <p className="text-sm text-muted-foreground">
                            Selected file: {syllabusFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Course"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Syllabus
            </Button>
          </div>
        </div>

        {/* Stats Grid - Now using real data */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="My Courses" 
            value={courses.length.toString()} 
            description="Active courses" 
            icon={BookOpen} 
          />
          <StatsCard
            title="Total Students"
            value={totalStudents.toString()}
            description="Across all courses"
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatsCard 
            title="Pending Assignments" 
            value={totalAssignments.toString()} 
            description="Need grading" 
            icon={ClipboardList} 
          />
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

          {/* My Courses - Now using real data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">My Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center text-muted-foreground py-4">
                    Loading courses...
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    <p>No courses found.</p>
                    <p className="text-sm">Create your first course to get started!</p>
                  </div>
                ) : (
                  courses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{course.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {course._count?.enrollments || 0} students • {course.credits} credits
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    </div>
                  ))
                )}
                {courses.length > 3 && (
                  <div className="text-center pt-2">
                    <Button variant="link" size="sm">
                      View All Courses ({courses.length})
                    </Button>
                  </div>
                )}
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