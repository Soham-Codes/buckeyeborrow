import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Package } from 'lucide-react';
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

export default function MyItems() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Failed to load your items');
    } finally {
      setLoading(false);
    }
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
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <p><strong>Campus Area:</strong> {item.campus_area}</p>
                      <p><strong>Pickup:</strong> {item.pickup_location}</p>
                      <p><strong>Cost:</strong> {item.cost_type === 'free' ? 'Free' : 'Paid'}</p>
                      <p className="text-xs">
                        Listed on {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" size="sm">
                          <Trash2 className="w-4 h-4 mr-2" />
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
    </div>
  );
}
