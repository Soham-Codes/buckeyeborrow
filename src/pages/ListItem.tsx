import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Header } from '@/components/Header';
import { AlertCircle, CheckCircle2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ListItem() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedItem, setSubmittedItem] = useState<any>(null);
  
  // Form state
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [campusArea, setCampusArea] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupTimeWindow, setPickupTimeWindow] = useState('');
  const [maxBorrowDuration, setMaxBorrowDuration] = useState('');
  const [costType, setCostType] = useState('free');
  const [conditionNotes, setConditionNotes] = useState('');
  const [borrowerExpectations, setBorrowerExpectations] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!agreedToTerms) {
      setError('Please agree to lend responsibly');
      setLoading(false);
      return;
    }

    try {
      let photoUrl = '';

      // Upload photo if provided
      if (photoFile && user) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('item-photos')
          .upload(fileName, photoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('item-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Insert item into database
      const { data, error: insertError } = await supabase
        .from('items')
        .insert({
          owner_id: user?.id,
          item_name: itemName,
          category,
          photo_url: photoUrl,
          campus_area: campusArea,
          pickup_location: pickupLocation,
          pickup_time_window: pickupTimeWindow,
          max_borrow_duration: maxBorrowDuration,
          cost_type: costType,
          condition_notes: conditionNotes,
          borrower_expectations: borrowerExpectations,
          contact_method: contactMethod,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setSubmittedItem(data);
      setSubmitted(true);
      toast.success('Item listed successfully!');
    } catch (err: any) {
      console.error('Error listing item:', err);
      setError(err.message || 'Failed to list item');
      toast.error('Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  // Show confirmation after successful submission
  if (submitted && submittedItem) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <Card className="border-border/50 shadow-elegant">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Your item is now listed!</CardTitle>
              <CardDescription>Students can now request to borrow your item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submittedItem.photo_url && (
                <img
                  src={submittedItem.photo_url}
                  alt={submittedItem.item_name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Item:</span> {submittedItem.item_name}
                </div>
                <div>
                  <span className="font-semibold">Category:</span> {submittedItem.category}
                </div>
                <div>
                  <span className="font-semibold">Pickup:</span> {submittedItem.pickup_location}
                </div>
                <div>
                  <span className="font-semibold">Campus Area:</span> {submittedItem.campus_area}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate('/')} className="flex-1">
                  View All Items
                </Button>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setSubmittedItem(null);
                    // Reset form
                    setItemName('');
                    setCategory('');
                    setPhotoFile(null);
                    setPhotoPreview('');
                    setCampusArea('');
                    setPickupLocation('');
                    setPickupTimeWindow('');
                    setMaxBorrowDuration('');
                    setCostType('free');
                    setConditionNotes('');
                    setBorrowerExpectations('');
                    setContactMethod('');
                    setAgreedToTerms(false);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  List Another Item
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>List an Item</CardTitle>
            <CardDescription>Share your item with the OSU community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Item Basics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Item Basics</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name *</Label>
                  <Input
                    id="itemName"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="e.g., Canon DSLR Camera"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory} required disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tech">Tech</SelectItem>
                      <SelectItem value="School Supplies">School Supplies</SelectItem>
                      <SelectItem value="Tools / Fix-It">Tools / Fix-It</SelectItem>
                      <SelectItem value="Event / Tailgate">Event / Tailgate</SelectItem>
                      <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">Item Photo</Label>
                  {photoPreview ? (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Label htmlFor="photo" className="cursor-pointer text-primary hover:underline">
                        Click to upload photo
                      </Label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location Info</h3>

                <div className="space-y-2">
                  <Label htmlFor="campusArea">Campus Area *</Label>
                  <Select value={campusArea} onValueChange={setCampusArea} required disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select campus area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="North Campus">North Campus</SelectItem>
                      <SelectItem value="South Campus">South Campus</SelectItem>
                      <SelectItem value="West Campus">West Campus</SelectItem>
                      <SelectItem value="Off-Campus Nearby">Off-Campus Nearby</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupLocation">Pickup Location *</Label>
                  <Input
                    id="pickupLocation"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="e.g., Smith-Steeb Lobby"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pickupTimeWindow">Preferred Pickup Time Window *</Label>
                  <Input
                    id="pickupTimeWindow"
                    value={pickupTimeWindow}
                    onChange={(e) => setPickupTimeWindow(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="e.g., Weekdays 5-8 PM"
                  />
                </div>
              </div>

              {/* Borrowing Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Borrowing Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="maxBorrowDuration">Max Borrow Duration *</Label>
                  <Select value={maxBorrowDuration} onValueChange={setMaxBorrowDuration} required disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 day">1 day</SelectItem>
                      <SelectItem value="3 days">3 days</SelectItem>
                      <SelectItem value="1 week">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cost Type *</Label>
                  <RadioGroup value={costType} onValueChange={setCostType} disabled={loading}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="free" id="free" />
                      <Label htmlFor="free" className="font-normal cursor-pointer">Free to borrow</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="favor" id="favor" />
                      <Label htmlFor="favor" className="font-normal cursor-pointer">Small favor / snack</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="token" id="token" disabled />
                      <Label htmlFor="token" className="font-normal text-muted-foreground">Token (coming soon)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conditionNotes">Condition / Notes</Label>
                  <Textarea
                    id="conditionNotes"
                    value={conditionNotes}
                    onChange={(e) => setConditionNotes(e.target.value)}
                    disabled={loading}
                    placeholder="e.g., Slight scratches, works perfectly. Please return in pouch."
                    rows={3}
                  />
                </div>
              </div>

              {/* Rules & Expectations */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Rules & Expectations</h3>

                <div className="space-y-2">
                  <Label htmlFor="borrowerExpectations">Borrower Expectation Note</Label>
                  <Input
                    id="borrowerExpectations"
                    value={borrowerExpectations}
                    onChange={(e) => setBorrowerExpectations(e.target.value)}
                    disabled={loading}
                    placeholder="e.g., Text me before pickup"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactMethod">Contact Method *</Label>
                  <Select value={contactMethod} onValueChange={setContactMethod} required disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OSU Email">OSU Email</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                      <SelectItem value="In-App" disabled>In-App (coming soon)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Confirmation */}
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    disabled={loading}
                  />
                  <Label htmlFor="terms" className="font-normal cursor-pointer leading-normal">
                    I agree to lend this item responsibly and return to pick-up location for handoff.
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !agreedToTerms}>
                {loading ? 'Listing Item...' : 'Confirm Item Listing'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
