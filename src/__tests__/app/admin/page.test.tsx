import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminDashboard from '@/app/admin/page'
import { getAllApartments } from '@/lib/supabase/apartments'
import { Apartment } from '@/lib/types'


// Mock ReservationsList component
jest.mock('@/components/admin/reservations-list', () => ({
  ReservationsList: () => <div data-testid="reservations-list">Reservations List</div>
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace: string) => (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      admin: {
        'dashboard.totalApartments': 'Total Apartments',
        'dashboard.activeListings': 'Active Listings',
        'dashboard.availableForBooking': 'Available for Booking',
        'dashboard.maxCapacity': 'Max Capacity',
        'dashboard.totalGuestsAcrossActive': 'Total guests across active listings',
        'dashboard.quickActions': 'Quick Actions',
        'dashboard.apartmentsManagement': 'Apartments Management',
        'dashboard.createEditManage': 'Create, edit and manage your apartment listings',
        'dashboard.reservationsManagement': 'Reservations Management',
        'dashboard.manageBookingRequests': 'Manage all booking requests and reservations',
        'dialogs.createTitle': 'Add New Apartment',
        'dialogs.createDescription': 'Create a new apartment listing'
      },
      common: {
        'active': 'Active',
        'inactive': 'Inactive',
        'viewPublicSite': 'View Public Site',
        'addNewApartment': 'Add New Apartment'
      },
      tabs: {
        'apartments': 'Apartments',
        'reservations': 'Reservations'
      }
    }
    return translations[namespace]?.[key] || key
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
jest.mock('@/components/admin/apartment-form', () => ({
  ApartmentForm: ({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) => (
    <div data-testid="apartment-form">
      <button onClick={onSuccess} data-testid="form-success">Save</button>
      <button onClick={onCancel} data-testid="form-cancel">Cancel</button>
    </div>
  )
}))

jest.mock('@/components/admin/apartment-list', () => ({
  ApartmentList: ({ apartments, isLoading, onApartmentUpdated, onApartmentDeleted }: any) => (
    <div data-testid="apartment-list">
      {isLoading ? (
        <div data-testid="loading">Loading apartments...</div>
      ) : (
        <div>
          {apartments.map((apt: Apartment) => (
            <div key={apt.id} data-testid={`apartment-${apt.id}`}>
              <span>{apt.title}</span>
              <button onClick={onApartmentUpdated} data-testid={`update-${apt.id}`}>Update</button>
              <button onClick={onApartmentDeleted} data-testid={`delete-${apt.id}`}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}))

// Mock Tabs components
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, className }: any) => (
    <div data-testid="tabs" className={className} data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, className }: any) => (
    <button data-testid={`tabs-trigger-${value}`} className={className} data-value={value}>
      {children}
    </button>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-testid={`tabs-content-${value}`} className={className} data-value={value}>
      {children}
    </div>
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

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div data-testid="card-header" {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <div data-testid="card-title" {...props}>{children}</div>
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} {...props}>{children}</span>
  )
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: any) => (
    <div data-testid="dialog" data-open={open}>
      {children}
    </div>
  ),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>,
  DialogTrigger: ({ children }: any) => <div data-testid="dialog-trigger">{children}</div>
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <div data-testid="plus-icon" />,
  Home: () => <div data-testid="home-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Users: () => <div data-testid="users-icon" />,
  BookOpen: () => <div data-testid="book-open-icon" />
}))

// Mock apartments service
jest.mock('@/lib/supabase/apartments')
const mockGetAllApartments = getAllApartments as jest.MockedFunction<typeof getAllApartments>

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
    is_active: false,
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

describe('AdminDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders dashboard with stats cards', async () => {
    mockGetAllApartments.mockResolvedValue(mockApartments)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Total Apartments')).toBeInTheDocument()
      expect(screen.getByText('Active Listings')).toBeInTheDocument()
      expect(screen.getByText('Max Capacity')).toBeInTheDocument()
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    })

    // Check calculated stats - wait for apartments to load
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument() // Total apartments
    })
    expect(screen.getByText('1 Active, 1 Inactive')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument() // Active listings
    })
    await waitFor(() => {
      expect(screen.getByText('4')).toBeInTheDocument() // Max capacity (only active apartment)
    })
  })

  it('renders management section', async () => {
    mockGetAllApartments.mockResolvedValue(mockApartments)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('Apartments Management')).toBeInTheDocument()
      expect(screen.getByText('Create, edit and manage your apartment listings')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add New Apartment' })).toBeInTheDocument()
    })
  })

  it('loads apartments on mount', async () => {
    mockGetAllApartments.mockResolvedValue(mockApartments)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(mockGetAllApartments).toHaveBeenCalled()
      expect(screen.getByTestId('apartment-list')).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    mockGetAllApartments.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<AdminDashboard />)

    expect(screen.getByTestId('loading')).toBeInTheDocument()
  })

  it('handles apartment loading error', async () => {
    mockGetAllApartments.mockRejectedValue(new Error('Failed to load apartments'))

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith('Error loading apartments:', expect.any(Error))
    })
  })

  it('opens create apartment dialog', async () => {
    const user = userEvent.setup()
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add New Apartment' })).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add New Apartment' }))
    })

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Add New Apartment')
    expect(screen.getByTestId('dialog-description')).toHaveTextContent('Create a new apartment listing')
  })

  it('handles apartment creation success', async () => {
    const user = userEvent.setup()
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    // Open dialog
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add New Apartment' })).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add New Apartment' }))
    })

    // Mock second call after creation
    mockGetAllApartments.mockResolvedValueOnce(mockApartments)

    // Submit form
    await act(async () => {
      await user.click(screen.getByTestId('form-success'))
    })

    await waitFor(() => {
      expect(mockGetAllApartments).toHaveBeenCalledTimes(2)
    })

    // Dialog should be closed (not visible)
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'false')
  })

  it('handles apartment creation cancellation', async () => {
    const user = userEvent.setup()
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    // Open dialog
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add New Apartment' })).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add New Apartment' }))
    })

    // Cancel form
    await act(async () => {
      await user.click(screen.getByTestId('form-cancel'))
    })

    // Dialog should be closed
    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'false')
  })

  it('handles apartment update', async () => {
    const user = userEvent.setup()
    mockGetAllApartments.mockResolvedValue(mockApartments)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('apartment-1')).toBeInTheDocument()
    })

    // Mock reload after update
    mockGetAllApartments.mockResolvedValueOnce(mockApartments)

    await act(async () => {
      await user.click(screen.getByTestId('update-1'))
    })

    await waitFor(() => {
      expect(mockGetAllApartments).toHaveBeenCalledTimes(2)
    })
  })

  it('handles apartment deletion', async () => {
    const user = userEvent.setup()
    mockGetAllApartments.mockResolvedValue(mockApartments)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('apartment-1')).toBeInTheDocument()
    })

    // Mock reload after deletion
    mockGetAllApartments.mockResolvedValueOnce([mockApartments[1]])

    await act(async () => {
      await user.click(screen.getByTestId('delete-1'))
    })

    await waitFor(() => {
      expect(mockGetAllApartments).toHaveBeenCalledTimes(2)
    })
  })

  it('calculates stats correctly with no apartments', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getAllByText('0')).toHaveLength(3) // Total apartments, Active listings, Max capacity
      expect(screen.getByText('0 Active, 0 Inactive')).toBeInTheDocument()
    })
  })

  it('calculates max capacity correctly', async () => {
    const apartmentsWithVaryingGuests = [
      { ...mockApartments[0], max_guests: 4, is_active: true },
      { ...mockApartments[1], max_guests: 2, is_active: true }
    ]
    mockGetAllApartments.mockResolvedValue(apartmentsWithVaryingGuests)

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument() // 4 + 2 = 6
    })
  })

  it('renders view public site link', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      const publicSiteLink = screen.getByRole('link')
      expect(publicSiteLink).toHaveAttribute('href', '/')
      expect(screen.getByText('View Public Site')).toBeInTheDocument()
    })
  })

  it('renders all required icons', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getAllByTestId('home-icon')).toHaveLength(2) // One in stats card, one in tabs trigger
      expect(screen.getByTestId('users-icon')).toBeInTheDocument()
      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    })
  })

  it('renders tabs navigation with correct default value', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
      expect(screen.getByTestId('tabs')).toHaveAttribute('data-default-value', 'apartments')
      expect(screen.getByTestId('tabs-list')).toBeInTheDocument()
      expect(screen.getByTestId('tabs-trigger-apartments')).toBeInTheDocument()
      expect(screen.getByTestId('tabs-trigger-reservations')).toBeInTheDocument()
    })
  })

  it('renders apartments tab content', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('tabs-content-apartments')).toBeInTheDocument()
      expect(screen.getByText('Apartments Management')).toBeInTheDocument()
      expect(screen.getByText('Create, edit and manage your apartment listings')).toBeInTheDocument()
    })
  })

  it('renders reservations tab content', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('tabs-content-reservations')).toBeInTheDocument()
      expect(screen.getByText('Reservations Management')).toBeInTheDocument()
      expect(screen.getByText('Manage all booking requests and reservations')).toBeInTheDocument()
      expect(screen.getByTestId('reservations-list')).toBeInTheDocument()
    })
  })

  it('renders tabs with correct trigger content', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      const apartmentsTrigger = screen.getByTestId('tabs-trigger-apartments')
      const reservationsTrigger = screen.getByTestId('tabs-trigger-reservations')

      expect(apartmentsTrigger).toHaveTextContent('Apartments')
      expect(reservationsTrigger).toHaveTextContent('Reservations')
    })
  })

  it('renders dialog content when create dialog is opened', async () => {
    const user = userEvent.setup()
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Add New Apartment' })).toBeInTheDocument()
    })

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Add New Apartment' }))
    })

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('dialog-header')).toBeInTheDocument()
    expect(screen.getByTestId('apartment-form')).toBeInTheDocument()
  })

  it('renders badge for active listings', async () => {
    mockGetAllApartments.mockResolvedValue(mockApartments)

    render(<AdminDashboard />)

    await waitFor(() => {
      const badge = screen.getByTestId('badge')
      expect(badge).toHaveAttribute('data-variant', 'outline')
      expect(badge).toHaveTextContent('Active')
    })
  })

  it('renders button with correct variant and size in quick actions', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      const viewSiteButton = buttons.find(button =>
        button.getAttribute('data-variant') === 'outline' &&
        button.getAttribute('data-size') === 'sm'
      )
      expect(viewSiteButton).toBeInTheDocument()
    })
  })

  it('sets loading state correctly during apartment fetching', async () => {
    let resolvePromise: (value: Apartment[]) => void
    const loadingPromise = new Promise<Apartment[]>((resolve) => {
      resolvePromise = resolve
    })

    mockGetAllApartments.mockReturnValue(loadingPromise)

    render(<AdminDashboard />)

    // Should show loading initially
    expect(screen.getByTestId('loading')).toBeInTheDocument()

    // Resolve the promise
    await act(async () => {
      resolvePromise!(mockApartments)
      await loadingPromise
    })

    // Loading should be gone
    await waitFor(() => {
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument()
    })
  })

  it('handles dialog trigger correctly', async () => {
    mockGetAllApartments.mockResolvedValue([])

    render(<AdminDashboard />)

    await waitFor(() => {
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument()
    })
  })
})