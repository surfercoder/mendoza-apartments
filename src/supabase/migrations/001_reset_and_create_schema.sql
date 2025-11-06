-- =====================================================
-- MIGRATION 001: RESET AND CREATE COMPLETE SCHEMA
-- =====================================================
-- This migration drops all existing data and recreates
-- the complete database schema from scratch.
-- WARNING: This will DELETE ALL DATA!
-- =====================================================

-- Drop existing policies first (to avoid dependency issues)
DROP POLICY IF EXISTS "Public can read apartments" ON apartments;
DROP POLICY IF EXISTS "Public can read apartment availability" ON apartment_availability;
DROP POLICY IF EXISTS "Authenticated users can manage apartments" ON apartments;
DROP POLICY IF EXISTS "Authenticated users can manage availability" ON apartment_availability;
DROP POLICY IF EXISTS "Authenticated users can manage bookings" ON bookings;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_apartments_updated_at ON apartments;
DROP TRIGGER IF EXISTS update_apartment_availability_updated_at ON apartment_availability;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;

-- Drop existing tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS apartment_availability CASCADE;
DROP TABLE IF EXISTS apartments CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- =====================================================
-- CREATE TABLES
-- =====================================================

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

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX idx_apartments_is_active ON apartments(is_active);
CREATE INDEX idx_apartment_availability_apartment_id ON apartment_availability(apartment_id);
CREATE INDEX idx_apartment_availability_dates ON apartment_availability(start_date, end_date);
CREATE INDEX idx_bookings_apartment_id ON bookings(apartment_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_apartments_updated_at 
  BEFORE UPDATE ON apartments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apartment_availability_updated_at 
  BEFORE UPDATE ON apartment_availability 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartment_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Public read access to active apartments
CREATE POLICY "Public can read apartments" 
  ON apartments 
  FOR SELECT 
  USING (is_active = true);

-- Public read access to apartment availability
CREATE POLICY "Public can read apartment availability" 
  ON apartment_availability 
  FOR SELECT 
  USING (true);

-- Admin policies (authenticated users can do everything)
CREATE POLICY "Authenticated users can manage apartments" 
  ON apartments 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage availability" 
  ON apartment_availability 
  FOR ALL 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage bookings" 
  ON bookings 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- =====================================================
-- ADD COLUMN COMMENTS (DOCUMENTATION)
-- =====================================================

COMMENT ON COLUMN apartments.characteristics IS 
'JSONB object containing apartment amenities and features. 
Supported fields (all optional):
- bedrooms: number
- bathrooms: number
- wifi: boolean
- kitchen: boolean
- air_conditioning: boolean
- parking: boolean
- pool: boolean
- balcony: boolean
- terrace: boolean
- garden: boolean
- bbq: boolean
- washing_machine: boolean
- mountain_view: boolean
- hot_water: boolean
- heating: boolean
- coffee_maker: boolean
- microwave: boolean
- oven: boolean
- refrigerator: boolean
- iron: boolean
- hair_dryer: boolean
- tv: boolean
- fire_extinguisher: boolean
- crib: boolean
- blackout_curtains: boolean
- bidet: boolean
- dishwasher: boolean
- single_floor: boolean
- long_term_available: boolean
- cleaning_service: boolean';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  apartment_count INTEGER;
  booking_count INTEGER;
  availability_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO apartment_count FROM apartments;
  SELECT COUNT(*) INTO booking_count FROM bookings;
  SELECT COUNT(*) INTO availability_count FROM apartment_availability;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION 001 COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - apartments (% records)', apartment_count;
  RAISE NOTICE '  - bookings (% records)', booking_count;
  RAISE NOTICE '  - apartment_availability (% records)', availability_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Next step: Run migration 002 to set up storage';
END $$;
