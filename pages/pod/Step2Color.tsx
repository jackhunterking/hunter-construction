import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { usePodForm, POD_TOTAL_STEPS } from '../../contexts/PodFormContext';
import { COLOR_OPTIONS } from '../../constants';

export default function Step2Color() {
  const navigate = useNavigate();
  const { formData, updateConfig, completeStep, trackStepView, isInitialized } = usePodForm();

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(2);
    }
  }, [isInitialized, trackStepView]);

  const handleNext = async () => {
    await completeStep(2);
    navigate('/pod/step-3');
  };

  const handleBack = () => {
    navigate('/pod/step-1');
  };

  const isValid = formData.config.exteriorColor !== null;

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={2}
      totalSteps={POD_TOTAL_STEPS}
      title="Pod Estimator"
    >
      <StepContainer
        title="Choose your exterior"
        description="Our premium composite cladding is durable and maintenance-free. Swipe to view options."
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isValid}
      >
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-6 px-6 no-scrollbar">
          {COLOR_OPTIONS.map((option) => (
            <div 
              key={option.value} 
              className="snap-center shrink-0 w-[85%] sm:w-[300px] pt-4"
            >
              <button
                onClick={() => updateConfig({ exteriorColor: option.value })}
                className={`w-full flex flex-col rounded-lg overflow-hidden border-2 transition-all duration-300 transform active:scale-95 ${
                  formData.config.exteriorColor === option.value
                    ? 'border-primary shadow-xl scale-[1.02]'
                    : 'border-transparent shadow-md scale-100 opacity-90 hover:border-accent'
                }`}
              >
                <div className="h-48 sm:h-56 w-full bg-slate-200 relative">
                  <img 
                    src={option.image} 
                    alt={option.label} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-white w-full p-4 flex justify-between items-center shrink-0">
                  <span className={`font-bold text-lg text-left ${
                    formData.config.exteriorColor === option.value ? 'text-primary' : 'text-slate-600'
                  }`}>
                    {option.label}
                  </span>
                  <div 
                    className="w-8 h-8 rounded-full border border-slate-200 shadow-sm shrink-0"
                    style={{ backgroundColor: option.hex }}
                  />
                </div>
              </button>
            </div>
          ))}
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
