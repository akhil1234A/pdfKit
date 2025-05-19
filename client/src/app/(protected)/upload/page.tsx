"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploadDropzone } from "@/components/file-upload-dropzone"
import { uploadPdf } from "@/lib/api/pdf"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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

      // Navigate to the my files page
      router.push("/my-files")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("There was an error uploading your PDF")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Upload PDF</h1>

      <Card>
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
        <CardFooter className="flex justify-end">
          <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
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
