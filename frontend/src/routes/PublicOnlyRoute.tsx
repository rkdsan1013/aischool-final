// src/components/PublicOnlyRoute.tsx
import React, { type ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useProfile } from "../hooks/useProfile";

interface PublicOnlyRouteProps {
  children: ReactElement;
  redirectTo?: string;
  loadingFallback?: ReactElement;
}

const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({
  children,
  redirectTo = "/home",
  loadingFallback = <div className="p-6 text-center">Loading...</div>,
}) => {
  const { isAuthLoading } = useAuth();
  const { profile, isProfileLoading } = useProfile();

  const isLoading = isAuthLoading || isProfileLoading;
  const isLoggedIn = !!profile;

  if (isLoading) return loadingFallback;
  if (isLoggedIn) return <Navigate to={redirectTo} replace />;
  return children;
};

export default PublicOnlyRoute;
