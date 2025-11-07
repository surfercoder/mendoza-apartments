import {
  generateWhatsAppUrl,
  openWhatsAppChat,
  createWhatsAppButton
} from '@/lib/whatsapp'
import { Apartment, Booking } from '@/lib/types'

describe('WhatsApp Module', () => {
  const mockApartment: Apartment = {
    id: 'apt-123',
    title: 'Luxury Downtown Apartment',
    description: 'Beautiful apartment in the city center',
    address: '123 Main St, Mendoza',
    price_per_night: 100,
    max_guests: 4,
    is_active: true,
    images: ['https://example.com/image1.jpg'],
    principal_image_index: 0,
    contact_email: 'owner@example.com',
    contact_phone: '+54 9 261 555-1234',
    whatsapp_number: '+5492615551234',
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

  const mockBooking: Booking = {
    id: 'booking-123',
    apartment_id: 'apt-123',
    guest_name: 'John Doe',
    guest_email: 'john@example.com',
    guest_phone: '+1234567890',
    check_in: '2024-01-15',
    check_out: '2024-01-20',
    total_guests: 2,
    total_price: 500,
    status: 'pending',
    notes: 'Looking forward to our stay!',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})

    // Mock window.open
    Object.defineProperty(window, 'open', {
      value: jest.fn(),
      writable: true
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('generateWhatsAppUrl', () => {
    it('generates WhatsApp URL with booking details', () => {
      const url = generateWhatsAppUrl(mockApartment, mockBooking)

      expect(url).toContain('https://wa.me/5492615551234')
      expect(url).toContain('Luxury%20Downtown%20Apartment')
      expect(url).toContain('5%20nights')
      expect(url).toContain('2%20guests')
      expect(url).toContain('%24500')
    })

    it('generates WhatsApp URL without booking details', () => {
      const url = generateWhatsAppUrl(mockApartment)

      expect(url).toContain('https://wa.me/5492615551234')
      expect(url).toContain('Luxury%20Downtown%20Apartment')
      expect(url).toContain('more%20information%20about%20availability')
      expect(url).not.toContain('nights')
      expect(url).not.toContain('guests')
    })

    it('cleans phone number correctly', () => {
      const apartmentWithFormattedPhone = {
        ...mockApartment,
        whatsapp_number: '+54 (9) 261-555-1234'
      }

      const url = generateWhatsAppUrl(apartmentWithFormattedPhone)

      expect(url).toContain('https://wa.me/5492615551234')
    })

    it('falls back to contact_phone when whatsapp_number is not available', () => {
      const apartmentWithoutWhatsApp = {
        ...mockApartment,
        whatsapp_number: undefined,
        contact_phone: '+54 261 555-9999'
      }

      const url = generateWhatsAppUrl(apartmentWithoutWhatsApp)

      expect(url).toContain('https://wa.me/542615559999')
    })

    it('returns empty string when no phone number is available', () => {
      const apartmentWithoutPhone = {
        ...mockApartment,
        whatsapp_number: undefined,
        contact_phone: undefined
      }

      const url = generateWhatsAppUrl(apartmentWithoutPhone)

      expect(url).toBe('')
      expect(console.warn).toHaveBeenCalledWith(
        'No WhatsApp or contact phone number available for apartment:',
        'apt-123'
      )
    })

    it('handles single guest correctly', () => {
      const singleGuestBooking = { ...mockBooking, total_guests: 1 }
      const url = generateWhatsAppUrl(mockApartment, singleGuestBooking)

      expect(url).toContain('1%20guest')
      expect(url).not.toContain('1%20guests')
    })

    it('handles multiple guests correctly', () => {
      const multipleGuestBooking = { ...mockBooking, total_guests: 4 }
      const url = generateWhatsAppUrl(mockApartment, multipleGuestBooking)

      expect(url).toContain('4%20guests')
    })

    it('calculates nights correctly', () => {
      const longStayBooking = {
        ...mockBooking,
        check_in: '2024-01-01',
        check_out: '2024-01-08'
      }
      const url = generateWhatsAppUrl(mockApartment, longStayBooking)

      expect(url).toContain('7%20nights')
    })

    it('handles single night stay', () => {
      const singleNightBooking = {
        ...mockBooking,
        check_in: '2024-01-15',
        check_out: '2024-01-16'
      }
      const url = generateWhatsAppUrl(mockApartment, singleNightBooking)

      expect(url).toContain('1%20nights')
    })

    it('formats dates correctly in message', () => {
      const specificDateBooking = {
        ...mockBooking,
        check_in: '2024-12-25',
        check_out: '2024-12-31'
      }
      const url = generateWhatsAppUrl(mockApartment, specificDateBooking)

      expect(url).toContain('December')
    })

    it('encodes special characters in apartment title', () => {
      const apartmentWithSpecialChars = {
        ...mockApartment,
        title: 'Apartment & Suite - "Luxury" (Downtown)'
      }
      const url = generateWhatsAppUrl(apartmentWithSpecialChars)

      expect(url).toContain('Apartment%20%26%20Suite%20-%20%22Luxury%22%20(Downtown)')
    })

    it('handles empty contact phone gracefully', () => {
      const apartmentWithEmptyPhone = {
        ...mockApartment,
        whatsapp_number: '',
        contact_phone: ''
      }

      const url = generateWhatsAppUrl(apartmentWithEmptyPhone)

      expect(url).toBe('')
      expect(console.warn).toHaveBeenCalled()
    })
  })

  describe('openWhatsAppChat', () => {
    it('opens WhatsApp chat in new window with booking', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null)

      openWhatsAppChat(mockApartment, mockBooking)

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/5492615551234'),
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('opens WhatsApp chat in new window without booking', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null)

      openWhatsAppChat(mockApartment)

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/5492615551234'),
        '_blank',
        'noopener,noreferrer'
      )
    })

    it('does not open window when no phone number is available', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null)
      const apartmentWithoutPhone = {
        ...mockApartment,
        whatsapp_number: undefined,
        contact_phone: undefined
      }

      openWhatsAppChat(apartmentWithoutPhone)

      expect(mockOpen).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith(
        'Unable to generate WhatsApp URL - no phone number available'
      )
    })

    it('handles window.open failure gracefully', () => {
      const mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null)

      expect(() => openWhatsAppChat(mockApartment)).not.toThrow()
      expect(mockOpen).toHaveBeenCalled()
    })
  })

  describe('createWhatsAppButton', () => {
    it('creates WhatsApp button HTML with booking', () => {
      const buttonHtml = createWhatsAppButton(mockApartment, mockBooking)

      expect(buttonHtml).toContain('href="https://wa.me/5492615551234')
      expect(buttonHtml).toContain('target="_blank"')
      expect(buttonHtml).toContain('rel="noopener noreferrer"')
      expect(buttonHtml).toContain('class="whatsapp-button"')
      expect(buttonHtml).toContain('💬 Contact on WhatsApp')
      expect(buttonHtml).toContain('background: #25d366')
      expect(buttonHtml).toContain('color: white')
      expect(buttonHtml).toContain('Luxury%20Downtown%20Apartment')
    })

    it('creates WhatsApp button HTML without booking', () => {
      const buttonHtml = createWhatsAppButton(mockApartment)

      expect(buttonHtml).toContain('href="https://wa.me/5492615551234')
      expect(buttonHtml).toContain('💬 Contact on WhatsApp')
      expect(buttonHtml).toContain('more%20information%20about%20availability')
    })

    it('uses custom className when provided', () => {
      const buttonHtml = createWhatsAppButton(mockApartment, mockBooking, 'custom-button-class')

      expect(buttonHtml).toContain('class="custom-button-class"')
      expect(buttonHtml).not.toContain('class="whatsapp-button"')
    })

    it('returns empty string when no phone number is available', () => {
      const apartmentWithoutPhone = {
        ...mockApartment,
        whatsapp_number: undefined,
        contact_phone: undefined
      }

      const buttonHtml = createWhatsAppButton(apartmentWithoutPhone)

      expect(buttonHtml).toBe('')
    })

    it('includes hover effects in style', () => {
      const buttonHtml = createWhatsAppButton(mockApartment)

      expect(buttonHtml).toContain('onmouseover="this.style.backgroundColor=\'#128c7e\'"')
      expect(buttonHtml).toContain('onmouseout="this.style.backgroundColor=\'#25d366\'"')
    })

    it('includes proper styling attributes', () => {
      const buttonHtml = createWhatsAppButton(mockApartment)

      expect(buttonHtml).toContain('padding: 12px 24px')
      expect(buttonHtml).toContain('border-radius: 6px')
      expect(buttonHtml).toContain('text-decoration: none')
      expect(buttonHtml).toContain('display: inline-block')
      expect(buttonHtml).toContain('font-weight: bold')
      expect(buttonHtml).toContain('transition: background-color 0.3s ease')
    })

    it('creates valid HTML structure', () => {
      const buttonHtml = createWhatsAppButton(mockApartment, mockBooking)

      // Check that it starts and ends with anchor tag (allowing for multiline)
      // Use [\s\S]* instead of the 's' (dotAll) flag for broader TS targets
      expect(buttonHtml.trim()).toMatch(/^<a\s+[\s\S]*>[\s\S]*<\/a>$/)

      // Check that href attribute is properly quoted
      expect(buttonHtml).toMatch(/href="[^"]*"/)

      // Check that style attribute is properly quoted
      expect(buttonHtml).toMatch(/style="[^"]*"/)
    })

    it('handles special characters in button content', () => {
      const apartmentWithSpecialTitle = {
        ...mockApartment,
        title: 'Apartment "Special" & Unique'
      }

      const buttonHtml = createWhatsAppButton(apartmentWithSpecialTitle)

      // Should properly encode the URL but the button text remains constant
      expect(buttonHtml).toContain('💬 Contact on WhatsApp')
      expect(buttonHtml).toContain('Apartment%20%22Special%22%20%26%20Unique')
    })
  })

  describe('Edge Cases', () => {
    it('handles apartment with null phone numbers', () => {
      const apartmentWithNullPhone = {
        ...mockApartment,
        whatsapp_number: null as any,
        contact_phone: null as any
      }

      const url = generateWhatsAppUrl(apartmentWithNullPhone)
      expect(url).toBe('')
    })

    it('handles booking with past dates', () => {
      const pastBooking = {
        ...mockBooking,
        check_in: '2020-01-01',
        check_out: '2020-01-05'
      }

      const url = generateWhatsAppUrl(mockApartment, pastBooking)
      expect(url).toContain('https://wa.me/5492615551234')
      expect(url).toContain('4%20nights')
    })

    it('handles booking with same check-in and check-out dates', () => {
      const sameDayBooking = {
        ...mockBooking,
        check_in: '2024-01-15',
        check_out: '2024-01-15'
      }

      const url = generateWhatsAppUrl(mockApartment, sameDayBooking)
      expect(url).toContain('0%20nights')
    })

    it('handles very long apartment titles', () => {
      const apartmentWithLongTitle = {
        ...mockApartment,
        title: 'A'.repeat(200)
      }

      const url = generateWhatsAppUrl(apartmentWithLongTitle)
      expect(url).toContain('https://wa.me/5492615551234')
      expect(url.length).toBeGreaterThan(100)
    })

    it('handles international phone number formats', () => {
      const apartmentWithIntlPhone = {
        ...mockApartment,
        whatsapp_number: '+1 (555) 123-4567'
      }

      const url = generateWhatsAppUrl(apartmentWithIntlPhone)
      expect(url).toContain('https://wa.me/15551234567')
    })
  })
});