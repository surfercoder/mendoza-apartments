import { createClient } from '@/lib/supabase/client';
import { Booking } from '@/lib/types';

export async function createBooking(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
  try {
    console.log('🔄 Creating booking:', booking);

    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .insert([booking])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase booking error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return null;
    }

    console.log('✅ Booking created successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Unexpected error creating booking:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

export async function getAllBookings(): Promise<Booking[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        apartments (
          title,
          address
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching bookings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching bookings:', error);
    return [];
  }
}

export async function getBookingsByApartment(apartmentId: string): Promise<Booking[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('apartment_id', apartmentId)
      .order('check_in', { ascending: true });

    if (error) {
      console.error('❌ Error fetching apartment bookings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error fetching apartment bookings:', error);
    return [];
  }
}

export async function updateBookingStatus(bookingId: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<Booking | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating booking status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('❌ Error updating booking status:', error);
    return null;
  }
}

export async function deleteBooking(bookingId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error('❌ Error deleting booking:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error deleting booking:', error);
    return false;
  }
}
