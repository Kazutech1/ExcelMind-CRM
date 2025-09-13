"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import type { AssignmentSubmission, Assignment } from "@/lib/types"
import { Award, FileText, Download } from "lucide-react"

interface GradeSubmissionDialogProps {
  submission: AssignmentSubmission
  assignment: Assignment
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function GradeSubmissionDialog({
  submission,
  assignment,
  trigger,
  open,
  onOpenChange,
}: GradeSubmissionDialogProps) {
  const [grade, setGrade] = useState(submission.grade || 0)
  const [feedback, setFeedback] = useState(submission.feedback || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGradeChange = (value: number[]) => {
    setGrade(value[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (grade < 0 || grade > assignment.maxPoints) {
      toast({
        title: "Invalid grade",
        description: `Grade must be between 0 and ${assignment.maxPoints}`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Mock grading submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Grade submitted successfully",
        description: `${submission.student.name} received ${grade}/${assignment.maxPoints} points.`,
      })

      onOpenChange?.(false)
    } catch (error) {
      toast({
        title: "Failed to submit grade",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getGradePercentage = () => {
    return Math.round((grade / assignment.maxPoints) * 100)
  }

  const getGradeColor = () => {
    const percentage = getGradePercentage()
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
          <DialogDescription>
            Review and grade {submission.student.name}'s submission for "{assignment.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-foreground">{submission.student.name}</h4>
              <span className="text-sm text-muted-foreground">
                Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{submission.student.email}</p>
          </div>

          {/* Assignment Info */}
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-foreground mb-2">{assignment.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span>Type: {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}</span>
              <span>Max Points: {assignment.maxPoints}</span>
            </div>
          </div>

          {/* Submission Content */}
          <div className="space-y-4">
            {submission.content && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Written Response</Label>
                <div className="p-3 bg-muted rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{submission.content}</p>
                </div>
              </div>
            )}

            {submission.attachments && submission.attachments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Attachments</Label>
                <div className="space-y-2">
                  {submission.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{attachment.filename}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grading Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="grade">Grade</Label>
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-bold ${getGradeColor()}`}>
                      {grade}/{assignment.maxPoints}
                    </span>
                    <span className="text-sm text-muted-foreground">({getGradePercentage()}%)</span>
                  </div>
                </div>
                <Slider
                  value={[grade]}
                  onValueChange={handleGradeChange}
                  max={assignment.maxPoints}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0</span>
                  <span>{assignment.maxPoints}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade-input">Or enter grade directly</Label>
                <Input
                  id="grade-input"
                  type="number"
                  min="0"
                  max={assignment.maxPoints}
                  value={grade}
                  onChange={(e) => setGrade(Number(e.target.value))}
                  className="w-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to help the student improve..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Award className="h-4 w-4 mr-2" />
                {isLoading ? "Submitting..." : "Submit Grade"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
