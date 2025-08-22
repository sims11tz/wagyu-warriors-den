import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { sanitizeHandle, sanitizeBio } from '@/utils/security';
import { useProfile } from '@/hooks/useProfile';
import { AvatarSelector } from './AvatarSelector';
import { Camera } from 'lucide-react';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ open, onClose }) => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarSelectorOpen, setAvatarSelectorOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    handle: '',
    bio: '',
    public_profile: false,
    avatar_id: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        handle: profile.handle || '',
        bio: profile.bio || '',
        public_profile: profile.public_profile || false,
        avatar_id: profile.avatar_id || '',
      });
    }
  }, [profile]);

  const handleAvatarSelect = async (avatarId: string) => {
    setFormData(prev => ({ ...prev, avatar_id: avatarId }));
    
    // Auto-save avatar selection
    if (profile) {
      const { error } = await updateProfile({ avatar_id: avatarId });
      if (error) {
        toast({
          title: "Avatar Update Failed",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Avatar Updated",
          description: "Your warrior avatar has been updated successfully.",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;

    // Sanitize inputs
    const cleanHandle = formData.handle.trim() ? sanitizeHandle(formData.handle) : null;
    const cleanBio = formData.bio.trim() ? sanitizeBio(formData.bio) : null;

    if (formData.handle.trim() && !cleanHandle) {
      toast({
        title: "Invalid Handle",
        description: "Handle must be 3-20 characters, letters, numbers, underscore, or dash only.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const { error } = await updateProfile({
      handle: cleanHandle,
      bio: cleanBio,
      public_profile: formData.public_profile,
      avatar_id: formData.avatar_id,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Update Failed",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your warrior profile has been updated successfully.",
      });
      onClose();
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-warrior-leather border-warrior-gold/20 text-warrior-light max-w-md">
          <DialogHeader>
            <DialogTitle className="text-warrior-gold">Edit Profile</DialogTitle>
            <DialogDescription className="text-warrior-light/70">
              Update your warrior details and preferences.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar Selection */}
            <div className="space-y-2">
              <Label className="text-warrior-light">Avatar</Label>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setAvatarSelectorOpen(true)}
                className="w-full h-20 border-2 border-dashed border-warrior-gold/30 hover:border-warrior-gold/50 flex flex-col items-center justify-center gap-2"
              >
                <Camera className="w-6 h-6 text-warrior-gold" />
                <span className="text-sm text-warrior-light">
                  {formData.avatar_id ? 'Change Avatar' : 'Choose Avatar'}
                </span>
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="handle" className="text-warrior-light">Warrior Handle</Label>
              <Input
                id="handle"
                value={formData.handle}
                onChange={(e) => handleChange('handle', e.target.value)}
                placeholder="Enter your warrior handle"
                className="bg-warrior-dark/50 border-warrior-gold/30 text-warrior-light"
                maxLength={20}
              />
              <p className="text-xs text-warrior-light/50">3-20 characters, letters, numbers, underscore, or dash only</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-warrior-light">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell fellow warriors about yourself..."
                className="bg-warrior-dark/50 border-warrior-gold/30 text-warrior-light resize-none"
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-warrior-light/50">{formData.bio.length}/500 characters</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="public_profile"
                checked={formData.public_profile}
                onCheckedChange={(checked) => handleChange('public_profile', checked as boolean)}
              />
              <Label htmlFor="public_profile" className="text-sm text-warrior-light">
                Make my profile visible to other warriors
              </Label>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
                className="text-warrior-light hover:bg-warrior-gold/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="warrior"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AvatarSelector
        open={avatarSelectorOpen}
        onClose={() => setAvatarSelectorOpen(false)}
        currentAvatarId={formData.avatar_id}
        onAvatarSelect={handleAvatarSelect}
      />
    </>
  );
};