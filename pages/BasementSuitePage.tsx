import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../components/StepContainer';
import {
  BasementFormData,
  BasementProjectType,
  ProjectUrgency,
  BasementStepId,
} from '../types/basement';
import {
  BASEMENT_STEPS_ORDER,
  PROJECT_TYPE_OPTIONS,
  SEPARATE_ENTRANCE_OPTIONS,
  PLAN_DESIGN_OPTIONS,
  PROJECT_URGENCY_OPTIONS,
} from '../constants/basement';
import { createBasementInquiry } from '../services/basementDatabaseService';
import { sendBasementConfirmationEmail, sendBasementSalesNotification } from '../services/emailService';
import { trackFormStep } from '../services/metaEventsService';

// --- VALIDATION HELPERS ---

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

// --- MAIN BASEMENT SUITE COMPONENT ---

export default function BasementSuitePage() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<BasementFormData>({
    projectTypes: [],
    needsSeparateEntrance: null,
    hasPlanDesign: null,
    projectUrgency: null,
    additionalDetails: '',
    projectLocation: '',
    email: '',
    fullName: '',
    phone: '',
  });

  // Mapbox Autocomplete State
  const [addressInput, setAddressInput] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [addressSelected, setAddressSelected] = useState(false);

  const currentStepId: BasementStepId = BASEMENT_STEPS_ORDER[currentStepIndex];

  // Track form step views (both client and server)
  useEffect(() => {
    trackFormStep(
      currentStepId,
      'basement',
      currentStepIndex + 1,
      BASEMENT_STEPS_ORDER.length,
      formData.email || undefined
    ).catch(err => {
      console.error('Failed to track form step:', err);
    });
  }, [currentStepIndex, currentStepId, formData.email]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Mapbox Geocoding - Fetch address suggestions
  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!MAPBOX_TOKEN) {
      console.warn('Mapbox token not configured');
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=CA&types=address,postcode&limit=5`
      );
      const data = await response.json();
      
      if (data.features) {
        setAddressSuggestions(data.features);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced address search
  useEffect(() => {
    if (!addressSelected && currentStepId === 'PROJECT_LOCATION') {
      const timer = setTimeout(() => {
        fetchAddressSuggestions(addressInput);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [addressInput, addressSelected, currentStepId]);

  // Handle address selection from suggestions
  const handleAddressSelect = (feature: any) => {
    const selectedAddress = feature.place_name;
    setAddressInput(selectedAddress);
    setFormData({ ...formData, projectLocation: selectedAddress });
    setAddressSelected(true);
    setShowSuggestions(false);
  };

  // Handle manual address input change
  const handleAddressInputChange = (value: string) => {
    setAddressInput(value);
    setAddressSelected(false);
    setFormData({ ...formData, projectLocation: '' });
  };

  // Toggle project type selection (multi-select)
  const toggleProjectType = (type: BasementProjectType) => {
    setFormData(prev => {
      const isSelected = prev.projectTypes.includes(type);
      return {
        ...prev,
        projectTypes: isSelected
          ? prev.projectTypes.filter(t => t !== type)
          : [...prev.projectTypes, type],
      };
    });
  };

  const handleNext = async () => {
    // If at the final CONTACT step, submit the form
    if (currentStepId === 'CONTACT') {
      setIsSubmitting(true);

      try {
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

        // Navigate to confirmation page with email for display
        // Note: Lead tracking moved to confirmation page to match Custom Conversion URL rule
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
      return;
    }

    // Standard Next
    if (currentStepIndex < BASEMENT_STEPS_ORDER.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // Check if current step is valid to proceed
  const isStepValid = (): boolean => {
    switch (currentStepId) {
      case 'PROJECT_TYPES':
        return formData.projectTypes.length > 0;
      case 'SEPARATE_ENTRANCE':
        return formData.needsSeparateEntrance !== null;
      case 'PLAN_DESIGN':
        return formData.hasPlanDesign !== null;
      case 'PROJECT_URGENCY':
        return formData.projectUrgency !== null;
      case 'ADDITIONAL_DETAILS':
        return true; // Optional field
      case 'PROJECT_LOCATION':
        return formData.projectLocation.trim().length > 0;
      case 'EMAIL':
        return isValidEmail(formData.email);
      case 'CONTACT':
        return formData.fullName.trim().length > 0 && isValidPhone(formData.phone);
      default:
        return true;
    }
  };

  // Progress Bar Logic
  const renderProgressBar = () => {
    const totalSteps = BASEMENT_STEPS_ORDER.length; // SUCCESS is handled by a separate route
    const progress = ((currentStepIndex + 1) / totalSteps) * 100;
    const label = `STEP ${currentStepIndex + 1} / ${totalSteps}`;

    return (
      <div className="w-full max-w-lg mx-auto px-6 py-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="font-bold text-primary text-sm tracking-wide uppercase">
            Basement Suite
          </h1>
          <span className="text-xs font-bold text-primary/50 bg-primary/5 px-2 py-1 rounded-md">
            {label}
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  // Step Renderers
  const renderStep = () => {
    switch (currentStepId) {
      case 'PROJECT_TYPES':
        return (
          <StepContainer
            title="What are you looking to renovate?"
            description="Select all that apply to your basement project."
            onNext={handleNext}
            isNextDisabled={!isStepValid()}
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
                      {option.icon && <span className="text-2xl">{option.icon}</span>}
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
        );

      case 'SEPARATE_ENTRANCE':
        return (
          <StepContainer
            title="Do you need a separate entrance?"
            description="A separate entrance is often required for legal rental suites."
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!isStepValid()}
          >
            <div className="space-y-4">
              {SEPARATE_ENTRANCE_OPTIONS.map((option) => (
                <button
                  key={String(option.value)}
                  onClick={() => setFormData({ ...formData, needsSeparateEntrance: option.value })}
                  className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                    formData.needsSeparateEntrance === option.value
                      ? 'border-primary shadow-md'
                      : 'border-slate-200 hover:border-accent'
                  }`}
                >
                  <span className={`font-bold text-lg ${
                    formData.needsSeparateEntrance === option.value ? 'text-primary' : 'text-slate-700'
                  }`}>
                    {option.label}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    formData.needsSeparateEntrance === option.value ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {formData.needsSeparateEntrance === option.value && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </StepContainer>
        );

      case 'PLAN_DESIGN':
        return (
          <StepContainer
            title="Do you already have a plan/design?"
            description="Let us know if you need help with design or already have plans ready."
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!isStepValid()}
          >
            <div className="space-y-4">
              {PLAN_DESIGN_OPTIONS.map((option) => (
                <button
                  key={String(option.value)}
                  onClick={() => setFormData({ ...formData, hasPlanDesign: option.value })}
                  className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                    formData.hasPlanDesign === option.value
                      ? 'border-primary shadow-md'
                      : 'border-slate-200 hover:border-accent'
                  }`}
                >
                  <span className={`font-bold text-lg ${
                    formData.hasPlanDesign === option.value ? 'text-primary' : 'text-slate-700'
                  }`}>
                    {option.label}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    formData.hasPlanDesign === option.value ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {formData.hasPlanDesign === option.value && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </StepContainer>
        );

      case 'PROJECT_URGENCY':
        return (
          <StepContainer
            title="Project urgency"
            description="When are you looking to start your basement renovation?"
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!isStepValid()}
          >
            <div className="space-y-4">
              {PROJECT_URGENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({ ...formData, projectUrgency: option.value })}
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
        );

      case 'ADDITIONAL_DETAILS':
        return (
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
                onChange={(e) => setFormData({ ...formData, additionalDetails: e.target.value })}
              />
            </div>
          </StepContainer>
        );

      case 'PROJECT_LOCATION':
        return (
          <StepContainer
            title="Project location"
            description="We use this to confirm service availability."
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!isStepValid()}
          >
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Address or Postal Code</label>
                <input
                  type="text"
                  placeholder="Enter your address or postal code"
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-white text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-300"
                  value={addressInput}
                  onChange={(e) => handleAddressInputChange(e.target.value)}
                  onFocus={() => {
                    if (addressSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                />
                {isLoadingSuggestions && (
                  <div className="absolute right-4 top-[46px] text-slate-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAddressSelect(suggestion)}
                        className="w-full text-left p-4 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-slate-900">{suggestion.text}</div>
                        <div className="text-sm text-slate-500">{suggestion.place_name}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                <strong>Note:</strong> We use this to confirm service availability in your area.
              </div>
            </div>
          </StepContainer>
        );

      case 'EMAIL':
        return (
          <StepContainer
            title="Email address"
            description="We'll use this to contact you about your project."
            onNext={handleNext}
            onBack={handleBack}
            nextLabel="Next"
            isNextDisabled={!isStepValid()}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formData.email && !isValidEmail(formData.email) && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
                )}
              </div>
            </div>
          </StepContainer>
        );

      case 'CONTACT':
        return (
          <StepContainer
            title="Contact details"
            description="We'll use this to follow up and confirm project details."
            onNext={handleNext}
            onBack={handleBack}
            nextLabel={isSubmitting ? "Submitting..." : "Submit"}
            isNextDisabled={!isStepValid() || isSubmitting}
          >
            <div className="space-y-5 mt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-slate-900/95 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/50">
          <span className="text-green-400 font-bold text-lg">✓</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      </div>

      {/* Top Bar - Progress Bar */}
      {renderProgressBar()}

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center">
        {renderStep()}
      </main>
    </div>
  );
}

