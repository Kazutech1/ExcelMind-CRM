"use client"

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useCourses } from "@/hooks/useCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  BookOpen, 
  Users, 
  Edit, 
  Plus, 
  Upload, 
  FileText, 
  Calendar,
  GraduationCap,
  Search,
  Filter,
  MoreVertical,
  Download
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  credits: number;
  syllabus: string;
  lecturerId: string;
  createdAt: string;
  updatedAt: string;
  lecturer?: {
    id: string;
    email: string;
  };
  _count?: {
    enrollments: number;
    assignments?: number;
  };
}

interface CreateCourseFormData {
  title: string;
  credits: number;
  syllabus: string;
}

interface EditCourseFormData {
  title: string;
  credits: number;
  syllabus: string;
}

export default function LecturerCoursesPage() {
  const {
    courses,
    isLoading,
    error,
    getLecturerCourses,
    createCourse,
    updateCourse,
    getCourseById
  } = useCourses();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [editSyllabusFile, setEditSyllabusFile] = useState<File | null>(null);

  const [createForm, setCreateForm] = useState<CreateCourseFormData>({
    title: "",
    credits: 3,
    syllabus: ""
  });

  const [editForm, setEditForm] = useState<EditCourseFormData>({
    title: "",
    credits: 3,
    syllabus: ""
  });

  // Load lecturer's courses on component mount
  useEffect(() => {
    getLecturerCourses();
  }, [getLecturerCourses]);

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.credits.toString().includes(searchQuery)
  );

  const handleCreateSubmit = async (e: React.FormEvent) => {
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
      setCreateForm({ title: "", credits: 3, syllabus: "" });
      setSyllabusFile(null);
      setIsCreateDialogOpen(false);
      
      // Refresh courses list
      getLecturerCourses();
    } catch (error) {
      console.error("Error creating course:", error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      let syllabusContent = editForm.syllabus;
      
      // If a new file was uploaded, read it as text
      if (editSyllabusFile) {
        syllabusContent = await readFileAsText(editSyllabusFile);
      }

      await updateCourse(selectedCourse.id, {
        title: editForm.title,
        credits: editForm.credits,
        syllabus: syllabusContent
      });

      // Reset form and close dialog
      setEditForm({ title: "", credits: 3, syllabus: "" });
      setEditSyllabusFile(null);
      setSelectedCourse(null);
      setIsEditDialogOpen(false);
      
      // Refresh courses list
      getLecturerCourses();
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const handleEditCourse = async (course: Course) => {
    try {
      // Fetch the full course details
      const fullCourse = await getCourseById(course.id);
      setSelectedCourse(fullCourse);
      setEditForm({
        title: fullCourse.title,
        credits: fullCourse.credits,
        syllabus: fullCourse.syllabus
      });
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching course details:", error);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (isEdit) {
        setEditSyllabusFile(file);
      } else {
        setSyllabusFile(file);
      }
    }
  };

  const downloadSyllabus = (course: Course) => {
    const blob = new Blob([course.syllabus], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title}_syllabus.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute allowedRoles={["LECTURER"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground">Manage and update your courses</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the course details below. You can type the syllabus directly or upload a text file.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="create-title" className="text-right">
                      Title
                    </Label>
                    <Input
                      id="create-title"
                      value={createForm.title}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                      className="col-span-3"
                      required
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="create-credits" className="text-right">
                      Credits
                    </Label>
                    <Input
                      id="create-credits"
                      type="number"
                      min="1"
                      max="6"
                      value={createForm.credits}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="create-syllabus" className="text-right pt-2">
                      Syllabus
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Textarea
                        id="create-syllabus"
                        value={createForm.syllabus}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, syllabus: e.target.value }))}
                        rows={6}
                        placeholder="Enter course syllabus content..."
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Or upload file:</span>
                        <Input
                          type="file"
                          onChange={(e) => handleFileUpload(e, false)}
                          accept=".txt,.md,.doc,.docx"
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
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Course</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between pt-4">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <p>Error loading courses: {error}</p>
                <Button 
                  onClick={() => getLecturerCourses()} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No courses found</p>
                <p className="text-sm">
                  {searchQuery ? "Try adjusting your search terms." : "Create your first course to get started."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {course.credits} Credits
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadSyllabus(course)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Syllabus
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          Delete Course
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {course.syllabus ? course.syllabus.substring(0, 150) + "..." : "No syllabus available"}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        {course._count?.enrollments || 0} Students
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm" onClick={() => handleEditCourse(course)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Course Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the course details below. Changes will be saved immediately.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-credits" className="text-right">
                    Credits
                  </Label>
                  <Input
                    id="edit-credits"
                    type="number"
                    min="1"
                    max="6"
                    value={editForm.credits}
                    onChange={(e) => setEditForm(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="edit-syllabus" className="text-right pt-2">
                    Syllabus
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Textarea
                      id="edit-syllabus"
                      value={editForm.syllabus}
                      onChange={(e) => setEditForm(prev => ({ ...prev, syllabus: e.target.value }))}
                      rows={6}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Or upload new file:</span>
                      <Input
                        type="file"
                        onChange={(e) => handleFileUpload(e, true)}
                        accept=".txt,.md,.doc,.docx"
                        className="w-auto"
                      />
                    </div>
                    {editSyllabusFile && (
                      <p className="text-sm text-muted-foreground">
                        New file selected: {editSyllabusFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setSelectedCourse(null);
                    setEditSyllabusFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}