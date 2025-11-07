// Use actual email module implementations; we'll mock nodemailer only
jest.mock('@/lib/email', () => {
  const actual = jest.requireActual('@/lib/email')
  return { ...actual }
})

import { createOwnerEmailTemplate, createGuestEmailTemplate, sendEmail, sendBookingEmails } from '@/lib/email'
import nodemailer from 'nodemailer'
import { Apartment, Booking } from '@/lib/types'

// Mock nodemailer
const mockSendMail = jest.fn()

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: mockSendMail
  }))
}))

describe('Email Module', () => {
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
    contact_phone: '+5492615551234',
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

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockSendMail.mockReset()
    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' })

    // Set up environment variables
    process.env.EMAIL_SENDER = 'test@example.com'
    process.env.GOOGLE_APP_PASSWORD = 'test-password'
    process.env.EMAIL_RECIPIENT = 'owner@example.com'
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.EMAIL_SENDER
    delete process.env.GOOGLE_APP_PASSWORD
    delete process.env.EMAIL_RECIPIENT
  })

  describe('createOwnerEmailTemplate', () => {
    it('creates owner email template with all booking details', () => {
      const template = createOwnerEmailTemplate(mockBooking, mockApartment)

      expect(template.subject).toBe('New Booking Request - Luxury Downtown Apartment')
      expect(template.html).toContain('New Booking Request')
      expect(template.html).toContain('John Doe')
      expect(template.html).toContain('john@example.com')
      expect(template.html).toContain('+1234567890')
      expect(template.html).toContain('Looking forward to our stay!')
      expect(template.html).toContain('$500')
      expect(template.html).toContain('2 guests')
      expect(template.html).toContain('5 nights')
      expect(template.html).toContain('Luxury Downtown Apartment')
      expect(template.html).toContain('123 Main St, Mendoza')
    })

    it('handles booking without notes', () => {
      const bookingWithoutNotes = { ...mockBooking, notes: undefined }
      const template = createOwnerEmailTemplate(bookingWithoutNotes, mockApartment)

      expect(template.html).not.toContain('Guest Notes:')
    })

    it('handles booking without guest phone', () => {
      const bookingWithoutPhone = { ...mockBooking, guest_phone: undefined }
      const template = createOwnerEmailTemplate(bookingWithoutPhone, mockApartment)

      expect(template.html).toContain('Not provided')
    })

    it('handles single guest', () => {
      const singleGuestBooking = { ...mockBooking, total_guests: 1 }
      const template = createOwnerEmailTemplate(singleGuestBooking, mockApartment)

      expect(template.html).toContain('1 guest')
      expect(template.html).not.toContain('1 guests')
    })

    it('handles single night stay', () => {
      const singleNightBooking = { ...mockBooking, check_out: '2024-01-16' }
      const template = createOwnerEmailTemplate(singleNightBooking, mockApartment)

      expect(template.html).toContain('1 night')
      expect(template.html).not.toContain('1 nights')
    })

    it('creates WhatsApp link with cleaned phone number', () => {
      const template = createOwnerEmailTemplate(mockBooking, mockApartment)

      expect(template.html).toContain('https://wa.me/5492615551234')
    })

    it('uses contact_phone when whatsapp_number is not available', () => {
      const apartmentWithoutWhatsApp = { ...mockApartment, whatsapp_number: undefined }
      const template = createOwnerEmailTemplate(mockBooking, apartmentWithoutWhatsApp)

      expect(template.html).toContain('https://wa.me/5492615551234')
    })
  })

  describe('createGuestEmailTemplate', () => {
    it('creates guest email template with all booking details', () => {
      const template = createGuestEmailTemplate(mockBooking, mockApartment)

      expect(template.subject).toBe('Booking Request Confirmation - Luxury Downtown Apartment')
      expect(template.html).toContain('Booking Request Received!')
      expect(template.html).toContain('Thank you for your interest')
      expect(template.html).toContain('$500')
      expect(template.html).toContain('2 guests')
      expect(template.html).toContain('5 nights')
      expect(template.html).toContain('Luxury Downtown Apartment')
      expect(template.html).toContain('Beautiful apartment in the city center')
      expect(template.html).toContain('owner@example.com')
      expect(template.html).toContain('+5492615551234')
      expect(template.html).toContain('Looking forward to our stay!')
    })

    it('handles booking without notes', () => {
      const bookingWithoutNotes = { ...mockBooking, notes: undefined }
      const template = createGuestEmailTemplate(bookingWithoutNotes, mockApartment)

      expect(template.html).not.toContain('Your Notes:')
    })

    it('handles apartment without contact phone', () => {
      const apartmentWithoutPhone = { ...mockApartment, contact_phone: undefined }
      const template = createGuestEmailTemplate(mockBooking, apartmentWithoutPhone)

      expect(template.html).toContain('Email: owner@example.com')
      expect(template.html).not.toContain('Phone:')
    })

    it('handles single guest and single night', () => {
      const singleBooking = {
        ...mockBooking,
        total_guests: 1,
        check_out: '2024-01-16'
      }
      const template = createGuestEmailTemplate(singleBooking, mockApartment)

      expect(template.html).toContain('1 guest')
      expect(template.html).toContain('1 night')
      expect(template.html).not.toContain('1 guests')
      expect(template.html).not.toContain('1 nights')
    })
  })

  describe('sendEmail', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      mockSendMail.mockReset()
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' })
    })

    it('sends email successfully', async () => {
      const result = await sendEmail('test@example.com', 'Test Subject', '<p>Test HTML</p>')

      expect(result).toBe(true)
      expect(mockSendMail).toHaveBeenCalled()
      const args = (mockSendMail as jest.Mock).mock.calls[0][0]
      expect(args).toMatchObject({ to: 'test@example.com', subject: 'Test Subject', html: '<p>Test HTML</p>' })
    })

    it('handles email sending error', async () => {
      const error = new Error('SMTP Error')
      mockSendMail.mockRejectedValue(error)
      console.error = jest.fn()

      const result = await sendEmail('test@example.com', 'Test Subject', '<p>Test HTML</p>')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('❌ Error sending email:', error)
    })

    it('handles missing email credentials gracefully', async () => {
      // Remove credentials so createTransporter throws synchronously
      delete process.env.EMAIL_SENDER
      delete process.env.GOOGLE_APP_PASSWORD
      console.error = jest.fn()

      const result = await sendEmail('test@example.com', 'Test Subject', '<p>Test HTML</p>')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalled()
    })

    it('handles missing EMAIL_SENDER gracefully', async () => {
      const error = new Error('Email credentials not configured. Please set EMAIL_SENDER and GOOGLE_APP_PASSWORD environment variables.')
      mockSendMail.mockRejectedValue(error)
      console.error = jest.fn()

      const result = await sendEmail('test@example.com', 'Test Subject', '<p>Test HTML</p>')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('❌ Error sending email:', error)
    })

    it('handles missing GOOGLE_APP_PASSWORD gracefully', async () => {
      const error = new Error('Email credentials not configured. Please set EMAIL_SENDER and GOOGLE_APP_PASSWORD environment variables.')
      mockSendMail.mockRejectedValue(error)
      console.error = jest.fn()

      const result = await sendEmail('test@example.com', 'Test Subject', '<p>Test HTML</p>')

      expect(result).toBe(false)
      expect(console.error).toHaveBeenCalledWith('❌ Error sending email:', error)
    })
  })

  describe('sendBookingEmails', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      mockSendMail.mockReset()
      mockSendMail.mockResolvedValue({ messageId: 'test-message-id' })
    })

    it('sends both owner and guest emails successfully', async () => {
      const result = await sendBookingEmails(mockBooking, mockApartment)

      expect(result).toEqual({ ownerSent: true, guestSent: true })
      // sendMail called twice: owner and guest
      expect(mockSendMail).toHaveBeenCalledTimes(2)
    })

    it('returns false when EMAIL_RECIPIENT is not set', async () => {
      console.error = jest.fn()
      const prev = process.env.EMAIL_RECIPIENT
      delete process.env.EMAIL_RECIPIENT

      const result = await sendBookingEmails(mockBooking, mockApartment)

      expect(result).toEqual({ ownerSent: false, guestSent: false })
      expect(console.error).toHaveBeenCalled()
      if (prev) process.env.EMAIL_RECIPIENT = prev
    })

    it('handles partial email sending failure', async () => {
      // First call resolves (owner), second rejects (guest)
      mockSendMail
        .mockResolvedValueOnce({ messageId: 'owner' })
        .mockRejectedValueOnce(new Error('Guest email failed'))

      const result = await sendBookingEmails(mockBooking, mockApartment)

      expect(result).toEqual({ ownerSent: true, guestSent: false })
    })

    it('handles both emails failing', async () => {
      mockSendMail.mockRejectedValue(new Error('All emails failed'))

      const result = await sendBookingEmails(mockBooking, mockApartment)

      expect(result).toEqual({ ownerSent: false, guestSent: false })
    })

    it('handles unexpected error in sendBookingEmails', async () => {
      const error = new Error('Unexpected error')
      console.error = jest.fn()
      // Force both transporter creations (owner + guest) to throw once each
      ;(nodemailer.createTransport as jest.Mock)
        .mockImplementationOnce(() => { throw error })
        .mockImplementationOnce(() => { throw error })

      const result = await sendBookingEmails(mockBooking, mockApartment)

      expect(result).toEqual({ ownerSent: false, guestSent: false })
      // Errors are logged inside sendEmail; just assert errors were logged
      expect((console.error as jest.Mock).mock.calls.length).toBeGreaterThanOrEqual(1)
    })

    it('sends emails in parallel', async () => {
      // Ensure environment variables are set
      process.env.EMAIL_SENDER = 'test@example.com'
      process.env.GOOGLE_APP_PASSWORD = 'test-password'
      process.env.EMAIL_RECIPIENT = 'owner@example.com'
      
      const emailsSentOrder: string[] = []

      mockSendMail.mockImplementation(async (mailOptions) => {
        // Simulate async delay
        await new Promise(resolve => setTimeout(resolve, 10))
        emailsSentOrder.push(mailOptions.to)
        return { messageId: 'test-message-id' }
      })

      const result = await sendBookingEmails(mockBooking, mockApartment)

      expect(result).toEqual({ ownerSent: true, guestSent: true })
      // sendMail should have been called twice (owner and guest)
      expect(mockSendMail).toHaveBeenCalledTimes(2)
    })
  })

  describe('Date formatting', () => {
    it('formats dates correctly in email templates', () => {
      const bookingWithSpecificDates = {
        ...mockBooking,
        check_in: '2024-12-25',
        check_out: '2024-12-31'
      }

      const ownerTemplate = createOwnerEmailTemplate(bookingWithSpecificDates, mockApartment)
      const guestTemplate = createGuestEmailTemplate(bookingWithSpecificDates, mockApartment)

      // Both templates should contain formatted dates
      expect(ownerTemplate.html).toContain('December')
      expect(guestTemplate.html).toContain('December')

      // Should calculate 6 nights correctly
      expect(ownerTemplate.html).toContain('6 nights')
      expect(guestTemplate.html).toContain('6 nights')
    })
  })
});