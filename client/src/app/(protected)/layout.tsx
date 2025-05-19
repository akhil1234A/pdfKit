"use client"

import type React from "react"
import { useAuth } from "@/context/auth-context"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null 
  }

  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto">
      <Navbar />
      <main className="flex-1 container py-8">{children}</main>
    </div>
  )
}