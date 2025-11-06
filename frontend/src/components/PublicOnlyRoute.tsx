// src/components/PublicOnlyRoute.tsx
import React, { type ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

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
  const { isLoggedIn, isLoading } = useAuth();
  if (isLoading) return loadingFallback;
  if (isLoggedIn) return <Navigate to={redirectTo} replace />;
  return children;
};

export default PublicOnlyRoute;
