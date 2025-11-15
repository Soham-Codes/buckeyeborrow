import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MapPin, Calendar, Clock, DollarSign, User, Phone, Mail } from 'lucide-react';

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
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

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
      const { data: itemData, error: itemError } = await supabase
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
            <Button className="w-full" size="lg">
              Request to Borrow
            </Button>
            <Button variant="outline" className="w-full" size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Message Lender
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
