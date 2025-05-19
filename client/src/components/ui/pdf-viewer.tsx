"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, AlertCircle, Loader2 } from "lucide-react"

// Set up the worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"



type PdfViewerProps = {
  url: string
  onExtract: (pages: number[]) => void
}

type SortablePageProps = {
  id: string
  pageNumber: number
  isSelected: boolean
  onToggle: () => void
  file: string
  renderKey: number
}

const SortablePage = ({ id, pageNumber, isSelected, onToggle, file, renderKey }: SortablePageProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const [pageError, setPageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handlePageLoadSuccess = () => {
    setIsLoading(false)
    setPageError(false)
  }

  const handlePageLoadError = () => {
    setIsLoading(false)
    setPageError(true)
  }

  return (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Suppress no-inline-styles warning for dnd-kit
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col items-center border rounded-md p-4 mb-4 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <Checkbox id={`page-${pageNumber}-${renderKey}`} checked={isSelected} onCheckedChange={onToggle} />
          <label htmlFor={`page-${pageNumber}-${renderKey}`} className="text-sm font-medium">
            Page {pageNumber}
          </label>
        </div>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <div className="border rounded overflow-hidden">
        {pageError ? (
          <div className="h-[300px] w-[210px] flex flex-col items-center justify-center bg-gray-100 p-4">
            <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-sm text-center text-gray-600">Failed to load page</p>
          </div>
        ) : (
          <>
            {isLoading && <Skeleton className="h-[300px] w-[210px]" />}
            <Document file={file} loading={null} error={null} onLoadError={() => setPageError(true)}>
              <Page
                key={`page-${pageNumber}-${renderKey}`}
                pageNumber={pageNumber}
                width={210}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={handlePageLoadSuccess}
                onLoadError={handlePageLoadError}
                loading={null}
                error={null}
              />
            </Document>
          </>
        )}
      </div>
    </div>
  )
}

export function PdfViewer({ url, onExtract }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [orderedPages, setOrderedPages] = useState<number[]>([])
  const [renderKey, setRenderKey] = useState(0)
  const [documentError, setDocumentError] = useState(false)
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false)
  // Use a regular div ref since we just need a container reference
  const documentRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    if (numPages) {
      setOrderedPages(Array.from({ length: numPages }, (_, i) => i + 1))
    }
  }, [numPages])

  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setDocumentError(false)
    setIsDocumentLoaded(true)
  }, [])

  const handleDocumentLoadError = useCallback(() => {
    setDocumentError(true)
    setIsDocumentLoaded(false)
  }, [])

  const togglePage = useCallback((pageNumber: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber],
    )
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setOrderedPages((items) => {
        const oldIndex = items.findIndex((item) => `page-${item}` === active.id)
        const newIndex = items.findIndex((item) => `page-${item}` === over.id)

        const newItems = [...items]
        const [removed] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, removed)

        return newItems
      })

      // Force re-render of pages after reordering
      setRenderKey((prev) => prev + 1)
    }
  }, [])

  const handleExtract = useCallback(() => {
    // Filter selected pages in the order they appear in orderedPages
    const orderedSelectedPages = orderedPages.filter((page) => selectedPages.includes(page))
    onExtract(orderedSelectedPages)
  }, [orderedPages, selectedPages, onExtract])

  const selectAll = useCallback(() => {
    if (numPages) {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1))
    }
  }, [numPages])

  const deselectAll = useCallback(() => {
    setSelectedPages([])
  }, [])

  if (documentError) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 p-8 border rounded-lg bg-gray-50 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Failed to load PDF</h3>
        <p className="text-gray-600 mb-4">
          There was an error loading the PDF document. The file might be corrupted or inaccessible.
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold">PDF Viewer</h2>
            {numPages && (
              <p className="text-sm text-gray-500">
                {numPages} page{numPages !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
            <Button onClick={handleExtract} disabled={selectedPages.length === 0}>
              Extract Selected Pages
            </Button>
          </div>
        </div>

        {selectedPages.length > 0 && (
          <div className="bg-muted/30 p-3 rounded-md">
            <p className="text-sm text-center">
              <span className="font-medium">{selectedPages.length}</span> page{selectedPages.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
        )}
      </div>

      {/* Use a wrapping div with ref instead of directly on Document */}
      <div ref={documentRef}>
        <Document
          file={url}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading={
            <div className="flex justify-center py-12 max-w-7xl mx-auto px-4 sm:px-6">
              <Skeleton className="h-[400px] w-[300px]" />
            </div>
          }
          className="hidden"
        />
      </div>

      {!isDocumentLoaded && !documentError && (
        <div className="flex justify-center py-12 max-w-7xl mx-auto px-4 sm:px-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {numPages && isDocumentLoaded && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedPages.map((page) => `page-${page}`)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
              {orderedPages.map((pageNumber) => (
                <SortablePage
                  key={`page-${pageNumber}-${renderKey}`}
                  id={`page-${pageNumber}`}
                  pageNumber={pageNumber}
                  isSelected={selectedPages.includes(pageNumber)}
                  onToggle={() => togglePage(pageNumber)}
                  file={url}
                  renderKey={renderKey}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}