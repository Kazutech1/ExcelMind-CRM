"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { CourseCard } from "@/components/courses/course-card"
import { CourseDetailModal } from "@/components/courses/course-detail-modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useCourses } from "@/hooks/useCourses"
import { useToast } from "@/hooks/use-toast"

export default function StudentCoursesPage() {
  const { courses, isLoading, getAllCourses, requestEnrollment } = useCourses()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [creditFilter, setCreditFilter] = useState<string>("")
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async (reset = false) => {
    try {
      const query = {
        search: searchQuery || undefined,
        credits: creditFilter ? parseInt(creditFilter) : undefined,
        page: reset ? 1 : page,
        limit: 12
      }
      
      const result = await getAllCourses(query)
      
      if (result?.pagination) {
        setHasMore(result.pagination.page < result.pagination.pages)
        if (reset) setPage(1)
      }
    } catch (error) {
      console.error('Failed to load courses:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadCourses(true)
  }

  const handleEnroll = async (courseId: string) => {
    try {
      await requestEnrollment(courseId)
      toast({
        title: "Success",
        description: "Enrollment request submitted successfully! Please wait for admin approval.",
      })
      // Refresh courses to show updated enrollment count
      loadCourses(true)
    } catch (error) {
      // Error is already handled in the hook
      console.error('Enrollment failed:', error)
    }
  }

  const handleViewDetails = (courseId: string) => {
    setSelectedCourseId(courseId)
    setIsModalOpen(true)
  }

  const handleCardClick = (courseId: string) => {
    // Same as view details for now
    handleViewDetails(courseId)
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
    loadCourses()
  }

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.syllabus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.lecturer?.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCredits = !creditFilter || course.credits === parseInt(creditFilter)
    
    return matchesSearch && matchesCredits
  }) || []

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Courses</h1>
          <p className="text-muted-foreground">Find and enroll in courses</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses, descriptions, or instructors..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={creditFilter} onValueChange={(value) => setCreditFilter(value === "all" ? "" : value)}>
              <SelectTrigger className="w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Credits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Credits</SelectItem>
                <SelectItem value="1">1 Credit</SelectItem>
                <SelectItem value="2">2 Credits</SelectItem>
                <SelectItem value="3">3 Credits</SelectItem>
                <SelectItem value="4">4 Credits</SelectItem>
                <SelectItem value="5">5 Credits</SelectItem>
                <SelectItem value="6">6 Credits</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        {!isLoading && filteredCourses && (
          <div className="text-sm text-muted-foreground">
            Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Course Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
            <p className="mt-4">Loading courses...</p>
          </div>
        ) : filteredCourses && filteredCourses.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => (
                <CourseCard 
                course={course} 
                showEnrollButton
                onEnroll={handleEnroll}
                onView={handleViewDetails}
                onClick={handleCardClick}
              />

              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Load More Courses"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="text-6xl">📚</div>
              <div>
                <h3 className="text-lg font-semibold">No courses found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || creditFilter 
                    ? "Try adjusting your search criteria" 
                    : "No courses are currently available"
                  }
                </p>
              </div>
              {(searchQuery || creditFilter) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("")
                    setCreditFilter("")
                    setPage(1)
                    loadCourses(true)
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Course Detail Modal */}
        <CourseDetailModal
          courseId={selectedCourseId}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          showEnrollButton
          onEnroll={handleEnroll}
        />
      </div>
    </ProtectedRoute>
  )
}