import React from 'react';
import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  // Pointing to the new location in the assets folder
  const logo = '/assets/Hunter-Logo.png';

  return (
    <footer className="bg-brand-black border-t border-brand-white/10 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {/* Brand Column */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {/* Small Brandmark for Footer */}
                    <img 
                        src={logo}
                        alt="Hunter Construction Logo" 
                        className="h-8 w-auto object-contain"
                    />
                    <span className="font-heading font-bold text-white tracking-widest text-sm">HUNTER CONSTRUCTION</span>
                </div>
                <p className="text-brand-smoke/60 text-sm leading-relaxed max-w-xs">
                    Engineering wealth through strategic construction and high-ROI rental units.
                </p>
            </div>

            {/* Office */}
            <div>
                <h4 className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Office
                </h4>
                <p className="text-brand-smoke/80 text-sm leading-relaxed">
                    170 Merton Street,<br/>
                    Toronto, ON M4S 1A1
                </p>
            </div>

            {/* Contact & Social */}
            <div>
                <h4 className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Contact
                </h4>
                <div className="space-y-2 mb-6">
                    <a href="mailto:hello@hunterconstruction.ca" className="text-brand-smoke/80 text-sm hover:text-white transition-colors block">
                        hello@hunterconstruction.ca
                    </a>
                </div>
                
                <h4 className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                    Social
                </h4>
                <div>
                     <a 
                        href="https://www.instagram.com/huntergroupconstruction/" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center gap-2 text-brand-smoke/60 hover:text-brand-gold transition-colors text-sm uppercase tracking-wide"
                    >
                        <Instagram className="w-4 h-4" /> @huntergroupconstruction
                    </a>
                </div>
            </div>

             {/* CTA */}
             <div>
                <h4 className="text-brand-gold font-bold uppercase tracking-widest text-xs mb-6">Start Your Project</h4>
                <p className="text-brand-smoke/60 text-sm mb-6">
                    Ready to increase your property value?
                </p>
                <a
                    href="mailto:hello@hunterconstruction.ca"
                    className="inline-block bg-brand-white text-brand-black px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-brand-gold transition-colors duration-300"
                >
                    Inquire Now
                </a>
            </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-brand-smoke/40 text-xs tracking-widest uppercase">
            &copy; {new Date().getFullYear()} Hunter Construction. All Rights Reserved.
            </div>

            <div className="flex gap-6">
                <a href="#" className="text-brand-smoke/40 hover:text-brand-gold transition-colors text-xs uppercase tracking-widest">Privacy</a>
                <a href="#" className="text-brand-smoke/40 hover:text-brand-gold transition-colors text-xs uppercase tracking-widest">Terms</a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;