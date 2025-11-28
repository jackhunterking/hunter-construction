import React from 'react';

interface StepContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  isNextDisabled?: boolean;
  isFinalStep?: boolean;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  title,
  description,
  children,
  onNext,
  onBack,
  nextLabel = 'Next',
  isNextDisabled = false,
  isFinalStep = false,
}) => {
  return (
    <div className="flex flex-col h-full w-full max-w-lg mx-auto overflow-hidden relative">
      {/* Header */}
      <div className="px-6 pt-4 pb-2">
        <h2 className="text-3xl font-bold text-primary leading-tight">{title}</h2>
        {description && <p className="mt-3 text-slate-600 leading-relaxed">{description}</p>}
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 px-6 pt-6 pb-32 overflow-y-auto no-scrollbar">
        {children}
      </div>

      {/* Sticky Footer Actions */}
      {!isFinalStep && (
        <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-6 pb-8 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-10 flex gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-4 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-100 transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={`flex-1 py-4 px-6 rounded-lg font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${
              isNextDisabled
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-primary hover:bg-[#022c30] shadow-primary/30'
            }`}
          >
            {nextLabel}
          </button>
        </div>
      )}
    </div>
  );
};