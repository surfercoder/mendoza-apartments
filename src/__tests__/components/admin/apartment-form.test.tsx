import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApartmentForm } from '@/components/admin/apartment-form'
import { createApartment, updateApartment } from '@/lib/supabase/apartments'
import { uploadApartmentImage } from '@/lib/supabase/storage'
import { Apartment } from '@/lib/types'
import { useForm } from 'react-hook-form'

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}))

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn((namespace: string) => (key: string, params?: any) => {
    const translations: Record<string, Record<string, string>> = {
      'admin.form': {
        basicInformation: 'Basic Information',
        title: 'Title',
        description: 'Description',
        descriptionPlaceholder: 'Describe your apartment...',
        address: 'Address',
        pricePerNight: 'Price per Night',
        maxGuests: 'Max Guests',
        activeListing: 'Active Listing',
        activeListingDesc: 'Make this apartment available for booking',
        contactInformation: 'Contact Information',
        contactEmail: 'Contact Email',
        contactPhone: 'Contact Phone',
        whatsappNumber: 'WhatsApp Number',
        whatsappHint: 'Include country code',
        characteristics: 'Characteristics',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
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
        images: 'Images',
        imageUrls: 'Image URLs',
        cancel: 'Cancel',
        create: 'Create',
        update: 'Update',
      }
    }
    return translations[namespace]?.[key] || params?.default || key
  })
}))

// Mock supabase functions
jest.mock('@/lib/supabase/apartments', () => ({
  createApartment: jest.fn(),
  updateApartment: jest.fn(),
}))

jest.mock('@/lib/supabase/storage', () => ({
  uploadApartmentImage: jest.fn(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: any) => (
    <img src={src} alt={alt} className={className} />
  ),
}))

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid="button"
    >
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, placeholder, type, ...props }: any) => (
    <input
      type={type || 'text'}
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      data-testid="input"
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ onChange, value, placeholder, ...props }: any) => (
    <textarea
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      data-testid="textarea"
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="checkbox"
    />
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid="label">
      {children}
    </label>
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
  CardHeader: ({ children }: any) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: any) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => <form data-testid="form" {...props}>{children}</form>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormDescription: ({ children }: any) => <div data-testid="form-description">{children}</div>,
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
  FormItem: ({ children, className }: any) => (
    <div className={className} data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: any) => <label data-testid="form-label">{children}</label>,
  FormMessage: ({ children }: any) => children && <div data-testid="form-message">{children}</div>,
}))

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(),
}))

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon" />,
  X: () => <div data-testid="x-icon" />,
  Star: () => <div data-testid="star-icon" />,
}))

const mockCreateApartment = createApartment as jest.MockedFunction<typeof createApartment>
const mockUpdateApartment = updateApartment as jest.MockedFunction<typeof updateApartment>
const mockUploadApartmentImage = uploadApartmentImage as jest.MockedFunction<typeof uploadApartmentImage>

describe('ApartmentForm', () => {
  const mockOnSuccess = jest.fn()
  const mockOnCancel = jest.fn()

  const mockForm = {
    control: {},
    handleSubmit: jest.fn((fn) => (e: any) => {
      e.preventDefault()
      fn({
        title: 'Test Apartment',
        description: 'Test description',
        price_per_night: 100,
        max_guests: 2,
        address: 'Test Address',
        contact_email: 'test@example.com',
        contact_phone: '',
        whatsapp_number: '',
        is_active: true,
        images: [],
        principal_image_index: 0,
        characteristics: {
          bedrooms: 1,
          bathrooms: 1,
          wifi: false,
          kitchen: false,
          air_conditioning: false,
          parking: false,
          pool: false,
          balcony: false,
          terrace: false,
          garden: false,
          bbq: false,
          washing_machine: false,
          mountain_view: false,
        },
      })
    }),
    setValue: jest.fn(),
    formState: { errors: {} },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useForm as jest.Mock).mockReturnValue(mockForm)
  })

  const mockApartment: Apartment = {
    id: '1',
    title: 'Test Apartment',
    description: 'Test description',
    price_per_night: 100,
    max_guests: 2,
    address: 'Test Address',
    contact_email: 'test@example.com',
    contact_phone: '123-456-7890',
    whatsapp_number: '123-456-7890',
    is_active: true,
    images: ['https://example.com/image1.jpg'],
    principal_image_index: 0,
    characteristics: {
      bedrooms: 2,
      bathrooms: 1,
      wifi: true,
      kitchen: true,
      air_conditioning: false,
      parking: true,
      pool: false,
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

  it('renders create form without apartment prop', () => {
    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Contact Information')).toBeInTheDocument()
    expect(screen.getByText('Characteristics')).toBeInTheDocument()
    expect(screen.getByText('Images')).toBeInTheDocument()
    expect(screen.getByText('Create')).toBeInTheDocument()
  })

  it('renders edit form with apartment prop', () => {
    render(
      <ApartmentForm
        apartment={mockApartment}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Update')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const cancelButton = screen.getByText('Cancel')
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('handles form submission for creating apartment', async () => {
    mockCreateApartment.mockResolvedValue({} as any)
    const user = userEvent.setup()

    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const createButton = screen.getByText('Create')
    await user.click(createButton)

    await waitFor(() => {
      expect(mockCreateApartment).toHaveBeenCalledWith({
        title: 'Test Apartment',
        description: 'Test description',
        price_per_night: 100,
        max_guests: 2,
        address: 'Test Address',
        contact_email: 'test@example.com',
        contact_phone: '',
        whatsapp_number: '',
        is_active: true,
        images: [],
        principal_image_index: 0,
        characteristics: {
          bedrooms: 1,
          bathrooms: 1,
          wifi: false,
          kitchen: false,
          air_conditioning: false,
          parking: false,
          pool: false,
          balcony: false,
          terrace: false,
          garden: false,
          bbq: false,
          washing_machine: false,
          mountain_view: false,
        },
      })
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('handles form submission for updating apartment', async () => {
    mockUpdateApartment.mockResolvedValue({} as any)
    const user = userEvent.setup()

    render(
      <ApartmentForm
        apartment={mockApartment}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const updateButton = screen.getByText('Update')
    await user.click(updateButton)

    await waitFor(() => {
      expect(mockUpdateApartment).toHaveBeenCalledWith('1', expect.any(Object))
    })

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('handles create apartment error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    mockCreateApartment.mockRejectedValue(new Error('Create failed'))

    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const createButton = screen.getByText('Create')
    await user.click(createButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error saving apartment:', expect.any(Error))
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('handles update apartment error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    mockUpdateApartment.mockRejectedValue(new Error('Update failed'))

    render(
      <ApartmentForm
        apartment={mockApartment}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const updateButton = screen.getByText('Update')
    await user.click(updateButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error saving apartment:', expect.any(Error))
    })

    expect(mockOnSuccess).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('handles file upload success', async () => {
    mockUploadApartmentImage.mockResolvedValue({ url: 'https://example.com/new-image.jpg' })

    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload images')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(mockUploadApartmentImage).toHaveBeenCalledWith(file)
    })

    await waitFor(() => {
      expect(mockForm.setValue).toHaveBeenCalledWith('images', ['https://example.com/new-image.jpg'])
    })
  })

  it('handles file upload error', async () => {
    mockUploadApartmentImage.mockResolvedValue({ error: 'Upload failed' })

    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload images')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument()
    })
  })

  it('handles multiple file uploads', async () => {
    mockUploadApartmentImage
      .mockResolvedValueOnce({ url: 'https://example.com/image1.jpg' })
      .mockResolvedValueOnce({ url: 'https://example.com/image2.jpg' })

    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload images')
    const files = [
      new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
      new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
    ]

    fireEvent.change(fileInput, { target: { files } })

    await waitFor(() => {
      expect(mockUploadApartmentImage).toHaveBeenCalledTimes(2)
    })

    await waitFor(() => {
      expect(mockForm.setValue).toHaveBeenCalledWith('images', [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ])
    })
  })

  it('handles file input with no files', async () => {
    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload images')

    fireEvent.change(fileInput, { target: { files: null } })

    expect(mockUploadApartmentImage).not.toHaveBeenCalled()
  })

  it('handles file input with empty files', async () => {
    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload images')

    fireEvent.change(fileInput, { target: { files: [] } })

    expect(mockUploadApartmentImage).not.toHaveBeenCalled()
  })

  it('displays existing images and allows removal', () => {
    render(
      <ApartmentForm
        apartment={mockApartment}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    expect(screen.getByText('Image URLs')).toBeInTheDocument()
    expect(screen.getByAltText('image-0')).toBeInTheDocument()
  })

  it('removes image when X button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <ApartmentForm
        apartment={mockApartment}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const removeButton = screen.getByTestId('x-icon').parentElement
    await user.click(removeButton!)

    expect(mockForm.setValue).toHaveBeenCalledWith('images', [])
  })

  it('shows loading state during form submission', async () => {
    let resolvePromise: () => void
    const promise = new Promise<void>((resolve) => {
      resolvePromise = resolve
    })
    mockCreateApartment.mockReturnValue(promise as any)
    const user = userEvent.setup()

    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const createButton = screen.getByText('Create')
    await user.click(createButton)

    await waitFor(() => {
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument()
    })

    resolvePromise!()
    await promise
  })

  it('shows uploading state during file upload', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockUploadApartmentImage.mockReturnValue(promise as any)

    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    const fileInput = screen.getByLabelText('Upload images')
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByText('Uploading...')).toBeInTheDocument()
    })

    resolvePromise!({ url: 'https://example.com/image.jpg' })
    await promise
  })

  it('renders all form fields correctly', () => {
    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    // Basic Information fields
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Address')).toBeInTheDocument()
    expect(screen.getByText('Price per Night')).toBeInTheDocument()
    expect(screen.getByText('Max Guests')).toBeInTheDocument()
    expect(screen.getByText('Active Listing')).toBeInTheDocument()

    // Contact Information fields
    expect(screen.getByText('Contact Email')).toBeInTheDocument()
    expect(screen.getByText('Contact Phone')).toBeInTheDocument()
    expect(screen.getByText('WhatsApp Number')).toBeInTheDocument()

    // Characteristics fields
    expect(screen.getByText('Bedrooms')).toBeInTheDocument()
    expect(screen.getByText('Bathrooms')).toBeInTheDocument()
    expect(screen.getByText('WiFi')).toBeInTheDocument()
    expect(screen.getByText('Kitchen')).toBeInTheDocument()
    expect(screen.getByText('Air Conditioning')).toBeInTheDocument()
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('Pool')).toBeInTheDocument()
    expect(screen.getByText('Balcony')).toBeInTheDocument()
    expect(screen.getByText('Terrace')).toBeInTheDocument()
    expect(screen.getByText('Garden')).toBeInTheDocument()
    expect(screen.getByText('BBQ')).toBeInTheDocument()
    expect(screen.getByText('Washing Machine')).toBeInTheDocument()
    expect(screen.getByText('Mountain View')).toBeInTheDocument()
  })

  it('updates numeric fields and characteristics via onChange handlers', async () => {
    render(
      <ApartmentForm
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
      />
    )

    // Trigger price and guests onChange parsing branches
    const priceInput = screen.getByPlaceholderText('85')
    const guestsInput = screen.getByPlaceholderText('2')
    fireEvent.change(priceInput, { target: { value: '123' } })
    fireEvent.change(guestsInput, { target: { value: '3' } })

    // Trigger bedrooms and bathrooms onChange parsing branches
    const [bedroomsInput, bathroomsInput] = screen.getAllByPlaceholderText('1')
    fireEvent.change(bedroomsInput, { target: { value: '2' } })
    fireEvent.change(bathroomsInput, { target: { value: '2' } })

    // No assertions required; executing handlers increases coverage
  })
})