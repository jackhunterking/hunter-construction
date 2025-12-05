import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import InquirySelectionPage from './pages/InquirySelectionPage';

// Basement Suite Funnel (Multi-page)
import { BasementFormProvider } from './contexts/BasementFormContext';
import { BasementRouteGuard } from './components/RouteGuard';
import BasementStep1ProjectTypes from './pages/basement/Step1ProjectTypes';
import BasementStep2Entrance from './pages/basement/Step2Entrance';
import BasementStep3PlanDesign from './pages/basement/Step3PlanDesign';
import BasementStep4Urgency from './pages/basement/Step4Urgency';
import BasementStep5Details from './pages/basement/Step5Details';
import BasementStep6Location from './pages/basement/Step6Location';
import BasementStep7Email from './pages/basement/Step7Email';
import BasementStep8Contact from './pages/basement/Step8Contact';
import BasementConfirmation from './pages/basement/Confirmation';

// Pod Estimator Funnel (Multi-page)
import { PodFormProvider } from './contexts/PodFormContext';
import { PodRouteGuard } from './components/RouteGuard';
import PodStep1Intent from './pages/pod/Step1Intent';
import PodStep2Color from './pages/pod/Step2Color';
import PodStep3Flooring from './pages/pod/Step3Flooring';
import PodStep4Hvac from './pages/pod/Step4Hvac';
import PodStep5Email from './pages/pod/Step5Email';
import PodStep6Result from './pages/pod/Step6Result';
import PodStep7Address from './pages/pod/Step7Address';
import PodStep8Contact from './pages/pod/Step8Contact';
import PodConfirmation from './pages/pod/Confirmation';

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
 * 
 * Basement Suite Funnel (Multi-page):
 * - /basement-suite → Redirects to step-1
 * - /basement-suite/step-1 → Project Types (multi-select)
 * - /basement-suite/step-2 → Separate Entrance (yes/no)
 * - /basement-suite/step-3 → Plan/Design (yes/no)
 * - /basement-suite/step-4 → Project Urgency
 * - /basement-suite/step-5 → Additional Details (optional)
 * - /basement-suite/step-6 → Project Location
 * - /basement-suite/step-7 → Email
 * - /basement-suite/step-8 → Contact + Submit
 * - /basement-suite-confirmation → Success page
 * 
 * Pod Estimator Funnel (Multi-page):
 * - /pod → Redirects to step-1
 * - /pod/step-1 → Purpose/Intent
 * - /pod/step-2 → Exterior Color
 * - /pod/step-3 → Flooring
 * - /pod/step-4 → HVAC
 * - /pod/step-5 → Email Capture
 * - /pod/step-6 → Result/Estimate Display
 * - /pod/step-7 → Address
 * - /pod/step-8 → Contact + Submit
 * - /pod/confirmation → Success page
 */
export default function App() {
  return (
    <Routes>
      {/* Landing Pages */}
      <Route path="/" element={<RootRoute />} />
      
      {/* ============================================== */}
      {/* BASEMENT SUITE FUNNEL (Multi-page)            */}
      {/* ============================================== */}
      
      {/* Redirect /basement-suite to step-1 */}
      <Route path="/basement-suite" element={<Navigate to="/basement-suite/step-1" replace />} />
      
      {/* Step 1: Project Types - No guard needed (entry point) */}
      <Route 
        path="/basement-suite/step-1" 
        element={
          <BasementFormProvider>
            <BasementStep1ProjectTypes />
          </BasementFormProvider>
        } 
      />
      
      {/* Step 2: Separate Entrance */}
      <Route 
        path="/basement-suite/step-2" 
        element={
          <BasementFormProvider>
            <BasementRouteGuard step={2}>
              <BasementStep2Entrance />
            </BasementRouteGuard>
          </BasementFormProvider>
        } 
      />
      
      {/* Step 3: Plan/Design */}
      <Route 
        path="/basement-suite/step-3" 
        element={
          <BasementFormProvider>
            <BasementRouteGuard step={3}>
              <BasementStep3PlanDesign />
            </BasementRouteGuard>
          </BasementFormProvider>
        } 
      />
      
      {/* Step 4: Project Urgency */}
      <Route 
        path="/basement-suite/step-4" 
        element={
          <BasementFormProvider>
            <BasementRouteGuard step={4}>
              <BasementStep4Urgency />
            </BasementRouteGuard>
          </BasementFormProvider>
        } 
      />
      
      {/* Step 5: Additional Details */}
      <Route 
        path="/basement-suite/step-5" 
        element={
          <BasementFormProvider>
            <BasementRouteGuard step={5}>
              <BasementStep5Details />
            </BasementRouteGuard>
          </BasementFormProvider>
        } 
      />
      
      {/* Step 6: Project Location */}
      <Route 
        path="/basement-suite/step-6" 
        element={
          <BasementFormProvider>
            <BasementRouteGuard step={6}>
              <BasementStep6Location />
            </BasementRouteGuard>
          </BasementFormProvider>
        } 
      />
      
      {/* Step 7: Email */}
      <Route 
        path="/basement-suite/step-7" 
        element={
          <BasementFormProvider>
            <BasementRouteGuard step={7}>
              <BasementStep7Email />
            </BasementRouteGuard>
          </BasementFormProvider>
        } 
      />
      
      {/* Step 8: Contact + Submit */}
      <Route 
        path="/basement-suite/step-8" 
        element={
          <BasementFormProvider>
            <BasementRouteGuard step={8}>
              <BasementStep8Contact />
            </BasementRouteGuard>
          </BasementFormProvider>
        } 
      />
      
      {/* Confirmation Page (no guard - accessible after submission) */}
      <Route path="/basement-suite-confirmation" element={<BasementConfirmation />} />
      
      {/* ============================================== */}
      {/* POD ESTIMATOR FUNNEL (Multi-page)             */}
      {/* ============================================== */}
      
      {/* Redirect /pod to step-1 */}
      <Route path="/pod" element={<Navigate to="/pod/step-1" replace />} />
      
      {/* Step 1: Intent/Purpose - No guard needed (entry point) */}
      <Route 
        path="/pod/step-1" 
        element={
          <PodFormProvider>
            <PodStep1Intent />
          </PodFormProvider>
        } 
      />
      
      {/* Step 2: Exterior Color */}
      <Route 
        path="/pod/step-2" 
        element={
          <PodFormProvider>
            <PodRouteGuard step={2}>
              <PodStep2Color />
            </PodRouteGuard>
          </PodFormProvider>
        } 
      />
      
      {/* Step 3: Flooring */}
      <Route 
        path="/pod/step-3" 
        element={
          <PodFormProvider>
            <PodRouteGuard step={3}>
              <PodStep3Flooring />
            </PodRouteGuard>
          </PodFormProvider>
        } 
      />
      
      {/* Step 4: HVAC */}
      <Route 
        path="/pod/step-4" 
        element={
          <PodFormProvider>
            <PodRouteGuard step={4}>
              <PodStep4Hvac />
            </PodRouteGuard>
          </PodFormProvider>
        } 
      />
      
      {/* Step 5: Email Capture */}
      <Route 
        path="/pod/step-5" 
        element={
          <PodFormProvider>
            <PodRouteGuard step={5}>
              <PodStep5Email />
            </PodRouteGuard>
          </PodFormProvider>
        } 
      />
      
      {/* Step 6: Result/Estimate */}
      <Route 
        path="/pod/step-6" 
        element={
          <PodFormProvider>
            <PodRouteGuard step={6}>
              <PodStep6Result />
            </PodRouteGuard>
          </PodFormProvider>
        } 
      />
      
      {/* Step 7: Address */}
      <Route 
        path="/pod/step-7" 
        element={
          <PodFormProvider>
            <PodRouteGuard step={7}>
              <PodStep7Address />
            </PodRouteGuard>
          </PodFormProvider>
        } 
      />
      
      {/* Step 8: Contact + Submit */}
      <Route 
        path="/pod/step-8" 
        element={
          <PodFormProvider>
            <PodRouteGuard step={8}>
              <PodStep8Contact />
            </PodRouteGuard>
          </PodFormProvider>
        } 
      />
      
      {/* Confirmation Page (no guard - accessible after submission) */}
      <Route path="/pod/confirmation" element={<PodConfirmation />} />
    </Routes>
  );
}
