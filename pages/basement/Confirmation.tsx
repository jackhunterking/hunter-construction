import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackLead } from '../../services/metaEventsService';

interface LocationState {
  email?: string;
  submitted?: boolean;
}

/**
 * Basement Suite Confirmation Page
 * Shown after successful form submission
 */
export default function BasementConfirmation() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const email = state?.email || '';
  const hasTrackedLead = useRef(false);

  // Track Lead event when confirmation page is loaded (after successful submission)
  useEffect(() => {
    if (email && state?.submitted && !hasTrackedLead.current) {
      hasTrackedLead.current = true;
      trackLead(email, 'basement');
    }
  }, [email, state?.submitted]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">✅</span>
      </div>
      <h1 className="text-3xl font-bold text-primary mb-4">Request Received!</h1>
      <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
        Thank you for your interest in our basement renovation services.
        {email && (
          <>
            <br /><br />
            A confirmation has been sent to <strong>{email}</strong>.
          </>
        )}
        <br /><br />
        Our team will review your request and contact you within 1-2 business days to discuss your project.
      </p>
      
      <div className="w-full max-w-xs space-y-3">
        <a 
          href="/"
          className="block w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:bg-secondary hover:scale-105 active:scale-95 text-center"
        >
          Back to Home
        </a>
        
        <a 
          href="/basement-suite/step-1"
          className="block w-full py-4 text-secondary font-semibold hover:text-primary transition-all duration-300 transform hover:scale-105 active:scale-95 text-center"
        >
          Start New Request
        </a>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-slate-500 text-sm">
          Have questions? Contact us at{' '}
          <a 
            href="mailto:hello@hunterconstruction.ca" 
            className="text-accent hover:text-secondary transition-colors font-semibold"
          >
            hello@hunterconstruction.ca
          </a>
        </p>
      </div>
    </div>
  );
}
