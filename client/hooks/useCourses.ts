// hooks/useCourses.ts
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
}

interface Course {
  id: string;
  title: string;
  credits: number;
  syllabus: string;
  lecturerId: string;
  createdAt: string;
  updatedAt: string;
  lecturer?: User;
  _count?: {
    enrollments: number;
    assignments?: number;
  };
  enrollments?: Enrollment[];
}

interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: 'PENDING' | 'ENROLLED' | 'COMPLETED' | 'DROPPED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    credits: number;
    lecturer?: {
      id: string;
      email: string;
    };
  };
  student?: User;
}

interface CreateCourseDto {
  title: string;
  credits: number;
  syllabus: string;
}

interface UpdateCourseDto {
  title?: string;
  credits?: number;
  syllabus?: string;
}

interface AssignLecturerDto {
  lecturerId: string;
}

interface UpdateEnrollmentDto {
  status: Enrollment['status'];
}

interface CourseQueryDto {
  search?: string;
  lecturerId?: string;
  credits?: number;
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  const handleApiError = async (response: Response) => {
    let errorMessage = `Request failed with status ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // If we can't parse JSON, use the default message
    }
    
    throw new Error(errorMessage);
  };

  // Get all courses with optional query parameters
  const getAllCourses = useCallback(async (query: CourseQueryDto = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const queryParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${API_BASE_URL}/courses`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) await handleApiError(response);

      const data = await response.json();
      // Handle both paginated and non-paginated responses
      const coursesArray = data.courses || data || [];
      setCourses(coursesArray);
      return coursesArray;
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

  // Get single course by ID
  const getCourseById = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) await handleApiError(response);

      const data: Course = await response.json();
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

  // Create a new course (Lecturer only)
  const createCourse = useCallback(async (createCourseDto: CreateCourseDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createCourseDto),
      });

      if (!response.ok) await handleApiError(response);

      const data: Course = await response.json();
      toast({
        title: 'Success',
        description: 'Course created successfully',
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

  // Update course (Lecturer only)
  const updateCourse = useCallback(async (id: string, updateCourseDto: UpdateCourseDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateCourseDto),
      });

      if (!response.ok) await handleApiError(response);

      const data: Course = await response.json();
      toast({
        title: 'Success',
        description: 'Course updated successfully',
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

  // Request enrollment in a course (Student only)
  const requestEnrollment = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) await handleApiError(response);

      const data: Enrollment = await response.json();
      toast({
        title: 'Success',
        description: 'Enrollment request submitted successfully',
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

  // Drop from a course (Student only)
  const dropFromCourse = useCallback(async (courseId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/drop`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) await handleApiError(response);

      const data: Enrollment = await response.json();
      toast({
        title: 'Success',
        description: 'Successfully dropped from course',
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

  // Get lecturer's courses
  const getLecturerCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses/lecturer/my-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) await handleApiError(response);

      const data: Course[] = await response.json();
      setCourses(data);
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

  // Get student's enrollments
  const getStudentEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses/student/my-enrollments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) await handleApiError(response);

      const data: Enrollment[] = await response.json();
      setEnrollments(data);
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

  // Admin: Assign lecturer to course
  const assignLecturer = useCallback(async (courseId: string, assignLecturerDto: AssignLecturerDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/assign-lecturer`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignLecturerDto),
      });

      if (!response.ok) await handleApiError(response);

      const data: Course = await response.json();
      toast({
        title: 'Success',
        description: 'Lecturer assigned successfully',
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

  // Admin: Get all enrollments
  const getAllEnrollments = useCallback(async (status?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);

      const response = await fetch(`${API_BASE_URL}/courses/admin/enrollments${queryParams.toString() ? `?${queryParams}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) await handleApiError(response);

      const data = await response.json();
      // Handle both paginated and non-paginated responses
      const enrollmentsArray = data.enrollments || data || [];
      setEnrollments(enrollmentsArray);
      return enrollmentsArray;
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

  // Admin: Get pending enrollments
  const getPendingEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/courses/admin/enrollments/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) await handleApiError(response);

      const data = await response.json();
      // Handle both paginated and non-paginated responses
      const enrollmentsArray = data.enrollments || data || [];
      setEnrollments(enrollmentsArray);
      return enrollmentsArray;
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

  // Admin: Update enrollment status
  const updateEnrollmentStatus = useCallback(async (enrollmentId: string, updateEnrollmentDto: UpdateEnrollmentDto) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/enrollments/${enrollmentId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateEnrollmentDto),
      });

      if (!response.ok) await handleApiError(response);

      const data: Enrollment = await response.json();
      toast({
        title: 'Success',
        description: 'Enrollment status updated successfully',
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

  return {
    courses,
    enrollments,
    isLoading,
    error,
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    requestEnrollment,
    dropFromCourse,
    getLecturerCourses,
    getStudentEnrollments,
    assignLecturer,
    getAllEnrollments,
    getPendingEnrollments,
    updateEnrollmentStatus,
  };
};