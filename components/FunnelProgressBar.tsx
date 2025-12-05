import React from 'react';

interface FunnelProgressBarProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

/**
 * FunnelProgressBar Component
 * Displays progress through the funnel steps with a clean, modern design.
 */
export function FunnelProgressBar({
  currentStep,
  totalSteps,
  title,
  subtitle,
}: FunnelProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  const label = `STEP ${currentStep} / ${totalSteps}`;

  return (
    <div className="w-full max-w-lg mx-auto px-6 py-4">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="font-bold text-primary text-sm tracking-wide uppercase">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        <span className="text-xs font-bold text-primary/50 bg-primary/5 px-2 py-1 rounded-md">
          {label}
        </span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

/**
 * FunnelLayout Component
 * Wraps funnel pages with consistent layout including progress bar and styling.
 */
interface FunnelLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  showProgress?: boolean;
}

export function FunnelLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  showProgress = true,
}: FunnelLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Progress Bar */}
      {showProgress && (
        <FunnelProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          title={title}
          subtitle={subtitle}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center">
        {children}
      </main>
    </div>
  );
}
