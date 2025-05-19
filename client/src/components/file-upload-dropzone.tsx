"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface FileUploadDropzoneProps {
  onFileSelect: (file: File) => void
  uploadProgress?: number
  selectedFile?: File | null
  onClearFile?: () => void
  isUploading?: boolean
}

export function FileUploadDropzone({
  onFileSelect,
  uploadProgress = 0,
  selectedFile = null,
  onClearFile,
  isUploading = false,
}: FileUploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading || !!selectedFile,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-lg font-medium">
              {isDragActive ? "Drop the PDF file here" : "Drag & drop a PDF file here, or click to select"}
            </p>
            <p className="text-sm text-gray-500">Only PDF files are accepted</p>
            <Button type="button" className="mt-2">
              Select PDF
            </Button>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <File className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isUploading && onClearFile && (
              <Button variant="ghost" size="icon" onClick={onClearFile} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isUploading && (
            <div className="space-y-1">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-gray-500 text-right">{uploadProgress}%</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
