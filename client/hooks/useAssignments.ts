// hooks/useAssignments.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Enums to match backend
export enum AssignmentType {
  FILE_UPLOAD = 'FILE_UPLOAD',
  TEXT_SUBMISSION = 'TEXT_SUBMISSION',
  BOTH = 'BOTH'
}

export enum SubmissionStatus {
  NOT_SUBMITTED = 'NOT_SUBMITTED',
  SUBMITTED = 'SUBMITTED',
  LATE_SUBMISSION = 'LATE_SUBMISSION',
  GRADED = 'GRADED'
}

// Interfaces matching backend response structure
interface Assignment {
  id: string;
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  weight: number;
  courseId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  course: {
    id: string;
    title: string;
  };
  createdBy: {
    id: string;
    email: string;
  };
  submissions?: StudentSubmissionInfo[] | LecturerSubmissionInfo[];
  _count: {
    submissions: number;
  };
}

// Student view of their own submissions
interface StudentSubmissionInfo {
  id: string;
  status: SubmissionStatus;
  grade?: number;
  submittedAt?: string;
  gradedAt?: string;
}

// Lecturer view of all submissions
interface LecturerSubmissionInfo {
  id: string;
  status: SubmissionStatus;
  grade?: number;
  student: {
    id: string;
    email: string;
  };
}

interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  textSubmission?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  grade?: number;
  feedback?: string;
  status: SubmissionStatus;
  submittedAt?: string;
  gradedAt?: string;
  assignment: {
    id: string;
    title: string;
    type: AssignmentType;
    weight: number;
    dueDate: string;
  };
  student?: {
    id: string;
    email: string;
  };
}

interface CourseGrade {
  id: string;
  courseId: string;
  studentId: string;
  finalGrade: number;
  letterGrade: string;
  createdAt: string;
  updatedAt: string;
  student: {
    id: string;
    email: string;
  };
}

// DTOs matching backend
interface CreateAssignmentDto {
  title: string;
  description: string;
  type: AssignmentType;
  dueDate: string;
  weight: number;
  courseId: string;
}

interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  type?: AssignmentType;
  dueDate?: string;
  weight?: number;
}

interface SubmitAssignmentDto {
  textSubmission?: string;
}

interface GradeAssignmentDto {
  grade: number;
  feedback?: string;
}

// API Error Response
interface ApiErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
}

export const useAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [courseGrades, setCourseGrades] = useState<CourseGrade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Helper function to handle API errors
  const handleApiError = async (response: Response): Promise<never> => {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData: ApiErrorResponse = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response body is not JSON, use the status text
    }
    
    throw new Error(errorMessage);
  };

  // Get assignments for a course
  const getCourseAssignments = useCallback(async (courseId: string): Promise<Assignment[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/assignments/course/${courseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: Assignment[] = await response.json();
      setAssignments(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Create a new assignment (Lecturer only)
  const createAssignment = useCallback(async (assignmentData: CreateAssignmentDto): Promise<Assignment> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: Assignment = await response.json();
      
      // Update local state by adding the new assignment
      setAssignments(prev => [...prev, data]);
      
      toast({
        title: 'Success',
        description: 'Assignment created successfully',
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Update an assignment (Lecturer only)
  const updateAssignment = useCallback(async (assignmentId: string, updateData: UpdateAssignmentDto): Promise<Assignment> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: Assignment = await response.json();
      
      // Update local state
      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId ? data : assignment
      ));
      
      toast({
        title: 'Success',
        description: 'Assignment updated successfully',
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Submit an assignment (Student only)
  const submitAssignment = useCallback(async (
    assignmentId: string, 
    submissionData: SubmitAssignmentDto, 
    file?: File
  ): Promise<Submission> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formData = new FormData();
      
      // Add text submission if provided
      if (submissionData.textSubmission) {
        formData.append('textSubmission', submissionData.textSubmission);
      }
      
      // Add file if provided
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header when using FormData
        },
        body: formData,
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: Submission = await response.json();
      
      // Update submissions state if it exists
      setSubmissions(prev => {
        const existingIndex = prev.findIndex(sub => 
          sub.assignmentId === assignmentId && sub.studentId === data.studentId
        );
        
        if (existingIndex >= 0) {
          // Update existing submission
          return prev.map(sub => sub.id === data.id ? data : sub);
        } else {
          // Add new submission
          return [...prev, data];
        }
      });
      
      toast({
        title: 'Success',
        description: 'Assignment submitted successfully',
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Grade a submission (Lecturer only)
  const gradeSubmission = useCallback(async (submissionId: string, gradeData: GradeAssignmentDto): Promise<Submission> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/assignments/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gradeData),
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: Submission = await response.json();
      
      // Update submissions state
      setSubmissions(prev => prev.map(sub => sub.id === submissionId ? data : sub));
      
      toast({
        title: 'Success',
        description: 'Submission graded successfully',
      });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Get student submissions for a course (Student only)
  const getStudentSubmissions = useCallback(async (courseId: string): Promise<Submission[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/assignments/course/${courseId}/my-submissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: Submission[] = await response.json();
      setSubmissions(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Get course grades (Lecturer only)
  const getCourseGrades = useCallback(async (courseId: string): Promise<CourseGrade[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/assignments/course/${courseId}/grades`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      const data: CourseGrade[] = await response.json();
      setCourseGrades(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL, toast]);

  // Download a submitted file
  const downloadFile = useCallback(async (filename: string): Promise<void> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/files/assignments/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await handleApiError(response);
      }

      // Get the content-disposition header to get the original filename
      const contentDisposition = response.headers.get('content-disposition');
      let downloadFilename = filename;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }

      // Create a blob from the response and create a download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'File downloaded successfully',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [API_BASE_URL, toast]);

  // Utility function to check if assignment is overdue
  const isAssignmentOverdue = useCallback((dueDate: string): boolean => {
    return new Date() > new Date(dueDate);
  }, []);

  // Utility function to format assignment status for students
  const getSubmissionStatusText = useCallback((status: SubmissionStatus): string => {
    switch (status) {
      case SubmissionStatus.NOT_SUBMITTED:
        return 'Not Submitted';
      case SubmissionStatus.SUBMITTED:
        return 'Submitted';
      case SubmissionStatus.LATE_SUBMISSION:
        return 'Late Submission';
      case SubmissionStatus.GRADED:
        return 'Graded';
      default:
        return 'Unknown';
    }
  }, []);

  // Clear state when switching contexts
  const clearState = useCallback(() => {
    setAssignments([]);
    setSubmissions([]);
    setCourseGrades([]);
    setError(null);
  }, []);

  return {
    // State
    assignments,
    submissions,
    courseGrades,
    isLoading,
    error,
    
    // Assignment CRUD operations
    getCourseAssignments,
    createAssignment,
    updateAssignment,
    
    // Submission operations
    submitAssignment,
    gradeSubmission,
    getStudentSubmissions,
    
    // Grade operations
    getCourseGrades,
    
    // File operations
    downloadFile,
    
    // Utility functions
    isAssignmentOverdue,
    getSubmissionStatusText,
    clearState,
    
    // Type exports for components
    AssignmentType,
    SubmissionStatus,
  };
};