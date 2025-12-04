import React from 'react';
import { Home, Warehouse, Hammer, ArrowUpRight } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      title: "Basement Units",
      description: "Unlock the hidden value beneath your feet. We transform underutilized basements into legal, high-yield rental apartments with premium finishes.",
      icon: <ArrowUpRight className="w-8 h-8" />,
    },
    {
      title: "Garden Suites & ADUs",
      description: "Maximize your lot potential with standalone accessory dwelling units. Perfect for generating significant passive income while increasing property value.",
      icon: <Home className="w-8 h-8" />,
    },
    {
      title: "Additions & Extensions",
      description: "Expand your footprint vertically or horizontally. We seamlessly integrate new square footage to create multi-unit dwellings or larger living spaces.",
      icon: <Hammer className="w-8 h-8" />,
    },
    {
      title: "Garage Conversions",
      description: "Repurpose existing structures into modern studio apartments or laneway houses. A cost-effective strategy for immediate rental cash flow.",
      icon: <Warehouse className="w-8 h-8" />,
    },
  ];

  return (
    <section className="py-24 bg-brand-navy text-brand-white relative overflow-hidden" id="services">
        {/* Decorative Grid Line */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-brand-white/10 hidden md:block"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-brand-white/10 hidden md:block"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20">
            <h2 className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-4">Our Expertise</h2>
            <h3 className="font-heading text-4xl md:text-5xl font-bold text-white">Generating Rental Income</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-brand-white/10 border border-brand-white/10">
          {services.map((service, index) => (
            <div key={index} className="bg-brand-navy p-12 group hover:bg-brand-navy/80 transition-colors duration-500 relative border border-transparent hover:border-brand-gold/20">
              <div className="text-brand-gold mb-8 opacity-70 group-hover:opacity-100 transition-opacity">
                {service.icon}
              </div>
              <h4 className="font-heading text-2xl font-bold mb-6 text-white group-hover:text-brand-gold transition-colors">
                {service.title}
              </h4>
              <p className="text-brand-smoke/70 leading-relaxed text-lg">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;