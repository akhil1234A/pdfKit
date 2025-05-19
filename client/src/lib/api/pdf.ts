import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export type PdfFile = {
  id: string
  name: string
  createdAt: string
  size: number
}

export type ExtractResponse = {
  url: string
}

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  },
})

export const uploadPdf = async (file: File, onProgress?: (progress: number) => void): Promise<PdfFile> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await axios.post(`${API_URL}/api/pdf/upload`, formData, {
    ...getAuthHeader(),
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
  const response = await axios.get(`${API_URL}/api/pdf/my-files`, getAuthHeader())
  return response.data
}

export const getSignedUrl = async (pdfId: string): Promise<string> => {
  const response = await axios.get(`${API_URL}/api/pdf/${pdfId}/view`, getAuthHeader())
  return response.data.url
}

export const extractPages = async (pdfId: string, pages: number[]): Promise<ExtractResponse> => {
  const response = await axios.post(`${API_URL}/api/pdf/${pdfId}/extract`, { pages }, getAuthHeader())
  return response.data
}
