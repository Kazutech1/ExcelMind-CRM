"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthService, type UserRole } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import {
  BookOpen,
  Users,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  UserCheck,
  ClipboardList,
  Award,
} from "lucide-react"

interface SidebarProps {
  userRole: UserRole
}

const navigationItems = {
  ADMIN: [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/courses", label: "Course Management", icon: BookOpen },
    { href: "/admin/enrollments", label: "Enrollments", icon: UserCheck },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
  LECTURER: [
    { href: "/lecturer", label: "Dashboard", icon: Home },
    { href: "/lecturer/courses", label: "My Courses", icon: BookOpen },
    { href: "/lecturer/assignments", label: "Assignments", icon: ClipboardList },
    { href: "/lecturer/grading", label: "Grading", icon: Award },
    { href: "/lecturer/profile", label: "Profile", icon: Settings },
  ],
  STUDENT: [
    { href: "/student", label: "Dashboard", icon: Home },
    { href: "/student/courses", label: "Browse Courses", icon: BookOpen },
    { href: "/student/enrolled", label: "My Courses", icon: GraduationCap },
    { href: "/student/assignments", label: "Assignments", icon: FileText },
    { href: "/student/grades", label: "Grades", icon: Award },
  ],
}

export function Sidebar({ userRole }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const user = AuthService.getCurrentUser()

  const handleLogout = () => {
    AuthService.logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const navItems = navigationItems[userRole] || []

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-0
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-sidebar-border">
            <h1 className="text-xl font-bold text-primary">EduCRM</h1>
            <p className="text-sm text-muted-foreground capitalize">{userRole.toLowerCase()} Portal</p>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    }
                  `}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
