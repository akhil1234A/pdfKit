"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { FileText, Upload, LogOut, User, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="border-b sticky top-0 bg-background z-10">
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
            <div className="bg-primary/10 p-1 rounded-full">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm hidden sm:inline-block">{user.email}</span>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex flex-col gap-4 mt-8">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 p-2 rounded-md ${isActive("/dashboard") ? "bg-primary/10 text-primary" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  className={`flex items-center gap-2 p-2 rounded-md ${isActive("/upload") ? "bg-primary/10 text-primary" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Upload className="h-5 w-5" />
                  Upload PDF
                </Link>
                <Link
                  href="/my-files"
                  className={`flex items-center gap-2 p-2 rounded-md ${isActive("/my-files") ? "bg-primary/10 text-primary" : ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  My Files
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="md:hidden border-t">
  <nav className="flex justify-around px-2 py-2 bg-background">
    {[
      { href: "/dashboard", icon: <FileText className="h-5 w-5" />, label: "Dashboard" },
      { href: "/upload", icon: <Upload className="h-5 w-5" />, label: "Upload" },
      { href: "/my-files", icon: <FileText className="h-5 w-5" />, label: "My Files" },
    ].map(({ href, icon, label }) => (
      <Link
        key={href}
        href={href}
        className={`flex flex-col items-center justify-center p-2 w-full text-xs ${
          isActive(href)
            ? "border-l-4 border-primary bg-muted text-primary"
            : "text-muted-foreground hover:bg-muted"
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    ))}
  </nav>
</div>

    </div>
  )
}
