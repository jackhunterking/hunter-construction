import React from 'react';

const Contact: React.FC = () => {
  return (
    <section className="py-24 bg-brand-smoke relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
                <h2 className="font-heading text-4xl md:text-6xl font-bold text-brand-navy mb-8">
                    Start Your Project
                </h2>
                <p className="text-brand-black/70 text-lg mb-12 max-w-md">
                    Ready to turn your property into a rental income asset? Contact Hunter Construction today for a consultation.
                </p>
                
                <div className="space-y-6">
                    <div>
                        <h4 className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-2">Office</h4>
                        <p className="text-brand-navy">170 Merton Street,<br/>Toronto, ON M4S 1A1</p>
                    </div>
                    <div>
                        <h4 className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-2">Contact</h4>
                        <p className="text-brand-navy">hello@hunterconstruction.ca</p>
                    </div>
                     <div>
                        <h4 className="text-brand-gold font-bold uppercase tracking-widest text-sm mb-2">Social</h4>
                        <a href="https://www.instagram.com/huntergroupconstruction/" target="_blank" rel="noreferrer" className="text-brand-navy border-b border-brand-navy/20 hover:border-brand-navy transition-colors">
                            @huntergroupconstruction
                        </a>
                    </div>
                </div>
            </div>

            <div className="bg-white p-10 md:p-12 shadow-2xl shadow-brand-navy/10">
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-brand-navy">First Name</label>
                            <input type="text" className="w-full border-b border-brand-smoke py-2 focus:outline-none focus:border-brand-gold transition-colors text-brand-black" placeholder="Jane" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest font-bold text-brand-navy">Last Name</label>
                            <input type="text" className="w-full border-b border-brand-smoke py-2 focus:outline-none focus:border-brand-gold transition-colors text-brand-black" placeholder="Doe" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-brand-navy">Email Address</label>
                        <input type="email" className="w-full border-b border-brand-smoke py-2 focus:outline-none focus:border-brand-gold transition-colors text-brand-black" placeholder="jane@example.com" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-brand-navy">Project Type</label>
                        <select className="w-full border-b border-brand-smoke py-2 focus:outline-none focus:border-brand-gold transition-colors text-brand-black bg-transparent">
                            <option>Basement Unit</option>
                            <option>Garden Suite / ADU</option>
                            <option>Addition / Extension</option>
                            <option>Garage Conversion</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-bold text-brand-navy">Message</label>
                        <textarea rows={4} className="w-full border-b border-brand-smoke py-2 focus:outline-none focus:border-brand-gold transition-colors text-brand-black resize-none" placeholder="Tell us about your property..."></textarea>
                    </div>

                    <button type="submit" className="bg-brand-black text-white px-10 py-4 uppercase tracking-[0.2em] text-sm hover:bg-brand-navy transition-colors duration-300 w-full md:w-auto">
                        Submit Inquiry
                    </button>
                </form>
            </div>
        </div>
    </section>
  );
};

export default Contact;