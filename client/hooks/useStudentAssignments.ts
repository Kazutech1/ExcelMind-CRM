// hooks/useStudentAssignments.ts
import { useAssignments } from './useAssignments';

export const useStudentAssignments = () => {
  const {
    assignments,
    submissions,
    isLoading,
    error,
    getCourseAssignments,
    submitAssignment,
    getStudentSubmissions,
    downloadFile,
  } = useAssignments();

  return {
    assignments,
    submissions,
    isLoading,
    error,
    getCourseAssignments,
    submitAssignment,
    getStudentSubmissions,
    downloadFile,
  };
};