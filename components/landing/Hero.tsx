import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://picsum.photos/1920/1080?grayscale&blur=2"
          alt="Architectural Interior"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black/70 via-brand-black/50 to-brand-black"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <p className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-6 animate-fade-in-up">
          Refining Real Estate Assets
        </p>
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight">
          Build <span className="text-brand-smoke italic font-light font-serif">Wealth</span> <br />
          With Construction
        </h1>
        <p className="text-brand-smoke/80 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-light leading-relaxed">
          We specialize in high-ROI rental units. From garden suites to basement conversions, we build assets that build your future.
        </p>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a href="#services" className="group flex items-center gap-3 bg-brand-gold text-brand-black px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-white transition-all duration-300">
                Explore Services
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;