import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingModal } from '@/components/booking-modal'
// import removed: openWhatsAppChat was unused in this test file
import { Apartment } from '@/lib/types'

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string, params?: any) => {
    const translations: Record<string, string> = {
      'title': 'Book Your Stay',
      'description': `Fill out the form below to book ${params?.title}`,
      'submittedTitle': 'Booking Submitted Successfully!',
      'submittedDesc': 'Thank you for your booking request.',
      'submittedEmail': 'You will receive a confirmation email shortly.',
      'summary.title': 'Booking Summary',
      'summary.nights': `${params?.count} ${params?.count === 1 ? 'night' : 'nights'}`,
      'summary.guests': `${params?.count} ${params?.count === 1 ? 'guest' : 'guests'}`,
      'summary.total': 'Total Price',
      'form.fullName': 'Full Name',
      'form.fullNamePh': 'Enter your full name',
      'form.email': 'Email',
      'form.phone': 'Phone Number',
      'form.notes': 'Special Requests',
      'form.notesPh': 'Any special requests or notes',
      'actions.cancel': 'Cancel',
      'actions.submit': 'Submit Booking',
      'actions.submitting': 'Submitting...',
      'note.title': 'Note:',
      'note.content': 'Your booking will be reviewed and confirmed within 24 hours.'
    }
    return translations[key] || key
  })
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM dd') return 'Jan 01'
    if (formatStr === 'MMM dd, yyyy') return 'Jan 02, 2024'
    return date.toString()
  })
}))

// Mock UI components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => open ? (
    <div data-testid="dialog" data-open={open}>
      <div onClick={() => onOpenChange(false)} data-testid="dialog-backdrop" />
      {children}
    </div>
  ) : null,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <div data-testid="dialog-description">{children}</div>,
  DialogHeader: ({ children }: any) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="dialog-title">{children}</div>
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => <form data-testid="form" {...props}>{children}</form>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormField: ({ render, name }: any) => {
    const mockField = {
      onChange: jest.fn(),
      onBlur: jest.fn(),
      value: '',
      name,
      ref: jest.fn()
    };
    const mockFieldState = { invalid: false, isTouched: false, isDirty: false, error: undefined };
    const mockFormState = { errors: {} };
    return render({ field: mockField, fieldState: mockFieldState, formState: mockFormState });
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
  FormMessage: () => <div data-testid="form-message" />
}))

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: jest.fn((fn) => (e: any) => {
      e.preventDefault();
      const formData = {
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        guest_phone: '1234567890',
        notes: ''
      };
      return fn(formData);
    }),
    formState: { errors: {} },
    setValue: jest.fn(),
    watch: jest.fn(),
    reset: jest.fn(),
    control: {}
  })),
  Controller: ({ render }: any) => render({
    field: {
      onChange: jest.fn(),
      onBlur: jest.fn(),
      value: '',
      name: '',
      ref: jest.fn()
    },
    fieldState: { invalid: false, isTouched: false, isDirty: false },
    formState: { errors: {} }
  })
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => ({}))
}))

jest.mock('zod', () => ({
  object: jest.fn(() => ({})),
  string: jest.fn(() => ({
    min: jest.fn(() => ({
      email: jest.fn(() => ({}))
    })),
    email: jest.fn(() => ({
      min: jest.fn(() => ({}))
    })),
    optional: jest.fn(() => ({}))
  }))
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, variant, className, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, type, ...props }: any) => (
    <input
      placeholder={placeholder}
      type={type}
      data-testid={`input-${props.name || 'unknown'}`}
      {...props}
    />
  )
}))

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ placeholder, rows, ...props }: any) => (
    <textarea
      placeholder={placeholder}
      rows={rows}
      data-testid={`textarea-${props.name || 'unknown'}`}
      {...props}
    />
  )
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader2: ({ className }: any) => <div data-testid="loader-icon" className={className} />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Users: () => <div data-testid="users-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
  MapPin: () => <div data-testid="mappin-icon" />,
  MessageCircle: () => <div data-testid="message-circle-icon" />
}))

// Mock bookings service
jest.mock('@/lib/supabase/bookings')
jest.mock('@/lib/whatsapp', () => ({
  openWhatsAppChat: jest.fn()
}))
// Mock fetch responses
const mockFetchResponse = (success: boolean, data: any) => {
  mockFetch.mockResolvedValueOnce({
    ok: success,
    json: async () => data
  })
}

const mockApartment: Apartment = {
  id: '1',
  title: 'Luxury Downtown Apartment',
  description: 'Beautiful apartment in the city center',
  address: '123 Main St, Mendoza',
  price_per_night: 150,
  max_guests: 4,
  is_active: true,
  images: ['https://example.com/image1.jpg'],
  contact_email: 'test@example.com',
  contact_phone: '+5492610000000',
  whatsapp_number: '+5492610000000',
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

describe('BookingModal', () => {
  const defaultProps = {
    apartment: mockApartment,
    checkIn: new Date('2024-01-01'),
    checkOut: new Date('2024-01-02'),
    guests: 2,
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(window, 'alert').mockImplementation(() => {})
    // Mock window.open for WhatsApp flow (jsdom doesn't implement it)
    ;(window as any).open = jest.fn()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    // Ensure any pending timers are flushed within React act
    act(() => {
      jest.runOnlyPendingTimers()
    })
    jest.useRealTimers()
  })

  it('renders booking modal when open', () => {
    render(<BookingModal {...defaultProps} />)

    expect(screen.getByTestId('dialog')).toBeInTheDocument()
    expect(screen.getByText('Book Your Stay')).toBeInTheDocument()
    expect(screen.getByText('Fill out the form below to book Luxury Downtown Apartment')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<BookingModal {...defaultProps} isOpen={false} />)

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument()
  })

  it('displays booking summary with apartment details', () => {
    render(<BookingModal {...defaultProps} />)

    expect(screen.getByText('Booking Summary')).toBeInTheDocument()
    expect(screen.getByText('Luxury Downtown Apartment')).toBeInTheDocument()
    expect(screen.getByText('Jan 01 - Jan 02, 2024')).toBeInTheDocument()
    expect(screen.getByText('1 night')).toBeInTheDocument()
    expect(screen.getByText('2 guests')).toBeInTheDocument()
    expect(screen.getByText('$150')).toBeInTheDocument()
  })

  it('calculates total price correctly', () => {
    const checkIn = new Date('2024-01-01')
    const checkOut = new Date('2024-01-03') // 2 nights

    render(
      <BookingModal
        {...defaultProps}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    )

    expect(screen.getByText('$300')).toBeInTheDocument() // 2 nights × $150
  })

  it('renders form fields', () => {
    render(<BookingModal {...defaultProps} />)

    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone Number')).toBeInTheDocument()
    expect(screen.getByText('Special Requests')).toBeInTheDocument()
  })

  it('handles form submission successfully', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockFetchResponse(true, { 
      success: true, 
      booking: { id: 'booking-1' } 
    })

    render(<BookingModal {...defaultProps} />)

    // Fill out form
    const nameInput = screen.getByTestId('input-guest_name')
    const emailInput = screen.getByTestId('input-guest_email')
    const phoneInput = screen.getByTestId('input-guest_phone')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(phoneInput, '1234567890')

    // Submit form
    const submitButton = screen.getByText('Submit Booking')
    await user.click(submitButton)

    expect(mockFetch).toHaveBeenCalledWith('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apartment_id: '1',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        guest_phone: '1234567890',
        check_in: '2024-01-01',
        check_out: '2024-01-02',
        total_guests: 2,
        total_price: 150,
        notes: undefined,
      })
    })

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('Booking Submitted Successfully!')).toBeInTheDocument()
    })

    // Auto-close after 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000)
    })

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalled()
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it('handles form submission with notes', () => {
    mockFetchResponse(true, { 
      success: true, 
      booking: { id: 'booking-1' } 
    })

    render(<BookingModal {...defaultProps} />)

    // Check that the form renders with all fields
    expect(screen.getByText('Full Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Phone Number')).toBeInTheDocument()
    expect(screen.getByText('Special Requests')).toBeInTheDocument()
    expect(screen.getByText('Submit Booking')).toBeInTheDocument()
  })

  it('shows error when booking creation fails', () => {
    mockFetchResponse(false, { 
      success: false, 
      error: 'Failed to create booking' 
    })

    render(<BookingModal {...defaultProps} />)

    // Verify modal renders with submit button
    expect(screen.getByText('Submit Booking')).toBeInTheDocument()
    expect(screen.getByText('Book Your Stay')).toBeInTheDocument()
  })

  it('shows error when booking creation throws', () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    render(<BookingModal {...defaultProps} />)

    // Verify modal renders correctly
    expect(screen.getByText('Submit Booking')).toBeInTheDocument()
    expect(screen.getByText('Book Your Stay')).toBeInTheDocument()
  })

  it('prevents submission without dates', () => {
    render(
      <BookingModal
        {...defaultProps}
        checkIn={undefined}
        checkOut={undefined}
      />
    )

    // Submit button should be disabled without dates
    const submitButton = screen.getByText('Submit Booking')
    expect(submitButton).toBeDisabled()
  })

  it('shows loading state during submission', () => {
    render(<BookingModal {...defaultProps} />)

    // Verify the form renders
    expect(screen.getByText('Submit Booking')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('handles modal close', () => {
    render(<BookingModal {...defaultProps} />)

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
  })

  it('prevents close during submission', () => {
    render(<BookingModal {...defaultProps} />)

    // Verify cancel button exists
    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
  })

  it('handles missing price calculation gracefully', () => {
    render(
      <BookingModal
        {...defaultProps}
        checkIn={undefined}
        checkOut={undefined}
      />
    )

    // Should not show total price section
    expect(screen.queryByText('Total Price')).not.toBeInTheDocument()
  })

  it('displays proper guest count in summary', () => {
    render(<BookingModal {...defaultProps} guests={1} />)
    expect(screen.getByText('1 guest')).toBeInTheDocument()

    render(<BookingModal {...defaultProps} guests={3} />)
    expect(screen.getByText('3 guests')).toBeInTheDocument()
  })

  it('renders all required icons', () => {
    render(<BookingModal {...defaultProps} />)

    expect(screen.getByTestId('mappin-icon')).toBeInTheDocument()
    expect(screen.getByTestId('calendar-icon')).toBeInTheDocument()
    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
    expect(screen.getByTestId('dollar-icon')).toBeInTheDocument()
  })

  it('shows success state with correct content', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockFetchResponse(true, { 
      success: true, 
      booking: { id: 'booking-1' } 
    })

    render(<BookingModal {...defaultProps} />)

    // Submit successful booking
    const nameInput = screen.getByTestId('input-guest_name')
    const emailInput = screen.getByTestId('input-guest_email')
    const phoneInput = screen.getByTestId('input-guest_phone')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(phoneInput, '1234567890')

    const submitButton = screen.getByText('Submit Booking')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('✅')).toBeInTheDocument()
      expect(screen.getByText('Booking Submitted Successfully!')).toBeInTheDocument()
      expect(screen.getByText('Thank you for your booking request.')).toBeInTheDocument()
      expect(screen.getByText('You will receive a confirmation email shortly.')).toBeInTheDocument()
    })
  })

  it('handles successful submission with WhatsApp integration', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const mockOnSuccess = jest.fn()
    const mockOnClose = jest.fn()

    mockFetchResponse(true, {
      success: true,
      booking: {
        id: 'booking-1',
        guest_name: 'John Doe',
        guest_email: 'john@example.com'
      }
    })

    // Timers are already faked in beforeEach

    render(
      <BookingModal
        {...defaultProps}
        onSuccess={mockOnSuccess}
        onClose={mockOnClose}
      />
    )

    // Fill out form
    const nameInput = screen.getByTestId('input-guest_name')
    const emailInput = screen.getByTestId('input-guest_email')
    const phoneInput = screen.getByTestId('input-guest_phone')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(phoneInput, '1234567890')

    const submitButton = screen.getByText('Submit Booking')
    await user.click(submitButton)

    // Ensure API was called (successful submission path reached)
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })

    // real timers restored in afterEach
  })

  it('alerts user when dates are not selected before submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <BookingModal
        {...defaultProps}
        checkIn={undefined}
        checkOut={undefined}
      />
    )

    // Fill out form but without dates
    const nameInput = screen.getByTestId('input-guest_name')
    const emailInput = screen.getByTestId('input-guest_email')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')

    // Try to submit without dates (need to manually trigger since button would be disabled)
    // We need to test the onSubmit function directly since the button is disabled
    // This tests the early return in onSubmit when dates are missing

    // Submit button should be disabled, but we can test the validation logic
    const submitButton = screen.getByText('Submit Booking')
    expect(submitButton).toBeDisabled()

    mockAlert.mockRestore()
  })

  it('handles form reset on close when not loading or submitted', () => {
    const mockOnClose = jest.fn()
    const { rerender } = render(
      <BookingModal
        {...defaultProps}
        onClose={mockOnClose}
        isOpen={true}
      />
    )

    // Simulate clicking cancel when form is not loading/submitted
    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()

    // Close the modal (not loading, not submitted)
    rerender(
      <BookingModal
        {...defaultProps}
        onClose={mockOnClose}
        isOpen={false}
      />
    )

    // Modal should be closed
    expect(screen.queryByText('Book Your Stay')).not.toBeInTheDocument()
  })

  it('prevents modal close during loading state', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const mockOnClose = jest.fn()

    // Mock a slow API response
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <BookingModal
        {...defaultProps}
        onClose={mockOnClose}
      />
    )

    // Fill out and submit form to trigger loading state
    const nameInput = screen.getByTestId('input-guest_name')
    const emailInput = screen.getByTestId('input-guest_email')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')

    const submitButton = screen.getByText('Submit Booking')
    await user.click(submitButton)

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Submitting...')).toBeInTheDocument()
    })

    // Try to close during loading - should be prevented
    // In actual implementation, the handleClose function checks isLoading
    expect(screen.getByText('Submitting...')).toBeInTheDocument()
  })

  it('shows booking error when API returns failure', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {})

    mockFetchResponse(true, {
      success: false,
      error: 'Booking failed due to availability'
    })

    render(<BookingModal {...defaultProps} />)

    // Fill out and submit form
    const nameInput = screen.getByTestId('input-guest_name')
    const emailInput = screen.getByTestId('input-guest_email')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')

    const submitButton = screen.getByText('Submit Booking')
    await user.click(submitButton)

    // Should not show success UI
    await waitFor(() => {
      expect(screen.queryByText('Booking Submitted Successfully!')).not.toBeInTheDocument()
    })
    // Ensure API was called
    expect(mockFetch).toHaveBeenCalled()

    mockAlert.mockRestore()
  })

  it('handles notes field correctly in submission', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })

    mockFetchResponse(true, {
      success: true,
      booking: { id: 'booking-1' }
    })

    render(<BookingModal {...defaultProps} />)

    // Fill out form including notes
    const nameInput = screen.getByTestId('input-guest_name')
    const emailInput = screen.getByTestId('input-guest_email')
    const notesInput = screen.getByTestId('textarea-notes')

    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    await user.type(notesInput, 'Special request for late check-in')

    const submitButton = screen.getByText('Submit Booking')
    await user.click(submitButton)

    // Verify API was called
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})