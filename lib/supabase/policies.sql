-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ca_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
-- Everyone can read profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- CA Details policies
-- Everyone can read CA details
CREATE POLICY "CA details are viewable by everyone" 
ON ca_details FOR SELECT 
USING (true);

-- CAs can update their own details
CREATE POLICY "CAs can update their own details" 
ON ca_details FOR UPDATE 
USING (auth.uid() = user_id);

-- Business Details policies
-- Everyone can read business details
CREATE POLICY "Business details are viewable by everyone" 
ON business_details FOR SELECT 
USING (true);

-- Businesses can update their own details
CREATE POLICY "Businesses can update their own details" 
ON business_details FOR UPDATE 
USING (auth.uid() = user_id);

-- Services policies
-- Everyone can read services
CREATE POLICY "Services are viewable by everyone" 
ON services FOR SELECT 
USING (true);

-- CAs can insert, update, and delete their own services
CREATE POLICY "CAs can insert their own services" 
ON services FOR INSERT 
WITH CHECK (auth.uid() = ca_id);

CREATE POLICY "CAs can update their own services" 
ON services FOR UPDATE 
USING (auth.uid() = ca_id);

CREATE POLICY "CAs can delete their own services" 
ON services FOR DELETE 
USING (auth.uid() = ca_id);

-- Bookings policies
-- Customers can see their own bookings
CREATE POLICY "Customers can see their own bookings" 
ON bookings FOR SELECT 
TO authenticated
USING (auth.uid() = customer_id);

-- CAs can see bookings for their services
CREATE POLICY "CAs can see bookings for their services" 
ON bookings FOR SELECT 
TO authenticated
USING (auth.uid() = ca_id);

-- Customers can insert bookings for themselves
CREATE POLICY "Customers can insert bookings for themselves" 
ON bookings FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = customer_id);

-- Customers can update their own bookings
CREATE POLICY "Customers can update their own bookings" 
ON bookings FOR UPDATE 
TO authenticated
USING (auth.uid() = customer_id);

-- CAs can update bookings status
CREATE POLICY "CAs can update bookings status" 
ON bookings FOR UPDATE 
TO authenticated
USING (auth.uid() = ca_id)
WITH CHECK (
  (OLD.booking_status::text <> NEW.booking_status::text) AND 
  (OLD.scheduled_at = NEW.scheduled_at) AND
  (OLD.service_id = NEW.service_id) AND
  (OLD.customer_id = NEW.customer_id) AND
  (OLD.ca_id = NEW.ca_id)
);

-- Payments policies
-- Customers can see their own payments
CREATE POLICY "Customers can see their own payments" 
ON payments FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = payments.booking_id 
    AND bookings.customer_id = auth.uid()
  )
);

-- CAs can see payments for their services
CREATE POLICY "CAs can see payments for their services" 
ON payments FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = payments.booking_id 
    AND bookings.ca_id = auth.uid()
  )
);

-- Reviews policies
-- Everyone can read reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

-- Reviewers can insert their own reviews
CREATE POLICY "Reviewers can insert their own reviews" 
ON reviews FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = reviewer_id AND
  EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = reviews.booking_id 
    AND (bookings.customer_id = auth.uid() OR bookings.ca_id = auth.uid())
    AND bookings.booking_status = 'completed'
  )
);

-- Reviewers can update their own reviews
CREATE POLICY "Reviewers can update their own reviews" 
ON reviews FOR UPDATE 
TO authenticated
USING (auth.uid() = reviewer_id);

-- Reviewers can delete their own reviews
CREATE POLICY "Reviewers can delete their own reviews" 
ON reviews FOR DELETE 
TO authenticated
USING (auth.uid() = reviewer_id);