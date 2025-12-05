import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { canAccessStep, FunnelType } from '../services/funnelSessionService';

interface RouteGuardProps {
  children: ReactNode;
  step: number;
  funnelType: FunnelType;
  redirectTo: string;
}

/**
 * RouteGuard Component
 * Protects funnel steps by checking if previous steps are completed.
 * Redirects to the first step if prerequisites are not met.
 */
export function RouteGuard({ children, step, funnelType, redirectTo }: RouteGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Small delay to ensure localStorage is ready
    const checkAccess = () => {
      const access = canAccessStep(funnelType, step);
      setHasAccess(access);
      setIsChecking(false);
    };

    // Check access after a small delay to ensure localStorage is synced
    const timer = setTimeout(checkAccess, 50);
    return () => clearTimeout(timer);
  }, [step, funnelType]);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if user doesn't have access
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if access is granted
  return <>{children}</>;
}

// Pre-configured guards for each funnel type
interface BasementRouteGuardProps {
  children: ReactNode;
  step: number;
}

export function BasementRouteGuard({ children, step }: BasementRouteGuardProps) {
  return (
    <RouteGuard
      step={step}
      funnelType="basement"
      redirectTo="/basement-suite/step-1"
    >
      {children}
    </RouteGuard>
  );
}

interface PodRouteGuardProps {
  children: ReactNode;
  step: number;
}

export function PodRouteGuard({ children, step }: PodRouteGuardProps) {
  return (
    <RouteGuard
      step={step}
      funnelType="pod"
      redirectTo="/pod/step-1"
    >
      {children}
    </RouteGuard>
  );
}
