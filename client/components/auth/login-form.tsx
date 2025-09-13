"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthService, type UserRole } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleQuickLogin = (role: UserRole) => {
    const roleEmails = {
      ADMIN: "admin@university.edu",
      LECTURER: "lecturer@university.edu",
      STUDENT: "student@university.edu",
    }
    setEmail(roleEmails[role])
    setPassword("password")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = await AuthService.login(email, password)
      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        })

        // Redirect based on role
        switch (user.role) {
          case "ADMIN":
            router.push("/admin")
            break
          case "LECTURER":
            router.push("/lecturer")
            break
          case "STUDENT":
            router.push("/student")
            break
        }
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">EduCRM</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Demo Login</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quick Login (Demo)</Label>
            <Select onValueChange={(value) => handleQuickLogin(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role to demo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin Dashboard</SelectItem>
                <SelectItem value="LECTURER">Lecturer Dashboard</SelectItem>
                <SelectItem value="STUDENT">Student Dashboard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Demo credentials: Use any email above with password "password"
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
