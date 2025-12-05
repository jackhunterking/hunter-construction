import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { useBasementForm, BASEMENT_TOTAL_STEPS } from '../../contexts/BasementFormContext';
import { BasementProjectType } from '../../types/basement';
import { PROJECT_TYPE_OPTIONS } from '../../constants/basement';
import { trackViewContent } from '../../services/metaCapiService';

export default function Step1ProjectTypes() {
  const navigate = useNavigate();
  const { formData, updateFormData, completeStep, trackStepView, sessionId, isInitialized } = useBasementForm();
  const hasTrackedViewContent = useRef(false);

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(1);
    }
  }, [isInitialized, trackStepView]);

  // Track Meta CAPI ViewContent event (fire once per session)
  useEffect(() => {
    if (isInitialized && sessionId && !hasTrackedViewContent.current) {
      hasTrackedViewContent.current = true;
      trackViewContent(sessionId, 'basement', 'Basement Suite - Start');
    }
  }, [isInitialized, sessionId]);

  // Toggle project type selection (multi-select)
  const toggleProjectType = (type: BasementProjectType) => {
    const isSelected = formData.projectTypes.includes(type);
    updateFormData({
      projectTypes: isSelected
        ? formData.projectTypes.filter(t => t !== type)
        : [...formData.projectTypes, type],
    });
  };

  const handleNext = async () => {
    await completeStep(1);
    navigate('/basement-suite/step-2');
  };

  const isValid = formData.projectTypes.length > 0;

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={1}
      totalSteps={BASEMENT_TOTAL_STEPS}
      title="Basement Suite"
    >
      <StepContainer
        title="What are you looking to renovate?"
        description="Select all that apply to your basement project."
        onNext={handleNext}
        isNextDisabled={!isValid}
      >
        <div className="space-y-3">
          {PROJECT_TYPE_OPTIONS.map((option) => {
            const isSelected = formData.projectTypes.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleProjectType(option.value)}
                className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                  isSelected
                    ? 'border-primary shadow-md'
                    : 'border-slate-200 hover:border-accent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`font-bold text-lg ${
                    isSelected ? 'text-primary' : 'text-slate-700'
                  }`}>
                    {option.label}
                  </span>
                </div>
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isSelected ? 'border-primary bg-primary' : 'border-slate-300'
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
