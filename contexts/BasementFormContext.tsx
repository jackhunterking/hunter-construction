import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  BasementFormData,
  BasementProjectType,
  ProjectUrgency,
} from '../types/basement';
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
import { trackViewContent } from '../services/metaEventsService';

// Step names for tracking
export const BASEMENT_STEP_NAMES = [
  'PROJECT_TYPES',
  'SEPARATE_ENTRANCE',
  'PLAN_DESIGN',
  'PROJECT_URGENCY',
  'ADDITIONAL_DETAILS',
  'PROJECT_LOCATION',
  'EMAIL',
  'CONTACT',
] as const;

export const BASEMENT_TOTAL_STEPS = 8;

// Initial form data
const initialFormData: BasementFormData = {
  projectTypes: [],
  needsSeparateEntrance: null,
  hasPlanDesign: null,
  projectUrgency: null,
  additionalDetails: '',
  projectLocation: '',
  email: '',
  fullName: '',
  phone: '',
};

// Context type
interface BasementFormContextType {
  // Form data
  formData: BasementFormData;
  updateFormData: (data: Partial<BasementFormData>) => void;
  
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
const BasementFormContext = createContext<BasementFormContextType | null>(null);

// Provider component
export function BasementFormProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<BasementFormData>(initialFormData);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const funnelType: FunnelType = 'basement';

  // Initialize session on mount
  useEffect(() => {
    const init = async () => {
      // Restore from localStorage first
      const savedData = getSavedFormData<BasementFormData>(funnelType);
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

  // Update form data
  const updateFormData = useCallback((data: Partial<BasementFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
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
    const stepName = BASEMENT_STEP_NAMES[step - 1] || `STEP_${step}`;
    await trackStepEvent(sessionId, funnelType, step, stepName, 'complete');

    // Sync to Supabase
    await updateFunnelProgress(sessionId, step, formData, funnelType);

    // Handle email step (step 7) - Update email in Supabase
    if (step === 7 && formData.email) {
      await updateFunnelEmail(sessionId, formData.email);
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
    
    const stepName = BASEMENT_STEP_NAMES[step - 1] || `STEP_${step}`;
    
    // Supabase funnel tracking
    await trackStepEvent(sessionId, funnelType, step, stepName, 'view');
    
    // Meta tracking (Client Pixel + Server CAPI with deduplication)
    await trackViewContent(
      'basement',
      step,
      stepName,
      BASEMENT_TOTAL_STEPS,
      sessionId,
      formData.email || undefined
    );
  }, [sessionId, formData.email]);

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

  const value: BasementFormContextType = {
    formData,
    updateFormData,
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
    <BasementFormContext.Provider value={value}>
      {children}
    </BasementFormContext.Provider>
  );
}

// Hook to use the context
export function useBasementForm(): BasementFormContextType {
  const context = useContext(BasementFormContext);
  if (!context) {
    throw new Error('useBasementForm must be used within a BasementFormProvider');
  }
  return context;
}
