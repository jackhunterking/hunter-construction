import React, { useEffect, useRef } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { trackLead } from '../services/metaEventsService';

interface ConfirmationState {
  email?: string;
  submitted?: boolean;
}

export default function BasementConfirmationPage() {
  const location = useLocation();
  const state = location.state as ConfirmationState | null;
  const hasTrackedLead = useRef(false);

  // Redirect to form if someone navigates directly to confirmation without submitting
  if (!state?.submitted) {
    return <Navigate to="/basement-suite" replace />;
  }

  // Track Meta Lead event when confirmation page loads
  // This ensures event_source_url matches the Custom Conversion rule
  useEffect(() => {
    // Prevent double-firing in React strict mode or on re-renders
    if (hasTrackedLead.current) {
      return;
    }

    if (state?.email && state?.submitted) {
      hasTrackedLead.current = true;
      
      // Construct the correct URL using React Router's location.pathname
      // This fixes SPA timing issues where window.location may not reflect the current route
      const sourceUrl = `${window.location.origin}${location.pathname}`;
      console.log('[Meta Lead] Using sourceUrl:', sourceUrl);
      
      trackLead(state.email, 0, sourceUrl)
        .then(() => {
          console.log('[Meta Lead] Successfully tracked from confirmation page');
        })
        .catch((error) => {
          console.error('[Meta Lead] Failed to track:', error);
        });
    }
  }, [state?.email, state?.submitted, location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <svg 
          className="w-10 h-10 text-green-600" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-primary mb-4">Thanks!</h1>
      
      <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
        We received your basement project details.
        <br /><br />
        Our team will review your inquiry and contact you shortly
        {state?.email && (
          <>
            {' '}at <strong className="text-slate-800">{state.email}</strong>
          </>
        )}
        {' '}to discuss your project.
      </p>
      
      <div className="w-full max-w-xs space-y-3">
        <a 
          href="https://hunterconstruction.ca"
          className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2"
        >
          Back to Home
        </a>
        
        <a 
          href="/basement-suite"
          className="w-full py-4 text-slate-500 font-semibold hover:text-primary transition-colors block text-center"
        >
          Start New Inquiry
        </a>
      </div>
    </div>
  );
}

