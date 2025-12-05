import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { usePodForm, POD_TOTAL_STEPS } from '../../contexts/PodFormContext';
import { FLOORING_OPTIONS } from '../../constants';

export default function Step3Flooring() {
  const navigate = useNavigate();
  const { formData, updateConfig, completeStep, trackStepView, isInitialized } = usePodForm();

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(3);
    }
  }, [isInitialized, trackStepView]);

  const handleNext = async () => {
    await completeStep(3);
    navigate('/pod/step-4');
  };

  const handleBack = () => {
    navigate('/pod/step-2');
  };

  const isValid = formData.config.flooring !== null;

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={3}
      totalSteps={POD_TOTAL_STEPS}
      title="Pod Estimator"
    >
      <StepContainer
        title="What flooring would you prefer?"
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isValid}
      >
        <div className="space-y-4">
          {FLOORING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateConfig({ flooring: option.value })}
              className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                formData.config.flooring === option.value
                  ? 'border-primary shadow-md'
                  : 'border-slate-200 hover:border-accent'
              }`}
            >
              <span className={`font-bold text-lg ${
                formData.config.flooring === option.value ? 'text-primary' : 'text-slate-700'
              }`}>
                {option.label}
              </span>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                formData.config.flooring === option.value ? 'border-primary bg-primary' : 'border-slate-300'
              }`}>
                {formData.config.flooring === option.value && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
