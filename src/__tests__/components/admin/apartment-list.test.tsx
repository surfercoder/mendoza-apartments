import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApartmentList } from '@/components/admin/apartment-list'
import { deleteApartment } from '@/lib/supabase/apartments'
import { Apartment } from '@/lib/types'
// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace: string) => (key: string, params?: any) => {
    const translations: Record<string, Record<string, string>> = {
      common: {
        active: 'Active',
        inactive: 'Inactive',
        edit: 'Edit',
        delete: 'Delete',
        cancel: 'Cancel',
      },
      admin: {
        'list.noApartmentsTitle': 'No apartments yet',
        'list.noApartmentsDesc': 'Create your first apartment listing to get started.',
        'list.noImage': 'No image',
        'dialogs.deleteTitle': 'Delete Apartment',
        'dialogs.deleteConfirm': 'Are you sure you want to delete {title}?',
        'dialogs.editTitle': 'Edit Apartment',
        'dialogs.editDescription': 'Update the apartment information below.',
      }
    }

    if (params?.title) {
      const text = translations[namespace]?.[key] || key
      return text.replace('{title}', params.title)
    }

    return translations[namespace]?.[key] || key
  })
}))

// Mock supabase functions
jest.mock('@/lib/supabase/apartments', () => ({
  deleteApartment: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, fill, className }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="apartment-image"
      style={fill ? { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } : {}}
    />
  ),
}))

// Mock apartment form
jest.mock('@/components/admin/apartment-form', () => ({
  ApartmentForm: ({ apartment, onSuccess, onCancel }: any) => (
    <div data-testid="apartment-form">
      <p>Editing: {apartment?.title || 'New Apartment'}</p>
      <button onClick={onSuccess} data-testid="form-success">Success</button>
      <button onClick={onCancel} data-testid="form-cancel">Cancel</button>
    </div>
  ),
}))

// Mock UI components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: any) => (
    <button
      onClick={onClick}
      data-testid="button"
      data-variant={variant}
      data-size={size}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
  CardHeader: ({ children, className }: any) => (
    <div className={className} data-testid="card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, className }: any) => (
    <h3 className={className} data-testid="card-title">
      {children}
    </h3>
  ),
}))

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    open ? (
      <div data-testid="dialog" data-open={open}>
        {children}
        <button onClick={() => onOpenChange(false)} data-testid="dialog-close">Close</button>
      </div>
    ) : null
  ),
  DialogContent: ({ children }: any) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogDescription: ({ children }: any) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
}))

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) => <div data-testid="alert-dialog">{children}</div>,
  AlertDialogAction: ({ children, onClick, className }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-testid="alert-dialog-action"
    >
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children }: any) => (
    <button data-testid="alert-dialog-cancel">{children}</button>
  ),
  AlertDialogContent: ({ children }: any) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogDescription: ({ children }: any) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: any) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogHeader: ({ children }: any) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: any) => (
    <h3 data-testid="alert-dialog-title">{children}</h3>
  ),
  AlertDialogTrigger: ({ children }: any) => children,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Users: () => <div data-testid="users-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Bed: () => <div data-testid="bed-icon" />,
  Bath: () => <div data-testid="bath-icon" />,
  Wifi: () => <div data-testid="wifi-icon" />,
  Car: () => <div data-testid="car-icon" />,
  Waves: () => <div data-testid="waves-icon" />,
}))

const mockDeleteApartment = deleteApartment as jest.MockedFunction<typeof deleteApartment>

describe('ApartmentList', () => {
  const mockOnApartmentUpdated = jest.fn()
  const mockOnApartmentDeleted = jest.fn()

  const mockApartment: Apartment = {
    id: '1',
    title: 'Test Apartment',
    description: 'A beautiful test apartment with amazing views',
    price_per_night: 100,
    max_guests: 2,
    address: '123 Test Street, Test City',
    contact_email: 'test@example.com',
    contact_phone: '123-456-7890',
    whatsapp_number: '123-456-7890',
    is_active: true,
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    characteristics: {
      bedrooms: 2,
      bathrooms: 1,
      wifi: true,
      kitchen: true,
      air_conditioning: false,
      parking: true,
      pool: true,
      balcony: true,
      terrace: false,
      garden: false,
      bbq: false,
      washing_machine: true,
      mountain_view: false,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state', () => {
    render(
      <ApartmentList
        apartments={[]}
        isLoading={true}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    // Should render 3 loading cards
    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(3)

    // Check for animate-pulse class
    cards.forEach(card => {
      expect(card.className).toContain('animate-pulse')
    })
  })

  it('renders empty state when no apartments', () => {
    render(
      <ApartmentList
        apartments={[]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('No apartments yet')).toBeInTheDocument()
    expect(screen.getByText('Create your first apartment listing to get started.')).toBeInTheDocument()
    expect(screen.getByText('🏠')).toBeInTheDocument()
  })

  it('renders apartment list with apartments', () => {
    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('Test Apartment')).toBeInTheDocument()
    expect(screen.getByText('A beautiful test apartment with amazing views')).toBeInTheDocument()
    expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument()
    expect(screen.getByText('$100/night')).toBeInTheDocument()
    expect(screen.getByText('2 guests')).toBeInTheDocument()
    expect(screen.getByText('2 beds')).toBeInTheDocument()
    expect(screen.getByText('1 bath')).toBeInTheDocument()
  })

  it('renders apartment with image', () => {
    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    const image = screen.getByTestId('apartment-image')
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg')
    expect(image).toHaveAttribute('alt', 'Test Apartment')
  })

  it('renders apartment without image', () => {
    const apartmentWithoutImage = { ...mockApartment, images: [] }

    render(
      <ApartmentList
        apartments={[apartmentWithoutImage]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('No image')).toBeInTheDocument()
  })

  it('shows active status badge', () => {
    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument()
  })

  it('shows inactive status badge', () => {
    const inactiveApartment = { ...mockApartment, is_active: false }

    render(
      <ApartmentList
        apartments={[inactiveApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument()
  })

  it('renders characteristics badges', () => {
    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('WiFi')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('Pool')).toBeInTheDocument()
    // AC should not be rendered since air_conditioning is false in mockApartment

    expect(screen.getByTestId('wifi-icon')).toBeInTheDocument()
    expect(screen.getByTestId('car-icon')).toBeInTheDocument()
    expect(screen.getByTestId('waves-icon')).toBeInTheDocument()
  })

  it('does not render characteristics badges when false', () => {
    const apartmentWithoutFeatures = {
      ...mockApartment,
      characteristics: {
        ...mockApartment.characteristics,
        wifi: false,
        parking: false,
        pool: false,
        air_conditioning: false,
      }
    }

    render(
      <ApartmentList
        apartments={[apartmentWithoutFeatures]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.queryByText('WiFi')).not.toBeInTheDocument()
    expect(screen.queryByText('Parking')).not.toBeInTheDocument()
    expect(screen.queryByText('Pool')).not.toBeInTheDocument()
    expect(screen.queryByText('AC')).not.toBeInTheDocument()
  })

  it('handles singular bedroom and bathroom text', () => {
    const apartmentSingular = {
      ...mockApartment,
      characteristics: {
        ...mockApartment.characteristics,
        bedrooms: 1,
        bathrooms: 1,
      }
    }

    render(
      <ApartmentList
        apartments={[apartmentSingular]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('1 bed')).toBeInTheDocument()
    expect(screen.getByText('1 bath')).toBeInTheDocument()
  })

  it('does not render bedroom/bathroom info when not available', () => {
    const apartmentWithoutRoomInfo = {
      ...mockApartment,
      characteristics: {
        ...mockApartment.characteristics,
        bedrooms: undefined,
        bathrooms: undefined,
      }
    }

    render(
      <ApartmentList
        apartments={[apartmentWithoutRoomInfo]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.queryByText(/bed/)).not.toBeInTheDocument()
    expect(screen.queryByText(/bath/)).not.toBeInTheDocument()
  })

  it('opens edit dialog when edit button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(screen.getByTestId('dialog')).toHaveAttribute('data-open', 'true')
    expect(screen.getByText('Edit Apartment')).toBeInTheDocument()
    expect(screen.getByText('Update the apartment information below.')).toBeInTheDocument()
    expect(screen.getByText('Editing: Test Apartment')).toBeInTheDocument()
  })

  it('closes edit dialog and calls onApartmentUpdated when form succeeds', async () => {
    const user = userEvent.setup()

    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    const successButton = screen.getByTestId('form-success')
    await user.click(successButton)

    expect(mockOnApartmentUpdated).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  it('closes edit dialog when form is cancelled', async () => {
    const user = userEvent.setup()

    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    const cancelButton = screen.getByTestId('form-cancel')
    await user.click(cancelButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  it('closes edit dialog when dialog close is clicked', async () => {
    const user = userEvent.setup()

    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    const closeButton = screen.getByTestId('dialog-close')
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
    })
  })

  it('renders delete confirmation dialog', () => {
    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete Apartment')).toBeInTheDocument()
    expect(screen.getByText('Are you sure you want to delete Test Apartment?')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('handles apartment deletion successfully', async () => {
    const user = userEvent.setup()
    mockDeleteApartment.mockResolvedValue(true)

    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    const deleteButton = screen.getByTestId('alert-dialog-action')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(mockDeleteApartment).toHaveBeenCalledWith('1')
    })

    await waitFor(() => {
      expect(mockOnApartmentDeleted).toHaveBeenCalledTimes(1)
    })
  })

  it('handles apartment deletion error', async () => {
    const user = userEvent.setup()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockDeleteApartment.mockRejectedValue(new Error('Delete failed'))

    render(
      <ApartmentList
        apartments={[mockApartment]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    const deleteButton = screen.getByTestId('alert-dialog-action')
    await user.click(deleteButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error deleting apartment:', expect.any(Error))
    })

    expect(mockOnApartmentDeleted).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('renders multiple apartments', () => {
    const apartment2 = { ...mockApartment, id: '2', title: 'Second Apartment' }

    render(
      <ApartmentList
        apartments={[mockApartment, apartment2]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('Test Apartment')).toBeInTheDocument()
    expect(screen.getByText('Second Apartment')).toBeInTheDocument()

    const cards = screen.getAllByTestId('card')
    expect(cards).toHaveLength(2)
  })

  it('renders apartment without characteristics', () => {
    const apartmentWithoutCharacteristics = {
      ...mockApartment,
      characteristics: null as any
    }

    render(
      <ApartmentList
        apartments={[apartmentWithoutCharacteristics]}
        isLoading={false}
        onApartmentUpdated={mockOnApartmentUpdated}
        onApartmentDeleted={mockOnApartmentDeleted}
      />
    )

    expect(screen.getByText('Test Apartment')).toBeInTheDocument()
    expect(screen.queryByText(/bed/)).not.toBeInTheDocument()
    expect(screen.queryByText(/bath/)).not.toBeInTheDocument()
  })
})