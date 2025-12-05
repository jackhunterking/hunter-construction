import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  PodConfiguration,
  AddressData,
  ContactData,
  HvacOption,
  EstimateResult,
} from '../types';
import {
  initFunnelSession,
  updateFunnelProgress,
  updateFunnelEmail,
  trackStepEvent,
  completeFunnelSession,
  getSavedFormData,
  getCompletedSteps,
  clearFunnelData,
  getExistingSessionId,
  FunnelType,
} from '../services/funnelSessionService';

// Meta Tracking (Dual: Client Pixel + Server CAPI)
import { trackViewContent, trackLead } from '../services/metaEventsService';

// Step names for tracking
export const POD_STEP_NAMES = [
  'INTENT',
  'COLOR',
  'FLOORING',
  'HVAC',
  'EMAIL_CAPTURE',
  'RESULT',
  'ADDRESS',
  'CONTACT',
] as const;

export const POD_TOTAL_STEPS = 8;

// Combined form data for the Pod funnel
export interface PodFormData {
  config: PodConfiguration;
  address: AddressData;
  contact: ContactData;
  estimate: EstimateResult | null;
  quoteId: string | null;
}

// Initial form data
const initialFormData: PodFormData = {
  config: {
    useCase: null,
    exteriorColor: null,
    flooring: null,
    hvac: null,
    additionalDetails: '',
  },
  address: {
    fullAddress: '',
    lat: null,
    lng: null,
  },
  contact: {
    email: '',
    fullName: '',
    phone: '',
  },
  estimate: null,
  quoteId: null,
};

// Context type
interface PodFormContextType {
  // Form data
  formData: PodFormData;
  updateConfig: (data: Partial<PodConfiguration>) => void;
  updateAddress: (data: Partial<AddressData>) => void;
  updateContact: (data: Partial<ContactData>) => void;
  setEstimate: (estimate: EstimateResult) => void;
  setQuoteId: (quoteId: string) => void;
  
  // Step management
  completedSteps: number[];
  completeStep: (step: number) => Promise<void>;
  canAccessStep: (step: number) => boolean;
  
  // Session management
  sessionId: string | null;
  isInitialized: boolean;
  
  // Actions
  resetForm: () => void;
  trackStepView: (step: number) => Promise<void>;
  finalizeFunnel: () => Promise<void>;
}

// Create context
const PodFormContext = createContext<PodFormContextType | null>(null);

// Provider component
export function PodFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<PodFormData>(initialFormData);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const funnelType: FunnelType = 'pod';

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      // Restore from localStorage first
      const savedData = getSavedFormData<PodFormData>(funnelType);
      if (savedData) {
        setFormData({ ...initialFormData, ...savedData });
      }
      
      const savedCompleted = getCompletedSteps(funnelType);
      setCompletedSteps(savedCompleted);

      // Initialize or get existing session
      const existingId = getExistingSessionId(funnelType);
      if (existingId) {
        setSessionId(existingId);
      } else {
        const newSessionId = await initFunnelSession(funnelType);
        setSessionId(newSessionId);
      }
      
      setIsInitialized(true);
    };

    init();
  }, []);

  // Update config
  const updateConfig = useCallback((data: Partial<PodConfiguration>) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, ...data },
    }));
  }, []);

  // Update address
  const updateAddress = useCallback((data: Partial<AddressData>) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, ...data },
    }));
  }, []);

  // Update contact
  const updateContact = useCallback((data: Partial<ContactData>) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, ...data },
    }));
  }, []);

  // Set estimate
  const setEstimate = useCallback((estimate: EstimateResult) => {
    setFormData(prev => ({ ...prev, estimate }));
  }, []);

  // Set quote ID
  const setQuoteId = useCallback((quoteId: string) => {
    setFormData(prev => ({ ...prev, quoteId }));
  }, []);

  // Complete a step
  const completeStep = useCallback(async (step: number) => {
    if (!sessionId) return;

    // Update completed steps
    setCompletedSteps(prev => {
      if (prev.includes(step)) return prev;
      return [...prev, step];
    });

    // Track completion event in Supabase
    const stepName = POD_STEP_NAMES[step - 1] || `STEP_${step}`;
    await trackStepEvent(sessionId, funnelType, step, stepName, 'complete');

    // Sync to Supabase
    await updateFunnelProgress(sessionId, step, formData, funnelType);

    // Handle email step (step 5) - Track Lead event for Meta
    if (step === 5 && formData.contact.email) {
      await updateFunnelEmail(sessionId, formData.contact.email);
      // Track Lead event for Meta (key conversion event)
      await trackLead(formData.contact.email, 'pod', sessionId);
    }
  }, [sessionId, formData]);

  // Check if user can access a step
  const canAccessStep = useCallback((step: number): boolean => {
    if (step === 1) return true;
    
    // Check all previous steps are completed
    for (let i = 1; i < step; i++) {
      if (!completedSteps.includes(i)) {
        return false;
      }
    }
    return true;
  }, [completedSteps]);

  // Track step view (Supabase + Meta Pixel/CAPI)
  const trackStepView = useCallback(async (step: number) => {
    if (!sessionId) return;
    
    const stepName = POD_STEP_NAMES[step - 1] || `STEP_${step}`;
    
    // Supabase funnel tracking
    await trackStepEvent(sessionId, funnelType, step, stepName, 'view');
    
    // Meta tracking (Client Pixel + Server CAPI with deduplication)
    await trackViewContent(
      'pod',
      step,
      stepName,
      POD_TOTAL_STEPS,
      sessionId,
      formData.contact.email || undefined
    );
  }, [sessionId, formData.contact.email]);

  // Finalize funnel (on successful submission)
  const finalizeFunnel = useCallback(async () => {
    if (!sessionId) return;
    
    await completeFunnelSession(sessionId);
    clearFunnelData(funnelType);
    setFormData(initialFormData);
    setCompletedSteps([]);
    setSessionId(null);
  }, [sessionId]);

  // Reset form
  const resetForm = useCallback(() => {
    clearFunnelData(funnelType);
    setFormData(initialFormData);
    setCompletedSteps([]);
    setSessionId(null);
    setIsInitialized(false);
    
    // Re-initialize
    initFunnelSession(funnelType).then(newSessionId => {
      setSessionId(newSessionId);
      setIsInitialized(true);
    });
  }, []);

  const value: PodFormContextType = {
    formData,
    updateConfig,
    updateAddress,
    updateContact,
    setEstimate,
    setQuoteId,
    completedSteps,
    completeStep,
    canAccessStep,
    sessionId,
    isInitialized,
    resetForm,
    trackStepView,
    finalizeFunnel,
  };

  return (
    <PodFormContext.Provider value={value}>
      {children}
    </PodFormContext.Provider>
  );
}

// Hook to use the context
export function usePodForm(): PodFormContextType {
  const context = useContext(PodFormContext);
  if (!context) {
    throw new Error('usePodForm must be used within a PodFormProvider');
  }
  return context;
}
