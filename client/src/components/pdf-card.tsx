"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { File, Eye, Download } from "lucide-react"
import Link from "next/link"
import type { PdfFile } from "@/lib/api/pdf"

interface PdfCardProps {
  pdf: PdfFile
  onDownload?: (id: string) => void
}

export function PdfCard({ pdf, onDownload }: PdfCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }


  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <File className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{pdf.fileName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(pdf.uploadDate)}</span>
              <span>•</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3 flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/pdf/${pdf.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
        {onDownload && (
          <Button onClick={() => onDownload(pdf.id)} className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
