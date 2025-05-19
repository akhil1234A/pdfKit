"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PdfViewer } from "@/components/ui/pdf-viewer"
import { getSignedUrl, extractPages } from "@/lib/api/pdf"
import { ArrowLeft, Loader2, Download } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function PdfViewPage() {
  const params = useParams<{ id: string }>()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedUrl, setExtractedUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchPdfUrl = async () => {
      try {
        const url = await getSignedUrl(params.id)
        setPdfUrl(url)
      } catch (error) {
        console.error("Error fetching PDF URL:", error)
        toast.error("Could not load the PDF. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdfUrl()
  }, [params.id])

  const handleExtract = async (selectedPages: number[]) => {
    if (selectedPages.length === 0) {
      toast.error("Please select at least one page to extract")
      return
    }

    setIsExtracting(true)
    toast.loading("Extracting pages...")

    try {
      const result = await extractPages(params.id, selectedPages)
      setExtractedUrl(result.url)

      toast.success(`Successfully extracted ${selectedPages.length} page${selectedPages.length !== 1 ? "s" : ""}`)
      window.open(result.url, "_blank")
      toast.success("Opened in new tab")
     
    } catch (error) {
      console.error("Extraction error:", error)
      toast.error("There was an error extracting the pages. Please try again.")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleDownloadOriginal = async () => {
    if (!pdfUrl) return

    try {
    window.open(pdfUrl, "_blank")
    toast.success("Opened in new tab")
  } catch (error) {
    console.error("Open error:", error)
    toast.error("Failed to open the PDF. Please try again.")
  }
  }

  const handleDownloadExtracted = () => {
    if (!extractedUrl) return

    try {
    window.open(extractedUrl, "_blank") 
    toast.success("Opened extracted PDF in new tab")
  } catch (error) {
    console.error("Open error:", error)
    toast.error("Failed to open the extracted PDF.")
  }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <Card className="shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h3 className="text-lg font-medium mb-6">Could not load PDF</h3>
            <Button asChild size="lg">
              <Link href="/my-files">Go back to My Files</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild className="h-8 w-8">
            <Link href="/my-files">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">PDF Viewer & Extractor</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadOriginal} className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Download Original
          </Button>
          {extractedUrl && (
            <Button onClick={handleDownloadExtracted} className="flex-1 sm:flex-none">
              <Download className="mr-2 h-4 w-4" />
              Download Extracted
            </Button>
          )}
        </div>
      </div>

      {isExtracting && (
        <div className="flex items-center justify-center gap-2 bg-primary/10 p-3 rounded-md">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="font-medium">Extracting pages...</span>
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <PdfViewer url={pdfUrl} onExtract={handleExtract} />
        </CardContent>
      </Card>
    </div>
  )
}