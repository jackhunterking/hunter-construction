import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { usePodForm, POD_TOTAL_STEPS } from '../../contexts/PodFormContext';
import { completeQuote } from '../../services/databaseService';
import { sendConfirmationEmail } from '../../services/emailService';
import { trackCompleteRegistration } from '../../services/metaEventsService';

// Phone validation helper
const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

export default function Step8Contact() {
  const navigate = useNavigate();
  const { formData, updateContact, completeStep, trackStepView, finalizeFunnel, isInitialized, sessionId } = usePodForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(8);
    }
  }, [isInitialized, trackStepView]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Complete the step first
      await completeStep(8);

      // Complete quote in database
      const completedQuote = await completeQuote(formData.contact.email, formData.address, formData.contact);

      // Track CompleteRegistration for Meta (key conversion event)
      await trackCompleteRegistration(
        formData.contact.email,
        formData.contact.fullName,
        formData.contact.phone,
        'pod',
        sessionId || undefined
      );

      // Send confirmation email
      sendConfirmationEmail(
        completedQuote.id,
        formData.contact.email,
        formData.contact.fullName,
        formData.contact.phone,
        formData.address.fullAddress,
        formData.config,
        {
          low: formData.estimate?.low || 0,
          high: formData.estimate?.high || 0,
        }
      ).catch(err => {
        console.error('Failed to send confirmation email:', err);
      });

      setToastMessage('Quote saved successfully!');
      setShowToast(true);

      // Finalize the funnel session
      await finalizeFunnel();

      // Navigate to confirmation page
      navigate('/pod/confirmation', { 
        state: { 
          fullName: formData.contact.fullName,
          address: formData.address.fullAddress,
          submitted: true 
        } 
      });
    } catch (error) {
      console.error('Error completing quote:', error);
      setToastMessage('Failed to save quote. Please try again.');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/pod/step-7');
  };

  const isValid = formData.contact.fullName.trim().length > 0 && isValidPhone(formData.contact.phone);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={8}
      totalSteps={POD_TOTAL_STEPS}
      title="Availability"
      subtitle="Final Details"
    >
      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-slate-900/95 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/50">
          <span className="text-green-400 font-bold text-lg">✓</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      </div>

      <StepContainer
        title="Final Step"
        description="Please enter your contact details for availability & final quote"
        onNext={handleSubmit}
        onBack={handleBack}
        nextLabel={isSubmitting ? "Submitting..." : "Submit"}
        isNextDisabled={!isValid || isSubmitting}
      >
        <div className="space-y-5 mt-2">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300"
              value={formData.contact.fullName}
              onChange={(e) => updateContact({ fullName: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="5551234567"
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300 ${
                formData.contact.phone && !isValidPhone(formData.contact.phone) ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-secondary'
              }`}
              value={formData.contact.phone}
              onChange={(e) => updateContact({ phone: e.target.value })}
            />
            {formData.contact.phone && !isValidPhone(formData.contact.phone) && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit phone number.</p>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 mt-4">
            <strong>Note:</strong> We will reach out to you to confirm your property details and site access before providing a final buildable quote.
          </div>
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
