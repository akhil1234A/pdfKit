import axiosInstance from "@/lib/axios"

export type PdfFile = {
  id: string
  fileName: string
  uploadDate: string
}

export type ExtractResponse = {
  url: string
}

export const uploadPdf = async (file: File, onProgress?: (progress: number) => void): Promise<PdfFile> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await axiosInstance.post(`/api/pdf/upload`, formData, {
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    },
  })

  return response.data
}

export const getUserPdfs = async (): Promise<PdfFile[]> => {
  const response = await axiosInstance.get(`/api/pdf/my-files`)
  return response.data
}

export const getSignedUrl = async (pdfId: string): Promise<string> => {
  const response = await axiosInstance.get(`/api/pdf/${pdfId}/view`)
  return response.data.url
}

export const extractPages = async (pdfId: string, pages: number[]): Promise<ExtractResponse> => {
  const response = await axiosInstance.post(`/api/pdf/${pdfId}/extract`, { pages })
  return response.data
}
