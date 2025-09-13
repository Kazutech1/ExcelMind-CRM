// Mock authentication system for UI demonstration
export type UserRole = "ADMIN" | "LECTURER" | "STUDENT"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

// Mock user data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@university.edu",
    name: "John Admin",
    role: "ADMIN",
    avatar: "/admin-avatar.png",
  },
  {
    id: "2",
    email: "lecturer@university.edu",
    name: "Dr. Sarah Johnson",
    role: "LECTURER",
    avatar: "/lecturer-avatar.jpg",
  },
  {
    id: "3",
    email: "student@university.edu",
    name: "Mike Student",
    role: "STUDENT",
    avatar: "/student-avatar.png",
  },
]

export class AuthService {
  private static currentUser: User | null = null

  static async login(email: string, password: string): Promise<User | null> {
    // Mock authentication - in real app, this would validate against backend
    const user = mockUsers.find((u) => u.email === email)
    if (user && password === "password") {
      this.currentUser = user
      localStorage.setItem("currentUser", JSON.stringify(user))
      return user
    }
    return null
  }

  static logout(): void {
    this.currentUser = null
    localStorage.removeItem("currentUser")
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser")
      if (stored) {
        this.currentUser = JSON.parse(stored)
        return this.currentUser
      }
    }
    return null
  }

  static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser()
    return user?.role === role
  }

  static hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser()
    return user ? roles.includes(user.role) : false
  }
}
