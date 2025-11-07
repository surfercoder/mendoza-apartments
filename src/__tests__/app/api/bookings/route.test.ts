/**
 * @jest-environment node
 */

// Mock window for Node.js environment
if (typeof global !== 'undefined') {
  (global as any).window = {
    location: { origin: 'https://test.com' }
  };
}

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/bookings/route';
import { createBooking } from '@/lib/supabase/bookings';
import { getApartmentById } from '@/lib/supabase/apartments';
import { sendBookingEmails } from '@/lib/email';

jest.mock('@/lib/supabase/bookings');
jest.mock('@/lib/supabase/apartments');
jest.mock('@/lib/email');

const mockCreateBooking = createBooking as jest.MockedFunction<typeof createBooking>;
const mockGetApartmentById = getApartmentById as jest.MockedFunction<typeof getApartmentById>;
const mockSendBookingEmails = sendBookingEmails as jest.MockedFunction<typeof sendBookingEmails>;

describe('/api/bookings', () => {
  const validBookingData = {
    apartment_id: 'apt-123',
    guest_name: 'John Doe',
    guest_email: 'john@example.com',
    guest_phone: '+1234567890',
    check_in: '2024-01-01',
    check_out: '2024-01-05',
    total_guests: 2,
    total_price: 500,
    notes: 'Test booking'
  };

  const mockBooking = {
    id: 'booking-123',
    ...validBookingData,
    status: 'pending' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockApartment = {
    id: 'apt-123',
    title: 'Test Apartment',
    description: 'A test apartment',
    characteristics: {
      bedrooms: 2,
      bathrooms: 1,
      wifi: true,
      kitchen: true
    },
    price_per_night: 100,
    max_guests: 4,
    address: 'Test Location',
    images: [],
    principal_image_index: 0,
    contact_email: 'owner@example.com',
    contact_phone: '+1234567890',
    whatsapp_number: '+1234567890',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('creates a booking successfully', async () => {
      mockCreateBooking.mockResolvedValue(mockBooking);
      mockGetApartmentById.mockResolvedValue(mockApartment);
      mockSendBookingEmails.mockResolvedValue({
        ownerSent: true,
        guestSent: true
      });

      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.booking).toEqual(mockBooking);
      expect(data.emails).toEqual({
        ownerSent: true,
        guestSent: true
      });

      expect(mockCreateBooking).toHaveBeenCalledWith({
        apartment_id: validBookingData.apartment_id,
        guest_name: validBookingData.guest_name,
        guest_email: validBookingData.guest_email,
        guest_phone: validBookingData.guest_phone,
        check_in: validBookingData.check_in,
        check_out: validBookingData.check_out,
        total_guests: validBookingData.total_guests,
        total_price: validBookingData.total_price,
        status: 'pending',
        notes: validBookingData.notes
      });

      expect(mockGetApartmentById).toHaveBeenCalledWith(mockBooking.apartment_id);
      expect(mockSendBookingEmails).toHaveBeenCalledWith(mockBooking, mockApartment);
    });

    it('creates a booking without notes', async () => {
      const { notes, ...bookingDataWithoutNotes } = validBookingData;

      mockCreateBooking.mockResolvedValue(mockBooking);
      mockGetApartmentById.mockResolvedValue(mockApartment);
      mockSendBookingEmails.mockResolvedValue({
        ownerSent: true,
        guestSent: true
      });

      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingDataWithoutNotes)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      expect(mockCreateBooking).toHaveBeenCalledWith({
        apartment_id: validBookingData.apartment_id,
        guest_name: validBookingData.guest_name,
        guest_email: validBookingData.guest_email,
        guest_phone: validBookingData.guest_phone,
        check_in: validBookingData.check_in,
        check_out: validBookingData.check_out,
        total_guests: validBookingData.total_guests,
        total_price: validBookingData.total_price,
        status: 'pending',
        notes: undefined
      });
    });

    it('returns 400 for missing required fields', async () => {
      const requiredFields = [
        'apartment_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'check_in',
        'check_out',
        'total_guests',
        'total_price'
      ];

      for (const field of requiredFields) {
        const incompleteData = { ...validBookingData };
        delete incompleteData[field as keyof typeof incompleteData];

        const request = new NextRequest('http://localhost/api/bookings', {
          method: 'POST',
          body: JSON.stringify(incompleteData)
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe(`Missing required field: ${field}`);
      }
    });

    it('returns 500 when booking creation fails', async () => {
      mockCreateBooking.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create booking');
    });

    it('returns 404 when apartment is not found', async () => {
      mockCreateBooking.mockResolvedValue(mockBooking);
      mockGetApartmentById.mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Apartment not found');
    });

    it('handles JSON parsing errors', async () => {
      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: 'invalid-json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('handles createBooking throwing an error', async () => {
      mockCreateBooking.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('handles getApartmentById throwing an error', async () => {
      mockCreateBooking.mockResolvedValue(mockBooking);
      mockGetApartmentById.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('handles sendBookingEmails throwing an error but still returns success', async () => {
      mockCreateBooking.mockResolvedValue(mockBooking);
      mockGetApartmentById.mockResolvedValue(mockApartment);
      mockSendBookingEmails.mockRejectedValue(new Error('Email service error'));

      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify(validBookingData)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });
});