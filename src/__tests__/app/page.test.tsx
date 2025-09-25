import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '@/app/page'
import { getAvailableApartments } from '@/lib/supabase/apartments'
import { Apartment, SearchFilters } from '@/lib/types'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, params?: any) => {
    const translations: Record<string, string> = {
      'brand': 'Mendoza Apartments',
      'tagline': 'Beautiful stays in Argentina',
      'adminDashboard': 'Admin Dashboard',
      'heroTitle': 'Find Your Perfect Stay in Mendoza',
      'heroSubtitle': 'Discover amazing apartments with mountain views',
      'results.found': `Found ${params?.count} apartments`,
      'results.none': 'No apartments found',
      'results.forDates': `From ${params?.from} to ${params?.to}`,
      'results.guests': `${params?.count} guests`,
      'results.allTitle': 'All Available Apartments',
      'results.allSubtitle': 'Discover our collection',
      'results.adjust': 'Try adjusting your search criteria',
      'results.viewAll': 'View All Apartments',
      'footer.copyright': '© 2024 Mendoza Apartments',
      'footer.contact': 'Contact us for more information'
    }
    return translations[key] || key
  })
}))

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: { children: React.ReactNode, href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockLink.displayName = 'Link'
  return MockLink
})

// Mock components
jest.mock('@/components/search-form', () => ({
  SearchForm: ({ onSearch, isLoading }: { onSearch: (filters: SearchFilters) => void, isLoading: boolean }) => (
    <div data-testid="search-form">
      <button
        onClick={() => onSearch({ checkIn: new Date('2024-01-01'), checkOut: new Date('2024-01-02'), guests: 2 })}
        disabled={isLoading}
        data-testid="search-button"
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  )
}))

jest.mock('@/components/apartment-card', () => ({
  ApartmentCard: ({ apartment }: { apartment: Apartment }) => (
    <div data-testid={`apartment-card-${apartment.id}`}>
      <h3>{apartment.title}</h3>
      <p>${apartment.price_per_night}</p>
    </div>
  )
}))

jest.mock('@/components/theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher</div>
}))

jest.mock('@/components/language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher">Language Switcher</div>
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  )
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />
}))

// Mock apartments service
jest.mock('@/lib/supabase/apartments')
const mockGetAvailableApartments = getAvailableApartments as jest.MockedFunction<typeof getAvailableApartments>

const mockApartments: Apartment[] = [
  {
    id: '1',
    title: 'Luxury Downtown Apartment',
    description: 'Beautiful apartment in the city center',
    address: '123 Main St, Mendoza',
    price_per_night: 150,
    max_guests: 4,
    is_active: true,
    images: ['https://example.com/image1.jpg'],
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
  },
  {
    id: '2',
    title: 'Mountain View Studio',
    description: 'Cozy studio with amazing mountain views',
    address: '456 Hill Ave, Mendoza',
    price_per_night: 100,
    max_guests: 2,
    is_active: true,
    images: [],
    contact_email: 'test2@example.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    characteristics: {
      bedrooms: 1,
      bathrooms: 1,
      wifi: true,
      parking: false,
      pool: false,
      air_conditioning: false,
      kitchen: true
    }
  }
]

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders homepage with header and hero section', () => {
    mockGetAvailableApartments.mockResolvedValue([])
    render(<HomePage />)

    expect(screen.getByText('Mendoza Apartments')).toBeInTheDocument()
    expect(screen.getByText('Beautiful stays in Argentina')).toBeInTheDocument()
    expect(screen.getByText('Find Your Perfect Stay in Mendoza')).toBeInTheDocument()
    expect(screen.getByText('Discover amazing apartments with mountain views')).toBeInTheDocument()
  })

  it('renders header components', () => {
    mockGetAvailableApartments.mockResolvedValue([])
    render(<HomePage />)

    expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
    expect(screen.getByTestId('mappin-icon')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Admin Dashboard/i })).toHaveAttribute('href', '/admin')
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument()
  })

  it('renders search form', () => {
    mockGetAvailableApartments.mockResolvedValue([])
    render(<HomePage />)

    expect(screen.getByTestId('search-form')).toBeInTheDocument()
  })

  it('loads initial apartments on mount', async () => {
    mockGetAvailableApartments.mockResolvedValue(mockApartments)

    render(<HomePage />)

    await waitFor(() => {
      expect(mockGetAvailableApartments).toHaveBeenCalledWith({
        checkIn: undefined,
        checkOut: undefined,
        guests: 1
      })
    })

    expect(screen.getByTestId('apartment-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('apartment-card-2')).toBeInTheDocument()
  })

  it('shows all apartments title when no search has been performed', async () => {
    mockGetAvailableApartments.mockResolvedValue(mockApartments)

    render(<HomePage />)

    await waitFor(() => {
      expect(screen.getByText('All Available Apartments')).toBeInTheDocument()
      expect(screen.getByText('Discover our collection')).toBeInTheDocument()
    })
  })

  it('handles search functionality', async () => {
    const user = userEvent.setup()
    mockGetAvailableApartments.mockResolvedValue(mockApartments)

    render(<HomePage />)

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('apartment-card-1')).toBeInTheDocument()
    })

    // Perform search
    await act(async () => {
      await user.click(screen.getByTestId('search-button'))
    })

    await waitFor(() => {
      expect(mockGetAvailableApartments).toHaveBeenCalledWith({
        checkIn: new Date('2024-01-01'),
        checkOut: new Date('2024-01-02'),
        guests: 2
      })
    })

    expect(screen.getByText('Found 2 apartments')).toBeInTheDocument()
  })

  it('shows loading state during search', async () => {
    const user = userEvent.setup()
    let resolveApartments: (value: Apartment[]) => void
    const apartmentsPromise = new Promise<Apartment[]>((resolve) => {
      resolveApartments = resolve
    })

    mockGetAvailableApartments.mockReturnValue(apartmentsPromise)

    render(<HomePage />)

    // Start search
    await act(async () => {
      await user.click(screen.getByTestId('search-button'))
    })

    // Check loading state
    expect(screen.getByText('Searching...')).toBeInTheDocument()
    expect(screen.getAllByTestId(/animate-pulse/i)).toBeTruthy()

    // Resolve search
    act(() => {
      resolveApartments!(mockApartments)
    })

    await waitFor(() => {
      expect(screen.getByText('Search')).toBeInTheDocument()
    })
  })

  it('handles search error', async () => {
    const user = userEvent.setup()

    // Allow initial load to succeed
    mockGetAvailableApartments.mockResolvedValueOnce(mockApartments)

    render(<HomePage />)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('apartment-card-1')).toBeInTheDocument()
    })

    // Now make search fail
    mockGetAvailableApartments.mockRejectedValueOnce(new Error('Search failed'))

    await act(async () => {
      await user.click(screen.getByTestId('search-button'))
    })

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error searching apartments:', expect.any(Error))
    })

    // Should still render the search form
    expect(screen.getByTestId('search-form')).toBeInTheDocument()
  })

  it('displays no results message when search returns empty', async () => {
    const user = userEvent.setup()

    // Allow initial load to succeed
    mockGetAvailableApartments.mockResolvedValueOnce(mockApartments)

    render(<HomePage />)

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByTestId('apartment-card-1')).toBeInTheDocument()
    })

    // Now make search return empty results
    mockGetAvailableApartments.mockResolvedValueOnce([])

    await act(async () => {
      await user.click(screen.getByTestId('search-button'))
    })

    await waitFor(() => {
      expect(screen.getByText('Found 0 apartments')).toBeInTheDocument()
    })

    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument()
    expect(screen.getByText('View All Apartments')).toBeInTheDocument()
  })

  it('handles view all apartments button click', async () => {
    const user = userEvent.setup()
    // First search returns empty, second returns apartments
    mockGetAvailableApartments
      .mockResolvedValueOnce([]) // Initial load
      .mockResolvedValueOnce([]) // Search with no results
      .mockResolvedValueOnce(mockApartments) // View all

    render(<HomePage />)

    // Wait for initial load
    await waitFor(() => {
      expect(mockGetAvailableApartments).toHaveBeenCalledTimes(1)
    })

    // Perform search that returns no results
    await act(async () => {
      await user.click(screen.getByTestId('search-button'))
    })

    await waitFor(() => {
      expect(screen.getByText('Found 0 apartments')).toBeInTheDocument()
    })

    // Click view all button
    await act(async () => {
      await user.click(screen.getByText('View All Apartments'))
    })

    await waitFor(() => {
      expect(mockGetAvailableApartments).toHaveBeenCalledWith({
        checkIn: undefined,
        checkOut: undefined,
        guests: 1
      })
      expect(screen.getByText('Found 2 apartments')).toBeInTheDocument()
    })
  })

  it('renders footer', () => {
    mockGetAvailableApartments.mockResolvedValue([])
    render(<HomePage />)

    expect(screen.getByText('© 2024 Mendoza Apartments')).toBeInTheDocument()
    expect(screen.getByText('Contact us for more information')).toBeInTheDocument()
  })

  it('handles initial load error', async () => {
    mockGetAvailableApartments.mockRejectedValue(new Error('Load failed'))

    render(<HomePage />)

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error loading apartments:', expect.any(Error))
    })

    // Should still render basic page structure
    expect(screen.getByText('Mendoza Apartments')).toBeInTheDocument()
  })
})