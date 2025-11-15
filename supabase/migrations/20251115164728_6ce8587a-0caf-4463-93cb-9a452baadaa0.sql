-- Create requests table for community posts
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  needed_by_date DATE NOT NULL,
  purpose TEXT NOT NULL,
  additional_details TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create request_comments table
CREATE TABLE public.request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE NOT NULL,
  commenter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment_text TEXT NOT NULL,
  listing_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to generate unique request number
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 5 random uppercase letters
    new_number := upper(substring(md5(random()::text) from 1 for 5));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM requests WHERE request_number = new_number) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$;

-- Trigger to auto-generate request number
CREATE OR REPLACE FUNCTION set_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := generate_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER before_insert_request_number
  BEFORE INSERT ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION set_request_number();

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for requests
CREATE POLICY "Anyone can view open requests"
  ON public.requests
  FOR SELECT
  USING (status = 'open' OR auth.uid() = requester_id);

CREATE POLICY "Authenticated users can create requests"
  ON public.requests
  FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own requests"
  ON public.requests
  FOR UPDATE
  USING (auth.uid() = requester_id);

CREATE POLICY "Users can delete their own requests"
  ON public.requests
  FOR DELETE
  USING (auth.uid() = requester_id);

-- RLS Policies for request_comments
CREATE POLICY "Anyone can view comments"
  ON public.request_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.request_comments
  FOR INSERT
  WITH CHECK (auth.uid() = commenter_id);

CREATE POLICY "Users can delete their own comments"
  ON public.request_comments
  FOR DELETE
  USING (auth.uid() = commenter_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live comments
ALTER TABLE public.requests REPLICA IDENTITY FULL;
ALTER TABLE public.request_comments REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_comments;