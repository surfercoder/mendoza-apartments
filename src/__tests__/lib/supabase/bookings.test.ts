import { createBooking, getAllBookings, getBookingsByApartment, updateBookingStatus, deleteBooking } from '@/lib/supabase/bookings'
import { Booking } from '@/lib/types'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock the client module
jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn()
}))

import { createClient } from '@/lib/supabase/client'

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('lib/supabase/bookings', () => {
  const originalConsole = console

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock console methods
    console.log = jest.fn()
    console.error = jest.fn()
  })

  afterAll(() => {
    console.log = originalConsole.log
    console.error = originalConsole.error
  })

  const createMockBooking = (): Booking => ({
    id: 'booking-123',
    apartment_id: 'apt-123',
    guest_name: 'John Doe',
    guest_email: 'john@example.com',
    guest_phone: '+1234567890',
    check_in: '2023-06-01',
    check_out: '2023-06-07',
    total_guests: 2,
    total_price: 600,
    status: 'confirmed',
    notes: 'Special requests',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  })

  const createMockSupabaseClient = () => {
    // Create a fresh mock chain for each test
    let isAfterDelete = false

    const mockChain = {
      select: jest.fn(),
      eq: jest.fn(),
      order: jest.fn(),
      single: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }

    // Configure chain methods to return the chain for method chaining
    mockChain.select.mockImplementation(() => mockChain)
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
      data: [createMockBooking()],
      error: null
    }))

    mockChain.single.mockImplementation(() => Promise.resolve({
      data: createMockBooking(),
      error: null
    }))

    return {
      from: jest.fn().mockReturnValue(mockChain)
    }
  }

  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newBooking = {
        apartment_id: 'apt-123',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        check_in: '2023-06-01',
        check_out: '2023-06-07',
        total_guests: 2,
        total_price: 600,
        status: 'pending' as const
      }

      const result = await createBooking(newBooking)

      expect(result?.id).toBe('booking-123')
      expect(mockClient.from).toHaveBeenCalledWith('bookings')
      expect(mockClient.from().insert).toHaveBeenCalledWith([newBooking])
      expect(console.log).toHaveBeenCalledWith('🔄 Creating booking:', newBooking)
      expect(console.log).toHaveBeenCalledWith('✅ Booking created successfully:', expect.any(Object))
    })

    it('should handle creation errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().insert().select().single.mockResolvedValue({
        data: null,
        error: {
          message: 'Insert failed',
          details: 'Database constraint violation',
          hint: 'Check required fields',
          code: '23505'
        }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newBooking = {
        apartment_id: 'apt-123',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        check_in: '2023-06-01',
        check_out: '2023-06-07',
        total_guests: 2,
        total_price: 600,
        status: 'pending' as const
      }

      const result = await createBooking(newBooking)

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('❌ Supabase booking error:', expect.objectContaining({
        message: 'Insert failed',
        details: 'Database constraint violation',
        hint: 'Check required fields',
        code: '23505'
      }))
    })

    it('should handle unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newBooking = {
        apartment_id: 'apt-123',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        check_in: '2023-06-01',
        check_out: '2023-06-07',
        total_guests: 2,
        total_price: 600,
        status: 'pending' as const
      }

      const result = await createBooking(newBooking)

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('❌ Unexpected error creating booking:', expect.any(Object))
    })

    it('should handle non-Error exceptions', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw 'String error'
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const newBooking = {
        apartment_id: 'apt-123',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        check_in: '2023-06-01',
        check_out: '2023-06-07',
        total_guests: 2,
        total_price: 600,
        status: 'pending' as const
      }

      const result = await createBooking(newBooking)

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('❌ Unexpected error creating booking:', expect.objectContaining({
        message: 'Unknown error'
      }))
    })
  })

  describe('getAllBookings', () => {
    it('should return all bookings with apartment details', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getAllBookings()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('booking-123')
      expect(mockClient.from).toHaveBeenCalledWith('bookings')
      expect(mockClient.from().select).toHaveBeenCalledWith(`
        *,
        apartments (
          title,
          address,
          whatsapp_number,
          contact_phone
        )
      `)
    })

    it('should handle query errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().select().order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getAllBookings()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Error fetching bookings:', expect.any(Object))
    })

    it('should handle unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getAllBookings()

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Error fetching bookings:', expect.any(Error))
    })
  })

  describe('getBookingsByApartment', () => {
    it('should return bookings for specific apartment', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getBookingsByApartment('apt-123')

      expect(result).toHaveLength(1)
      expect(result[0].apartment_id).toBe('apt-123')
      expect(mockClient.from().eq).toHaveBeenCalledWith('apartment_id', 'apt-123')
    })

    it('should order bookings by check-in date', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      await getBookingsByApartment('apt-123')

      expect(mockClient.from().order).toHaveBeenCalledWith('check_in', { ascending: true })
    })

    it('should handle query errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().select().eq().order.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await getBookingsByApartment('apt-123')

      expect(result).toEqual([])
      expect(console.error).toHaveBeenCalledWith('❌ Error fetching apartment bookings:', expect.any(Object))
    })
  })

  describe('updateBookingStatus', () => {
    it('should update booking status successfully', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await updateBookingStatus('booking-123', 'confirmed')

      expect(result?.status).toBe('confirmed')
      expect(mockClient.from().update).toHaveBeenCalledWith({ status: 'confirmed' })
      expect(mockClient.from().update().eq).toHaveBeenCalledWith('id', 'booking-123')
    })

    it('should handle all valid status values', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const statuses: Array<'pending' | 'confirmed' | 'cancelled'> = ['pending', 'confirmed', 'cancelled']

      for (const status of statuses) {
        await updateBookingStatus('booking-123', status)
        expect(mockClient.from().update).toHaveBeenCalledWith({ status })
      }
    })

    it('should handle update errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await updateBookingStatus('booking-123', 'confirmed')

      expect(result).toBeNull()
      expect(console.error).toHaveBeenCalledWith('❌ Error updating booking status:', expect.any(Object))
    })
  })

  describe('deleteBooking', () => {
    it('should delete booking successfully', async () => {
      const mockClient = createMockSupabaseClient()
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await deleteBooking('booking-123')

      expect(result).toBe(true)
      expect(mockClient.from().eq).toHaveBeenCalledWith('id', 'booking-123')
    })

    it('should handle delete errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from().delete().eq.mockResolvedValue({
        error: { message: 'Delete failed' }
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await deleteBooking('booking-123')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('❌ Error deleting booking:', expect.any(Object))
    })

    it('should handle unexpected errors', async () => {
      const mockClient = createMockSupabaseClient()
      mockClient.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })
      mockCreateClient.mockReturnValue(mockClient as unknown as SupabaseClient)

      const result = await deleteBooking('booking-123')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('❌ Error deleting booking:', expect.any(Error))
    })
  })
})