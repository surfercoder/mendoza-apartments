import type {
  Apartment,
  ApartmentAvailability,
  Booking,
  SearchFilters,
  ApartmentFormData
} from '@/lib/types'

describe('lib/types', () => {
  describe('Apartment type', () => {
    it('should have all required properties', () => {
      const apartment: Apartment = {
        id: 'test-id',
        title: 'Test Apartment',
        description: 'A test apartment',
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
          bbq: true,
          washing_machine: true,
          mountain_view: false
        },
        price_per_night: 100,
        max_guests: 4,
        address: '123 Test St',
        images: ['image1.jpg', 'image2.jpg'],
        contact_email: 'test@example.com',
        contact_phone: '+1234567890',
        whatsapp_number: '+1234567890',
        is_active: true,
        principal_image_index: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(apartment.id).toBe('test-id')
      expect(apartment.title).toBe('Test Apartment')
      expect(apartment.characteristics.bedrooms).toBe(2)
      expect(apartment.characteristics.wifi).toBe(true)
      expect(apartment.price_per_night).toBe(100)
      expect(apartment.max_guests).toBe(4)
      expect(apartment.is_active).toBe(true)
    })

    it('should allow optional characteristics', () => {
      const apartment: Apartment = {
        id: 'test-id',
        title: 'Test Apartment',
        description: 'A test apartment',
        characteristics: {}, // All characteristics are optional
        price_per_night: 100,
        max_guests: 4,
        address: '123 Test St',
        images: [],
        contact_email: 'test@example.com',
        is_active: true,
        principal_image_index: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(apartment.characteristics).toEqual({})
    })

    it('should allow optional contact fields', () => {
      const apartment: Apartment = {
        id: 'test-id',
        title: 'Test Apartment',
        description: 'A test apartment',
        characteristics: {},
        price_per_night: 100,
        max_guests: 4,
        address: '123 Test St',
        images: [],
        contact_email: 'test@example.com',
        // contact_phone and whatsapp_number are optional
        is_active: true,
        principal_image_index: 0,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(apartment.contact_phone).toBeUndefined()
      expect(apartment.whatsapp_number).toBeUndefined()
    })
  })

  describe('ApartmentAvailability type', () => {
    it('should have all required properties', () => {
      const availability: ApartmentAvailability = {
        id: 'availability-id',
        apartment_id: 'apartment-id',
        start_date: '2023-01-01',
        end_date: '2023-01-07',
        is_available: true,
        notes: 'Available for booking',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(availability.apartment_id).toBe('apartment-id')
      expect(availability.is_available).toBe(true)
      expect(availability.notes).toBe('Available for booking')
    })

    it('should allow optional notes field', () => {
      const availability: ApartmentAvailability = {
        id: 'availability-id',
        apartment_id: 'apartment-id',
        start_date: '2023-01-01',
        end_date: '2023-01-07',
        is_available: false,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(availability.notes).toBeUndefined()
    })
  })

  describe('Booking type', () => {
    it('should have all required properties', () => {
      const booking: Booking = {
        id: 'booking-id',
        apartment_id: 'apartment-id',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        guest_phone: '+1234567890',
        check_in: '2023-01-01',
        check_out: '2023-01-07',
        total_guests: 2,
        total_price: 600,
        status: 'confirmed',
        notes: 'Special requests',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(booking.guest_name).toBe('John Doe')
      expect(booking.status).toBe('confirmed')
      expect(booking.total_guests).toBe(2)
      expect(booking.total_price).toBe(600)
    })

    it('should accept all valid status values', () => {
      const statuses: Booking['status'][] = ['pending', 'confirmed', 'cancelled']

      statuses.forEach(status => {
        const booking: Booking = {
          id: 'booking-id',
          apartment_id: 'apartment-id',
          guest_name: 'John Doe',
          guest_email: 'john@example.com',
          check_in: '2023-01-01',
          check_out: '2023-01-07',
          total_guests: 2,
          total_price: 600,
          status,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }

        expect(booking.status).toBe(status)
      })
    })

    it('should allow optional fields', () => {
      const booking: Booking = {
        id: 'booking-id',
        apartment_id: 'apartment-id',
        guest_name: 'John Doe',
        guest_email: 'john@example.com',
        check_in: '2023-01-01',
        check_out: '2023-01-07',
        total_guests: 2,
        total_price: 600,
        status: 'pending',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z'
      }

      expect(booking.guest_phone).toBeUndefined()
      expect(booking.notes).toBeUndefined()
    })
  })

  describe('SearchFilters type', () => {
    it('should allow all undefined values', () => {
      const filters: SearchFilters = {
        checkIn: undefined,
        checkOut: undefined,
        guests: 1
      }

      expect(filters.checkIn).toBeUndefined()
      expect(filters.checkOut).toBeUndefined()
      expect(filters.guests).toBe(1)
    })

    it('should accept Date objects for check-in and check-out', () => {
      const checkIn = new Date('2023-01-01')
      const checkOut = new Date('2023-01-07')

      const filters: SearchFilters = {
        checkIn,
        checkOut,
        guests: 2
      }

      expect(filters.checkIn).toBe(checkIn)
      expect(filters.checkOut).toBe(checkOut)
      expect(filters.guests).toBe(2)
    })
  })

  describe('ApartmentFormData type', () => {
    it('should have all required properties', () => {
      const formData: ApartmentFormData = {
        title: 'New Apartment',
        description: 'A new apartment',
        characteristics: {
          bedrooms: 3,
          bathrooms: 2,
          wifi: true
        },
        price_per_night: 150,
        max_guests: 6,
        address: '456 New St',
        images: ['new-image1.jpg'],
        contact_email: 'owner@example.com',
        contact_phone: '+1234567890',
        whatsapp_number: '+1234567890',
        is_active: true,
        principal_image_index: 0
      }

      expect(formData.title).toBe('New Apartment')
      expect(formData.characteristics.bedrooms).toBe(3)
      expect(formData.price_per_night).toBe(150)
      expect(formData.is_active).toBe(true)
    })

    it('should allow optional characteristics', () => {
      const formData: ApartmentFormData = {
        title: 'New Apartment',
        description: 'A new apartment',
        characteristics: {
          wifi: true
          // Other characteristics are optional
        },
        price_per_night: 150,
        max_guests: 6,
        address: '456 New St',
        images: [],
        contact_email: 'owner@example.com',
        is_active: true,
        principal_image_index: 0
      }

      expect(formData.characteristics.wifi).toBe(true)
      expect(formData.characteristics.bedrooms).toBeUndefined()
    })

    it('should allow optional contact fields', () => {
      const formData: ApartmentFormData = {
        title: 'New Apartment',
        description: 'A new apartment',
        characteristics: {},
        price_per_night: 150,
        max_guests: 6,
        address: '456 New St',
        images: [],
        contact_email: 'owner@example.com',
        is_active: true,
        principal_image_index: 0
      }

      expect(formData.contact_phone).toBeUndefined()
      expect(formData.whatsapp_number).toBeUndefined()
    })
  })
})