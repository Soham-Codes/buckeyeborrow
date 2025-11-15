import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trash2, Package, Inbox } from 'lucide-react';
import { toast } from 'sonner';

interface Item {
  id: string;
  item_name: string;
  category: string;
  photo_url: string | null;
  campus_area: string;
  pickup_location: string;
  status: string;
  cost_type: string;
  created_at: string;
  item_number: string;
}

interface BorrowRequest {
  id: string;
  needed_from: string;
  needed_until: string;
  purpose: string;
  contact_phone: string;
  status: string;
  created_at: string;
  requester: {
    full_name: string;
  };
}

export default function MyItems() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [requestCounts, setRequestCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itemRequests, setItemRequests] = useState<BorrowRequest[]>([]);
  const [requestsDialogOpen, setRequestsDialogOpen] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { returnTo: '/my-items' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchMyItems();
    }
  }, [user]);

  const fetchMyItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);

      // Fetch request counts for each item
      if (data && data.length > 0) {
        await fetchRequestCounts(data.map(item => item.id));
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load your items');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestCounts = async (itemIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('item_id')
        .in('item_id', itemIds)
        .eq('status', 'pending');

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach(request => {
        counts[request.item_id] = (counts[request.item_id] || 0) + 1;
      });

      setRequestCounts(counts);
    } catch (error) {
      console.error('Error fetching request counts:', error);
    }
  };

  const fetchItemRequests = async (itemId: string) => {
    setLoadingRequests(true);
    try {
      const { data, error } = await supabase
        .from('borrow_requests')
        .select('*')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false});

      if (error) throw error;

      // Fetch requester profiles
      const requestsWithProfiles = await Promise.all(
        (data || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', request.requester_id)
            .single();

          return {
            ...request,
            requester: { full_name: profile?.full_name || 'Unknown User' }
          };
        })
      );

      setItemRequests(requestsWithProfiles);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleViewRequests = (item: Item) => {
    setSelectedItem(item);
    fetchItemRequests(item.id);
    setRequestsDialogOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setItems(items.filter(item => item.id !== itemId));
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">My Items</h1>
              <p className="text-muted-foreground">Manage your listed items</p>
            </div>
            <Button onClick={() => navigate('/list-item')}>
              List New Item
            </Button>
          </div>

          {items.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No items listed yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start lending items to your community
                </p>
                <Button onClick={() => navigate('/list-item')}>
                  List Your First Item
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.photo_url && (
                    <img
                      src={item.photo_url}
                      alt={item.item_name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.item_name}</CardTitle>
                        <CardDescription>{item.category}</CardDescription>
                      </div>
                      <Badge variant={item.status === 'available' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-primary/10 border border-primary rounded-md px-3 py-2 mb-4">
                      <p className="text-xs text-muted-foreground text-center">Item Number</p>
                      <p className="text-lg font-bold text-primary text-center tracking-wider">{item.item_number}</p>
                    </div>

                    {/* Request Count Badge */}
                    {requestCounts[item.id] > 0 && (
                      <div className="mb-4 flex items-center justify-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-md">
                        <Inbox className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-medium text-green-700">
                          {requestCounts[item.id]} pending {requestCounts[item.id] === 1 ? 'request' : 'requests'}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p><strong>Campus Area:</strong> {item.campus_area}</p>
                      <p><strong>Pickup:</strong> {item.pickup_location}</p>
                      <p><strong>Cost:</strong> {item.cost_type === 'free' ? 'Free' : 'Paid'}</p>
                      <p className="text-xs">
                        Listed on {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* View Requests Button */}
                    <Button 
                      variant="outline" 
                      className="w-full mb-2" 
                      size="sm"
                      onClick={() => handleViewRequests(item)}
                    >
                      <Inbox className="w-4 h-4 mr-2" />
                      View Requests {requestCounts[item.id] > 0 && `(${requestCounts[item.id]})`}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" size="sm">
                          <Trash2 className="w-4 w-4 mr-2" />
                          Delete Item
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{item.item_name}" from your listings.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Requests Dialog */}
      <Dialog open={requestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Borrow Requests for "{selectedItem?.item_name}"</DialogTitle>
            <DialogDescription>
              Review and manage borrow requests for this item
            </DialogDescription>
          </DialogHeader>

          {loadingRequests ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : itemRequests.length === 0 ? (
            <div className="text-center py-8">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No requests yet for this item</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {itemRequests.map((request) => (
                <Card key={request.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{request.requester.full_name}</CardTitle>
                        <CardDescription>
                          Requested on {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge variant={request.status === 'pending' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Needed Period</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(request.needed_from).toLocaleDateString()} - {new Date(request.needed_until).toLocaleDateString()}
                        </p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium">Purpose</p>
                        <p className="text-sm text-muted-foreground">{request.purpose}</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium">Contact Phone</p>
                        <p className="text-sm text-muted-foreground font-mono">{request.contact_phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
