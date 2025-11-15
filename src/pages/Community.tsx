import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, MessageSquare, Search, Calendar, Target } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Request {
  id: string;
  request_number: string;
  requester_id: string;
  item_name: string;
  needed_by_date: string;
  purpose: string;
  additional_details: string;
  status: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface Comment {
  id: string;
  request_id: string;
  commenter_id: string;
  comment_text: string;
  listing_number: string | null;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export default function Community() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New request form
  const [itemName, setItemName] = useState('');
  const [neededByDate, setNeededByDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  
  // Comment form
  const [commentText, setCommentText] = useState('');
  const [listingNumber, setListingNumber] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { returnTo: '/community' } });
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  // Realtime subscription for comments
  useEffect(() => {
    if (!selectedRequest) return;

    const channel = supabase
      .channel('request-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_comments',
          filter: `request_id=eq.${selectedRequest.id}`,
        },
        async (payload) => {
          // Fetch the comment with profile data
          const { data } = await supabase
            .from('request_comments')
            .select(`
              *,
              profiles!request_comments_commenter_id_fkey (full_name)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (data) {
            setComments((prev) => [...prev, data as any]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRequest]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        profiles:requester_id (full_name)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load requests');
      return;
    }

    setRequests(data as Request[]);
  };

  const fetchComments = async (requestId: string) => {
    const { data, error } = await supabase
      .from('request_comments')
      .select(`
        *,
        profiles:commenter_id (full_name)
      `)
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error('Failed to load comments');
      return;
    }

    setComments(data as Comment[]);
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('requests')
        .insert({
          requester_id: user?.id,
          item_name: itemName,
          needed_by_date: neededByDate,
          purpose: purpose,
          additional_details: additionalDetails,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`Request created! ID: ${data.request_number}`);
      setShowNewRequest(false);
      setItemName('');
      setNeededByDate('');
      setPurpose('');
      setAdditionalDetails('');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('request_comments')
        .insert({
          request_id: selectedRequest.id,
          commenter_id: user?.id,
          comment_text: commentText,
          listing_number: listingNumber || null,
        });

      if (error) throw error;

      setCommentText('');
      setListingNumber('');
      toast.success('Comment posted!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request);
    fetchComments(request.id);
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.purpose.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Requests</h1>
            <p className="text-muted-foreground mt-1">Looking for something? Post a request!</p>
          </div>
          <Button onClick={() => setShowNewRequest(!showNewRequest)}>
            {showNewRequest ? 'Cancel' : 'New Request'}
          </Button>
        </div>

        {showNewRequest && (
          <Card className="mb-6 border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Create a Request</CardTitle>
              <CardDescription>Fill in the details about what you need</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">What item do you need? *</Label>
                  <Input
                    id="item-name"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g., Chemistry Lab Goggles"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="needed-by">When do you need it by? *</Label>
                  <Input
                    id="needed-by"
                    type="date"
                    value={neededByDate}
                    onChange={(e) => setNeededByDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">What do you need it for? *</Label>
                  <Input
                    id="purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g., Stats 3470 Final Exam"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Additional Details (Optional)</Label>
                  <Textarea
                    id="details"
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                    placeholder="Any other relevant information..."
                    rows={3}
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Post Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Requests List */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by item, ID, or purpose..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredRequests.map((request) => (
                <Card
                  key={request.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow border-border/50"
                  onClick={() => handleViewRequest(request)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{request.item_name}</CardTitle>
                      <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        #{request.request_number}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Need by: {format(new Date(request.needed_by_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Target className="h-4 w-4" />
                      <span>{request.purpose}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Posted by {request.profiles.full_name}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredRequests.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {searchQuery ? 'No requests found matching your search.' : 'No active requests yet. Be the first to post one!'}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div>
            {selectedRequest ? (
              <Card className="border-border/50 shadow-elegant">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{selectedRequest.item_name}</CardTitle>
                      <CardDescription className="mt-1">
                        Request ID: <span className="font-mono">#{selectedRequest.request_number}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm pt-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Need by: {format(new Date(selectedRequest.needed_by_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      <span>{selectedRequest.purpose}</span>
                    </div>
                    {selectedRequest.additional_details && (
                      <p className="text-muted-foreground">{selectedRequest.additional_details}</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Comments */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {comments.map((comment) => (
                      <div key={comment.id} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-sm">{comment.profiles.full_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), 'MMM dd, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment_text}</p>
                        {comment.listing_number && (
                          <div className="mt-2 text-xs bg-background px-2 py-1 rounded inline-block">
                            Listing: <span className="font-mono font-medium">#{comment.listing_number}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No comments yet. Be the first to respond!</p>
                      </div>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="space-y-3 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="comment">Your Response</Label>
                      <Textarea
                        id="comment"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share if you have this item or any helpful information..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="listing-number">Your Listing Number (Optional)</Label>
                      <Input
                        id="listing-number"
                        value={listingNumber}
                        onChange={(e) => setListingNumber(e.target.value)}
                        placeholder="e.g., ABCDE"
                        maxLength={5}
                      />
                      <p className="text-xs text-muted-foreground">
                        If you have this item listed, include your listing number
                      </p>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">Select a request to view and reply</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
