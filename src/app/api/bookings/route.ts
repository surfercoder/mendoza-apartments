import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getAllBookings, updateBookingStatus } from '@/lib/supabase/bookings';
import { getApartmentById } from '@/lib/supabase/apartments';
import { sendBookingEmails } from '@/lib/email';

export async function GET() {
  try {
    const bookings = await getAllBookings();
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
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
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the booking
    const bookingData = {
      apartment_id: body.apartment_id,
      guest_name: body.guest_name,
      guest_email: body.guest_email,
      guest_phone: body.guest_phone,
      check_in: body.check_in,
      check_out: body.check_out,
      total_guests: body.total_guests,
      total_price: body.total_price,
      status: 'pending' as const,
      notes: body.notes || undefined,
    };

    const booking = await createBooking(bookingData);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Get apartment details for email
    const apartment = await getApartmentById(booking.apartment_id);
    
    if (!apartment) {
      console.error('Apartment not found for booking:', booking.apartment_id);
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      );
    }

    // Send emails
    const emailResults = await sendBookingEmails(booking, apartment);
    
    console.log('Email sending results:', emailResults);

    return NextResponse.json({
      success: true,
      booking,
      emails: emailResults
    });

  } catch (error) {
    console.error('Error in booking API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id and status' },
        { status: 400 }
      );
    }

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updatedBooking = await updateBookingStatus(id, status);

    if (!updatedBooking) {
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
