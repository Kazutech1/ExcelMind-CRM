// lib/auth.ts
export type UserRole = "ADMIN" | "LECTURER" | "STUDENT";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export class AuthService {
  private static currentUser: User | null = null;
  private static baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  static async login(email: string, password: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      console.log(data);
      
      
      // Store token and user data
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }
      
      this.currentUser = data.user;
      return data.user;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  static async register(email: string, password: string, role: UserRole, name: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role, name }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      
      // Store token and user data
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }
      
      this.currentUser = data.user;
      return data.user;
    } catch (error) {
      console.error("Registration error:", error);
      return null;
    }
  }

  static logout(): void {
    this.currentUser = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    }
  }

  static getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      }
    }
    return null;
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }

  static async refreshUserProfile(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.baseURL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      this.currentUser = data.user;
      
      if (typeof window !== "undefined") {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
      }
      
      return data.user;
    } catch (error) {
      console.error("Profile refresh error:", error);
      return null;
    }
  }

  static hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  static hasAnyRole(roles: UserRole[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }
}