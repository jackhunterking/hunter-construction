import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { usePodForm, POD_TOTAL_STEPS } from '../../contexts/PodFormContext';
import { trackLead } from '../../services/metaCapiService';

// Email validation helper
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export default function Step5Email() {
  const navigate = useNavigate();
  const { formData, updateContact, completeStep, trackStepView, sessionId, isInitialized } = usePodForm();

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(5);
    }
  }, [isInitialized, trackStepView]);

  const handleNext = async () => {
    // Track Meta CAPI Lead event when email is captured
    if (sessionId && formData.contact.email) {
      trackLead(sessionId, 'pod', formData.contact.email, 'Pod Estimator - Email Capture');
    }
    
    await completeStep(5);
    navigate('/pod/step-6');
  };

  const handleBack = () => {
    navigate('/pod/step-4');
  };

  const isValid = isValidEmail(formData.contact.email);

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
      totalSteps={POD_TOTAL_STEPS}
      title="Pod Estimator"
    >
      <StepContainer
        title="Where should we send your estimate?"
        onNext={handleNext}
        onBack={handleBack}
        nextLabel="Get my estimate"
        isNextDisabled={!isValid}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300 ${
                formData.contact.email && !isValidEmail(formData.contact.email) ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-secondary'
              }`}
              value={formData.contact.email}
              onChange={(e) => updateContact({ email: e.target.value })}
            />
            {formData.contact.email && !isValidEmail(formData.contact.email) && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
            <strong>Note:</strong> We will be using this email to send you the estimate.
          </div>
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
