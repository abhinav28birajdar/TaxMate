-- Create enums
CREATE TYPE user_role AS ENUM ('customer', 'ca', 'business');
CREATE TYPE service_type AS ENUM ('fixed', 'recurring');
CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'completed', 'cancelled');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CA (Chartered Accountant) details
CREATE TABLE ca_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bio TEXT,
  specializations TEXT[],
  consultation_rate DECIMAL(10, 2),
  is_verified BOOLEAN DEFAULT false,
  years_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_is_ca CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = user_id AND profiles.role = 'ca'
    )
  )
);

-- Business details
CREATE TABLE business_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_size TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_is_business CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = user_id AND profiles.role = 'business'
    )
  )
);

-- Services offered by CAs
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ca_id UUID NOT NULL REFERENCES ca_details(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  service_type service_type NOT NULL,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  ca_id UUID NOT NULL REFERENCES ca_details(user_id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  booking_status booking_status NOT NULL DEFAULT 'pending_payment',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_id UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_status TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add payment_id foreign key to bookings after payments table is created
ALTER TABLE bookings ADD CONSTRAINT fk_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (booking_id, reviewer_id, reviewee_id)
);

-- Triggers for updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER set_updated_at_profiles
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_ca_details
BEFORE UPDATE ON ca_details
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_business_details
BEFORE UPDATE ON business_details
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_services
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_bookings
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_payments
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

CREATE TRIGGER set_updated_at_reviews
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at();

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_ca_details_user_id ON ca_details(user_id);
CREATE INDEX idx_business_details_user_id ON business_details(user_id);
CREATE INDEX idx_services_ca_id ON services(ca_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_ca_id ON bookings(ca_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);