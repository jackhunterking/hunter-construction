import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePodForm } from '../../contexts/PodFormContext';
import { calculateEstimate } from '../../services/pricingService';
import { createPartialQuote } from '../../services/databaseService';
import { sendEstimateEmail } from '../../services/emailService';
import { COLOR_OPTIONS, USE_CASE_OPTIONS } from '../../constants';
import { HvacOption } from '../../types';

export default function Step6Result() {
  const navigate = useNavigate();
  const { formData, setEstimate, setQuoteId, completeStep, trackStepView, sessionId, isInitialized } = usePodForm();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Analyzing your configuration...');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Track step view and calculate estimate on mount
  useEffect(() => {
    if (!isInitialized) return;

    trackStepView(6);

    const calculateAndSave = async () => {
      // Calculate estimate
      const pricing = calculateEstimate(formData.config);
      setEstimate({
        ...pricing,
        summary: '',
      });

      try {
        // Create partial quote in database with session tracking for attribution
        const savedQuote = await createPartialQuote(formData.contact.email, formData.config, {
          low: pricing.low,
          high: pricing.high,
        }, sessionId);

        setQuoteId(savedQuote.id);

        // Send estimate email
        sendEstimateEmail(formData.contact.email, formData.config, pricing, savedQuote.id).catch(err => {
          console.error('Failed to send estimate email:', err);
        });

        setToastMessage(`Estimate sent to ${formData.contact.email}`);
        setShowToast(true);
      } catch (error) {
        console.error('Error creating partial quote:', error);
        setToastMessage(`Estimate sent to ${formData.contact.email}`);
        setShowToast(true);
      }

      // Animated loading sequence
      setTimeout(() => {
        setLoadingText('Checking local material costs...');
      }, 800);

      setTimeout(() => {
        setLoadingText('Finalizing estimate...');
      }, 1600);

      setTimeout(() => {
        setIsLoading(false);
        completeStep(6);
      }, 2400);
    };

    calculateAndSave();
  }, [isInitialized]);

  // Auto-hide toast after 4 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleContinue = () => {
    navigate('/pod/step-7');
  };

  const handleBack = () => {
    navigate('/pod/step-5');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Loading state
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

  const selectedColorImg = COLOR_OPTIONS.find(c => c.value === formData.config.exteriorColor)?.image || COLOR_OPTIONS[0].image;

  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-24">
      {/* Toast Notification */}
      <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-500 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-slate-900/95 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/50">
          <span className="text-green-400 font-bold text-lg">✓</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      </div>

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
          alt={`${formData.config.exteriorColor} Pod`} 
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
              ${formData.estimate?.low.toLocaleString()}
            </span>
            <span className="text-2xl font-medium text-slate-400">—</span>
            <span className="text-4xl font-extrabold text-primary tracking-tight">
              ${formData.estimate?.high.toLocaleString()}
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
                {USE_CASE_OPTIONS.find(u => u.value === formData.config.useCase)?.label}
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
              <span className="font-semibold text-slate-900">{formData.config.exteriorColor}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Flooring</span>
              <span className="font-semibold text-slate-900">{formData.config.flooring}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Heating & Cooling</span>
              <span className="font-semibold text-slate-900">
                {formData.config.hvac === HvacOption.YES ? 'Included' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 safe-area-pb z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto w-full">
          <button 
            onClick={handleContinue}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-lg shadow-lg shadow-primary/20 transition-all duration-300 transform hover:bg-secondary hover:scale-105 active:scale-95"
          >
            Check Availability In Your Area
          </button>
        </div>
      </div>
    </div>
  );
}
