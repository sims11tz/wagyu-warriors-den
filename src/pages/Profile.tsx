import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const { profile, refreshProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [meatsCount, setMeatsCount] = useState(0);

  // Fetch meats prepared count
  useEffect(() => {
    const fetchMeatsCount = async () => {
      if (!user) return;
      
      try {
        const { count, error } = await supabase
          .from('cooking_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (error) throw error;
        setMeatsCount(count || 0);
      } catch (error) {
        console.error('Error fetching meats count:', error);
        setMeatsCount(0);
      }
    };

    fetchMeatsCount();
  }, [user]);

  const MeatsStatCounter = () => (
    <div className="text-center">
      <div className="text-2xl font-bold text-warrior-gold">
        {meatsCount}
      </div>
      <div className="text-xs text-muted-foreground">Meats Prepared</div>
    </div>
  );

  // Refresh profile stats when component mounts
  useEffect(() => {
    refreshProfile();
  }, []);

  const [formData, setFormData] = useState({
    handle: profile?.handle || "",
    bio: profile?.bio || "",
    public_profile: profile?.public_profile || false,
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          handle: formData.handle,
          bio: formData.bio,
          public_profile: formData.public_profile,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAgeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !birthDate) return;

    setLoading(true);
    try {
      // Verify age using the database function
      const { data: isOldEnough, error: verifyError } = await supabase
        .rpc('verify_user_age', { birth_date: birthDate });

      if (verifyError) throw verifyError;

      if (!isOldEnough) {
        toast({
          title: "Age Verification Failed",
          description: "You must be 21 or older to access the Cigar Lounge.",
          variant: "destructive",
        });
        return;
      }

      // Update profile with age verification
      const { error } = await supabase
        .from('profiles')
        .update({ age_verified: true })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Age Verified",
        description: "You now have access to the Cigar Lounge!",
      });

      // Navigate back to main page
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify age",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen warrior-dark flex items-center justify-center">
        <div className="text-warrior-gold text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen warrior-dark p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="warrior-glass rounded-xl p-6 border border-warrior-gold/20">
          <div className="flex items-center space-x-3">
            <User className="text-warrior-gold" size={24} />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your warrior profile</p>
            </div>
          </div>
        </div>

        {/* Age Verification Card */}
        {!profile.age_verified && (
          <Card className="warrior-glass border-warrior-ember/30 bg-warrior-ember/5">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="text-warrior-ember" size={20} />
                <CardTitle className="text-warrior-ember">Age Verification Required</CardTitle>
              </div>
              <CardDescription>
                To access the Cigar Lounge, you must verify that you are 21 years or older.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAgeVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-foreground">
                    Date of Birth
                  </Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="bg-warrior-leather/20 border-warrior-gold/30"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your birth date is used only for age verification and is not stored.
                  </p>
                </div>
                <Button
                  type="submit"
                  variant="warrior"
                  disabled={loading || !birthDate}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify Age (21+)"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Avatar Selection */}
        <Card className="warrior-glass border-warrior-gold/20">
          <CardHeader>
            <CardTitle className="text-foreground">Avatar</CardTitle>
            <CardDescription>Choose your warrior avatar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full border-2 border-warrior-gold/30 overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Current avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-warrior-leather/20 flex items-center justify-center">
                    <User className="text-warrior-gold" size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-foreground">
                  {profile.avatar_url ? "Current Avatar" : "No Avatar Selected"}
                </p>
                <Button
                  variant="warrior-outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    toast({
                      title: "Avatar Selection",
                      description: "Avatar customization coming soon!",
                    });
                  }}
                >
                  Change Avatar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="warrior-glass border-warrior-gold/20">
          <CardHeader>
            <CardTitle className="text-foreground">Profile Information</CardTitle>
            <CardDescription>Update your public profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="handle" className="text-foreground">Handle</Label>
                <Input
                  id="handle"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  placeholder="Your warrior handle"
                  className="bg-warrior-leather/20 border-warrior-gold/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-foreground">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell fellow warriors about yourself..."
                  className="bg-warrior-leather/20 border-warrior-gold/30"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public-profile"
                  checked={formData.public_profile}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, public_profile: checked })
                  }
                />
                <Label htmlFor="public-profile" className="text-foreground">
                  Make profile public
                </Label>
              </div>

              <Button
                type="submit"
                variant="warrior"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Updating..." : "Update Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card className="warrior-glass border-warrior-gold/20">
          <CardHeader>
            <CardTitle className="text-foreground">Warrior Stats</CardTitle>
            <CardDescription>Your culinary achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warrior-gold">
                  {profile.marbling_points || 0}
                </div>
                <div className="text-xs text-muted-foreground">Marbling Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warrior-ember">
                  {profile.sear_score || 0}
                </div>
                <div className="text-xs text-muted-foreground">Sear Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warrior-smoke">
                  {profile.smoke_rings || 0}
                </div>
                <div className="text-xs text-muted-foreground">Smoke Rings</div>
              </div>
              <MeatsStatCounter />
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Button
            variant="warrior-outline"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;