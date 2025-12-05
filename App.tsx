import React, { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import PodEstimatorPage from './pages/PodEstimatorPage';
import BasementSuitePage from './pages/BasementSuitePage';
import BasementConfirmationPage from './pages/BasementConfirmationPage';
import InquirySelectionPage from './pages/InquirySelectionPage';
import LandingPage from './pages/LandingPage';
import { trackPageView, sendServerOnlyEvent } from './services/metaEventsService';

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
  // Initial PageView is fired in HTML (browser-side only)
  // We send server-side event here to complete the deduplication pair

  // Track PageView events
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      // Send server-only event for initial page load
      // HTML already fired browser event, so we only send server-side here
      // Using the same event ID from HTML for proper deduplication
      const initialEventId = window.__META_INITIAL_EVENT_ID__;
      
      if (initialEventId) {
        sendServerOnlyEvent(
          'PageView',
          initialEventId,
          { email: '' },
          {
            content_type: 'page',
            content_name: location.pathname,
            page_path: location.pathname
          }
        ).catch(err => {
          console.error('[Meta CAPI] Failed to send server-side PageView for initial load:', err);
        });
      } else {
        console.warn('[Meta CAPI] Initial event ID not found - server-side PageView not sent');
      }
      
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
