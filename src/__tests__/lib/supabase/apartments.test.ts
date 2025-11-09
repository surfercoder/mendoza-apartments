import {
  getAvailableApartments,
  getApartmentById,
  getAllApartments,
  createApartment,
  updateApartment,
  deleteApartment,
  getApartmentAvailability,
  createAvailabilityPeriod
} from '@/lib/supabase/apartments'
import { Apartment, SearchFilters, ApartmentAvailability } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock the client module
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('lib/supabase/apartments', () => {
  const originalEnv = process.env
  const originalConsole = console

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    // Mock console methods
    console.log = jest.fn()
    console.error = jest.fn()
    console.warn = jest.fn()
  })

  afterAll(() => {
    process.env = originalEnv
    console.log = originalConsole.log
    console.error = originalConsole.error
    console.warn = originalConsole.warn
  })

  const createMockApartment = (): Apartment => ({
    id: 'apt-123',
    title: 'Test Apartment',
    description: 'A nice apartment',
    characteristics: {
      bedrooms: 2,
      bathrooms: 1,
      wifi: true,
      kitchen: true
    },
    price_per_night: 100,
    max_guests: 4,
    address: '123 Test St',
    images: ['image1.jpg'],
    contact_email: 'test@example.com',
    is_active: true,
    principal_image_index: 0,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  })

  const createMockSupabaseClient = () => {
    // Create a fresh mock chain for each test
    let isAfterDelete = false
    let currentTable = ''

    const mockChain = {
      select: jest.fn(),
      eq: jest.fn(),
      gte: jest.fn(),
      lte: jest.fn(),
      not: jest.fn(),
      order: jest.fn(),
      single: jest.fn(),
      in: jest.fn(),
      or: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    // Configure chain methods to return the chain for method chaining
    mockChain.select.mockImplementation(() => mockChain)
    mockChain.gte.mockImplementation(() => mockChain)
    mockChain.lte.mockImplementation(() => mockChain)
    mockChain.not.mockImplementation(() => mockChain)
    mockChain.in.mockImplementation(() => mockChain)
    mockChain.insert.mockImplementation(() => mockChain)
    mockChain.update.mockImplementation(() => mockChain)

    // Delete method sets a flag and returns chain
    mockChain.delete.mockImplementation(() => {
      isAfterDelete = true
      return mockChain
    })

    // eq method behavior depends on context
    mockChain.eq.mockImplementation(() => {
      if (isAfterDelete) {
        // After delete, eq is the final operation
        return Promise.resolve({ error: null })
      } else {
        // In query building, eq returns chain
        return mockChain
      }
    })

    // order is always a final operation for queries
    mockChain.order.mockImplementation(() => Promise.resolve({
      data: [createMockApartment()],
      error: null
    }))

    mockChain.single.mockImplementation(() => Promise.resolve({
      data: createMockApartment(),
      error: null
    }))

    mockChain.or.mockImplementation(() => Promise.resolve({
      data: [],
      error: null
    }))

    const from = jest.fn().mockImplementation((table: string) => {
      currentTable = table
      return mockChain
    })

    return {
      from,
      _mockChain: mockChain,
      _getCurrentTable: () => currentTable
    }
  }

  describe('getAvailableApartments', () => {
    it('should return apartments when env vars are set', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 2
      }

      const result = await getAvailableApartments(filters)

      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('Test Apartment')
      expect(mockClient.from).toHaveBeenCalledWith('apartments')
    })

    it('should return empty array when env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const result = await getAvailableApartments({
        checkIn: undefined,
        checkOut: undefined,
        guests: 1
      })

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Missing Supabase environment variables!')
    })

    it('should filter by guest count', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 3
      }

      await getAvailableApartments(filters)

      expect(mockClient.from().gte).toHaveBeenCalledWith('max_guests', 3)
    })

    it('should check availability when dates are provided', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const checkIn = new Date('2023-06-01')
      const checkOut = new Date('2023-06-07')

      const filters: SearchFilters = {
        checkIn,
        checkOut,
        guests: 2
      }

      await getAvailableApartments(filters)

      expect(console.log).toHaveBeenCalledWith('📅 Checking availability for dates:', '2023-06-01', 'to', '2023-06-07')
    })

    it('should handle query errors gracefully', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: '500' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getAvailableApartments({
        checkIn: undefined,
        checkOut: undefined,
        guests: 1
      })

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Supabase query error:', expect.any(Object))
    })

    it('should handle unexpected errors', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getAvailableApartments({
        checkIn: undefined,
        checkOut: undefined,
        guests: 1
      })

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Unexpected error fetching available apartments:', expect.any(Object))
    })
  })

  describe('getApartmentById', () => {
    it('should return apartment when found', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getApartmentById('apt-123')

      expect(result?.id).toBe('apt-123')
      expect(mockClient.from).toHaveBeenCalledWith('apartments')
      expect(mockClient.from().single).toHaveBeenCalled()
    })

    it('should return null when apartment not found', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().single.mockResolvedValue({
        data: null,
        error: { message: 'No rows returned', code: 'PGRST116' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getApartmentById('non-existent')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error fetching apartment:', expect.any(Object))
    })

    it('should handle unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getApartmentById('apt-123')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error fetching apartment by id:', expect.any(Error))
    })
  })

  describe('getAllApartments', () => {
    it('should return all apartments when env vars are set', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getAllApartments()

      expect(result).toHaveLength(1)
      expect(console.log).toHaveBeenCalledWith('🔄 Fetching apartments from Supabase...')
      expect(console.log).toHaveBeenCalledWith('✅ Successfully fetched', 1, 'apartments')
    })

    it('should return empty array when env vars are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const result = await getAllApartments()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Missing Supabase environment variables!')
    })
  })

  describe('createApartment', () => {
    it('should create apartment successfully', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newApartment = {
        title: 'New Apartment',
        description: 'A new apartment',
        characteristics: { bedrooms: 1 },
        price_per_night: 80,
        max_guests: 2,
        address: '456 New St',
        images: [],
        contact_email: 'new@example.com',
        is_active: true,
        principal_image_index: 0
      }

      const result = await createApartment(newApartment)

      expect(result?.title).toBe('Test Apartment') // Mock returns the default apartment
      expect(mockClient.from).toHaveBeenCalledWith('apartments')
      expect(mockClient.from().insert).toHaveBeenCalledWith([newApartment])
    })

    it('should handle creation errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newApartment = {
        title: 'New Apartment',
        description: 'A new apartment',
        characteristics: {},
        price_per_night: 80,
        max_guests: 2,
        address: '456 New St',
        images: [],
        contact_email: 'new@example.com',
        is_active: true,
        principal_image_index: 0
      }

      const result = await createApartment(newApartment)

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error creating apartment:', expect.any(Object))
    })
  })

  describe('updateApartment', () => {
    it('should update apartment successfully', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const updates = { title: 'Updated Title' }
      const result = await updateApartment('apt-123', updates)

      expect(result?.title).toBe('Test Apartment')
      expect(mockClient.from().update).toHaveBeenCalledWith(updates)
    })

    it('should handle update errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await updateApartment('apt-123', { title: 'Updated' })

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error updating apartment:', expect.any(Object))
    })
  })

  describe('deleteApartment', () => {
    it('should delete apartment successfully', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await deleteApartment('apt-123')

      expect(result).toBe(true)
      expect(mockClient.from().eq).toHaveBeenCalledWith('id', 'apt-123')
    })

    it('should handle delete errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().eq.mockResolvedValue({
        error: { message: 'Delete failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await deleteApartment('apt-123')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error deleting apartment:', expect.any(Object))
    })
  })

  describe('getApartmentAvailability', () => {
    it('should return availability periods', async () => {
      const mockAvailability: ApartmentAvailability = {
        id: 'avail-123',
        apartment_id: 'apt-123',
        start_date: '2023-06-01',
        end_date: '2023-06-07',
        is_available: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({
        data: [mockAvailability],
        error: null
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getApartmentAvailability('apt-123')

      expect(result).toHaveLength(1)
      expect(result[0].apartment_id).toBe('apt-123')
    })

    it('should handle availability query errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getApartmentAvailability('apt-123')

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('Error fetching apartment availability:', expect.any(Object))
    })
  })

  describe('createAvailabilityPeriod', () => {
    it('should create availability period successfully', async () => {
      const mockClient = createMockSupabaseClient()
      const mockAvailability: ApartmentAvailability = {
        id: 'avail-123',
        apartment_id: 'apt-123',
        start_date: '2023-06-01',
        end_date: '2023-06-07',
        is_available: true,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      mockClient.from().single.mockResolvedValue({
        data: mockAvailability,
        error: null
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newAvailability = {
        apartment_id: 'apt-123',
        start_date: '2023-06-01',
        end_date: '2023-06-07',
        is_available: true
      }

      const result = await createAvailabilityPeriod(newAvailability)

      expect(result?.apartment_id).toBe('apt-123')
      expect(mockClient.from().insert).toHaveBeenCalledWith([newAvailability])
    })

    it('should handle creation errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newAvailability = {
        apartment_id: 'apt-123',
        start_date: '2023-06-01',
        end_date: '2023-06-07',
        is_available: true
      }

      const result = await createAvailabilityPeriod(newAvailability)

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error creating availability period:', expect.any(Object))
    })

    it('should handle unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newAvailability = {
        apartment_id: 'apt-123',
        start_date: '2023-06-01',
        end_date: '2023-06-07',
        is_available: true
      }

      const result = await createAvailabilityPeriod(newAvailability)

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error creating availability period:', expect.any(Error))
    })
  })

  // Additional tests for edge cases to improve coverage
  describe('getAvailableApartments - additional edge cases', () => {
    it('should handle availability checking with no unavailable apartments', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      // Mock availability check to return empty array
      mockClient.from().or.mockResolvedValue({
        data: [],
        error: null
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: new Date('2023-06-01'),
        checkOut: new Date('2023-06-07'),
        guests: 2
      }

      await getAvailableApartments(filters)

      expect(console.log).toHaveBeenCalledWith('📅 Checking availability for dates:', '2023-06-01', 'to', '2023-06-07')
    })

    it('should handle availability error gracefully', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()

      // Set up gte to return errors for both availability and bookings checks
      let callCount = 0
      mockClient.from().gte.mockImplementation(() => {
        callCount++
        return Promise.resolve({
          data: null,
          error: { message: 'Table does not exist' }
        })
      })

      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: new Date('2023-06-01'),
        checkOut: new Date('2023-06-07'),
        guests: 2
      }

      await getAvailableApartments(filters)

      expect(console.warn).toHaveBeenCalledWith('⚠️ Error checking availability (table may not exist yet):', 'Table does not exist')
      expect(console.warn).toHaveBeenCalledWith('⚠️ Error checking bookings (table may not exist yet):', 'Table does not exist')
    })

    it('should exclude unavailable apartments when checking availability', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()

      // Set up gte to return different data based on which table is being queried
      let availabilityCalled = false
      let bookingsCalled = false

      mockClient._mockChain.gte.mockImplementation(() => {
        const table = mockClient._getCurrentTable()

        if (table === 'apartment_availability' && !availabilityCalled) {
          availabilityCalled = true
          return Promise.resolve({
            data: [{ apartment_id: 'apt-unavailable' }],
            error: null
          })
        } else if (table === 'bookings' && !bookingsCalled) {
          bookingsCalled = true
          return Promise.resolve({
            data: [{ apartment_id: 'apt-booked' }],
            error: null
          })
        }
        // For the main apartments query, return the chain
        return mockClient._mockChain
      })

      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: new Date('2023-06-01'),
        checkOut: new Date('2023-06-07'),
        guests: 2
      }

      await getAvailableApartments(filters)

      expect(console.log).toHaveBeenCalledWith('🚫 Excluding', 2, 'unavailable apartments')
      expect(mockClient._mockChain.not).toHaveBeenCalledWith('id', 'in', '(apt-unavailable,apt-booked)')
    })

    it('should log successful results', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({
        data: [createMockApartment(), createMockApartment()],
        error: null
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      await getAvailableApartments({
        checkIn: undefined,
        checkOut: undefined,
        guests: 1
      })

      expect(console.log).toHaveBeenCalledWith('✅ Found', 2, 'available apartments')
    })
  })

  describe('getAllApartments - additional edge cases', () => {
    it('should handle unexpected errors', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getAllApartments()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Unexpected error fetching apartments:', expect.any(Object))
    })

    it('should handle query errors', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed', details: 'Connection error', hint: 'Check network', code: '500' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getAllApartments()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Supabase query error:', expect.any(Object))
    })
  })

  describe('Booking status filtering', () => {
    it('should only exclude apartments with confirmed bookings, not pending ones', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()

      // Set up gte to return different data for availability and bookings checks
      let callCount = 0
      mockClient.from().gte.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: no unavailable apartments
          return Promise.resolve({
            data: [],
            error: null
          })
        } else if (callCount === 2) {
          // Second call: one confirmed booking
          return Promise.resolve({
            data: [{ apartment_id: 'apt-confirmed' }],
            error: null
          })
        }
        return Promise.resolve({ data: [], error: null })
      })

      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: new Date('2023-06-01'),
        checkOut: new Date('2023-06-07'),
        guests: 2
      }

      await getAvailableApartments(filters)

      // Verify that eq was called with 'confirmed' status only
      expect(mockClient.from().eq).toHaveBeenCalledWith('status', 'confirmed')
      // Should NOT be called with 'pending' or array of statuses
      expect(mockClient.from().eq).not.toHaveBeenCalledWith('status', 'pending')
    })

    it('should show apartments with pending bookings in same date range', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()

      // Set up gte to return empty arrays for availability/bookings checks
      mockClient._mockChain.gte.mockImplementation(() => {
        const table = mockClient._getCurrentTable()
        if (table === 'apartment_availability' || table === 'bookings') {
          return Promise.resolve({
            data: [],
            error: null
          })
        }
        // For the main apartments query, return the chain
        return mockClient._mockChain
      })

      // Mock the main apartments query to return an apartment
      mockClient._mockChain.order.mockResolvedValue({
        data: [createMockApartment()],
        error: null
      })

      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: new Date('2023-11-07'),
        checkOut: new Date('2023-11-10'),
        guests: 1
      }

      const result = await getAvailableApartments(filters)

      // Should return apartments even if there are pending bookings
      expect(result).toHaveLength(1)
      expect(console.log).toHaveBeenCalledWith('📅 Checking availability for dates:', '2023-11-07', 'to', '2023-11-10')
    })

    it('should hide apartments with confirmed bookings in overlapping date range', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()

      // Set up gte to return different data based on table
      let availabilityCalled = false
      let bookingsCalled = false

      mockClient._mockChain.gte.mockImplementation(() => {
        const table = mockClient._getCurrentTable()

        if (table === 'apartment_availability' && !availabilityCalled) {
          availabilityCalled = true
          return Promise.resolve({
            data: [],
            error: null
          })
        } else if (table === 'bookings' && !bookingsCalled) {
          bookingsCalled = true
          return Promise.resolve({
            data: [{ apartment_id: 'apt-confirmed-booked' }],
            error: null
          })
        }
        // For the main apartments query, return the chain
        return mockClient._mockChain
      })

      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: new Date('2023-11-07'),
        checkOut: new Date('2023-11-10'),
        guests: 1
      }

      await getAvailableApartments(filters)

      // Should exclude the confirmed booking
      expect(console.log).toHaveBeenCalledWith('🚫 Excluding', 1, 'unavailable apartments')
      expect(mockClient._mockChain.not).toHaveBeenCalledWith('id', 'in', '(apt-confirmed-booked)')
    })

    it('should show apartments for future dates even with pending bookings in past', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()

      // Set up gte to return empty arrays for availability/bookings checks
      mockClient._mockChain.gte.mockImplementation(() => {
        const table = mockClient._getCurrentTable()
        if (table === 'apartment_availability' || table === 'bookings') {
          return Promise.resolve({
            data: [],
            error: null
          })
        }
        // For the main apartments query, return the chain
        return mockClient._mockChain
      })

      // Mock the main apartments query to return an apartment
      mockClient._mockChain.order.mockResolvedValue({
        data: [createMockApartment()],
        error: null
      })

      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: new Date('2023-11-24'),
        checkOut: new Date('2023-11-27'),
        guests: 1
      }

      const result = await getAvailableApartments(filters)

      // Should return apartments for future dates
      expect(result).toHaveLength(1)
      expect(console.log).toHaveBeenCalledWith('📅 Checking availability for dates:', '2023-11-24', 'to', '2023-11-27')
    })

    it('should correctly build date overlap query for confirmed bookings', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockClient = createMockSupabaseClient()

      // Set up gte to return empty arrays
      mockClient.from().gte.mockImplementation(() => {
        return Promise.resolve({
          data: [],
          error: null
        })
      })

      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const checkIn = new Date('2023-11-24')
      const checkOut = new Date('2023-11-27')

      const filters: SearchFilters = {
        checkIn,
        checkOut,
        guests: 1
      }

      await getAvailableApartments(filters)

      // Verify the date overlap query is constructed correctly using lte and gte
      expect(mockClient.from().lte).toHaveBeenCalledWith('check_in', '2023-11-27')
      expect(mockClient.from().gte).toHaveBeenCalledWith('check_out', '2023-11-24')
    })
  })

  describe('Amenities filtering', () => {
    it('should filter apartments by single amenity', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockApartments = [
        {
          ...createMockApartment(),
          id: 'apt-1',
          characteristics: { wifi: true, kitchen: true, pool: false }
        },
        {
          ...createMockApartment(),
          id: 'apt-2',
          characteristics: { wifi: false, kitchen: true, pool: true }
        },
        {
          ...createMockApartment(),
          id: 'apt-3',
          characteristics: { wifi: true, kitchen: false, pool: true }
        }
      ]

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({ data: mockApartments, error: null })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 1,
        amenities: ['wifi']
      }

      const result = await getAvailableApartments(filters)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('apt-1')
      expect(result[1].id).toBe('apt-3')
      expect(console.log).toHaveBeenCalledWith('🔍 Filtered to', 2, 'apartments with selected amenities')
    })

    it('should filter apartments by multiple amenities', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockApartments = [
        {
          ...createMockApartment(),
          id: 'apt-1',
          characteristics: { wifi: true, kitchen: true, pool: true }
        },
        {
          ...createMockApartment(),
          id: 'apt-2',
          characteristics: { wifi: true, kitchen: false, pool: true }
        },
        {
          ...createMockApartment(),
          id: 'apt-3',
          characteristics: { wifi: true, kitchen: true, pool: false }
        }
      ]

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({ data: mockApartments, error: null })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 1,
        amenities: ['wifi', 'kitchen']
      }

      const result = await getAvailableApartments(filters)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('apt-1')
      expect(result[1].id).toBe('apt-3')
    })

    it('should return no apartments when none match all amenities', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockApartments = [
        {
          ...createMockApartment(),
          id: 'apt-1',
          characteristics: { wifi: true, kitchen: false, pool: false }
        },
        {
          ...createMockApartment(),
          id: 'apt-2',
          characteristics: { wifi: false, kitchen: true, pool: false }
        }
      ]

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({ data: mockApartments, error: null })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 1,
        amenities: ['wifi', 'kitchen', 'pool']
      }

      const result = await getAvailableApartments(filters)

      expect(result).toHaveLength(0)
    })

    it('should not filter when amenities array is empty', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockApartments = [
        createMockApartment(),
        { ...createMockApartment(), id: 'apt-2' }
      ]

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({ data: mockApartments, error: null })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 1,
        amenities: []
      }

      const result = await getAvailableApartments(filters)

      expect(result).toHaveLength(2)
      expect(console.log).not.toHaveBeenCalledWith(expect.stringContaining('Filtered to'))
    })

    it('should not filter when amenities is undefined', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockApartments = [
        createMockApartment(),
        { ...createMockApartment(), id: 'apt-2' }
      ]

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({ data: mockApartments, error: null })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 1,
        amenities: undefined
      }

      const result = await getAvailableApartments(filters)

      expect(result).toHaveLength(2)
    })

    it('should combine date and amenity filters', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockApartments = [
        {
          ...createMockApartment(),
          id: 'apt-1',
          characteristics: { wifi: true, kitchen: true }
        },
        {
          ...createMockApartment(),
          id: 'apt-2',
          characteristics: { wifi: false, kitchen: true }
        }
      ]

      const mockClient = createMockSupabaseClient()
      mockClient.from().select().eq().gte().not().order.mockResolvedValue({ 
        data: mockApartments, 
        error: null 
      })
      mockClient.from().select().eq().or.mockResolvedValue({ data: [], error: null })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: new Date('2023-06-01'),
        checkOut: new Date('2023-06-07'),
        guests: 2,
        amenities: ['wifi']
      }

      const result = await getAvailableApartments(filters)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('apt-1')
    })

    it('should handle amenities that do not exist in characteristics', async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const mockApartments = [
        {
          ...createMockApartment(),
          id: 'apt-1',
          characteristics: { wifi: true }
        }
      ]

      const mockClient = createMockSupabaseClient()
      mockClient.from().order.mockResolvedValue({ data: mockApartments, error: null })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 1,
        amenities: ['pool']
      }

      const result = await getAvailableApartments(filters)

      expect(result).toHaveLength(0)
    })
  })

  describe('Error handling edge cases', () => {
    it('should handle createApartment unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await createApartment({
        title: 'Test',
        description: 'Test',
        characteristics: {},
        price_per_night: 100,
        max_guests: 2,
        address: 'Test',
        images: [],
        contact_email: 'test@example.com',
        is_active: true,
        principal_image_index: 0
      })

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error creating apartment:', expect.any(Error))
    })

    it('should handle updateApartment unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await updateApartment('apt-123', { title: 'Updated' })

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('Error updating apartment:', expect.any(Error))
    })

    it('should handle deleteApartment unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await deleteApartment('apt-123')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error deleting apartment:', expect.any(Error))
    })

    it('should handle getApartmentAvailability unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getApartmentAvailability('apt-123')

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('Error fetching apartment availability:', expect.any(Error))
    })
  })
})