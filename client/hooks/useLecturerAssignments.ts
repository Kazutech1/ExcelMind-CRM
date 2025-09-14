// hooks/useLecturerAssignments.ts
import { useAssignments } from './useAssignments';

export const useLecturerAssignments = () => {
  const {
    assignments,
    isLoading,
    error,
    getCourseAssignments,
    createAssignment,
    updateAssignment,
    gradeSubmission,
    getCourseGrades,
  } = useAssignments();

  return {
    assignments,
    isLoading,
    error,
    getCourseAssignments,
    createAssignment,
    updateAssignment,
    gradeSubmission,
    getCourseGrades,
  };
};