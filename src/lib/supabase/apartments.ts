import { createClient } from '@/lib/supabase/client';
import { Apartment, ApartmentAvailability, SearchFilters } from '@/lib/types';

export async function getAvailableApartments(filters: SearchFilters): Promise<Apartment[]> {
  try {
    // Check environment variables first
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error('❌ Missing Supabase environment variables!');
      console.error('NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? '✅ Set' : '❌ Missing');
      return [];
    }

    const supabase = createClient();

    let query = supabase
      .from('apartments')
      .select('*')
      .eq('is_active', true)
      .gte('max_guests', filters.guests || 1);

    // If dates are provided, check availability
    if (filters.checkIn && filters.checkOut) {
      const checkInStr = filters.checkIn.toISOString().split('T')[0];
      const checkOutStr = filters.checkOut.toISOString().split('T')[0];
      
      console.log('📅 Checking availability for dates:', checkInStr, 'to', checkOutStr);

      // Get apartments that don't have conflicting bookings or unavailable periods
      const { data: unavailableApartments, error: availabilityError } = await supabase
        .from('apartment_availability')
        .select('apartment_id')
        .eq('is_available', false)
        .lte('start_date', checkOutStr)
        .gte('end_date', checkInStr);
        
      if (availabilityError) {
        console.warn('⚠️ Error checking availability (table may not exist yet):', availabilityError.message);
      }

      // Only exclude apartments with CONFIRMED bookings
      // Pending bookings are just requests and should not block availability
      const { data: bookedApartments, error: bookingsError } = await supabase
        .from('bookings')
        .select('apartment_id')
        .eq('status', 'confirmed')
        .lte('check_in', checkOutStr)
        .gte('check_out', checkInStr);
        
      if (bookingsError) {
        console.warn('⚠️ Error checking bookings (table may not exist yet):', bookingsError.message);
      }

      const excludeIds = [
        ...(unavailableApartments?.map(item => item.apartment_id) || []),
        ...(bookedApartments?.map(item => item.apartment_id) || [])
      ];

      if (excludeIds.length > 0) {
        console.log('🚫 Excluding', excludeIds.length, 'unavailable apartments');
        query = query.not('id', 'in', `(${excludeIds.join(',')})`);
      }
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    // Filter by amenities if provided
    let filteredData = data || [];
    if (filters.amenities && filters.amenities.length > 0) {
      filteredData = filteredData.filter(apartment => {
        // Check if apartment has all selected amenities
        return filters.amenities!.every(amenity => {
          const hasAmenity = apartment.characteristics[amenity as keyof typeof apartment.characteristics];
          return hasAmenity === true;
        });
      });
      console.log('🔍 Filtered to', filteredData.length, 'apartments with selected amenities');
    }

    console.log('✅ Found', filteredData.length, 'available apartments');
    return filteredData;
  } catch (error) {
    console.error('❌ Unexpected error fetching available apartments:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

export async function getApartmentById(id: string): Promise<Apartment | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching apartment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching apartment by id:', error);
    return null;
  }
}

export async function getAllApartments(): Promise<Apartment[]> {
  try {
    // Check environment variables first
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ Missing Supabase environment variables!');
      console.error('NEXT_PUBLIC_SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', key ? '✅ Set' : '❌ Missing');
      return [];
    }

    console.log('🔄 Fetching apartments from Supabase...');

    const supabase = createClient();
    const { data, error } = await supabase
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase query error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return [];
    }

    console.log('✅ Successfully fetched', data?.length || 0, 'apartments');
    return data || [];
  } catch (error) {
    console.error('❌ Unexpected error fetching apartments:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return [];
  }
}

export async function createApartment(apartment: Omit<Apartment, 'id' | 'created_at' | 'updated_at'>): Promise<Apartment | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('apartments')
      .insert([apartment])
      .select()
      .single();

    if (error) {
      console.error('Error creating apartment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating apartment:', error);
    return null;
  }
}

export async function updateApartment(id: string, updates: Partial<Apartment>): Promise<Apartment | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('apartments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating apartment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error updating apartment:', error);
    return null;
  }
}

export async function deleteApartment(id: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('apartments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting apartment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting apartment:', error);
    return false;
  }
}

export async function getApartmentAvailability(apartmentId: string): Promise<ApartmentAvailability[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('apartment_availability')
      .select('*')
      .eq('apartment_id', apartmentId)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Error fetching apartment availability:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching apartment availability:', error);
    return [];
  }
}

export async function createAvailabilityPeriod(availability: Omit<ApartmentAvailability, 'id' | 'created_at' | 'updated_at'>): Promise<ApartmentAvailability | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('apartment_availability')
      .insert([availability])
      .select()
      .single();

    if (error) {
      console.error('Error creating availability period:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating availability period:', error);
    return null;
  }
}
