-- Add foreign keys from requests and request_comments to profiles
-- First, ensure profiles table has proper foreign key to auth.users if not already
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey,
  ADD CONSTRAINT profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Now add indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_requests_requester_id ON public.requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_commenter_id ON public.request_comments(commenter_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_request_id ON public.request_comments(request_id);