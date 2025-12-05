import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { useBasementForm, BASEMENT_TOTAL_STEPS } from '../../contexts/BasementFormContext';

// Email validation helper
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function Step7Email() {
  const navigate = useNavigate();
  const { formData, updateFormData, completeStep, trackStepView, isInitialized } = useBasementForm();

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(7);
    }
  }, [isInitialized, trackStepView]);

  const handleNext = async () => {
    await completeStep(7);
    navigate('/basement-suite/step-8');
  };

  const handleBack = () => {
    navigate('/basement-suite/step-6');
  };

  const isValid = isValidEmail(formData.email);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={7}
      totalSteps={BASEMENT_TOTAL_STEPS}
      title="Basement Suite"
    >
      <StepContainer
        title="Email address"
        description="We'll use this to contact you about your project."
        onNext={handleNext}
        onBack={handleBack}
        nextLabel="Next"
        isNextDisabled={!isValid}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300 ${
                formData.email && !isValidEmail(formData.email) ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-secondary'
              }`}
              value={formData.email}
              onChange={(e) => updateFormData({ email: e.target.value })}
            />
            {formData.email && !isValidEmail(formData.email) && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
            )}
          </div>
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
