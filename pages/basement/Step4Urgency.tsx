import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { useBasementForm, BASEMENT_TOTAL_STEPS } from '../../contexts/BasementFormContext';
import { PROJECT_URGENCY_OPTIONS } from '../../constants/basement';

export default function Step4Urgency() {
  const navigate = useNavigate();
  const { formData, updateFormData, completeStep, trackStepView, isInitialized } = useBasementForm();

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(4);
    }
  }, [isInitialized, trackStepView]);

  const handleNext = async () => {
    await completeStep(4);
    navigate('/basement-suite/step-5');
  };

  const handleBack = () => {
    navigate('/basement-suite/step-3');
  };

  const isValid = formData.projectUrgency !== null;

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={4}
      totalSteps={BASEMENT_TOTAL_STEPS}
      title="Basement Suite"
    >
      <StepContainer
        title="Project urgency"
        description="When are you looking to start your basement renovation?"
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isValid}
      >
        <div className="space-y-4">
          {PROJECT_URGENCY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFormData({ projectUrgency: option.value })}
              className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                formData.projectUrgency === option.value
                  ? 'border-primary shadow-md'
                  : 'border-slate-200 hover:border-accent'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.icon}</span>
                <span className={`font-bold text-lg ${
                  formData.projectUrgency === option.value ? 'text-primary' : 'text-slate-700'
                }`}>
                  {option.label}
                </span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                formData.projectUrgency === option.value ? 'border-primary bg-primary' : 'border-slate-300'
              }`}>
                {formData.projectUrgency === option.value && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
