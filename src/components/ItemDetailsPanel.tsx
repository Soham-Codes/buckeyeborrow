import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, DollarSign, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface ItemDetails {
  id: string;
  item_name: string;
  category: string;
  photo_url: string | null;
  campus_area: string;
  pickup_location: string;
  pickup_time_window: string;
  max_borrow_duration: string;
  cost_type: string;
  condition_notes: string | null;
  borrower_expectations: string | null;
  contact_method: string;
  status: string;
  item_number: string;
  created_at: string;
  owner_id: string;
}

interface Profile {
  full_name: string;
  profile_photo_url: string | null;
}

interface ItemDetailsPanelProps {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ItemDetailsPanel = ({ itemId, open, onOpenChange }: ItemDetailsPanelProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [neededFrom, setNeededFrom] = useState('');
  const [neededUntil, setNeededUntil] = useState('');
  const [purpose, setPurpose] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);

  useEffect(() => {
    if (itemId && open) {
      fetchItemDetails();
    }
  }, [itemId, open]);

  const fetchItemDetails = async () => {
    if (!itemId) return;
    
    setLoading(true);
    try {
      // Fetch item details
      const { data: itemData, error: itemError} = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;
      setItem(itemData);

      // Fetch owner profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, profile_photo_url')
        .eq('id', itemData.owner_id)
        .single();

      if (!profileError) {
        setOwner(profileData);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageLender = () => {
    if (!user) {
      toast.error('Please sign in to send a request');
      navigate('/auth');
      return;
    }
    setRequestDialogOpen(true);
  };

  const handleSubmitRequest = async () => {
    if (!user || !itemId) return;

    // Validation
    if (!neededFrom || !neededUntil || !purpose.trim() || !contactPhone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!agreedToGuidelines) {
      toast.error('Please agree to the lender\'s guidelines');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    if (!phoneRegex.test(contactPhone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    // Validate dates
    const fromDate = new Date(neededFrom);
    const untilDate = new Date(neededUntil);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (fromDate < today) {
      toast.error('Start date cannot be in the past');
      return;
    }

    if (untilDate <= fromDate) {
      toast.error('End date must be after start date');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('borrow_requests')
        .insert({
          item_id: itemId,
          requester_id: user.id,
          needed_from: neededFrom,
          needed_until: neededUntil,
          purpose: purpose.trim(),
          contact_phone: contactPhone.trim(),
          agreed_to_guidelines: agreedToGuidelines
        });

      if (error) throw error;

      toast.success('Request sent successfully!');
      setRequestDialogOpen(false);
      
      // Reset form
      setNeededFrom('');
      setNeededUntil('');
      setPurpose('');
      setContactPhone('');
      setAgreedToGuidelines(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to send request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!item) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <SheetTitle className="text-2xl">{item.item_name}</SheetTitle>
                <SheetDescription>
                  Listed on {new Date(item.created_at).toLocaleDateString()}
                </SheetDescription>
              </div>
              <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                {item.status}
              </Badge>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Item Photo */}
            {item.photo_url && (
              <div className="aspect-video overflow-hidden rounded-lg border">
                <img
                  src={item.photo_url}
                  alt={item.item_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Item Number */}
            <div className="bg-primary/10 border border-primary rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Item Number</p>
              <p className="text-2xl font-bold text-primary tracking-wider font-mono">{item.item_number}</p>
            </div>

            {/* Category & Cost */}
            <div className="flex gap-3">
              <Badge variant="outline" className="flex-1 justify-center py-2">
                {item.category}
              </Badge>
              <Badge variant="outline" className="flex-1 justify-center py-2">
                <DollarSign className="h-3 w-3 mr-1" />
                {item.cost_type === 'free' ? 'Free' : 'Paid'}
              </Badge>
            </div>

            <Separator />

            {/* Location & Pickup Details */}
            <div className="space-y-4">
              <h3 className="font-semibold">Pickup Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Campus Area</p>
                    <p className="text-sm text-muted-foreground">{item.campus_area}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pickup Location</p>
                    <p className="text-sm text-muted-foreground">{item.pickup_location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pickup Time Window</p>
                    <p className="text-sm text-muted-foreground">{item.pickup_time_window}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Max Borrow Duration</p>
                    <p className="text-sm text-muted-foreground">{item.max_borrow_duration}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Condition & Expectations */}
            {(item.condition_notes || item.borrower_expectations) && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold">Details</h3>
                  {item.condition_notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Condition Notes</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {item.condition_notes}
                      </p>
                    </div>
                  )}
                  {item.borrower_expectations && (
                    <div>
                      <p className="text-sm font-medium mb-1">Borrower Expectations</p>
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {item.borrower_expectations}
                      </p>
                    </div>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Owner Info */}
            <div className="space-y-4">
              <h3 className="font-semibold">Lender Information</h3>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{owner?.full_name || 'OSU Student'}</p>
                  <p className="text-sm text-muted-foreground">Contact via {item.contact_method}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button className="w-full" size="lg" onClick={handleMessageLender}>
                <Mail className="h-4 w-4 mr-2" />
                Request to Borrow
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Borrow Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request to Borrow</DialogTitle>
            <DialogDescription>
              Send a request to borrow "{item?.item_name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="neededFrom">Needed From</Label>
                <Input
                  id="neededFrom"
                  type="date"
                  value={neededFrom}
                  onChange={(e) => setNeededFrom(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="neededUntil">Needed Until</Label>
                <Input
                  id="neededUntil"
                  type="date"
                  value={neededUntil}
                  onChange={(e) => setNeededUntil(e.target.value)}
                  min={neededFrom || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">What do you need it for?</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g., Statistics final exam on Dec 15th"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone Number</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="(123) 456-7890"
              />
            </div>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="guidelines"
                checked={agreedToGuidelines}
                onCheckedChange={(checked) => setAgreedToGuidelines(checked === true)}
              />
              <Label htmlFor="guidelines" className="text-sm leading-snug cursor-pointer">
                I agree to follow the lender's guidelines and borrowing etiquette
              </Label>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setRequestDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitRequest} disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
