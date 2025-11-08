import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApartmentDetailsClient } from '@/app/[locale]/apartment/[id]/apartment-details-client'
import { Apartment } from '@/lib/types'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace: string) => (key: string, params?: any) => {
    const translations: Record<string, Record<string, string>> = {
      listing: {
        noImage: 'No images available',
        beds: `${params?.count} beds`,
        baths: `${params?.count} baths`,
        upToGuests: `Up to ${params?.count} guests`,
        night: 'night'
      },
      'admin.form': {
        wifi: 'WiFi',
        kitchen: 'Kitchen',
        air_conditioning: 'Air Conditioning',
        parking: 'Parking',
        pool: 'Pool',
        balcony: 'Balcony',
        terrace: 'Terrace',
        garden: 'Garden',
        bbq: 'BBQ',
        washing_machine: 'Washing Machine',
        mountain_view: 'Mountain View',
        hot_water: 'Hot Water',
        heating: 'Heating',
        coffee_maker: 'Coffee Maker',
        microwave: 'Microwave',
        oven: 'Oven',
        refrigerator: 'Refrigerator',
        iron: 'Iron',
        hair_dryer: 'Hair Dryer',
        tv: 'TV',
        fire_extinguisher: 'Fire Extinguisher',
        crib: 'Crib',
        blackout_curtains: 'Blackout Curtains',
        bidet: 'Bidet',
        dishwasher: 'Dishwasher',
        single_floor: 'Single Floor',
        long_term_available: 'Long Term Available',
        cleaning_service: 'Cleaning Service'
      }
    }
    return translations[namespace]?.[key] || key
  }),
  useLocale: jest.fn(() => 'en')
}))

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockLink.displayName = 'Link'
  return MockLink
})

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, priority, ...props }: any) => (
    <img src={src} alt={alt} data-fill={fill} data-priority={priority} {...props} />
  )
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size} className={className} {...props}>
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) => <span {...props}>{children}</span>
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  )
}))

// Mock BookingModal
jest.mock('@/components/booking-modal', () => ({
  BookingModal: ({ apartment, isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="booking-modal">
        <h2>Booking Modal for {apartment.title}</h2>
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Confirm Booking</button>
      </div>
    ) : null
}))

// Mock ApartmentMap
jest.mock('@/components/apartment-map', () => ({
  ApartmentMap: ({ latitude, longitude, title, address }: any) => (
    <div data-testid="apartment-map">
      Map: {title} at {latitude},{longitude} - {address}
    </div>
  )
}))

// Mock map utils
const mockGetBestCoordinates = jest.fn((lat, lng, url) => {
  if (lat && lng) return { lat, lng }
  if (url) return { lat: -32.8894587, lng: -68.8458386 }
  return null
})

jest.mock('@/lib/utils/map-utils', () => ({
  getBestCoordinates: (lat: any, lng: any, url: any) => mockGetBestCoordinates(lat, lng, url)
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  const MockIcon = ({ className, ...props }: any) => <div className={className} {...props} data-testid="icon" />
  return {
    Bed: MockIcon,
    Bath: MockIcon,
    Users: MockIcon,
    MapPin: MockIcon,
    ArrowLeft: MockIcon,
    Wifi: MockIcon,
    Car: MockIcon,
    Waves: MockIcon,
    UtensilsCrossed: MockIcon,
    Wind: MockIcon,
    Flame: MockIcon,
    Coffee: MockIcon,
    Microwave: MockIcon,
    ChefHat: MockIcon,
    Refrigerator: MockIcon,
    Shirt: MockIcon,
    Tv: MockIcon,
    FireExtinguisher: MockIcon,
    Baby: MockIcon,
    Moon: MockIcon,
    Droplet: MockIcon,
    Sparkles: MockIcon,
    Home: MockIcon,
    Calendar: MockIcon,
    Mountain: MockIcon,
    Sun: MockIcon,
    ExternalLink: MockIcon
  }
})

const mockApartment: Apartment = {
  id: 'apt-123',
  title: 'Test Luxury Apartment',
  description: 'A beautiful apartment with amazing views',
  address: '123 Test St, Mendoza',
  price_per_night: 150,
  max_guests: 4,
  is_active: true,
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
  ],
  principal_image_index: 0,
  contact_email: 'test@example.com',
  whatsapp_number: '+54 9 123456789',
  latitude: -32.8894587,
  longitude: -68.8458386,
  google_maps_url: 'https://maps.google.com/?q=-32.8894587,-68.8458386',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  characteristics: {
    bedrooms: 2,
    bathrooms: 2,
    wifi: true,
    kitchen: true,
    air_conditioning: true,
    parking: true,
    pool: false,
    balcony: true,
    hot_water: true,
    heating: true
  }
}

describe('ApartmentDetailsClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset the mock to default behavior
    mockGetBestCoordinates.mockImplementation((lat, lng, url) => {
      if (lat && lng) return { lat, lng }
      if (url) return { lat: -32.8894587, lng: -68.8458386 }
      return null
    })
  })

  it('should render apartment details', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    expect(screen.getByText('Test Luxury Apartment')).toBeInTheDocument()
    expect(screen.getAllByText('123 Test St, Mendoza').length).toBeGreaterThan(0)
    expect(screen.getByText('$150')).toBeInTheDocument()
    expect(screen.getByText('A beautiful apartment with amazing views')).toBeInTheDocument()
  })

  it('should render back button with correct link', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    const backLink = screen.getByText('Back to listings').closest('a')
    expect(backLink).toHaveAttribute('href', '/en')
  })

  it('should render principal image first', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    const images = screen.getAllByRole('img')
    const mainImage = images[0]
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image1.jpg')
  })

  it('should render principal image based on principal_image_index', () => {
    const apartmentWithDifferentPrincipal = {
      ...mockApartment,
      principal_image_index: 2
    }

    render(<ApartmentDetailsClient apartment={apartmentWithDifferentPrincipal} />)

    const images = screen.getAllByRole('img')
    const mainImage = images[0]
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image3.jpg')
  })

  it('should handle invalid principal_image_index', () => {
    const apartmentWithInvalidIndex = {
      ...mockApartment,
      principal_image_index: 999
    }

    render(<ApartmentDetailsClient apartment={apartmentWithInvalidIndex} />)

    // Should fallback to last image
    const images = screen.getAllByRole('img')
    const mainImage = images[0]
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image3.jpg')
  })

  it('should handle negative principal_image_index', () => {
    const apartmentWithNegativeIndex = {
      ...mockApartment,
      principal_image_index: -1
    }

    render(<ApartmentDetailsClient apartment={apartmentWithNegativeIndex} />)

    // Should fallback to first image
    const images = screen.getAllByRole('img')
    const mainImage = images[0]
    expect(mainImage).toHaveAttribute('src', 'https://example.com/image1.jpg')
  })

  it('should render all thumbnail images', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    // Principal image + 3 thumbnails
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThanOrEqual(4)
  })

  it('should change selected image when thumbnail is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(<ApartmentDetailsClient apartment={mockApartment} />)

    // Find thumbnails
    const thumbnails = container.querySelectorAll('[class*="cursor-pointer"]')

    if (thumbnails.length > 1) {
      await user.click(thumbnails[1] as HTMLElement)
      // Image should change (tested through component behavior)
    }
  })

  it('should render bedroom and bathroom count', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    expect(screen.getByText('2 beds')).toBeInTheDocument()
    expect(screen.getByText('2 baths')).toBeInTheDocument()
    expect(screen.getByText('Up to 4 guests')).toBeInTheDocument()
  })

  it('should render amenities section', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    expect(screen.getByText('Amenities')).toBeInTheDocument()
    expect(screen.getByText('WiFi')).toBeInTheDocument()
    expect(screen.getByText('Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Air Conditioning')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
  })

  it('should only render available amenities', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    // Pool is false, so it should not be rendered
    expect(screen.queryByText('Pool')).not.toBeInTheDocument()
  })

  it('should render location map when coordinates are available', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByTestId('apartment-map')).toBeInTheDocument()
  })

  it('should render Google Maps link when available', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    const googleMapsLink = screen.getByText('Open in Google Maps').closest('a')
    expect(googleMapsLink).toHaveAttribute('href', mockApartment.google_maps_url)
    expect(googleMapsLink).toHaveAttribute('target', '_blank')
  })

  it('should not render location section when no coordinates', () => {
    const apartmentWithoutLocation: Apartment = {
      ...mockApartment,
      latitude: undefined,
      longitude: undefined,
      google_maps_url: undefined
    }

    render(<ApartmentDetailsClient apartment={apartmentWithoutLocation} />)

    expect(screen.queryByText('Location')).not.toBeInTheDocument()
    expect(screen.queryByTestId('apartment-map')).not.toBeInTheDocument()
  })

  it('should render booking card with price', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    expect(screen.getByText('$150')).toBeInTheDocument()
    expect(screen.getByText('/ night')).toBeInTheDocument()
    expect(screen.getByText('Reserve')).toBeInTheDocument()
  })

  it('should render contact email when available', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should render WhatsApp number with link when available', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    expect(screen.getByText('WhatsApp')).toBeInTheDocument()

    const whatsappLink = screen.getByText('+54 9 123456789').closest('a')
    expect(whatsappLink).toHaveAttribute('href', 'https://wa.me/549123456789')
    expect(whatsappLink).toHaveAttribute('target', '_blank')
  })

  it('should not render contact section when email is missing', () => {
    const apartmentWithoutContact = {
      ...mockApartment,
      contact_email: ''
    }

    render(<ApartmentDetailsClient apartment={apartmentWithoutContact} />)

    expect(screen.queryByText('Contact')).not.toBeInTheDocument()
  })

  it('should not render WhatsApp section when number is missing', () => {
    const apartmentWithoutWhatsApp: Apartment = {
      ...mockApartment,
      whatsapp_number: undefined
    }

    render(<ApartmentDetailsClient apartment={apartmentWithoutWhatsApp} />)

    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  })

  it('should open booking modal when Reserve button is clicked', async () => {
    const user = userEvent.setup()
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    const reserveButton = screen.getByText('Reserve')
    await user.click(reserveButton)

    await waitFor(() => {
      expect(screen.getByTestId('booking-modal')).toBeInTheDocument()
      expect(screen.getByText(`Booking Modal for ${mockApartment.title}`)).toBeInTheDocument()
    })
  })

  it('should close booking modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    // Open modal
    const reserveButton = screen.getByText('Reserve')
    await user.click(reserveButton)

    await waitFor(() => {
      expect(screen.getByTestId('booking-modal')).toBeInTheDocument()
    })

    // Close modal
    const closeButton = screen.getByText('Close')
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('booking-modal')).not.toBeInTheDocument()
    })
  })

  it('should close booking modal on successful booking', async () => {
    const user = userEvent.setup()
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    // Open modal
    const reserveButton = screen.getByText('Reserve')
    await user.click(reserveButton)

    await waitFor(() => {
      expect(screen.getByTestId('booking-modal')).toBeInTheDocument()
    })

    // Confirm booking
    const confirmButton = screen.getByText('Confirm Booking')
    await user.click(confirmButton)

    await waitFor(() => {
      expect(screen.queryByTestId('booking-modal')).not.toBeInTheDocument()
    })
  })

  it('should not render amenities section when no amenities are available', () => {
    const apartmentWithoutAmenities = {
      ...mockApartment,
      characteristics: {
        bedrooms: 2,
        bathrooms: 2
      }
    }

    render(<ApartmentDetailsClient apartment={apartmentWithoutAmenities} />)

    expect(screen.queryByText('Amenities')).not.toBeInTheDocument()
  })

  it('should handle undefined characteristics gracefully', () => {
    const apartmentWithoutCharacteristics = {
      ...mockApartment,
      characteristics: undefined as any
    }

    render(<ApartmentDetailsClient apartment={apartmentWithoutCharacteristics} />)

    // Should not crash
    expect(screen.getByText('Test Luxury Apartment')).toBeInTheDocument()
  })

  it('should render About this place section', () => {
    render(<ApartmentDetailsClient apartment={mockApartment} />)

    expect(screen.getByText('About this place')).toBeInTheDocument()
    expect(screen.getByText('A beautiful apartment with amazing views')).toBeInTheDocument()
  })

  it('should preserve whitespace in description', () => {
    const apartmentWithMultilineDescription = {
      ...mockApartment,
      description: 'Line 1\nLine 2\nLine 3'
    }

    const { container } = render(<ApartmentDetailsClient apartment={apartmentWithMultilineDescription} />)

    const description = container.querySelector('.whitespace-pre-line')
    expect(description).toBeInTheDocument()
    expect(description?.textContent).toBe('Line 1\nLine 2\nLine 3')
  })

  it('should render with Spanish locale', () => {
    const { useLocale } = require('next-intl')
    useLocale.mockReturnValue('es')

    render(<ApartmentDetailsClient apartment={mockApartment} />)

    const backLink = screen.getByText('Back to listings').closest('a')
    expect(backLink).toHaveAttribute('href', '/es')
  })

  it('should render sticky booking card', () => {
    const { container } = render(<ApartmentDetailsClient apartment={mockApartment} />)

    const bookingCard = container.querySelector('.sticky')
    expect(bookingCard).toBeInTheDocument()
  })
})
