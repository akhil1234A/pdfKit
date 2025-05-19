"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { FileText, Upload, LogOut, User } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <Link href="/dashboard" className="font-bold text-xl flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          PDF Manager
        </Link>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 hidden md:block">
          <Button asChild variant={isActive("/dashboard") ? "default" : "ghost"} className="text-sm font-medium">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant={isActive("/upload") ? "default" : "ghost"} className="text-sm font-medium">
            <Link href="/upload">Upload PDF</Link>
          </Button>
          <Button asChild variant={isActive("/my-files") ? "default" : "ghost"} className="text-sm font-medium">
            <Link href="/my-files">My Files</Link>
          </Button>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <User className="h-4 w-4" />
            <span className="text-sm hidden sm:inline-block">{user.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
      <div className="md:hidden border-t">
        <nav className="flex justify-between px-4 py-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={isActive("/dashboard") ? "border-b-2 border-primary rounded-none" : ""}
          >
            <Link href="/dashboard" className="flex flex-col items-center gap-1">
              <FileText className="h-5 w-5" />
              <span className="text-xs">Dashboard</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={isActive("/upload") ? "border-b-2 border-primary rounded-none" : ""}
          >
            <Link href="/upload" className="flex flex-col items-center gap-1">
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={isActive("/my-files") ? "border-b-2 border-primary rounded-none" : ""}
          >
            <Link href="/my-files" className="flex flex-col items-center gap-1">
              <FileText className="h-5 w-5" />
              <span className="text-xs">My Files</span>
            </Link>
          </Button>
        </nav>
      </div>
    </div>
  )
}
