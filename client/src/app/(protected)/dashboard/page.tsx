"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserPdfs, getSignedUrl } from "@/lib/api/pdf"
import { PdfCard } from "@/components/pdf-card"
import { Upload, FileText, Loader2 } from "lucide-react"
import type { PdfFile } from "@/lib/api/pdf"
import { toast } from "sonner"

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
        toast.error("Failed to load your PDFs. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdfs()
  }, [])

  const handleDownload = async (id: string) => {
    try {
      toast.loading("Preparing download...")
      const url = await getSignedUrl(id)

      const pdf = pdfs.find((p) => p.id === id)
      const fileName = pdf ? pdf.fileName : `document-${id}.pdf`

      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Download started")
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to download the PDF. Please try again.")
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total PDFs</CardTitle>
            <CardDescription>Your uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "-" : pdfs.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Recent PDFs</h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : pdfs.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pdfs.slice(0, 6).map((pdf) => (
              <PdfCard key={pdf.id} pdf={pdf} onDownload={handleDownload} />
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No PDFs found</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                You haven&apos;t uploaded any PDFs yet. Upload your first PDF to get started with extracting and
                managing your documents.
              </p>
              <Button asChild size="lg">
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {pdfs.length > 6 && (
          <div className="flex justify-center mt-6">
            <Button asChild variant="outline" size="lg">
              <Link href="/my-files">View All PDFs</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}