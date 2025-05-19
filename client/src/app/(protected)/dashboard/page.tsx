"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserPdfs } from "@/lib/api/pdf"
import { PdfCard } from "@/components/pdf-card"
import { Upload, FileText, Loader2 } from "lucide-react"
import type { PdfFile } from "@/lib/api/pdf"

export default function DashboardPage() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const data = await getUserPdfs()
        setPdfs(data)
      } catch (error) {
        console.error("Error fetching PDFs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdfs()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total PDFs</CardTitle>
            <CardDescription>Your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pdfs.length}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-8">Recent PDFs</h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : pdfs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pdfs.slice(0, 6).map((pdf) => (
            <PdfCard key={pdf.id} pdf={pdf} />
          ))}
        </div>
      ) : (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No PDFs found</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              You haven&apos;t uploaded any PDFs yet. Upload your first PDF to get started.
            </p>
            <Button asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload PDF
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {pdfs.length > 6 && (
        <div className="flex justify-center mt-4">
          <Button asChild variant="outline">
            <Link href="/my-files">View All PDFs</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
