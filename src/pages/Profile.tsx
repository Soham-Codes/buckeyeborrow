import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Package, BookOpen, Plus, List, Edit, LogOut, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  full_name: string;
  profile_photo_url: string | null;
  bio: string | null;
  dorm_area: string | null;
}

interface Item {
  id: string;
  item_name: string;
  category: string;
  photo_url: string | null;
  status: string;
  item_number: string;
}

// Sample borrowed items data
const sampleBorrowedItems = [
  {
    id: '1',
    item_name: 'Organic Chemistry Textbook',
    photo_url: null,
    status: 'Borrowed',
    due_date: '2025-11-22'
  },
  {
    id: '2',
    item_name: 'Graphing Calculator',
    photo_url: null,
    status: 'Returned',
    due_date: '2025-11-15'
  }
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lendingItems, setLendingItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { returnTo: '/profile' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLendingItems();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchLendingItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setLendingItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Basic User Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.profile_photo_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile?.full_name ? getInitials(profile.full_name) : 'OS'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{profile?.full_name || 'OSU Student'}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{user?.email}</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">Email Verified</span>
                  </div>
                  {profile?.dorm_area && (
                    <Badge variant="secondary">{profile.dorm_area}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          {profile?.bio && (
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground italic">{profile.bio}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={() => navigate('/list-item')} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                List New Item
              </Button>
              <Button onClick={() => navigate('/my-items')} variant="outline" className="w-full">
                <List className="h-4 w-4 mr-2" />
                View Listings
              </Button>
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button onClick={handleSignOut} variant="destructive" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Borrowing Activity */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Items I'm Lending */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>Items I'm Lending</CardTitle>
              </div>
              <CardDescription>Items you've listed for others to borrow</CardDescription>
            </CardHeader>
            <CardContent>
              {lendingItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No items listed yet</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate('/list-item')}
                  >
                    List Your First Item
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {lendingItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <img
                        src={item.photo_url || '/images/no-image-placeholder.png'}
                        alt={item.item_name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.item_name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={item.status === 'available' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground">#{item.item_number}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {lendingItems.length >= 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate('/my-items')}
                    >
                      View All Items
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items I've Borrowed */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>Items I've Borrowed</CardTitle>
              </div>
              <CardDescription>Items you're currently borrowing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleBorrowedItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <img
                      src={item.photo_url || '/images/no-image-placeholder.png'}
                      alt={item.item_name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.item_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={item.status === 'Borrowed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      {item.status === 'Borrowed' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(item.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Helpful Section */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">Borrowing Etiquette & Safety Tips</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn how to be a responsible borrower and lender in the Buckeye Borrow community.
                </p>
                <Button variant="outline" size="sm">
                  Read Guidelines
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
