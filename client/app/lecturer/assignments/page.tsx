// pages/lecturer/assignments/index.tsx
"use client"


import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAssignments } from "@/hooks/useAssignments";
import { useCourses } from "@/hooks/useCourses";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, ArrowLeft, Plus, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LecturerAssignmentsPage() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const { assignments, getCourseAssignments, isLoading: assignmentsLoading } = useAssignments();
  const { courses, getLecturerCourses, isLoading: coursesLoading, error } = useCourses();

  useEffect(() => {
    // Fetch lecturer's courses on component mount
    getLecturerCourses();
  }, [getLecturerCourses]);

  const handleCourseSelect = async (courseId: string) => {
    setSelectedCourse(courseId);
    await getCourseAssignments(courseId);
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
  };

  if (coursesLoading) {
    return (
      <ProtectedRoute allowedRoles={["LECTURER"]}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["LECTURER"]}>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading courses</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => getLecturerCourses()}>Try Again</Button>
        </div>
      </ProtectedRoute>
    );
  }

  if (!selectedCourse) {
    return (
      <ProtectedRoute allowedRoles={["LECTURER"]}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground">Select a course to view assignments</p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't been assigned to any courses yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card 
                  key={course.id} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleCourseSelect(course.id)}
                >
                  <CardHeader>
                    {/* <CardTitle className="text-lg">{course.code}</CardTitle> */}
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{course.title}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {course._count?.assignments || 0} assignments
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ProtectedRoute>
    );
  }

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <ProtectedRoute allowedRoles={["LECTURER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={handleBackToCourses}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {selectedCourseData?.title} Assignments
              </h1>
              <p className="text-muted-foreground">Manage course assignments</p>
            </div>
          </div>
          <Link href={`/lecturer/assignments/create?courseId=${selectedCourse}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </Link>
        </div>

        {assignmentsLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Assignments Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  courseName={selectedCourseData?.title || ""}
                  submissionCount={assignment._count?.submissions || 0}
                  showManageButton
                  onManage={() => console.log("Manage assignment:", assignment.id)}
                  onView={() => console.log("View assignment:", assignment.id)}
                />
              ))}
            </div>

            {assignments.length === 0 && (
              <div className="text-center py-12">
                <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No assignments yet</h3>
                <p className="text-muted-foreground mb-4">Create your first assignment to get started</p>
                <Link href={`/lecturer/assignments/create?courseId=${selectedCourse}`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Assignment
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}