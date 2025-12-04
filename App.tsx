import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PodEstimatorPage from './pages/PodEstimatorPage';
import BasementSuitePage from './pages/BasementSuitePage';
import BasementConfirmationPage from './pages/BasementConfirmationPage';
import InquirySelectionPage from './pages/InquirySelectionPage';
import LandingPage from './pages/LandingPage';

/**
 * Redirect component that redirects to external URL
 */
function ExternalRedirect({ to }: { to: string }) {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
}

/**
 * Component that checks subdomain and routes accordingly
 * - If on inquiry.hunterconstruction.ca, shows the inquiry selection landing page
 * - Otherwise, shows the main landing page
 */
function RootRoute() {
  const hostname = window.location.hostname;
  
  // Check if we're on the inquiry subdomain
  if (hostname === 'inquiry.hunterconstruction.ca' || hostname.startsWith('inquiry.')) {
    // Show inquiry selection landing page
    return <InquirySelectionPage />;
  }
  
  // For main domain, show landing page
  return <LandingPage />;
}

/**
 * Main App Component with Routing
 * 
 * Routes:
 * - / : 
 *   - If on inquiry.hunterconstruction.ca → Shows Inquiry Selection landing page
 *   - Otherwise → Shows Hunter Construction main landing page
 * - /pod : Pod Estimator form
 * - /basement-suite : Basement Rental Suite form
 * - /basement-suite-confirmation : Confirmation page after basement form submission
 * 
 * Inquiry Selection Page (inquiry.hunterconstruction.ca):
 * Users can choose between Pod or Basement Suite inquiries
 * 
 * To add new forms:
 * 1. Create a new page component in /pages
 * 2. Add a new Route below
 * 3. Add the form option to InquirySelectionPage
 */
export default function App() {
  // Initialize Facebook Pixel on app load
  useEffect(() => {
    const pixelId = import.meta.env.VITE_META_PIXEL_ID;
    
    if (pixelId && typeof window !== 'undefined' && window.fbq) {
      // Initialize pixel with Advanced Matching enabled
      window.fbq('init', pixelId, {
        em: 'enabled',
        ph: 'enabled',
        fn: 'enabled',
        ln: 'enabled',
      });
      // Track initial PageView
      window.fbq('track', 'PageView');
      console.log('[Meta Pixel] Initialized with ID:', pixelId);
    } else if (!pixelId) {
      console.warn('[Meta Pixel] VITE_META_PIXEL_ID not configured');
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/pod" element={<PodEstimatorPage />} />
      <Route path="/basement-suite" element={<BasementSuitePage />} />
      <Route path="/basement-suite-confirmation" element={<BasementConfirmationPage />} />
    </Routes>
  );
}
