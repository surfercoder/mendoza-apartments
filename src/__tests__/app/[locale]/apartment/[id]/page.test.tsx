import { notFound } from 'next/navigation'
import ApartmentDetailsPage from '@/app/[locale]/apartment/[id]/page'
import { getApartmentById } from '@/lib/supabase/apartments'
import { setRequestLocale } from 'next-intl/server'
import { Apartment } from '@/lib/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
}))

// Mock next-intl/server
jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn()
}))

// Mock supabase apartments
jest.mock('@/lib/supabase/apartments')

// Mock ApartmentDetailsClient
jest.mock('@/app/[locale]/apartment/[id]/apartment-details-client', () => ({
  ApartmentDetailsClient: ({ apartment }: { apartment: Apartment }) => (
    <div data-testid="apartment-details-client">
      <h1>{apartment.title}</h1>
      <p>{apartment.address}</p>
    </div>
  )
}))

const mockNotFound = notFound as jest.MockedFunction<typeof notFound>
const mockGetApartmentById = getApartmentById as jest.MockedFunction<typeof getApartmentById>
const mockSetRequestLocale = setRequestLocale as jest.MockedFunction<typeof setRequestLocale>

const mockApartment: Apartment = {
  id: 'apt-123',
  title: 'Test Apartment',
  description: 'A test apartment',
  address: '123 Test St',
  price_per_night: 100,
  max_guests: 4,
  is_active: true,
  images: ['image1.jpg'],
  principal_image_index: 0,
  contact_email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  characteristics: {
    bedrooms: 2,
    bathrooms: 1,
    wifi: true,
    kitchen: true
  }
}

describe('ApartmentDetailsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should render apartment details when apartment is found', async () => {
    mockGetApartmentById.mockResolvedValue(mockApartment)

    const params = Promise.resolve({ id: 'apt-123', locale: 'en' })
    const result = await ApartmentDetailsPage({ params })

    expect(mockSetRequestLocale).toHaveBeenCalledWith('en')
    expect(mockGetApartmentById).toHaveBeenCalledWith('apt-123')
    expect(mockNotFound).not.toHaveBeenCalled()

    // Result should be the ApartmentDetailsClient component
    expect(result).toBeDefined()
  })

  it('should call notFound when apartment is not found', async () => {
    mockGetApartmentById.mockResolvedValue(null)
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })

    const params = Promise.resolve({ id: 'non-existent', locale: 'en' })

    await expect(ApartmentDetailsPage({ params })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockSetRequestLocale).toHaveBeenCalledWith('en')
    expect(mockGetApartmentById).toHaveBeenCalledWith('non-existent')
    expect(mockNotFound).toHaveBeenCalled()
  })

  it('should set locale for Spanish', async () => {
    mockGetApartmentById.mockResolvedValue(mockApartment)

    const params = Promise.resolve({ id: 'apt-123', locale: 'es' })
    await ApartmentDetailsPage({ params })

    expect(mockSetRequestLocale).toHaveBeenCalledWith('es')
    expect(mockGetApartmentById).toHaveBeenCalledWith('apt-123')
  })

  it('should handle different apartment ids', async () => {
    const differentApartment = { ...mockApartment, id: 'apt-456', title: 'Different Apartment' }
    mockGetApartmentById.mockResolvedValue(differentApartment)

    const params = Promise.resolve({ id: 'apt-456', locale: 'en' })
    await ApartmentDetailsPage({ params })

    expect(mockGetApartmentById).toHaveBeenCalledWith('apt-456')
  })
})
