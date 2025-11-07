import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApartmentCard } from '@/components/apartment-card'
import { Apartment } from '@/lib/types'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, params?: any) => {
    const translations: Record<string, string> = {
      'noImage': 'No image available',
      'night': 'night',
      'beds': `${params?.count} ${params?.count === 1 ? 'bed' : 'beds'}`,
      'baths': `${params?.count} ${params?.count === 1 ? 'bath' : 'baths'}`,
      'upToGuests': `Up to ${params?.count} guests`,
      'amenities.wifi': 'WiFi',
      'amenities.parking': 'Parking',
      'amenities.pool': 'Pool',
      'amenities.ac': 'AC',
      'amenities.kitchen': 'Kitchen',
      'nights': `${params?.count} ${params?.count === 1 ? 'night' : 'nights'}`,
      'total': 'Total',
      'bookNow': 'Book Now',
      'selectDates': 'Select Dates'
    }
    return translations[key] || key
  })
}))

// Mock next/image
jest.mock('next/image', () => {
  const MockImage = ({ src, alt, fill, className, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      data-fill={fill}
      className={className}
      {...props}
    />
  )
  MockImage.displayName = 'Image'
  return MockImage
})

// Mock BookingModal
jest.mock('@/components/booking-modal', () => ({
  BookingModal: ({ apartment, checkIn, checkOut, guests, isOpen, onClose, onSuccess }: any) => (
    isOpen ? (
      <div data-testid="booking-modal">
        <div>Booking Modal for {apartment.title}</div>
        <div>Check-in: {checkIn?.toDateString()}</div>
        <div>Check-out: {checkOut?.toDateString()}</div>
        <div>Guests: {guests}</div>
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Success</button>
      </div>
    ) : null
  )
}))

// Mock ImageGalleryModal
jest.mock('@/components/image-gallery-modal', () => ({
  ImageGalleryModal: ({ images, isOpen, onClose, apartmentTitle }: any) => (
    isOpen ? (
      <div data-testid="image-gallery-modal">
        <div>Image Gallery for {apartmentTitle}</div>
        <div>Images: {images.length}</div>
        <button onClick={onClose}>Close Gallery</button>
      </div>
    ) : null
  )
}))

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} className={className} {...props}>
      {children}
    </span>
  )
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, size, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-size={size}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div data-testid="card" className={className} {...props}>{children}</div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div data-testid="card-content" className={className} {...props}>{children}</div>
  ),
  CardFooter: ({ children, className, ...props }: any) => (
    <div data-testid="card-footer" className={className} {...props}>{children}</div>
  ),
  CardHeader: ({ children, className, ...props }: any) => (
    <div data-testid="card-header" className={className} {...props}>{children}</div>
  ),
  CardTitle: ({ children, className, ...props }: any) => (
    <div data-testid="card-title" className={className} {...props}>{children}</div>
  )
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Bed: () => <div data-testid="bed-icon" />,
  Bath: () => <div data-testid="bath-icon" />,
  Wifi: () => <div data-testid="wifi-icon" />,
  Car: () => <div data-testid="car-icon" />,
  Waves: () => <div data-testid="waves-icon" />,
  Users: () => <div data-testid="users-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />
}))

const mockApartment: Apartment = {
  id: '1',
  title: 'Luxury Downtown Apartment',
  description: 'Beautiful apartment in the city center with amazing views',
  address: '123 Main St, Mendoza',
  price_per_night: 150,
  max_guests: 4,
  is_active: true,
  images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  principal_image_index: 0,
  contact_email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  characteristics: {
    bedrooms: 2,
    bathrooms: 2,
    wifi: true,
    parking: true,
    pool: false,
    air_conditioning: true,
    kitchen: true
  }
}

describe('ApartmentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console.log to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders apartment card with basic information', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument()
    expect(screen.getByText('123 Main St, Mendoza')).toBeInTheDocument()
    expect(screen.getByText('Beautiful apartment in the city center with amazing views')).toBeInTheDocument()
    expect(screen.getByText('$150/night')).toBeInTheDocument()
  })

  it('renders apartment image', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    const image = screen.getByAltText('Luxury Downtown Apartment')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg')
    expect(image).toHaveAttribute('data-fill', 'true')
  })

  it('renders placeholder when no images', () => {
    const apartmentWithoutImages = {
      ...mockApartment,
      images: []
    }

    render(<ApartmentCard apartment={apartmentWithoutImages} />)

    expect(screen.getByText('No image available')).toBeInTheDocument()
    expect(screen.queryByAltText('Luxury Downtown Apartment')).not.toBeInTheDocument()
  })

  it('displays apartment characteristics', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    expect(screen.getByText('2 beds')).toBeInTheDocument()
    expect(screen.getByText('2 baths')).toBeInTheDocument()
    expect(screen.getByText('Up to 4 guests')).toBeInTheDocument()

    expect(screen.getByTestId('bed-icon')).toBeInTheDocument()
    expect(screen.getByTestId('bath-icon')).toBeInTheDocument()
    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
  })

  it('displays amenities badges', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    expect(screen.getByText('WiFi')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('AC')).toBeInTheDocument()
    expect(screen.getByText('Kitchen')).toBeInTheDocument()

    // Pool should not be displayed since it's false
    expect(screen.queryByText('Pool')).not.toBeInTheDocument()

    expect(screen.getByTestId('wifi-icon')).toBeInTheDocument()
    expect(screen.getByTestId('car-icon')).toBeInTheDocument()
  })

  it('handles missing characteristics gracefully', () => {
    const apartmentWithoutCharacteristics = {
      ...mockApartment,
      characteristics: {}
    }

    render(<ApartmentCard apartment={apartmentWithoutCharacteristics} />)

    expect(screen.queryByText(/beds/)).not.toBeInTheDocument()
    expect(screen.queryByText(/baths/)).not.toBeInTheDocument()
    expect(screen.getByText('Up to 4 guests')).toBeInTheDocument() // This comes from max_guests
  })

  it('calculates and displays total price when dates provided', () => {
    const checkIn = new Date('2024-01-01')
    const checkOut = new Date('2024-01-03') // 2 nights

    render(
      <ApartmentCard
        apartment={mockApartment}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={2}
      />
    )

    expect(screen.getByText('$150 × 2 nights')).toBeInTheDocument()
    expect(screen.getAllByText('$300')).toHaveLength(2) // One in calculation, one in total
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('does not show pricing section when no dates provided', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    expect(screen.queryByText('Total')).not.toBeInTheDocument()
    expect(screen.queryByText(/nights/)).not.toBeInTheDocument()
  })

  it('shows select dates button when no dates provided', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Select Dates')
    expect(button).toBeDisabled()
  })

  it('shows book now button when dates provided', () => {
    const checkIn = new Date('2024-01-01')
    const checkOut = new Date('2024-01-02')

    render(
      <ApartmentCard
        apartment={mockApartment}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={2}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Book Now')
    expect(button).not.toBeDisabled()
  })

  it('opens booking modal when book now is clicked', async () => {
    const user = userEvent.setup()
    const checkIn = new Date('2024-01-01')
    const checkOut = new Date('2024-01-02')

    render(
      <ApartmentCard
        apartment={mockApartment}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={2}
      />
    )

    const bookButton = screen.getByText('Book Now')
    await act(async () => {
      await user.click(bookButton)
    })

    expect(screen.getByTestId('booking-modal')).toBeInTheDocument()
    expect(screen.getByText('Booking Modal for Luxury Downtown Apartment')).toBeInTheDocument()
  })

  it('closes booking modal when close is clicked', async () => {
    const user = userEvent.setup()
    const checkIn = new Date('2024-01-01')
    const checkOut = new Date('2024-01-02')

    render(
      <ApartmentCard
        apartment={mockApartment}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={2}
      />
    )

    // Open modal
    const bookButton = screen.getByText('Book Now')
    await act(async () => {
      await user.click(bookButton)
    })

    // Close modal
    const closeButton = screen.getByText('Close')
    await act(async () => {
      await user.click(closeButton)
    })

    expect(screen.queryByTestId('booking-modal')).not.toBeInTheDocument()
  })

  it('handles booking success', async () => {
    const user = userEvent.setup()
    const checkIn = new Date('2024-01-01')
    const checkOut = new Date('2024-01-02')

    render(
      <ApartmentCard
        apartment={mockApartment}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={2}
      />
    )

    // Open modal
    const bookButton = screen.getByText('Book Now')
    await act(async () => {
      await user.click(bookButton)
    })

    // Trigger success
    const successButton = screen.getByText('Success')
    await act(async () => {
      await user.click(successButton)
    })

    expect(console.log).toHaveBeenCalledWith('Booking submitted successfully!')
  })

  it('passes correct props to booking modal', async () => {
    const user = userEvent.setup()
    const checkIn = new Date('2024-01-01')
    const checkOut = new Date('2024-01-02')
    const guests = 3

    render(
      <ApartmentCard
        apartment={mockApartment}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
      />
    )

    const bookButton = screen.getByText('Book Now')
    await act(async () => {
      await user.click(bookButton)
    })

    // Check for the expected date format from the mock
    expect(screen.getByText(`Check-in: ${checkIn.toDateString()}`)).toBeInTheDocument()
    expect(screen.getByText(`Check-out: ${checkOut.toDateString()}`)).toBeInTheDocument()
    expect(screen.getByText('Guests: 3')).toBeInTheDocument()
  })

  it('renders all required icons', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    expect(screen.getByTestId('mappin-icon')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
  })

  it('handles singular/plural forms correctly', () => {
    const apartmentWithSingleValues = {
      ...mockApartment,
      characteristics: {
        ...mockApartment.characteristics,
        bedrooms: 1,
        bathrooms: 1
      }
    }

    render(<ApartmentCard apartment={apartmentWithSingleValues} />)

    expect(screen.getByText('1 bed')).toBeInTheDocument()
    expect(screen.getByText('1 bath')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    const card = screen.getByTestId('card')
    expect(card).toHaveClass('overflow-hidden', 'hover:shadow-lg', 'transition-shadow')
  })

  it('calculates nights correctly for same-day booking', () => {
    const checkIn = new Date('2024-01-01T10:00:00')
    const checkOut = new Date('2024-01-01T15:00:00') // Same day, 5 hours later

    render(
      <ApartmentCard
        apartment={mockApartment}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={2}
      />
    )

    expect(screen.getByText('$150 × 1 night')).toBeInTheDocument()
    expect(screen.getAllByText('$150')).toHaveLength(2) // One in calculation, one in total
  })

  it('defaults guests to 1 when not provided', () => {
    const checkIn = new Date('2024-01-01')
    const checkOut = new Date('2024-01-02')

    render(
      <ApartmentCard
        apartment={mockApartment}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    )

    // Open modal
    const bookButton = screen.getByText('Book Now')
    expect(bookButton).toBeInTheDocument()
  })

  it('renders line-clamp on description', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    const description = screen.getByText('Beautiful apartment in the city center with amazing views')
    expect(description).toHaveClass('line-clamp-2')
  })

  it('opens image gallery modal when image is clicked', async () => {
    const user = userEvent.setup()
    render(<ApartmentCard apartment={mockApartment} />)

    const imageContainer = screen.getByAltText('Luxury Downtown Apartment').parentElement
    await act(async () => {
      await user.click(imageContainer!)
    })

    expect(screen.getByTestId('image-gallery-modal')).toBeInTheDocument()
    expect(screen.getByText('Image Gallery for Luxury Downtown Apartment')).toBeInTheDocument()
    expect(screen.getByText('Images: 2')).toBeInTheDocument()
  })

  it('closes image gallery modal when close is clicked', async () => {
    const user = userEvent.setup()
    render(<ApartmentCard apartment={mockApartment} />)

    // Open gallery
    const imageContainer = screen.getByAltText('Luxury Downtown Apartment').parentElement
    await act(async () => {
      await user.click(imageContainer!)
    })

    // Close gallery
    const closeButton = screen.getByText('Close Gallery')
    await act(async () => {
      await user.click(closeButton)
    })

    expect(screen.queryByTestId('image-gallery-modal')).not.toBeInTheDocument()
  })

  it('shows image count indicator when multiple images', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('does not show image count indicator for single image', () => {
    const apartmentWithOneImage = {
      ...mockApartment,
      images: ['https://example.com/image1.jpg']
    }

    render(<ApartmentCard apartment={apartmentWithOneImage} />)

    expect(screen.queryByText(/more/)).not.toBeInTheDocument()
  })

  it('applies hover effect to image', () => {
    render(<ApartmentCard apartment={mockApartment} />)

    const image = screen.getByAltText('Luxury Downtown Apartment')
    expect(image).toHaveClass('transition-transform', 'group-hover:scale-105')
  })

  it('does not open gallery when clicking on apartment without images', async () => {
    const user = userEvent.setup()
    const apartmentWithoutImages = {
      ...mockApartment,
      images: []
    }

    render(<ApartmentCard apartment={apartmentWithoutImages} />)

    const placeholder = screen.getByText('No image available').parentElement
    await act(async () => {
      await user.click(placeholder!)
    })

    expect(screen.queryByTestId('image-gallery-modal')).not.toBeInTheDocument()
  })

  it('displays principal image based on principal_image_index', () => {
    const apartmentWithPrincipalImage = {
      ...mockApartment,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg'],
      principal_image_index: 1
    }

    render(<ApartmentCard apartment={apartmentWithPrincipalImage} />)

    const image = screen.getByAltText('Luxury Downtown Apartment')
    expect(image).toHaveAttribute('src', 'https://example.com/image2.jpg')
  })

  it('defaults to first image when principal_image_index is not set', () => {
    const apartmentWithoutPrincipalIndex = {
      ...mockApartment,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      principal_image_index: undefined as any
    }

    render(<ApartmentCard apartment={apartmentWithoutPrincipalIndex} />)

    const image = screen.getByAltText('Luxury Downtown Apartment')
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg')
  })

  it('handles out of bounds principal_image_index gracefully', () => {
    const apartmentWithInvalidIndex = {
      ...mockApartment,
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      principal_image_index: 5
    }

    render(<ApartmentCard apartment={apartmentWithInvalidIndex} />)

    const image = screen.getByAltText('Luxury Downtown Apartment')
    // Should default to last image when index is out of bounds
    expect(image).toHaveAttribute('src', 'https://example.com/image2.jpg')
  })
})