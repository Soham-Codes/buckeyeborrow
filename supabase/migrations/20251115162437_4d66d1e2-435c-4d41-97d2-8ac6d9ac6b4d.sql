-- Create items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  photo_url TEXT,
  campus_area TEXT NOT NULL,
  pickup_location TEXT NOT NULL,
  pickup_time_window TEXT NOT NULL,
  max_borrow_duration TEXT NOT NULL,
  cost_type TEXT NOT NULL,
  condition_notes TEXT,
  borrower_expectations TEXT,
  contact_method TEXT NOT NULL,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items
CREATE POLICY "Anyone can view available items"
  ON public.items
  FOR SELECT
  USING (status = 'available' OR auth.uid() = owner_id);

CREATE POLICY "Users can create their own items"
  ON public.items
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own items"
  ON public.items
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own items"
  ON public.items
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for item photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-photos', 'item-photos', true);

-- Storage policies for item photos
CREATE POLICY "Anyone can view item photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'item-photos');

CREATE POLICY "Authenticated users can upload item photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'item-photos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own item photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'item-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own item photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'item-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );