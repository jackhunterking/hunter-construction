import React, { useState, useEffect, useRef } from 'react';
import { StepContainer } from '../components/StepContainer';
import {
  PodConfiguration,
  AddressData,
  ContactData,
  HvacOption,
  StepId,
  EstimateResult
} from '../types';
import {
  STEPS_ORDER,
  USE_CASE_OPTIONS,
  COLOR_OPTIONS,
  FLOORING_OPTIONS,
} from '../constants';
import { calculateEstimate } from '../services/pricingService';
import { createPartialQuote, completeQuote } from '../services/databaseService';
import { sendEstimateEmail, sendConfirmationEmail } from '../services/emailService';
import { trackLead, trackCompleteRegistration, trackViewContent } from '../services/metaEventsService';

// --- CONFIGURATION ---
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamFja2h1bnRlcmtpbmciLCJhIjoiY21mbmhocHVnMDN5dDJycTd6NXJsbzdvdCJ9.J9o8ZqveZnan_BjJJEAfpg';

// Declare Leaflet on window
declare global {
  interface Window {
    L: any;
  }
}

// --- VALIDATION HELPERS ---

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

// --- SUB-COMPONENTS ---

interface AddressStepProps {
  address: AddressData;
  setAddress: (addr: AddressData) => void;
  onNext: () => void;
  onBack: () => void;
}

const AddressStep: React.FC<AddressStepProps> = ({ address, setAddress, onNext, onBack }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [query, setQuery] = useState(address.fullAddress);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapError, setMapError] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // Initialize Map (Leaflet)
  useEffect(() => {
    const initTimer = window.setTimeout(() => {
      if (!mapContainer.current) return;
      if (map.current) return;

      if (!window.L) {
        console.warn("Leaflet JS not loaded");
        setMapError(true);
        return;
      }

      try {
        const defaultLat = 43.6532;
        const defaultLng = -79.3832;
        
        const center: [number, number] = (address.lat !== null && address.lng !== null) 
          ? [address.lat, address.lng] 
          : [defaultLat, defaultLng];
          
        const zoom = (address.lat !== null && address.lng !== null) ? 16 : 9;

        map.current = window.L.map(mapContainer.current, {
          center: center,
          zoom: zoom,
          zoomControl: false,
          attributionControl: false
        });
        
        window.L.control.zoom({
          position: 'topright'
        }).addTo(map.current);

        window.L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`, {
          tileSize: 512,
          zoomOffset: -1,
          attribution: '© Mapbox © OpenStreetMap'
        }).addTo(map.current);

        if (address.lat !== null && address.lng !== null) {
          marker.current = window.L.marker([address.lat, address.lng]).addTo(map.current);
        }

        setTimeout(() => {
          map.current?.invalidateSize();
        }, 200);

      } catch (err) {
        console.error("Error initializing map:", err);
        setMapError(true);
      }
    }, 100);

    return () => {
      window.clearTimeout(initTimer);
      try {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      } catch (e) {
        console.error("Error cleaning up map", e);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    setAddress({ ...address, fullAddress: val, lat: null, lng: null }); 

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    if (val.length > 2) {
      setIsSearching(true);
      debounceRef.current = window.setTimeout(() => {
        fetchSuggestions(val);
      }, 300) as unknown as number;
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const fetchSuggestions = async (searchText: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchText
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=ca&types=address&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    const fullAddr = feature.place_name;

    setQuery(fullAddr);
    setSuggestions([]);
    setAddress({
      fullAddress: fullAddr,
      lat,
      lng,
    });

    if (map.current) {
      try {
        map.current.flyTo([lat, lng], 16, { duration: 1.5 });

        if (marker.current) {
          map.current.removeLayer(marker.current);
        }
        marker.current = window.L.marker([lat, lng]).addTo(map.current);
      } catch (err) {
        console.error("Error updating map view:", err);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setSuggestions([]);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <StepContainer
      title="Where are you located?"
      description="Enter the address so we can check if your property is suitable for a 160 sq ft no-permit pod."
      onNext={onNext}
      onBack={onBack}
      isNextDisabled={!address.fullAddress || address.lat === null}
    >
      <div className="space-y-6 relative" onClick={(e) => e.stopPropagation()}>
        {/* Map View */}
        <div className="relative w-full h-56 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shadow-inner z-0">
          {mapError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-100 p-4 text-center">
              <span className="text-2xl mb-2">🗺️</span>
              <p className="text-sm">Map preview unavailable.</p>
              <p className="text-xs text-slate-400 mt-1">Please enter your address below.</p>
            </div>
          ) : (
            <>
              <div ref={mapContainer} className="w-full h-full z-0" style={{ zIndex: 0 }} />
              {!map.current && !window.L && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-100">
                  Map loading...
                </div>
              )}
            </>
          )}
        </div>

        {/* Address Input */}
        <div className="space-y-4 relative z-20">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Property Address</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Start typing your address..."
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-white text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-300"
              value={query}
              onChange={handleInputChange}
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            )}
            
            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-slate-200 max-h-60 overflow-y-auto z-50">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 text-slate-700 flex items-start gap-3 transition-colors"
                  >
                    <span className="mt-1 text-slate-400">📍</span>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{suggestion.text}</div>
                      <div className="text-xs text-slate-500 truncate">{suggestion.place_name}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </StepContainer>
  );
};

// --- MAIN POD ESTIMATOR COMPONENT ---

export default function PodEstimatorPage() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing requirements...');
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [isSavingQuote, setIsSavingQuote] = useState(false);

  // Form State
  const [config, setConfig] = useState<PodConfiguration>({
    useCase: null,
    exteriorColor: null,
    flooring: null,
    hvac: null,
    additionalDetails: '',
  });

  const [address, setAddress] = useState<AddressData>({
    fullAddress: '',
    lat: null,
    lng: null,
  });

  const [contact, setContact] = useState<ContactData>({
    email: '',
    fullName: '',
    phone: '',
  });

  const currentStepId: StepId = STEPS_ORDER[currentStepIndex] as StepId;

  // Helpers to determine "Phase"
  const isPhase1 = currentStepIndex < STEPS_ORDER.indexOf('RESULT');
  const isPhase2 = currentStepIndex > STEPS_ORDER.indexOf('RESULT') && currentStepId !== 'SUCCESS';

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleNext = async () => {
    if (currentStepId === 'EMAIL_CAPTURE') {
      const resultIndex = STEPS_ORDER.indexOf('RESULT');
      setIsLoading(true);
      setLoadingText('Analyzing your configuration...');
      setCurrentStepIndex(resultIndex);

      const pricing = calculateEstimate(config);
      setEstimate({
        ...pricing,
        summary: '',
      });

      try {
        const savedQuote = await createPartialQuote(contact.email, config, {
          low: pricing.low,
          high: pricing.high,
        });

        setQuoteId(savedQuote.id);

        sendEstimateEmail(contact.email, config, pricing, savedQuote.id).catch(err => {
          console.error('Failed to send estimate email:', err);
        });

        // Track Meta Lead event (email captured, estimate sent)
        trackLead(contact.email, (pricing.low + pricing.high) / 2).catch(err => {
          console.error('Failed to track Meta Lead event:', err);
        });

        setToastMessage(`Estimate sent to ${contact.email}`);
        setShowToast(true);
      } catch (error) {
        console.error('Error creating partial quote:', error);
        setToastMessage(`Estimate sent to ${contact.email}`);
        setShowToast(true);
      }

      setTimeout(() => {
        setLoadingText('Checking local material costs...');
      }, 800);

      setTimeout(() => {
        setLoadingText('Finalizing estimate...');
      }, 1600);

      setTimeout(() => {
        setIsLoading(false);
      }, 2400);
      return;
    }

    if (currentStepId === 'CONTACT') {
      setIsSavingQuote(true);
      setLoadingText('Saving your quote...');

      try {
        const completedQuote = await completeQuote(contact.email, address, contact);

        setQuoteId(completedQuote.id);

        sendConfirmationEmail(
          completedQuote.id,
          contact.email,
          contact.fullName,
          contact.phone,
          address.fullAddress,
          config,
          {
            low: estimate?.low || 0,
            high: estimate?.high || 0,
          }
        ).catch(err => {
          console.error('Failed to send confirmation email:', err);
        });

        // Track Meta CompleteRegistration event (full contact info submitted)
        trackCompleteRegistration(
          completedQuote.id,
          contact.email,
          contact.phone,
          contact.fullName,
          (estimate?.low || 0 + estimate?.high || 0) / 2
        ).catch(err => {
          console.error('Failed to track Meta CompleteRegistration event:', err);
        });

        setToastMessage('Quote saved successfully!');
        setShowToast(true);

        setCurrentStepIndex((prev) => prev + 1);
      } catch (error) {
        console.error('Error completing quote:', error);

        setToastMessage('Failed to save quote. Please try again.');
        setShowToast(true);

        setTimeout(() => {
          setCurrentStepIndex((prev) => prev + 1);
        }, 2000);
      } finally {
        setIsSavingQuote(false);
      }
      return;
    }

    if (currentStepIndex < STEPS_ORDER.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePhase2Start = () => {
    const addressIndex = STEPS_ORDER.indexOf('ADDRESS');
    setCurrentStepIndex(addressIndex);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      if (currentStepId === 'ADDRESS') {
        const resultIndex = STEPS_ORDER.indexOf('RESULT');
        setCurrentStepIndex(resultIndex);
      } else {
        setCurrentStepIndex((prev) => prev - 1);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Backyard Pod Estimate',
          text: `Check out this 160sqft pod I designed! Estimate: $${estimate?.low.toLocaleString()} - $${estimate?.high.toLocaleString()}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert('Link copied to clipboard!');
    }
  };

  // Progress Bar Logic
  const renderProgressBar = () => {
    if (currentStepId === 'RESULT' || currentStepId === 'SUCCESS') return null;

    let progress = 0;
    let label = '';

    if (isPhase1) {
      const totalPhase1 = 5;
      progress = ((currentStepIndex + 1) / totalPhase1) * 100;
      label = `STEP ${currentStepIndex + 1} / ${totalPhase1}`;
    } else if (isPhase2) {
      const phase2StartIndex = STEPS_ORDER.indexOf('ADDRESS');
      const totalPhase2 = 2;
      const currentPhase2Step = currentStepIndex - phase2StartIndex + 1;
      progress = (currentPhase2Step / totalPhase2) * 100;
      label = `FINAL DETAILS ${currentPhase2Step} / ${totalPhase2}`;
    }

    return (
      <div className="w-full max-w-lg mx-auto px-6 py-4">
        <div className="flex justify-between items-center mb-3">
          <h1 className="font-bold text-primary text-sm tracking-wide uppercase">
            {isPhase1 ? 'Pod Estimator' : 'Availability'}
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
      case 'INTENT':
        return (
          <StepContainer
            title="Purpose of use?"
            description="This helps us customize the interior layout recommendations."
            onNext={handleNext}
            isNextDisabled={!config.useCase}
          >
            <div className="space-y-4">
              {USE_CASE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setConfig({ ...config, useCase: option.value })}
                  className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                    config.useCase === option.value
                      ? 'border-primary shadow-md'
                      : 'border-slate-200 hover:border-accent'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{option.icon}</span>
                    <span className={`font-bold text-lg ${
                      config.useCase === option.value ? 'text-primary' : 'text-slate-700'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    config.useCase === option.value ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {config.useCase === option.value && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </StepContainer>
        );

      case 'COLOR':
        return (
          <StepContainer
            title="Choose your exterior"
            description="Our premium composite cladding is durable and maintenance-free. Swipe to view options."
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!config.exteriorColor}
          >
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-8 -mx-6 px-6 no-scrollbar">
              {COLOR_OPTIONS.map((option) => (
                <div 
                  key={option.value} 
                  className="snap-center shrink-0 w-[85%] sm:w-[300px] pt-4"
                >
                  <button
                    onClick={() => setConfig({ ...config, exteriorColor: option.value })}
                    className={`w-full flex flex-col rounded-lg overflow-hidden border-2 transition-all duration-300 transform active:scale-95 ${
                      config.exteriorColor === option.value
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
                        config.exteriorColor === option.value ? 'text-primary' : 'text-slate-600'
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
        );

      case 'FLOORING':
        return (
          <StepContainer
            title="What flooring would you prefer?"
            onNext={handleNext}
            onBack={handleBack}
            isNextDisabled={!config.flooring}
          >
            <div className="space-y-4">
              {FLOORING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setConfig({ ...config, flooring: option.value })}
                  className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                    config.flooring === option.value
                      ? 'border-primary shadow-md'
                      : 'border-slate-200 hover:border-accent'
                  }`}
                >
                  <span className={`font-bold text-lg ${
                    config.flooring === option.value ? 'text-primary' : 'text-slate-700'
                  }`}>
                    {option.label}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    config.flooring === option.value ? 'border-primary bg-primary' : 'border-slate-300'
                  }`}>
                    {config.flooring === option.value && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </StepContainer>
        );

      case 'HVAC':
        return (
          <StepContainer
            title="Add Heating & Cooling?"
            description="A mini-split system ensures your pod is comfortable year-round."
            onNext={handleNext}
            onBack={handleBack}
            nextLabel="Next"
            isNextDisabled={!config.hvac}
          >
            <div className="space-y-4">
              <button
                onClick={() => setConfig({ ...config, hvac: HvacOption.YES })}
                className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                  config.hvac === HvacOption.YES
                    ? 'border-primary shadow-md'
                    : 'border-slate-200 hover:border-accent'
                }`}
              >
                <div>
                  <div className={`font-bold text-lg ${
                    config.hvac === HvacOption.YES ? 'text-primary' : 'text-slate-700'
                  }`}>Yes, include it</div>
                  <div className="text-sm text-slate-500 mt-0.5">Full climate control (Mini-split)</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  config.hvac === HvacOption.YES ? 'border-primary bg-primary' : 'border-slate-300'
                }`}>
                  {config.hvac === HvacOption.YES && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </button>

              <button
                onClick={() => setConfig({ ...config, hvac: HvacOption.NO })}
                className={`w-full p-5 rounded-lg border-2 flex items-center justify-between transition-all duration-300 text-left bg-white transform hover:scale-[1.02] active:scale-[0.98] ${
                  config.hvac === HvacOption.NO
                    ? 'border-primary shadow-md'
                    : 'border-slate-200 hover:border-accent'
                }`}
              >
                <div>
                  <div className={`font-bold text-lg ${
                    config.hvac === HvacOption.NO ? 'text-primary' : 'text-slate-700'
                  }`}>No thanks</div>
                  <div className="text-sm text-slate-500 mt-0.5">I'll source my own solution</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  config.hvac === HvacOption.NO ? 'border-primary bg-primary' : 'border-slate-300'
                }`}>
                  {config.hvac === HvacOption.NO && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </button>
            </div>
          </StepContainer>
        );

      case 'EMAIL_CAPTURE':
        return (
          <StepContainer
            title="Where should we send your estimate?"
            onNext={handleNext}
            onBack={handleBack}
            nextLabel="Get my estimate"
            isNextDisabled={!isValidEmail(contact.email)}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full p-4 border rounded-lg focus:ring-2 focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300 ${
                    contact.email && !isValidEmail(contact.email) ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-secondary'
                  }`}
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                />
                {contact.email && !isValidEmail(contact.email) && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid email address.</p>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100">
                <strong>Note:</strong> We will be using this email to send you the estimate.
              </div>
            </div>
          </StepContainer>
        );

      case 'RESULT':
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 text-center">
              <div className="relative mb-8">
                <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl">
                  🏡
                </div>
              </div>
              <h2 className="text-2xl font-bold text-primary animate-pulse">{loadingText}</h2>
              <p className="text-slate-500 mt-3 max-w-xs mx-auto">Please wait while we generate your custom proposal.</p>
            </div>
          );
        }

        const selectedColorImg = COLOR_OPTIONS.find(c => c.value === config.exteriorColor)?.image || COLOR_OPTIONS[0].image;

        return (
          <div className="min-h-screen bg-white flex flex-col relative pb-24">
            {/* Hero Image Section */}
            <div className="w-full h-[40vh] min-h-[300px] relative bg-slate-200">
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-slate-700 hover:bg-white transition-all transform active:scale-95"
                aria-label="Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </button>

              <img 
                src={selectedColorImg} 
                alt={`${config.exteriorColor} Pod`} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Product Details Section */}
            <div className="flex-1 w-full max-w-lg mx-auto px-6 py-8">
              
              {/* Pricing */}
              <div className="mb-8">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Estimated Project Total</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-primary tracking-tight">
                    ${estimate?.low.toLocaleString()}
                  </span>
                  <span className="text-2xl font-medium text-slate-400">—</span>
                  <span className="text-4xl font-extrabold text-primary tracking-tight">
                    ${estimate?.high.toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mt-2">CAD + Tax • Includes delivery & installation</p>
              </div>

              <div className="border-t border-slate-100 my-8"></div>

              {/* Specifications Table */}
              <div className="mb-12">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Specifications</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-900 font-bold uppercase tracking-widest text-sm">Purpose</span>
                    <span className="font-bold text-slate-900 text-lg">
                      {USE_CASE_OPTIONS.find(u => u.value === config.useCase)?.label}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Size</span>
                    <span className="px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Standard 160 sq ft
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Exterior Finish</span>
                    <span className="font-semibold text-slate-900">{config.exteriorColor}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Flooring</span>
                    <span className="font-semibold text-slate-900">{config.flooring}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Heating & Cooling</span>
                    <span className="font-semibold text-slate-900">
                      {config.hvac === HvacOption.YES ? 'Included' : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 safe-area-pb z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="max-w-lg mx-auto w-full">
                <button 
                  onClick={handlePhase2Start}
                  className="w-full bg-primary text-white font-bold text-lg py-4 rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 transform hover:bg-secondary hover:scale-105 active:scale-95"
                >
                  Check Availability In Your Area
                </button>
              </div>
            </div>
          </div>
        );

      case 'ADDRESS':
        return (
          <AddressStep 
            address={address}
            setAddress={setAddress}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      case 'CONTACT':
        return (
          <StepContainer
            title="Final Step"
            description="Please enter your contact details for availability & final quote"
            onNext={handleNext}
            onBack={handleBack}
            nextLabel={isSavingQuote ? "Submitting..." : "Submit"}
            isNextDisabled={!contact.fullName || !isValidPhone(contact.phone) || isSavingQuote}
          >
            <div className="space-y-5 mt-2">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300"
                  value={contact.fullName}
                  onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">Phone Number</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="5551234567"
                  className={`w-full p-4 border rounded-lg focus:ring-2 focus:border-transparent outline-none bg-white text-slate-900 shadow-sm transition-all duration-300 ${
                    contact.phone && !isValidPhone(contact.phone) ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-secondary'
                  }`}
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                />
                {contact.phone && !isValidPhone(contact.phone) && (
                  <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit phone number.</p>
                )}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-100 mt-4">
                <strong>Note:</strong> We will reach out to you to confirm your property details and site access before providing a final buildable quote.
              </div>
            </div>
          </StepContainer>
        );
        
      case 'SUCCESS':
        return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-4">Details Received!</h1>
            <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
              Thanks {contact.fullName.split(' ')[0]}. We have received your request.
              <br/><br/>
              Our team will review your address at <strong>{address.fullAddress}</strong> for site eligibility and contact you shortly with a precise quote.
            </p>
            
            <div className="w-full max-w-xs space-y-3">
              <button 
                onClick={handleShare}
                className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:bg-secondary hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>📤</span> Share This Project
              </button>
              
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 text-secondary font-semibold hover:text-primary transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                Start New Estimate
              </button>
            </div>
          </div>
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

