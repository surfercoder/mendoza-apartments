-- Create apartments table
CREATE TABLE apartments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  characteristics JSONB NOT NULL DEFAULT '{}', -- Store features like bedrooms, bathrooms, wifi, etc.
  price_per_night DECIMAL(10,2) NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 1,
  address TEXT NOT NULL,
  images TEXT[] DEFAULT '{}', -- Array of image URLs
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  whatsapp_number VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create apartment_availability table
CREATE TABLE apartment_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create bookings table (for tracking reservations)
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_guests INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, cancelled
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_booking_dates CHECK (check_out > check_in)
);

-- Create indexes for better performance
CREATE INDEX idx_apartments_is_active ON apartments(is_active);
CREATE INDEX idx_apartment_availability_apartment_id ON apartment_availability(apartment_id);
CREATE INDEX idx_apartment_availability_dates ON apartment_availability(start_date, end_date);
CREATE INDEX idx_bookings_apartment_id ON bookings(apartment_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON apartments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_apartment_availability_updated_at BEFORE UPDATE ON apartment_availability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to apartments and availability
CREATE POLICY "Public can read apartments" ON apartments FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read apartment availability" ON apartment_availability FOR SELECT USING (true);

-- Admin policies (authenticated users can do everything)
CREATE POLICY "Authenticated users can manage apartments" ON apartments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage availability" ON apartment_availability FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');

-- Insert some sample data
INSERT INTO apartments (title, description, characteristics, price_per_night, max_guests, address, contact_email, contact_phone, whatsapp_number) VALUES
(
  'Cozy Downtown Apartment',
  'Beautiful apartment in the heart of Mendoza, perfect for couples or solo travelers. Walking distance to restaurants, bars, and main attractions.',
  '{"bedrooms": 1, "bathrooms": 1, "wifi": true, "kitchen": true, "air_conditioning": true, "parking": false, "pool": false, "balcony": true}',
  85.00,
  2,
  'San Martín 1234, Mendoza Capital',
  'florcaliri@gmail.com',
  '+5492616540387',
  '+5492616540387'
),
(
  'Luxury Penthouse with Pool',
  'Stunning penthouse with panoramic views of the Andes mountains. Features a private pool, spacious terrace, and premium amenities.',
  '{"bedrooms": 3, "bathrooms": 2, "wifi": true, "kitchen": true, "air_conditioning": true, "parking": true, "pool": true, "balcony": true, "terrace": true, "mountain_view": true}',
  250.00,
  6,
  'Av. Las Heras 567, Mendoza Capital',
  'florcaliri@gmail.com',
  '+5492616540387',
  '+5492616540387'
),
(
  'Family-Friendly House',
  'Spacious house perfect for families visiting Mendoza. Close to parks and family attractions, with a private garden and BBQ area.',
  '{"bedrooms": 4, "bathrooms": 3, "wifi": true, "kitchen": true, "air_conditioning": true, "parking": true, "pool": false, "garden": true, "bbq": true, "washing_machine": true}',
  180.00,
  8,
  'Barrio Bombal, Mendoza',
  'florcaliri@gmail.com',
  '+5492616540387',
  '+5492616540387'
);
