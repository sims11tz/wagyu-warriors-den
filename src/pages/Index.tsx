import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen warrior-dark flex items-center justify-center">
        <div className="text-warrior-gold text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen warrior-dark flex items-center justify-center p-4">
        <div className="absolute inset-0 warrior-pattern opacity-10" />
        <div className="text-center space-y-6 relative z-10">
          <h1 className="text-4xl font-bold text-warrior-gold mb-4">
            The Wagyu Warriors
          </h1>
          <p className="text-warrior-light text-lg max-w-md mx-auto">
            Join the elite culinary brotherhood. Create your warrior profile and enter the exclusive world of premium beef and fine cigars.
          </p>
          <Link to="/auth">
            <Button variant="warrior" size="lg">
              Enter the Club
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return <MainLayout />;
};

export default Index;
