import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Services from '../components/landing/Services';
import Footer from '../components/landing/Footer';

/**
 * Main landing page for hunterconstruction.ca
 * Shows company information, services, and contact form
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-black">
      <Navbar />
      <Hero />
      <Services />
      <Footer />
    </div>
  );
}

