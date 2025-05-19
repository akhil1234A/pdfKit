"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { PdfCard } from "@/components/pdf-card"
import { getUserPdfs } from "@/lib/api/pdf"
import { Upload, FileText, Loader2, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import type { PdfFile } from "@/lib/api/pdf"

export default function MyFilesPage() {
  const [pdfs, setPdfs] = useState<PdfFile[]>([])
  const [filteredPdfs, setFilteredPdfs] = useState<PdfFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const data = await getUserPdfs()
        setPdfs(data)
        setFilteredPdfs(data)
      } catch (error) {
        console.error("Error fetching PDFs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPdfs()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPdfs(pdfs)
    } else {
      const filtered = pdfs.filter((pdf) => pdf.name.toLowerCase().includes(searchQuery.toLowerCase()))
      setFilteredPdfs(filtered)
    }
  }, [searchQuery, pdfs])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Files</h1>
        <Button asChild>
          <Link href="/upload">
            <Upload className="mr-2 h-4 w-4" />
            Upload PDF
          </Link>
        </Button>
      </div>

      {pdfs.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredPdfs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPdfs.map((pdf) => (
            <PdfCard key={pdf.id} pdf={pdf} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          {searchQuery ? (
            <>
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No matching files</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                We couldn&apos;t find any files matching your search. Try a different search term.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No PDFs found</h3>
              <p className="text-sm text-muted-foreground max-w-md mb-4">
                You haven&apos;t uploaded any PDFs yet. Upload your first PDF to get started.
              </p>
              <Button asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload PDF
                </Link>
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
