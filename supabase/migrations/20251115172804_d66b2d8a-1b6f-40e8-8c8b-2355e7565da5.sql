-- Create borrow_requests table
CREATE TABLE public.borrow_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  needed_from DATE NOT NULL,
  needed_until DATE NOT NULL,
  purpose TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  agreed_to_guidelines BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view requests for their items"
ON public.borrow_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.items
    WHERE items.id = borrow_requests.item_id
    AND items.owner_id = auth.uid()
  )
  OR requester_id = auth.uid()
);

CREATE POLICY "Authenticated users can create requests"
ON public.borrow_requests
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own requests"
ON public.borrow_requests
FOR UPDATE
USING (requester_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_borrow_requests_updated_at
  BEFORE UPDATE ON public.borrow_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_borrow_requests_item_id ON public.borrow_requests(item_id);
CREATE INDEX idx_borrow_requests_requester_id ON public.borrow_requests(requester_id);