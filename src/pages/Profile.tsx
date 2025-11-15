import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from 'next-themes';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Package, BookOpen, Plus, List, Edit, LogOut, AlertCircle, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';
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
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lendingItems, setLendingItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  
  // Edit form state
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editDormArea, setEditDormArea] = useState('');
  const [saving, setSaving] = useState(false);

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

  const handleEditProfile = () => {
    setEditFullName(profile?.full_name || '');
    setEditBio(profile?.bio || '');
    setEditDormArea(profile?.dorm_area || '');
    setEditDialogOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFullName,
          bio: editBio,
          dorm_area: editDormArea
        })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile({
        ...profile!,
        full_name: editFullName,
        bio: editBio,
        dorm_area: editDormArea
      });

      toast.success('Profile updated successfully!');
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your profile and settings</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Basic User Info */}
            <Card>
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
              <Button variant="outline" className="w-full" onClick={handleEditProfile}>
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
                <Button variant="outline" size="sm" onClick={() => setGuidelinesOpen(true)}>
                  Read Guidelines
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-primary" />
                  <CardTitle>Appearance</CardTitle>
                </div>
                <CardDescription>Customize how Buckeye Borrow looks for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <Switch
                      id="dark-mode"
                      checked={theme === 'dark'}
                      onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email updates about your borrowing activity
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="borrow-requests" className="text-base">Borrow Requests</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when someone requests to borrow your items
                    </p>
                  </div>
                  <Switch id="borrow-requests" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="return-reminders" className="text-base">Return Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive reminders about upcoming item returns
                    </p>
                  </div>
                  <Switch id="return-reminders" defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
                <CardDescription>Control your privacy and data preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visibility" className="text-base">Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow other users to view your profile
                    </p>
                  </div>
                  <Switch id="profile-visibility" defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-email" className="text-base">Show Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Display your email on your public profile
                    </p>
                  </div>
                  <Switch id="show-email" />
                </div>
              </CardContent>
            </Card>

            {/* Account Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" onClick={handleEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile Information
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dormArea">Campus Area</Label>
                <Select value={editDormArea} onValueChange={setEditDormArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North Campus">North Campus</SelectItem>
                    <SelectItem value="South Campus">South Campus</SelectItem>
                    <SelectItem value="West Campus">West Campus</SelectItem>
                    <SelectItem value="Off-Campus">Off-Campus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">About Me</Label>
                <Textarea
                  id="bio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell us a bit about yourself (optional)"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Guidelines Dialog */}
        <Dialog open={guidelinesOpen} onOpenChange={setGuidelinesOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Borrowing Etiquette & Safety Tips</DialogTitle>
              <DialogDescription>
                Guidelines for a safe and respectful borrowing experience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  For Borrowers
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>• Always treat borrowed items with care and respect</li>
                  <li>• Return items on time and in the same condition you received them</li>
                  <li>• Communicate clearly about pickup and return arrangements</li>
                  <li>• Report any damage immediately and offer to cover repair costs</li>
                  <li>• Leave honest feedback about your borrowing experience</li>
                  <li>• Meet in well-lit, public campus locations for exchanges</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  For Lenders
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>• Only lend items you're comfortable parting with temporarily</li>
                  <li>• Be clear about condition, expectations, and return dates</li>
                  <li>• Take photos of the item before lending</li>
                  <li>• Verify the borrower's OSU email and profile</li>
                  <li>• Respond promptly to borrowing requests</li>
                  <li>• Be understanding if minor issues arise</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Safety Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                  <li>• Always meet in public, well-lit areas on campus</li>
                  <li>• Let a friend know about your meeting arrangements</li>
                  <li>• Verify the person's identity matches their profile</li>
                  <li>• Trust your instincts - if something feels off, cancel</li>
                  <li>• Never share sensitive personal information</li>
                  <li>• Report suspicious activity or violations immediately</li>
                </ul>
              </div>

              <Separator />

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Need Help?</p>
                <p className="text-sm text-muted-foreground">
                  If you experience any issues or have concerns about a transaction,
                  please contact our support team. We're here to help maintain a safe
                  and trustworthy community for all Buckeyes.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setGuidelinesOpen(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
