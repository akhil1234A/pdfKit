import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { File, Eye } from "lucide-react"
import Link from "next/link"
import type { PdfFile } from "@/lib/api/pdf"

interface PdfCardProps {
  pdf: PdfFile
}

export function PdfCard({ pdf }: PdfCardProps) {
  const formatDate = (dateString: string) => {
   if (!dateString) return "Invalid date"

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid date"
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <File className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{pdf.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(pdf.createdAt)}</span>
              <span>•</span>
              <span>{formatFileSize(pdf.size)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <Button asChild className="w-full">
          <Link href={`/pdf/${pdf.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View & Extract
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
