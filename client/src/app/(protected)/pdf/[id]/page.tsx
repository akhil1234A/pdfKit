"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PdfViewer } from "@/components/ui/pdf-viewer"
import { getSignedUrl, extractPages } from "@/lib/api/pdf"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PdfViewPage() {
  const params = useParams<{ id: string }>()
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExtracting, setIsExtracting] = useState(false)

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
  }, [params.id, toast])

  const handleExtract = async (selectedPages: number[]) => {
    if (selectedPages.length === 0) {
      toast.warning("Please select at least one page to extract")
      return
    }

    setIsExtracting(true)

    try {
      const result = await extractPages(params.id, selectedPages)

      // Trigger download of the extracted PDF
      const link = document.createElement("a")
      link.href = result.url
      link.download = `extracted_${new Date().getTime()}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Successfully extracted ${selectedPages.length} page${selectedPages.length !== 1 ? "s" : ""}`)
    } catch (error) {
      console.error("Extraction error:", error)
      toast.error("There was an error extracting the pages")
    } finally {
      setIsExtracting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium mb-4">Could not load PDF</h3>
          <Button asChild>
            <Link href="/my-files">Go back to My Files</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="outline" size="icon" asChild className="mr-2">
            <Link href="/my-files">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">PDF Viewer & Extractor</h1>
        </div>
        {isExtracting && (
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span>Extracting pages...</span>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <PdfViewer url={pdfUrl} onExtract={handleExtract} />
        </CardContent>
      </Card>
    </div>
  )
}
