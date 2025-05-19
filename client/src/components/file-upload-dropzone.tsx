"use client"

import { useCallback, useState } from "react"
import { useDropzone, FileRejection } from "react-dropzone"
import { Upload, File, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { z } from "zod"
import { fileUploadSchema } from "@/lib/validations/auth"

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
  const [fileError, setFileError] = useState<string | null>(null)

  const validateFile = (file: File) => {
    try {
      fileUploadSchema.parse({ file })
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFileError(error.errors[0].message)
      }
      return false
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        setFileError("Only PDF files are accepted")
        return
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (validateFile(file)) {
          setFileError(null)
          onFileSelect(file)
        }
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading || !!selectedFile,
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleClearFile = () => {
    setFileError(null)
    if (onClearFile) onClearFile()
  }

  return (
    <div className="w-full mx-auto space-y-4">
      {!selectedFile ? (
        <>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive && !isDragReject
                ? "border-primary bg-primary/10"
                : isDragReject
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300 hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className={`h-10 w-10 ${isDragReject ? "text-red-500" : "text-gray-400"}`} />
              <p className="text-lg font-medium">
                {isDragActive && !isDragReject
                  ? "Drop the PDF file here"
                  : isDragReject
                    ? "This file type is not supported"
                    : "Drag & drop a PDF file here, or click to select"}
              </p>
              <p className="text-sm text-gray-500">Only PDF files up to 10MB are accepted</p>
              <Button type="button" className="mt-2">
                Select PDF
              </Button>
            </div>
          </div>
          {fileError && (
            <div className="flex items-center gap-2 text-red-500 text-sm p-2 bg-red-50 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>{fileError}</span>
            </div>
          )}
        </>
      ) : (
        <div className="border rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <File className="h-6 w-6 text-primary" />
              <div>
                <p className="font-medium truncate max-w-[200px] sm:max-w-xs">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isUploading && onClearFile && (
              <Button variant="ghost" size="icon" onClick={handleClearFile} className="h-8 w-8">
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