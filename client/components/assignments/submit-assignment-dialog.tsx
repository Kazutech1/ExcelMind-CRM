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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import type { Assignment } from "@/lib/types"
import { Upload, FileText, X } from "lucide-react"

interface SubmitAssignmentDialogProps {
  assignment: Assignment
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SubmitAssignmentDialog({ assignment, trigger, open, onOpenChange }: SubmitAssignmentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && files.length === 0) {
      toast({
        title: "Submission required",
        description: "Please provide either text content or file attachments.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Mock submission
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Assignment submitted successfully",
        description: `Your submission for "${assignment.title}" has been recorded.`,
      })

      onOpenChange?.(false)
      setContent("")
      setFiles([])
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
          <DialogDescription>
            Submit your work for "{assignment.title}". You can provide text content, file attachments, or both.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Info */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-foreground mb-2">{assignment.title}</h4>
            <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              <span>Max Points: {assignment.maxPoints}</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Written Response</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your response, explanation, or notes here..."
              rows={6}
              className="resize-none"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="files">File Attachments</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Input id="files" type="file" multiple onChange={handleFileUpload} className="hidden" />
              <Label htmlFor="files" className="cursor-pointer">
                <div className="flex flex-col items-center space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-xs text-muted-foreground">PDF, DOC, DOCX, TXT, ZIP, or code files</div>
                </div>
              </Label>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files</Label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Assignment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
