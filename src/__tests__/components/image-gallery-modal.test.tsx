import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageGalleryModal } from '@/components/image-gallery-modal'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img alt="" {...props} />
  },
}))

// No carousel mocking needed anymore

// Mock dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>{children}</div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 data-testid="dialog-title" className={className}>{children}</h2>
  ),
  DialogDescription: ({ children, className }: any) => (
    <p data-testid="dialog-description" className={className}>{children}</p>
  ),
}))

// Mock button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, disabled }: any) => (
    <button onClick={onClick} className={className} disabled={disabled}>{children}</button>
  ),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <span>Close</span>,
  ChevronLeft: () => <span>Left</span>,
  ChevronRight: () => <span>Right</span>,
}))

describe('ImageGalleryModal', () => {
  const mockImages = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ]

  const defaultProps = {
    images: mockImages,
    isOpen: true,
    onClose: jest.fn(),
    apartmentTitle: 'Test Apartment',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock scrollIntoView which is not available in jsdom
    Element.prototype.scrollIntoView = jest.fn()
  })

  it('renders modal when open', () => {
    render(<ImageGalleryModal {...defaultProps} />)
    
    expect(screen.getByAltText('Test Apartment - Image 1')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<ImageGalleryModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByAltText('Test Apartment - Image 1')).not.toBeInTheDocument()
  })

  it('displays image counter', () => {
    render(<ImageGalleryModal {...defaultProps} />)
    
    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    
    render(<ImageGalleryModal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    await user.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders current image', () => {
    render(<ImageGalleryModal {...defaultProps} />)
    
    // Should show the first image by default
    expect(screen.getByAltText('Test Apartment - Image 1')).toBeInTheDocument()
  })

  it('renders thumbnail strip for multiple images', () => {
    render(<ImageGalleryModal {...defaultProps} />)
    
    const thumbnails = screen.getAllByAltText(/Thumbnail \d+/)
    expect(thumbnails).toHaveLength(3)
  })

  it('does not render navigation arrows for single image', () => {
    const singleImageProps = {
      ...defaultProps,
      images: ['https://example.com/single.jpg'],
    }
    
    render(<ImageGalleryModal {...singleImageProps} />)
    
    expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument()
  })

  it('does not render thumbnail strip for single image', () => {
    const singleImageProps = {
      ...defaultProps,
      images: ['https://example.com/single.jpg'],
    }
    
    render(<ImageGalleryModal {...singleImageProps} />)
    
    expect(screen.queryByAltText(/Thumbnail/)).not.toBeInTheDocument()
  })

  it('returns null when no images provided', () => {
    const { container } = render(
      <ImageGalleryModal {...defaultProps} images={[]} />
    )
    
    expect(container.firstChild).toBeNull()
  })

  it('starts at initial index when provided', () => {
    render(<ImageGalleryModal {...defaultProps} initialIndex={1} />)
    
    // The modal should be open and showing images
    expect(screen.getByAltText('Test Apartment - Image 2')).toBeInTheDocument()
  })

  it('applies correct styling classes', () => {
    render(<ImageGalleryModal {...defaultProps} />)
    
    const mainImage = screen.getByAltText('Test Apartment - Image 1')
    expect(mainImage).toHaveClass('object-contain')
  })
})
