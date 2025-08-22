import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Cigarette, Crown, Zap } from 'lucide-react';

interface AvatarOption {
  id: string;
  name: string;
  description: string;
  image_url: string;
  gender: 'male' | 'female';
  age_group: 'young' | 'middle' | 'old';
}

interface AvatarSelectorProps {
  open: boolean;
  onClose: () => void;
  currentAvatarId?: string;
  onAvatarSelect: (avatarId: string) => void;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({ 
  open, 
  onClose, 
  currentAvatarId,
  onAvatarSelect 
}) => {
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchAvatars();
    }
  }, [open]);

  const fetchAvatars = async () => {
    try {
      const { data, error } = await supabase
        .from('avatar_options')
        .select('*')
        .order('age_group', { ascending: true })
        .order('gender', { ascending: true });

      if (error) throw error;

        if (!data || data.length === 0) {
          // No avatars exist, generate them
          await generateAvatars();
        } else {
          setAvatars(data as AvatarOption[]);
        }
    } catch (error) {
      console.error('Error fetching avatars:', error);
      toast({
        title: "Error Loading Avatars",
        description: "Failed to load avatar options. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAvatars = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-avatars');
      
      if (error) throw error;

      toast({
        title: "Avatars Generated!",
        description: `Successfully created ${data.generated} yakuza warrior avatars.`,
      });

      // Refresh the avatar list
      await fetchAvatars();
    } catch (error) {
      console.error('Error generating avatars:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate avatars. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = () => {
    if (selectedAvatarId) {
      onAvatarSelect(selectedAvatarId);
      onClose();
    }
  };

  const getAgeIcon = (age: string) => {
    switch (age) {
      case 'young': return <Zap className="w-3 h-3" />;
      case 'middle': return <Cigarette className="w-3 h-3" />;
      case 'old': return <Crown className="w-3 h-3" />;
      default: return null;
    }
  };

  const filterAvatars = (gender?: string, age?: string) => {
    return avatars.filter(avatar => 
      (!gender || avatar.gender === gender) &&
      (!age || avatar.age_group === age)
    );
  };

  if (loading || generating) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-warrior-leather border-warrior-gold/20 text-warrior-light max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-warrior-gold">
              {generating ? 'Forging Warrior Avatars...' : 'Loading Avatars...'}
            </DialogTitle>
            <DialogDescription className="text-warrior-light/70">
              {generating ? 'Creating 20 unique yakuza warriors for you to choose from.' : 'Please wait while we load your avatar options.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-warrior-leather border-warrior-gold/20 text-warrior-light max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-warrior-gold">Choose Your Warrior Avatar</DialogTitle>
          <DialogDescription className="text-warrior-light/70">
            Select from our collection of elite yakuza warriors who share your passion for cigars and premium beef.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-warrior-dark">
            <TabsTrigger value="all" className="data-[state=active]:bg-warrior-gold data-[state=active]:text-warrior-dark">All</TabsTrigger>
            <TabsTrigger value="male" className="data-[state=active]:bg-warrior-gold data-[state=active]:text-warrior-dark">Male</TabsTrigger>
            <TabsTrigger value="female" className="data-[state=active]:bg-warrior-gold data-[state=active]:text-warrior-dark">Female</TabsTrigger>
            <TabsTrigger value="elder" className="data-[state=active]:bg-warrior-gold data-[state=active]:text-warrior-dark">Elders</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedAvatarId === avatar.id
                      ? 'border-warrior-gold shadow-warrior-gold'
                      : 'border-warrior-gold/20 hover:border-warrior-gold/50'
                  }`}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                >
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-warrior-dark/90 to-transparent p-2">
                    <p className="text-warrior-light font-semibold text-sm">{avatar.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs border-warrior-gold/50 text-warrior-gold bg-warrior-gold/10"
                      >
                        {getAgeIcon(avatar.age_group)}
                        {avatar.age_group}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-warrior-ember/50 text-warrior-ember bg-warrior-ember/10"
                      >
                        {avatar.gender}
                      </Badge>
                    </div>
                  </div>
                  {selectedAvatarId === avatar.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warrior-gold flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-warrior-dark" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="male" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {filterAvatars('male').map((avatar) => (
                <div
                  key={avatar.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedAvatarId === avatar.id
                      ? 'border-warrior-gold shadow-warrior-gold'
                      : 'border-warrior-gold/20 hover:border-warrior-gold/50'
                  }`}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                >
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-warrior-dark/90 to-transparent p-2">
                    <p className="text-warrior-light font-semibold text-sm">{avatar.name}</p>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-warrior-gold/50 text-warrior-gold bg-warrior-gold/10 mt-1"
                    >
                      {getAgeIcon(avatar.age_group)}
                      {avatar.age_group}
                    </Badge>
                  </div>
                  {selectedAvatarId === avatar.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warrior-gold flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-warrior-dark" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="female" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {filterAvatars('female').map((avatar) => (
                <div
                  key={avatar.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedAvatarId === avatar.id
                      ? 'border-warrior-gold shadow-warrior-gold'
                      : 'border-warrior-gold/20 hover:border-warrior-gold/50'
                  }`}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                >
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-warrior-dark/90 to-transparent p-2">
                    <p className="text-warrior-light font-semibold text-sm">{avatar.name}</p>
                    <Badge 
                      variant="outline" 
                      className="text-xs border-warrior-gold/50 text-warrior-gold bg-warrior-gold/10 mt-1"
                    >
                      {getAgeIcon(avatar.age_group)}
                      {avatar.age_group}
                    </Badge>
                  </div>
                  {selectedAvatarId === avatar.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warrior-gold flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-warrior-dark" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="elder" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {filterAvatars(undefined, 'old').map((avatar) => (
                <div
                  key={avatar.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    selectedAvatarId === avatar.id
                      ? 'border-warrior-gold shadow-warrior-gold'
                      : 'border-warrior-gold/20 hover:border-warrior-gold/50'
                  }`}
                  onClick={() => setSelectedAvatarId(avatar.id)}
                >
                  <img
                    src={avatar.image_url}
                    alt={avatar.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-warrior-dark/90 to-transparent p-2">
                    <p className="text-warrior-light font-semibold text-sm">{avatar.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge 
                        variant="outline" 
                        className="text-xs border-warrior-gold/50 text-warrior-gold bg-warrior-gold/10"
                      >
                        <Crown className="w-3 h-3 mr-1" />
                        Elder
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs border-warrior-ember/50 text-warrior-ember bg-warrior-ember/10"
                      >
                        {avatar.gender}
                      </Badge>
                    </div>
                  </div>
                  {selectedAvatarId === avatar.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-warrior-gold flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-warrior-dark" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-warrior-light hover:bg-warrior-gold/10"
          >
            Cancel
          </Button>
          <Button
            variant="warrior"
            onClick={handleSelect}
            disabled={!selectedAvatarId}
          >
            Select Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};