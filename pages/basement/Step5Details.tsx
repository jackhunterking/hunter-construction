import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { useBasementForm, BASEMENT_TOTAL_STEPS } from '../../contexts/BasementFormContext';

export default function Step5Details() {
  const navigate = useNavigate();
  const { formData, updateFormData, completeStep, trackStepView, isInitialized } = useBasementForm();

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(5);
    }
  }, [isInitialized, trackStepView]);

  const handleNext = async () => {
    await completeStep(5);
    navigate('/basement-suite/step-6');
  };

  const handleBack = () => {
    navigate('/basement-suite/step-4');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={5}
      totalSteps={BASEMENT_TOTAL_STEPS}
      title="Basement Suite"
    >
      <StepContainer
        title="Additional details (optional)"
        onNext={handleNext}
        onBack={handleBack}
        nextLabel="Next"
        isNextDisabled={false}
      >
        <div className="space-y-4">
          <textarea
            placeholder="Enter your project details, vision, or any special requests (optional)"
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-white text-slate-900 shadow-sm min-h-[150px] resize-none placeholder:text-slate-400 transition-all duration-300"
            value={formData.additionalDetails}
            onChange={(e) => updateFormData({ additionalDetails: e.target.value })}
          />
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
