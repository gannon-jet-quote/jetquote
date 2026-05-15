import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandingSettings } from "@/hooks/useBrandingSettings";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  skipOnboardingCheck?: boolean;
}

const ProtectedRoute = ({ children, skipOnboardingCheck }: Props) => {
  const { user, loading } = useAuth();
  const { settings, loading: brandingLoading } = useBrandingSettings();
  const location = useLocation();

  if (loading || brandingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect new users to onboarding (only if not already there)
  if (
    !skipOnboardingCheck &&
    !settings?.onboarding_completed &&
    location.pathname !== "/settings" &&
    location.pathname !== "/onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
