export interface Apartment {
  id: string;
  title: string;
  description: string;
  characteristics: {
    bedrooms?: number;
    bathrooms?: number;
    wifi?: boolean;
    kitchen?: boolean;
    air_conditioning?: boolean;
    parking?: boolean;
    pool?: boolean;
    balcony?: boolean;
    terrace?: boolean;
    garden?: boolean;
    bbq?: boolean;
    washing_machine?: boolean;
    mountain_view?: boolean;
    hot_water?: boolean;
    heating?: boolean;
    coffee_maker?: boolean;
    microwave?: boolean;
    oven?: boolean;
    refrigerator?: boolean;
    iron?: boolean;
    hair_dryer?: boolean;
    tv?: boolean;
    fire_extinguisher?: boolean;
    crib?: boolean;
    blackout_curtains?: boolean;
    bidet?: boolean;
    dishwasher?: boolean;
    single_floor?: boolean;
    long_term_available?: boolean;
    cleaning_service?: boolean;
  };
  price_per_night: number;
  max_guests: number;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  images: string[];
  principal_image_index: number;
  contact_email: string;
  contact_phone?: string;
  whatsapp_number?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApartmentAvailability {
  id: string;
  apartment_id: string;
  start_date: string;
  end_date: string;
  is_available: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  apartment_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  check_in: string;
  check_out: string;
  total_guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchFilters {
  checkIn: Date | undefined;
  checkOut: Date | undefined;
  guests: number;
}

export interface ApartmentFormData {
  title: string;
  description: string;
  characteristics: {
    bedrooms?: number;
    bathrooms?: number;
    wifi?: boolean;
    kitchen?: boolean;
    air_conditioning?: boolean;
    parking?: boolean;
    pool?: boolean;
    balcony?: boolean;
    terrace?: boolean;
    garden?: boolean;
    bbq?: boolean;
    washing_machine?: boolean;
    mountain_view?: boolean;
    hot_water?: boolean;
    heating?: boolean;
    coffee_maker?: boolean;
    microwave?: boolean;
    oven?: boolean;
    refrigerator?: boolean;
    iron?: boolean;
    hair_dryer?: boolean;
    tv?: boolean;
    fire_extinguisher?: boolean;
    crib?: boolean;
    blackout_curtains?: boolean;
    bidet?: boolean;
    dishwasher?: boolean;
    single_floor?: boolean;
    long_term_available?: boolean;
    cleaning_service?: boolean;
  };
  price_per_night: number;
  max_guests: number;
  address: string;
  latitude?: number;
  longitude?: number;
  google_maps_url?: string;
  images: string[];
  principal_image_index: number;
  contact_email: string;
  contact_phone?: string;
  whatsapp_number?: string;
  is_active: boolean;
}
