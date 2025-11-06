"use client"

import * as React from "react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageGalleryModalProps {
  images: string[]
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
  apartmentTitle: string
}

export function ImageGalleryModal({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
  apartmentTitle,
}: ImageGalleryModalProps) {
  const [current, setCurrent] = React.useState(initialIndex)
  const thumbnailRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  React.useEffect(() => {
    if (isOpen) {
      setCurrent(initialIndex)
    }
  }, [isOpen, initialIndex])

  // Scroll thumbnail into view when current changes
  React.useEffect(() => {
    const thumbnail = thumbnailRefs.current[current]
    if (thumbnail) {
      thumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }, [current])

  if (!images || images.length === 0) return null

  const goToPrevious = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-0 flex flex-col">
        <DialogTitle className="sr-only">{apartmentTitle} Gallery</DialogTitle>
        <DialogDescription className="sr-only">
          Image {current + 1} of {images.length}
        </DialogDescription>

        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50 rounded-md bg-white !text-black hover:bg-gray-100 shadow-lg"
          onClick={onClose}
        >
          <X className="h-4 w-4 text-black" />
        </Button>

        {/* Image counter */}
        <div className="absolute left-4 top-4 z-50 bg-black/70 text-white px-3 py-1.5 rounded-md text-sm font-medium">
          {current + 1} / {images.length}
        </div>

        {/* Main image area */}
        <div className="relative flex-1 bg-black overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-16">
            <div className="relative w-full h-full">
              <Image
                src={images[current]}
                alt={`${apartmentTitle} - Image ${current + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 85vw"
                priority
              />
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/90 hover:bg-white shadow-lg"
                onClick={goToNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="border-t bg-muted/50 p-4 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-2 justify-start scroll-smooth">
              {images.map((image, index) => (
                <button
                  key={index}
                  ref={(el) => {
                    thumbnailRefs.current[index] = el
                  }}
                  onClick={() => setCurrent(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
                    current === index
                      ? "border-primary ring-2 ring-primary/20 scale-105"
                      : "border-transparent hover:border-muted-foreground/20 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
