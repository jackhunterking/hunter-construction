import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { usePodForm, POD_TOTAL_STEPS } from '../../contexts/PodFormContext';
import { HvacOption } from '../../types';

export default function Step4Hvac() {
  const navigate = useNavigate();
  const { formData, updateConfig, completeStep, trackStepView, isInitialized } = usePodForm();

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(4);
    }
  }, [isInitialized, trackStepView]);

  const handleNext = async () => {
    await completeStep(4);
    navigate('/pod/step-5');
  };

  const handleBack = () => {
    navigate('/pod/step-3');
  };

  const isValid = formData.config.hvac !== null;

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
      totalSteps={POD_TOTAL_STEPS}
      title="Pod Estimator"
    >
      <StepContainer
        title="Add Heating & Cooling?"
        description="A mini-split system ensures your pod is comfortable year-round."
        onNext={handleNext}
        onBack={handleBack}
        nextLabel="Next"
        isNextDisabled={!isValid}
      >
        <div className="space-y-4">
          <button
            onClick={() => updateConfig({ hvac: HvacOption.YES })}
            className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
              formData.config.hvac === HvacOption.YES
                ? 'border-primary shadow-md'
                : 'border-slate-200 hover:border-accent'
            }`}
          >
            <div>
              <div className={`font-bold text-lg ${
                formData.config.hvac === HvacOption.YES ? 'text-primary' : 'text-slate-700'
              }`}>Yes, include it</div>
              <div className="text-sm text-slate-500 mt-0.5">Full climate control (Mini-split)</div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              formData.config.hvac === HvacOption.YES ? 'border-primary bg-primary' : 'border-slate-300'
            }`}>
              {formData.config.hvac === HvacOption.YES && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
          </button>

          <button
            onClick={() => updateConfig({ hvac: HvacOption.NO })}
            className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
              formData.config.hvac === HvacOption.NO
                ? 'border-primary shadow-md'
                : 'border-slate-200 hover:border-accent'
            }`}
          >
            <div>
              <div className={`font-bold text-lg ${
                formData.config.hvac === HvacOption.NO ? 'text-primary' : 'text-slate-700'
              }`}>No thanks</div>
              <div className="text-sm text-slate-500 mt-0.5">I'll source my own solution</div>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
              formData.config.hvac === HvacOption.NO ? 'border-primary bg-primary' : 'border-slate-300'
            }`}>
              {formData.config.hvac === HvacOption.NO && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
          </button>
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
