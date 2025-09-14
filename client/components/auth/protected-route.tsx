"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService, type UserRole, type User } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = AuthService.getToken();
      
      // If no token, redirect to login
      if (!token) {
        router.push("/");
        return;
      }

      // Check if we have a user in state/localStorage
      let currentUser = AuthService.getCurrentUser();
      
      // If no user in storage but we have a token, try to fetch profile
      if (!currentUser) {
        try {
          currentUser = await AuthService.refreshUserProfile();
        } catch (error) {
          console.error("Failed to refresh user profile:", error);
          AuthService.logout();
          router.push("/");
          return;
        }
      }

      // If still no user, redirect to login
      if (!currentUser) {
        AuthService.logout();
        router.push("/");
        return;
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(currentUser.role)) {
        router.push("/unauthorized");
        return;
      }

      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userRole={user.role} />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="p-6 md:p-8 pt-16 md:pt-8">{children}</div>
      </main>
    </div>
  );
}