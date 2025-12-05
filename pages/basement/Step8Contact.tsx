import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { useBasementForm, BASEMENT_TOTAL_STEPS } from '../../contexts/BasementFormContext';
import { createBasementInquiry } from '../../services/basementDatabaseService';
import { sendBasementConfirmationEmail, sendBasementSalesNotification } from '../../services/emailService';
import { trackCompleteRegistration } from '../../services/metaCapiService';

// Phone validation helper
const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

export default function Step8Contact() {
  const navigate = useNavigate();
  const { formData, updateFormData, completeStep, trackStepView, finalizeFunnel, sessionId, isInitialized } = useBasementForm();
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

      // Save to database
      const inquiry = await createBasementInquiry(formData);
      const inquiryId = inquiry.id;
      const submittedAt = inquiry.created_at;

      // Send both emails in parallel
      try {
        await Promise.all([
          // Customer confirmation email
          sendBasementConfirmationEmail(
            formData.email,
            formData.fullName,
            formData.phone,
            formData.projectLocation,
            formData.projectTypes,
            formData.needsSeparateEntrance ?? false,
            formData.hasPlanDesign ?? false,
            formData.projectUrgency || '',
            formData.additionalDetails || null
          ),
          // Sales team notification email
          sendBasementSalesNotification(
            inquiryId,
            formData.email,
            formData.fullName,
            formData.phone,
            formData.projectLocation,
            formData.projectTypes,
            formData.needsSeparateEntrance ?? false,
            formData.hasPlanDesign ?? false,
            formData.projectUrgency || '',
            formData.additionalDetails || null,
            submittedAt
          ),
        ]);
      } catch (emailError) {
        console.error('Error sending emails:', emailError);
        // Don't fail the submission if email fails
      }

      // Track Meta CAPI CompleteRegistration event
      if (sessionId) {
        trackCompleteRegistration(
          sessionId,
          'basement',
          {
            email: formData.email,
            phone: formData.phone,
            firstName: formData.fullName.split(' ')[0],
            lastName: formData.fullName.split(' ').slice(1).join(' ') || undefined,
          },
          'Basement Suite - Form Complete'
        );
      }

      // Finalize the funnel session
      await finalizeFunnel();

      // Navigate to confirmation page with email for display
      navigate('/basement-suite-confirmation', { 
        state: { 
          email: formData.email,
          submitted: true 
        } 
      });
    } catch (error) {
      console.error('Error submitting basement inquiry:', error);
      setToastMessage('Failed to submit. Please try again.');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/basement-suite/step-7');
  };

  const isValid = formData.fullName.trim().length > 0 && isValidPhone(formData.phone);

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
      totalSteps={BASEMENT_TOTAL_STEPS}
      title="Basement Suite"
    >
      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-slate-900/95 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/50">
          <span className="text-red-400 font-bold text-lg">!</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      </div>

      <StepContainer
        title="Contact details"
        description="We'll use this to follow up and confirm project details."
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
              value={formData.fullName}
              onChange={(e) => updateFormData({ fullName: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Phone Number</label>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="5551234567"
              className={`w-full p-4 border rounded-lg focus:ring-2 focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300 ${
                formData.phone && !isValidPhone(formData.phone) ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-secondary'
              }`}
              value={formData.phone}
              onChange={(e) => updateFormData({ phone: e.target.value })}
            />
            {formData.phone && !isValidPhone(formData.phone) && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit phone number.</p>
            )}
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 mt-4">
            <strong>Note:</strong> We'll use this to follow up and confirm project details.
          </div>
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
