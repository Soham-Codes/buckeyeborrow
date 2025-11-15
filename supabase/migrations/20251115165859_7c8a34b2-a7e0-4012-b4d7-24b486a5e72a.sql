-- Add item_number column to items table
ALTER TABLE public.items 
ADD COLUMN item_number text NOT NULL DEFAULT '';

-- Create function to generate unique item numbers (5 random uppercase letters)
CREATE OR REPLACE FUNCTION public.generate_item_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate 5 random uppercase letters
    new_number := upper(substring(md5(random()::text) from 1 for 5));
    
    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM items WHERE item_number = new_number) INTO exists_check;
    
    -- If it doesn't exist, we can use it
    IF NOT exists_check THEN
      RETURN new_number;
    END IF;
  END LOOP;
END;
$$;

-- Create trigger to auto-generate item number
CREATE OR REPLACE FUNCTION public.set_item_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.item_number IS NULL OR NEW.item_number = '' THEN
    NEW.item_number := generate_item_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_item_number_trigger
  BEFORE INSERT ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_item_number();