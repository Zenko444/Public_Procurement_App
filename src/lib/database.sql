-- Smart City Database Schema
-- Run this in your Supabase SQL Editor after connecting

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- City Halls Table (Primarii)
CREATE TABLE IF NOT EXISTS city_halls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(50) NOT NULL UNIQUE, -- CUI
  contact_person_name VARCHAR(255) NOT NULL,
  contact_person_email VARCHAR(255) NOT NULL,
  contact_person_phone VARCHAR(50) NOT NULL,
  locality VARCHAR(255) NOT NULL,
  address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Providers Table (Furnizori)
CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  tax_id VARCHAR(50) NOT NULL UNIQUE, -- CUI
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  address TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  provider_id UUID REFERENCES service_providers(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for service search
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_services_provider ON services(provider_id);

-- Requests Table
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_hall_id UUID REFERENCES city_halls(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES service_providers(id) ON DELETE SET NULL,
  -- Auto-filled from City Hall profile
  city_hall_name VARCHAR(255) NOT NULL,
  city_hall_tax_id VARCHAR(50) NOT NULL,
  contact_person_name VARCHAR(255) NOT NULL,
  contact_person_email VARCHAR(255) NOT NULL,
  contact_person_phone VARCHAR(50) NOT NULL,
  locality VARCHAR(255) NOT NULL,
  -- Request details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  service_name VARCHAR(255) NOT NULL,
  provider_name VARCHAR(255) NOT NULL,
  provider_tax_id VARCHAR(50) NOT NULL,
  -- Dates
  request_date DATE DEFAULT CURRENT_DATE,
  has_estimated_start_date BOOLEAN DEFAULT false,
  estimated_start_date DATE,
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  status_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for requests
CREATE INDEX IF NOT EXISTS idx_requests_city_hall ON requests(city_hall_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_provider ON requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at DESC);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  is_read BOOLEAN DEFAULT false,
  related_request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE city_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- City Halls policies
CREATE POLICY "Users can view their own city hall profile"
  ON city_halls FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own city hall profile"
  ON city_halls FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own city hall profile"
  ON city_halls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service Providers policies (publicly readable)
CREATE POLICY "Service providers are publicly readable"
  ON service_providers FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Services policies (publicly readable)
CREATE POLICY "Services are publicly readable"
  ON services FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Requests policies
CREATE POLICY "City halls can view their own requests"
  ON requests FOR SELECT
  USING (city_hall_id IN (
    SELECT id FROM city_halls WHERE user_id = auth.uid()
  ));

CREATE POLICY "City halls can create their own requests"
  ON requests FOR INSERT
  WITH CHECK (city_hall_id IN (
    SELECT id FROM city_halls WHERE user_id = auth.uid()
  ));

CREATE POLICY "City halls can update their own requests"
  ON requests FOR UPDATE
  USING (city_hall_id IN (
    SELECT id FROM city_halls WHERE user_id = auth.uid()
  ));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Insert sample data for Service Providers
INSERT INTO service_providers (name, tax_id, contact_email, contact_phone, description) VALUES
  ('AquaServ SRL', 'RO12345678', 'contact@aquaserv.ro', '0721123456', 'Servicii de alimentare cu apă și canalizare'),
  ('ElectroGrid SA', 'RO23456789', 'office@electrogrid.ro', '0722234567', 'Furnizor de energie electrică'),
  ('GazNatura SRL', 'RO34567890', 'info@gaznatura.ro', '0723345678', 'Distribuție gaze naturale'),
  ('SalubritatePro SRL', 'RO45678901', 'contact@salubritatepro.ro', '0724456789', 'Servicii de salubritate și curățenie'),
  ('TermoConfort SA', 'RO56789012', 'office@termoconfort.ro', '0725567890', 'Furnizor de energie termică'),
  ('DrumBine SRL', 'RO67890123', 'contact@drumbine.ro', '0726678901', 'Întreținere și reparații drumuri'),
  ('IluminatPublic SA', 'RO78901234', 'info@iluminatpublic.ro', '0727789012', 'Servicii de iluminat public'),
  ('SpatiuVerde SRL', 'RO89012345', 'contact@spatiuverde.ro', '0728890123', 'Amenajare și întreținere spații verzi')
ON CONFLICT (tax_id) DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Alimentare cu apă potabilă',
  'Servicii de furnizare apă potabilă pentru localități',
  'Utilități',
  id
FROM service_providers WHERE tax_id = 'RO12345678';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Canalizare și epurare',
  'Servicii de canalizare și tratare ape uzate',
  'Utilități',
  id
FROM service_providers WHERE tax_id = 'RO12345678';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Furnizare energie electrică',
  'Distribuție și furnizare energie electrică',
  'Energie',
  id
FROM service_providers WHERE tax_id = 'RO23456789';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Iluminat public',
  'Instalare și întreținere sistem iluminat public',
  'Energie',
  id
FROM service_providers WHERE tax_id = 'RO78901234';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Distribuție gaze naturale',
  'Furnizare și distribuție gaze naturale',
  'Utilități',
  id
FROM service_providers WHERE tax_id = 'RO34567890';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Colectare deșeuri',
  'Servicii de colectare și transport deșeuri menajere',
  'Salubritate',
  id
FROM service_providers WHERE tax_id = 'RO45678901';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Curățenie stradală',
  'Servicii de măturat și spălat străzi',
  'Salubritate',
  id
FROM service_providers WHERE tax_id = 'RO45678901';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Furnizare energie termică',
  'Încălzire centralizată pentru clădiri publice',
  'Energie',
  id
FROM service_providers WHERE tax_id = 'RO56789012';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Reparații drumuri',
  'Întreținere și reparații infrastructură rutieră',
  'Infrastructură',
  id
FROM service_providers WHERE tax_id = 'RO67890123';

INSERT INTO services (name, description, category, provider_id) 
SELECT 
  'Amenajare spații verzi',
  'Plantare și întreținere parcuri și grădini',
  'Mediu',
  id
FROM service_providers WHERE tax_id = 'RO89012345';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_city_halls_updated_at
  BEFORE UPDATE ON city_halls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at
  BEFORE UPDATE ON service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
