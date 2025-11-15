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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, Package, BookOpen, Plus, List, Edit, LogOut, AlertCircle, Settings as SettingsIcon, Moon, Sun, Upload, X, Camera } from 'lucide-react';
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

interface UserPreferences {
  email_notifications: boolean;
  borrow_request_notifications: boolean;
  return_reminders: boolean;
  profile_visibility: boolean;
  show_email: boolean;
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // User preferences state
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    borrow_request_notifications: true,
    return_reminders: true,
    profile_visibility: true,
    show_email: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { state: { returnTo: '/profile' } });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchLendingItems();
      fetchUserPreferences();
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

  const fetchUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          borrow_request_notifications: data.borrow_request_notifications,
          return_reminders: data.return_reminders,
          profile_visibility: data.profile_visibility,
          show_email: data.show_email,
        });
      } else {
        // Create default preferences if none exist
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user?.id,
            email_notifications: true,
            borrow_request_notifications: true,
            return_reminders: true,
            profile_visibility: true,
            show_email: false,
          });
        
        if (insertError) console.error('Error creating preferences:', insertError);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
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
    setPhotoPreview(profile?.profile_photo_url || null);
    setPhotoFile(null);
    setEditDialogOpen(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Photo must be less than 5MB');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePhoto = async (): Promise<string | null> => {
    if (!photoFile || !user) return null;
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      if (profile?.profile_photo_url) {
        const oldPath = profile.profile_photo_url.split('/').slice(-2).join('/');
        if (oldPath) await supabase.storage.from('profile-photos').remove([oldPath]);
      }
      const { error: uploadError } = await supabase.storage.from('profile-photos').upload(fileName, photoFile, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      let photoUrl = profile?.profile_photo_url;
      if (photoFile) {
        const newPhotoUrl = await uploadProfilePhoto();
        if (newPhotoUrl) photoUrl = newPhotoUrl;
      }
      const { error } = await supabase.from('profiles').update({
        full_name: editFullName,
        bio: editBio,
        dorm_area: editDormArea,
        profile_photo_url: photoUrl
      }).eq('id', user?.id);
      if (error) throw error;
      setProfile({ ...profile!, full_name: editFullName, bio: editBio, dorm_area: editDormArea, profile_photo_url: photoUrl });
      toast.success('Profile updated successfully!');
      setEditDialogOpen(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = async (key: keyof UserPreferences, value: boolean) => {
    try {
      const { error } = await supabase.from('user_preferences').update({ [key]: value }).eq('user_id', user?.id);
      if (error) throw error;
      setPreferences(prev => ({ ...prev, [key]: value }));
      toast.success('Preference updated');
    } catch (error) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your profile and settings</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and edit your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.profile_photo_url || undefined} />
                    <AvatarFallback className="text-xl">{profile?.full_name ? getInitials(profile.full_name) : 'OS'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold">{profile?.full_name || 'No Name'}</h2>
                    <p className="text-muted-foreground">{profile?.bio || 'No bio yet'}</p>
                    {profile?.dorm_area && <Badge variant="secondary">{profile.dorm_area}</Badge>}
                  </div>
                </div>
                <Button variant="outline" onClick={handleEditProfile}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <CardTitle>My Lending Items</CardTitle>
                </div>
                <CardDescription>Items you are currently lending out</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p>Loading items...</p>
                ) : lendingItems.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lendingItems.map((item) => (
                      <Card key={item.id} className="border">
                        <CardHeader>
                          <CardTitle>{item.item_name}</CardTitle>
                          <CardDescription>{item.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p>Item Number: {item.item_number}</p>
                          <Badge>{item.status}</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No items being lent out currently.</p>
                    <Button variant="link" onClick={() => navigate('/items/add')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                )}
                {!loading && lendingItems.length > 0 && (
                  <Button variant="link" onClick={() => navigate('/items')}>
                    <List className="h-4 w-4 mr-2" />
                    View All Items
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <CardTitle>Borrowed Items</CardTitle>
                </div>
                <CardDescription>Items you are currently borrowing</CardDescription>
              </CardHeader>
              <CardContent>
                {sampleBorrowedItems.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sampleBorrowedItems.map((item) => (
                      <Card key={item.id} className="border">
                        <CardHeader>
                          <CardTitle>{item.item_name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p>Status: {item.status}</p>
                          <p>Due Date: {item.due_date}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No items borrowed currently.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <CardTitle>Community Guidelines</CardTitle>
                </div>
                <CardDescription>Our guidelines for a safe and respectful community</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Read our community guidelines to understand what is expected of all members.
                </p>
                <Button variant="secondary" onClick={() => setGuidelinesOpen(true)}>
                  View Guidelines
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /><CardTitle>Appearance</CardTitle></div>
                <CardDescription>Customize how Buckeye Borrow looks for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5"><Label htmlFor="dark-mode" className="text-base">Dark Mode</Label><p className="text-sm text-muted-foreground">Switch between light and dark themes</p></div>
                  <div className="flex items-center gap-3"><Sun className="h-4 w-4 text-muted-foreground" /><Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} /><Moon className="h-4 w-4 text-muted-foreground" /></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Notifications</CardTitle><CardDescription>Manage how you receive notifications</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="text-base">Email Notifications</Label><p className="text-sm text-muted-foreground">Receive email updates about your borrowing activity</p></div><Switch checked={preferences.email_notifications} onCheckedChange={(checked) => updatePreference('email_notifications', checked)} /></div>
                <Separator />
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="text-base">Borrow Requests</Label><p className="text-sm text-muted-foreground">Get notified when someone requests to borrow your items</p></div><Switch checked={preferences.borrow_request_notifications} onCheckedChange={(checked) => updatePreference('borrow_request_notifications', checked)} /></div>
                <Separator />
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="text-base">Return Reminders</Label><p className="text-sm text-muted-foreground">Receive reminders about upcoming item returns</p></div><Switch checked={preferences.return_reminders} onCheckedChange={(checked) => updatePreference('return_reminders', checked)} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Privacy</CardTitle><CardDescription>Control your privacy and data preferences</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="text-base">Profile Visibility</Label><p className="text-sm text-muted-foreground">Allow other users to view your profile</p></div><Switch checked={preferences.profile_visibility} onCheckedChange={(checked) => updatePreference('profile_visibility', checked)} /></div>
                <Separator />
                <div className="flex items-center justify-between"><div className="space-y-0.5"><Label className="text-base">Show Email</Label><p className="text-sm text-muted-foreground">Display your email on your public profile</p></div><Switch checked={preferences.show_email} onCheckedChange={(checked) => updatePreference('show_email', checked)} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Account</CardTitle><CardDescription>Manage your account settings</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" onClick={handleEditProfile}><Edit className="h-4 w-4 mr-2" />Edit Profile Information</Button>
                <Button variant="destructive" className="w-full" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" />Sign Out</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Edit Profile</DialogTitle><DialogDescription>Update your personal information</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Photo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20"><AvatarImage src={photoPreview || profile?.profile_photo_url || undefined} /><AvatarFallback className="text-xl">{editFullName ? getInitials(editFullName) : 'OS'}</AvatarFallback></Avatar>
                  <div>
                    <Label htmlFor="profile-photo" className="cursor-pointer"><Button type="button" variant="outline" size="sm" asChild><span><Camera className="h-4 w-4 mr-2" />Change Photo</span></Button></Label>
                    <Input id="profile-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    <p className="text-xs text-muted-foreground mt-1">Max 5MB (JPG, PNG, WEBP)</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="fullName">Full Name *</Label><Input id="fullName" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} placeholder="Enter your full name" /></div>
              <div className="space-y-2"><Label htmlFor="dormArea">Campus Area</Label><Select value={editDormArea} onValueChange={setEditDormArea}><SelectTrigger><SelectValue placeholder="Select campus area" /></SelectTrigger><SelectContent><SelectItem value="North Campus">North Campus</SelectItem><SelectItem value="South Campus">South Campus</SelectItem><SelectItem value="West Campus">West Campus</SelectItem><SelectItem value="Off-Campus">Off-Campus</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="bio">About Me</Label><Textarea id="bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us a bit about yourself (optional)" rows={3} /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSaveProfile} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={guidelinesOpen} onOpenChange={setGuidelinesOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Community Guidelines</DialogTitle>
              <DialogDescription>
                Please read and follow these guidelines to ensure a safe and respectful community for all users.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Respect and Courtesy</h3>
              <p>
                Treat all users with respect and courtesy. Avoid personal attacks, harassment, or any form of
                discrimination.
              </p>

              <h3 className="text-lg font-semibold">Honesty and Integrity</h3>
              <p>
                Be honest and transparent in your interactions. Do not misrepresent items, provide false information,
                or engage in deceptive practices.
              </p>

              <h3 className="text-lg font-semibold">Safety and Security</h3>
              <p>
                Prioritize the safety and security of yourself and others. Do not share personal information, arrange
                meetings in safe locations, and report any suspicious activity.
              </p>

              <h3 className="text-lg font-semibold">Responsibility and Accountability</h3>
              <p>
                Take responsibility for your actions and be accountable for any consequences. Return borrowed items on
                time and in good condition.
              </p>

              <h3 className="text-lg font-semibold">Compliance with Laws and Regulations</h3>
              <p>
                Comply with all applicable laws and regulations. Do not use Buckeye Borrow for any illegal or
                unauthorized purposes.
              </p>

              <h3 className="text-lg font-semibold">Reporting Violations</h3>
              <p>
                Report any violations of these guidelines to the Buckeye Borrow team. Help us maintain a safe and
                respectful community.
              </p>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => setGuidelinesOpen(false)}>
              Close
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
