import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Landing page for inquiry.hunterconstruction.ca
 * Allows users to choose between Pod or Basement Suite inquiries
 */
export default function InquirySelectionPage() {
  const navigate = useNavigate();

  const inquiryOptions = [
    {
      id: 'pod',
      title: 'Backyard Pod',
      description: 'Get an instant estimate for a 160 sq ft no-permit backyard pod',
      icon: '🏡',
      route: '/pod',
      features: ['160 sq ft', 'No permit required', 'Quick installation', 'Multiple uses'],
    },
    {
      id: 'basement',
      title: 'Basement Suite',
      description: 'Request a quote for basement renovation or rental suite',
      icon: '🏠',
      route: '/basement-suite',
      features: ['Full renovation', 'Rental suite ready', 'Custom design', 'Expert consultation'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <div className="w-full max-w-4xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            Hunter Construction
          </h1>
          <p className="text-slate-600 text-lg md:text-xl">
            What can we help you build today?
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pb-12">
        <div className="grid md:grid-cols-2 gap-6">
          {inquiryOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => navigate(option.route)}
              className="group relative bg-white rounded-2xl border-2 border-slate-200 hover:border-accent transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl transform hover:scale-[1.02] text-left"
            >
              {/* Card Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <span className="text-4xl">{option.icon}</span>
                </div>

                {/* Title & Description */}
                <h2 className="text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition-colors">
                  {option.title}
                </h2>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {option.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-700">
                      <svg 
                        className="w-5 h-5 text-accent flex-shrink-0" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 text-accent font-bold text-lg group-hover:gap-4 transition-all">
                  <span>Get Started</span>
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Accent Border on Hover */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </button>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            Have questions? Contact us at{' '}
            <a 
              href="mailto:hello@hunterconstruction.ca" 
              className="text-accent hover:text-secondary transition-colors font-semibold"
            >
              hello@hunterconstruction.ca
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Hunter Construction. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

