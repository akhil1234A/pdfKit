"use client"

import { useState, useEffect } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

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
}

const SortablePage = ({ id, pageNumber, isSelected, onToggle, file }: SortablePageProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col items-center border rounded-md p-4 mb-4 bg-white">
      <div className="flex justify-between w-full mb-2">
        <div className="flex items-center gap-2">
          <Checkbox id={`page-${pageNumber}`} checked={isSelected} onCheckedChange={onToggle} />
          <label htmlFor={`page-${pageNumber}`} className="text-sm font-medium">
            Page {pageNumber}
          </label>
        </div>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <div className="border rounded overflow-hidden">
        <Document file={file} loading={<Skeleton className="h-[300px] w-[210px]" />}>
          <Page pageNumber={pageNumber} width={210} renderTextLayer={false} renderAnnotationLayer={false} />
        </Document>
      </div>
    </div>
  )
}

export function PdfViewer({ url, onExtract }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [selectedPages, setSelectedPages] = useState<number[]>([])
  const [orderedPages, setOrderedPages] = useState<number[]>([])

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

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const togglePage = (pageNumber: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber],
    )
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setOrderedPages((items) => {
        const oldIndex = items.findIndex((item) => `page-${item}` === active.id)
        const newIndex = items.findIndex((item) => `page-${item}` === over.id)

        const newItems = [...items]
        const [removed] = newItems.splice(oldIndex, 1)
        newItems.splice(newIndex, 0, removed)

        return newItems
      })
    }
  }

  const handleExtract = () => {
    // Filter selected pages in the order they appear in orderedPages
    const orderedSelectedPages = orderedPages.filter((page) => selectedPages.includes(page))
    onExtract(orderedSelectedPages)
  }

  const selectAll = () => {
    if (numPages) {
      setSelectedPages(Array.from({ length: numPages }, (_, i) => i + 1))
    }
  }

  const deselectAll = () => {
    setSelectedPages([])
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">PDF Viewer</h2>
          {numPages && (
            <p className="text-sm text-gray-500">
              {numPages} page{numPages !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex gap-2">
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

      <Document
        file={url}
        onLoadSuccess={handleDocumentLoadSuccess}
        loading={<p>Loading PDF...</p>}
        error={<p>Error loading PDF. Please try again.</p>}
        className="hidden"
      />

      {numPages && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedPages.map((page) => `page-${page}`)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orderedPages.map((pageNumber) => (
                <SortablePage
                  key={`page-${pageNumber}`}
                  id={`page-${pageNumber}`}
                  pageNumber={pageNumber}
                  isSelected={selectedPages.includes(pageNumber)}
                  onToggle={() => togglePage(pageNumber)}
                  file={url}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
