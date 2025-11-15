import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Auth() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');

  // Check if user came from password reset email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'reset') {
      setIsResettingPassword(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !isResettingPassword) {
      navigate('/');
    }
  }, [user, navigate, isResettingPassword]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signin-email') as string;
    const password = formData.get('signin-password') as string;

    // Validate OSU email
    if (!email.endsWith('@osu.edu')) {
      setError('Please use your OSU email address (@osu.edu)');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message);
      }
    } else {
      navigate('/');
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('signup-email') as string;
    const password = formData.get('signup-password') as string;
    const confirmPassword = formData.get('signup-confirm-password') as string;
    const fullName = formData.get('signup-name') as string;
    const dormArea = formData.get('signup-dorm') as string;

    // Validate OSU email (only @osu.edu, not other .edu)
    if (!email.endsWith('@osu.edu')) {
      setError('Please use your OSU email address (@osu.edu). Other .edu emails are not accepted.');
      setLoading(false);
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          dorm_area: dormArea,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      // Show verification form
      setVerificationEmail(email);
      setShowVerification(true);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetSuccess(false);

    // Validate OSU email
    if (!resetEmail.endsWith('@osu.edu')) {
      setResetError('Please use your OSU email address (@osu.edu)');
      setResetLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    if (error) {
      // Better error messages for common issues
      if (error.message.includes('hook')) {
        setResetError('Email service is temporarily unavailable. Please try again in a few minutes or contact support.');
      } else {
        setResetError(error.message);
      }
    } else {
      setResetSuccess(true);
    }

    setResetLoading(false);
  };

  const handleVerifyEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.verifyOtp({
      email: verificationEmail,
      token: verificationCode,
      type: 'signup',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: verificationEmail,
    });

    if (error) {
      setError(error.message);
    } else {
      setError('');
      // Show success message using Alert instead of error
    }

    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setError(error.message);
    } else {
      // Clear the mode parameter and redirect to home
      navigate('/', { replace: true });
    }

    setLoading(false);
  };

  // Show email verification form after sign-up
  if (showVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Verify Your Email</h1>
            <p className="text-muted-foreground mt-2">Check your OSU email for the verification code</p>
          </div>

          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Enter Verification Code</CardTitle>
              <CardDescription>We sent a 6-digit code to {verificationEmail}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyEmail} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    disabled={loading}
                    maxLength={6}
                    pattern="[0-9]{6}"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify Email'}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-sm"
                  >
                    Resend Code
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show password reset form if user came from email link
  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground mt-2">Enter your new password</p>
          </div>

          <Card className="border-border/50 shadow-elegant">
            <CardHeader>
              <CardTitle>Create New Password</CardTitle>
              <CardDescription>Choose a strong password for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="text-left mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Go to Dashboard
            </Button>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
              <Heart className="h-8 w-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Buckeye Borrow</h1>
            <p className="text-muted-foreground mt-2">OSU Community Sharing Platform</p>
          </div>
        </div>

        <Card className="border-border/50 shadow-elegant">
          <CardHeader>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>Sign in or create your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signin-email">OSU Email</Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="name.1@osu.edu"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="signin-password"
                      type="password"
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>

                  <div className="text-center mt-4">
                    <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="link" 
                          className="text-sm text-muted-foreground hover:text-primary"
                          type="button"
                        >
                          Forgot password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset your password</DialogTitle>
                          <DialogDescription>
                            Enter your OSU email address and we'll send you a link to reset your password.
                          </DialogDescription>
                        </DialogHeader>

                        {resetSuccess ? (
                          <Alert className="border-green-500/50 bg-green-500/10">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <AlertDescription className="text-green-700 dark:text-green-400">
                              Password reset email sent! Check your inbox for instructions.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <form onSubmit={handleForgotPassword} className="space-y-4">
                            {resetError && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{resetError}</AlertDescription>
                              </Alert>
                            )}

                            <div className="space-y-2">
                              <Label htmlFor="reset-email">OSU Email</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                placeholder="name.1@osu.edu"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                disabled={resetLoading}
                              />
                            </div>

                            <Button type="submit" className="w-full" disabled={resetLoading}>
                              {resetLoading ? 'Sending...' : 'Send reset link'}
                            </Button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      name="signup-name"
                      type="text"
                      placeholder="Brutus Buckeye"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-dorm">Dorm/Area (Optional)</Label>
                    <Input
                      id="signup-dorm"
                      name="signup-dorm"
                      type="text"
                      placeholder="North Campus, Smith-Steeb Hall"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">OSU Email (Only @osu.edu)</Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="name.1@osu.edu"
                      required
                      disabled={loading}
                      pattern="[a-zA-Z0-9._%+-]+@osu\.edu$"
                      title="Must be a valid @osu.edu email address"
                    />
                    <p className="text-xs text-muted-foreground">
                      Only OSU email addresses are accepted. Other .edu emails will not work.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <Input
                      id="signup-confirm-password"
                      name="signup-confirm-password"
                      type="password"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
