"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploadDropzone } from "@/components/file-upload-dropzone"
import { uploadPdf } from "@/lib/api/pdf"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
  }

  const handleClearFile = () => {
    setSelectedFile(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      await uploadPdf(selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      toast.success("Your PDF has been uploaded successfully")

      router.push("/my-files")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("There was an error uploading your PDF. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 space-y-8 pb-8">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild className="h-8 w-8">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Upload PDF</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Upload a PDF file</CardTitle>
          <CardDescription>Upload a PDF file to extract pages or view its contents</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadDropzone
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClearFile={handleClearFile}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
          />
        </CardContent>
        <CardFooter className="flex justify-center sm:justify-end">
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading} size="lg" className="w-full sm:w-auto">
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload PDF"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}