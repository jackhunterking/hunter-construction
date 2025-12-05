import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { useBasementForm, BASEMENT_TOTAL_STEPS } from '../../contexts/BasementFormContext';

export default function Step6Location() {
  const navigate = useNavigate();
  const { formData, updateFormData, completeStep, trackStepView, isInitialized } = useBasementForm();

  // Local state for address autocomplete
  const [addressInput, setAddressInput] = useState(formData.projectLocation || '');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [addressSelected, setAddressSelected] = useState(!!formData.projectLocation);

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(6);
    }
  }, [isInitialized, trackStepView]);

  // Sync addressInput with formData on mount
  useEffect(() => {
    if (formData.projectLocation) {
      setAddressInput(formData.projectLocation);
      setAddressSelected(true);
    }
  }, [formData.projectLocation]);

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
    if (!addressSelected) {
      const timer = setTimeout(() => {
        fetchAddressSuggestions(addressInput);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [addressInput, addressSelected]);

  // Handle address selection from suggestions
  const handleAddressSelect = (feature: any) => {
    const selectedAddress = feature.place_name;
    setAddressInput(selectedAddress);
    updateFormData({ projectLocation: selectedAddress });
    setAddressSelected(true);
    setShowSuggestions(false);
  };

  // Handle manual address input change
  const handleAddressInputChange = (value: string) => {
    setAddressInput(value);
    setAddressSelected(false);
    updateFormData({ projectLocation: '' });
  };

  const handleNext = async () => {
    await completeStep(6);
    navigate('/basement-suite/step-7');
  };

  const handleBack = () => {
    navigate('/basement-suite/step-5');
  };

  const isValid = formData.projectLocation.trim().length > 0;

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={6}
      totalSteps={BASEMENT_TOTAL_STEPS}
      title="Basement Suite"
    >
      <StepContainer
        title="Project location"
        description="We use this to confirm service availability."
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isValid}
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
    </FunnelLayout>
  );
}
