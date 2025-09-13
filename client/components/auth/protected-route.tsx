"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AuthService, type UserRole } from "@/lib/auth"
import { Sidebar } from "@/components/layout/sidebar"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(AuthService.getCurrentUser())
  const router = useRouter()

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser()

    if (!currentUser) {
      router.push("/")
      return
    }

    if (!allowedRoles.includes(currentUser.role)) {
      router.push("/unauthorized")
      return
    }

    setUser(currentUser)
    setIsLoading(false)
  }, [router, allowedRoles])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 pt-16 md:pt-8">{children}</div>
      </main>
    </div>
  )
}
