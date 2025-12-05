import React from 'react';
import { useLocation } from 'react-router-dom';

interface LocationState {
  fullName?: string;
  address?: string;
  submitted?: boolean;
}

/**
 * Pod Estimator Confirmation Page
 * Shown after successful form submission
 */
export default function PodConfirmation() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const firstName = state?.fullName?.split(' ')[0] || '';
  const address = state?.address || '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Backyard Pod Estimate',
          text: 'Check out this 160sqft pod I designed!',
          url: window.location.origin + '/pod/step-1',
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">✅</span>
      </div>
      <h1 className="text-3xl font-bold text-primary mb-4">Details Received!</h1>
      <p className="text-slate-600 max-w-sm mb-8 leading-relaxed">
        {firstName && `Thanks ${firstName}. `}We have received your request.
        {address && (
          <>
            <br /><br />
            Our team will review your address at <strong>{address}</strong> for site eligibility and contact you shortly with a precise quote.
          </>
        )}
        {!address && (
          <>
            <br /><br />
            Our team will review your request and contact you shortly with a precise quote.
          </>
        )}
      </p>
      
      <div className="w-full max-w-xs space-y-3">
        <button 
          onClick={handleShare}
          className="w-full py-4 bg-primary text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:bg-secondary hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <span>📤</span> Share This Project
        </button>
        
        <a 
          href="/pod/step-1"
          className="block w-full py-4 text-secondary font-semibold hover:text-primary transition-all duration-300 transform hover:scale-105 active:scale-95 text-center"
        >
          Start New Estimate
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
