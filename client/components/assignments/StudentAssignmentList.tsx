// components/StudentAssignmentList.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStudentAssignments } from "@/hooks/useStudentAssignments";
import { format, isToday, isTomorrow, addDays, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface StudentAssignmentListProps {
  courseId: string;
}

export function StudentAssignmentList({ courseId }: StudentAssignmentListProps) {
  const { assignments, isLoading, getCourseAssignments } = useStudentAssignments();
  const [filteredAssignments, setFilteredAssignments] = useState<any[]>([]);

  useEffect(() => {
    getCourseAssignments(courseId);
  }, [courseId, getCourseAssignments]);

  useEffect(() => {
    if (assignments && assignments.length > 0) {
      // Filter out completed assignments and sort by due date
      const upcoming = assignments
        .filter((assignment) => {
          const submission = assignment.submissions?.[0];
          return !submission || submission.status === "NOT_SUBMITTED";
        })
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5); // Show only the next 5 assignments

      setFilteredAssignments(upcoming);
    }
  }, [assignments]);

  const getDueDateText = (dueDate: string) => {
    const date = new Date(dueDate);
    
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    }
    
    if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, "h:mm a")}`;
    }
    
    const daysDiff = differenceInDays(date, new Date());
    
    if (daysDiff < 7) {
      return `${format(date, "EEEE")} at ${format(date, "h:mm a")}`;
    }
    
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const getStatusInfo = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (timeDiff < 0) {
      return { text: "Overdue", color: "text-red-600" };
    }
    
    if (daysDiff === 0) {
      return { text: "Due Today", color: "text-red-600" };
    }
    
    if (daysDiff === 1) {
      return { text: "Due Tomorrow", color: "text-orange-600" };
    }
    
    if (daysDiff <= 3) {
      return { text: `${daysDiff} days left`, color: "text-orange-600" };
    }
    
    return { text: `${daysDiff} days left`, color: "text-green-600" };
  };

  const getButtonVariant = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    
    if (timeDiff < 0) {
      return "destructive";
    }
    
    if (timeDiff < 24 * 60 * 60 * 1000) {
      return "default";
    }
    
    return "outline";
  };

  const getButtonText = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const timeDiff = date.getTime() - now.getTime();
    
    if (timeDiff < 0) {
      return "Submit Late";
    }
    
    if (timeDiff < 24 * 60 * 60 * 1000) {
      return "Submit";
    }
    
    return "Start";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Upcoming Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (filteredAssignments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Upcoming Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            No upcoming assignments
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Upcoming Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const statusInfo = getStatusInfo(assignment.dueDate);
            const buttonVariant = getButtonVariant(assignment.dueDate);
            const buttonText = getButtonText(assignment.dueDate);
            
            return (
              <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{assignment.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {assignment.course?.title} • Due: {getDueDateText(assignment.dueDate)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  <Button size="sm" variant={buttonVariant as any}>
                    {buttonText}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}