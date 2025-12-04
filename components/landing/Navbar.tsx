import React, { useState, useEffect } from 'react';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  // Pointing to the new location in the assets folder
  const logo = '/assets/Hunter-Logo.png';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-brand-black/95 backdrop-blur-sm border-b border-brand-navy/30 py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        {/* Logo Representation */}
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          {/* Updated Logo Image */}
          <img 
            src={logo}
            alt="Hunter Construction Logo" 
            className="h-10 w-auto object-contain"
          />
          
          <div className="flex flex-col">
            <span className="font-heading font-bold text-white tracking-[0.2em] leading-none text-lg">HUNTER</span>
            <span className="font-sans text-brand-smoke text-xs tracking-widest uppercase">Construction</span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          <a
            href="mailto:hello@hunterconstruction.ca"
            className="border border-brand-gold text-brand-gold px-6 py-2 text-sm uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black transition-all duration-300"
          >
            Inquire
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;