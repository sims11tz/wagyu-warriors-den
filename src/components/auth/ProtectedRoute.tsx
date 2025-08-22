import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/useProfile';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAgeVerification?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAgeVerification = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen warrior-dark flex items-center justify-center">
        <div className="text-warrior-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAgeVerification && (!profile || !profile.age_verified)) {
    return (
      <div className="min-h-screen warrior-dark flex items-center justify-center p-4">
        <Card className="max-w-md bg-warrior-leather/90 border-warrior-gold/20">
          <CardHeader>
            <CardTitle className="text-warrior-gold">Age Verification Required</CardTitle>
            <CardDescription className="text-warrior-light">
              Access to the Cigar Lounge requires age verification (21+). Please verify your age in your profile settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="warrior" 
              onClick={() => window.location.href = '/profile'}
              className="w-full"
            >
              Verify Age in Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;