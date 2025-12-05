import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import PodEstimatorPage from './pages/PodEstimatorPage';
import BasementSuitePage from './pages/BasementSuitePage';
import BasementConfirmationPage from './pages/BasementConfirmationPage';
import InquirySelectionPage from './pages/InquirySelectionPage';
import LandingPage from './pages/LandingPage';
import { trackPageView } from './services/metaEventsService';

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
  const location = useLocation();
  const isFirstRender = useRef(true);
  
  // Meta Pixel is initialized in index.html following Facebook's official best practice
  // Initial PageView is also fired in HTML, so we only track SUBSEQUENT SPA route changes here

  // Track PageView on SPA route changes (skip initial - already fired in HTML)
  useEffect(() => {
    // Skip the first render - HTML already fired the initial PageView
    // We don't call trackPageView here because it would fire a duplicate browser event
    // The index.html PageView is sufficient for initial page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // For SPA navigation (subsequent route changes), fire both browser and server events
    // These share the same eventId for proper deduplication
    trackPageView(location.pathname).catch(err => {
      console.error('[Meta CAPI] Failed to track PageView:', err);
    });
    
    console.log('[Meta Events] PageView tracked for:', location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/pod" element={<PodEstimatorPage />} />
      <Route path="/basement-suite" element={<BasementSuitePage />} />
      <Route path="/basement-suite-confirmation" element={<BasementConfirmationPage />} />
    </Routes>
  );
}
