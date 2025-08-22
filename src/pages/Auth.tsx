import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { sanitizeInput, sanitizeHandle, isValidEmail } from '@/utils/security';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState('');
  const [ageVerified, setAgeVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect authenticated users to main app
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize inputs
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password; // Don't sanitize passwords as they may contain special chars
    
    if (!cleanEmail || !cleanPassword) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    const { error } = await signIn(cleanEmail, cleanPassword);
    setLoading(false);
    
    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back, Warrior",
        description: "Successfully signed in.",
      });
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize inputs
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password; // Don't sanitize passwords
    let cleanHandle = null;
    
    if (handle.trim()) {
      cleanHandle = sanitizeHandle(handle);
      if (!cleanHandle) {
        toast({
          title: "Invalid handle",
          description: "Handle must be 3-20 characters, letters, numbers, underscore, or dash only.",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (!cleanEmail || !cleanPassword) {
      toast({
        title: "Missing information",
        description: "Please enter email and password.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    if (!ageVerified) {
      toast({
        title: "Age verification required",
        description: "You must be 21+ to join The Wagyu Warriors.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    const { error } = await signUp(cleanEmail, cleanPassword, cleanHandle || undefined);
    setLoading(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast({
          title: "Account exists",
          description: "An account with this email already exists. Try signing in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Welcome to the Club",
        description: "Your warrior profile has been created. Check your email to verify your account.",
      });
    }
  };

  return (
    <div className="min-h-screen warrior-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 warrior-pattern opacity-10" />
      
      <Card className="w-full max-w-md bg-warrior-leather/90 border-warrior-gold/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-warrior-gold">
            The Wagyu Warriors
          </CardTitle>
          <CardDescription className="text-warrior-light">
            Enter the elite culinary brotherhood
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="signin" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-warrior-dark">
              <TabsTrigger value="signin" className="data-[state=active]:bg-warrior-gold data-[state=active]:text-warrior-dark">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-warrior-gold data-[state=active]:text-warrior-dark">
                Join Club
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-warrior-light">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="warrior@example.com"
                    className="bg-warrior-dark/50 border-warrior-gold/30 text-warrior-light"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-warrior-light">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-warrior-dark/50 border-warrior-gold/30 text-warrior-light"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  variant="warrior"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Entering...' : 'Enter the Club'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-handle" className="text-warrior-light">Warrior Handle</Label>
                  <Input
                    id="signup-handle"
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="beef_master"
                    className="bg-warrior-dark/50 border-warrior-gold/30 text-warrior-light"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-warrior-light">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="warrior@example.com"
                    className="bg-warrior-dark/50 border-warrior-gold/30 text-warrior-light"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-warrior-light">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-warrior-dark/50 border-warrior-gold/30 text-warrior-light"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="age-verification"
                    checked={ageVerified}
                    onCheckedChange={(checked) => setAgeVerified(checked as boolean)}
                  />
                  <Label htmlFor="age-verification" className="text-sm text-warrior-light">
                    I am 21+ years old (required for Cigar Lounge access)
                  </Label>
                </div>
                
                <Button
                  type="submit"
                  variant="warrior"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Forging Profile...' : 'Become a Warrior'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;