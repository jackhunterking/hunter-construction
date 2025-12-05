import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepContainer } from '../../components/StepContainer';
import { FunnelLayout } from '../../components/FunnelProgressBar';
import { usePodForm, POD_TOTAL_STEPS } from '../../contexts/PodFormContext';

// Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiamFja2h1bnRlcmtpbmciLCJhIjoiY21mbmhocHVnMDN5dDJycTd6NXJsbzdvdCJ9.J9o8ZqveZnan_BjJJEAfpg';

// Declare Leaflet on window
declare global {
  interface Window {
    L: any;
  }
}

export default function Step7Address() {
  const navigate = useNavigate();
  const { formData, updateAddress, completeStep, trackStepView, isInitialized } = usePodForm();
  
  // Map refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  
  // Local state
  const [query, setQuery] = useState(formData.address.fullAddress);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapError, setMapError] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // Track step view on mount
  useEffect(() => {
    if (isInitialized) {
      trackStepView(7);
    }
  }, [isInitialized, trackStepView]);

  // Initialize Map (Leaflet)
  useEffect(() => {
    const initTimer = window.setTimeout(() => {
      if (!mapContainer.current) return;
      if (map.current) return;

      if (!window.L) {
        console.warn("Leaflet JS not loaded");
        setMapError(true);
        return;
      }

      try {
        const defaultLat = 43.6532;
        const defaultLng = -79.3832;
        
        const center: [number, number] = (formData.address.lat !== null && formData.address.lng !== null) 
          ? [formData.address.lat, formData.address.lng] 
          : [defaultLat, defaultLng];
          
        const zoom = (formData.address.lat !== null && formData.address.lng !== null) ? 16 : 9;

        map.current = window.L.map(mapContainer.current, {
          center: center,
          zoom: zoom,
          zoomControl: false,
          attributionControl: false
        });
        
        window.L.control.zoom({
          position: 'topright'
        }).addTo(map.current);

        window.L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`, {
          tileSize: 512,
          zoomOffset: -1,
          attribution: '© Mapbox © OpenStreetMap'
        }).addTo(map.current);

        if (formData.address.lat !== null && formData.address.lng !== null) {
          marker.current = window.L.marker([formData.address.lat, formData.address.lng]).addTo(map.current);
        }

        setTimeout(() => {
          map.current?.invalidateSize();
        }, 200);

      } catch (err) {
        console.error("Error initializing map:", err);
        setMapError(true);
      }
    }, 100);

    return () => {
      window.clearTimeout(initTimer);
      try {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      } catch (e) {
        console.error("Error cleaning up map", e);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    updateAddress({ fullAddress: val, lat: null, lng: null }); 

    if (debounceRef.current !== null) {
      window.clearTimeout(debounceRef.current);
    }

    if (val.length > 2) {
      setIsSearching(true);
      debounceRef.current = window.setTimeout(() => {
        fetchSuggestions(val);
      }, 300) as unknown as number;
    } else {
      setSuggestions([]);
      setIsSearching(false);
    }
  };

  const fetchSuggestions = async (searchText: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchText
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=ca&types=address&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (feature: any) => {
    const [lng, lat] = feature.center;
    const fullAddr = feature.place_name;

    setQuery(fullAddr);
    setSuggestions([]);
    updateAddress({
      fullAddress: fullAddr,
      lat,
      lng,
    });

    if (map.current) {
      try {
        map.current.flyTo([lat, lng], 16, { duration: 1.5 });

        if (marker.current) {
          map.current.removeLayer(marker.current);
        }
        marker.current = window.L.marker([lat, lng]).addTo(map.current);
      } catch (err) {
        console.error("Error updating map view:", err);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setSuggestions([]);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNext = async () => {
    await completeStep(7);
    navigate('/pod/step-8');
  };

  const handleBack = () => {
    navigate('/pod/step-6');
  };

  const isValid = formData.address.fullAddress && formData.address.lat !== null;

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <FunnelLayout
      currentStep={7}
      totalSteps={POD_TOTAL_STEPS}
      title="Availability"
      subtitle="Final Details"
    >
      <StepContainer
        title="Where are you located?"
        description="Enter the address so we can check if your property is suitable for a 160 sq ft no-permit pod."
        onNext={handleNext}
        onBack={handleBack}
        isNextDisabled={!isValid}
      >
        <div className="space-y-6 relative" onClick={(e) => e.stopPropagation()}>
          {/* Map View */}
          <div className="relative w-full h-56 bg-slate-200 rounded-lg overflow-hidden border border-slate-300 shadow-inner z-0">
            {mapError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-100 p-4 text-center">
                <span className="text-2xl mb-2">🗺️</span>
                <p className="text-sm">Map preview unavailable.</p>
                <p className="text-xs text-slate-400 mt-1">Please enter your address below.</p>
              </div>
            ) : (
              <>
                <div ref={mapContainer} className="w-full h-full z-0" style={{ zIndex: 0 }} />
                {!map.current && !window.L && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-100">
                    Map loading...
                  </div>
                )}
              </>
            )}
          </div>

          {/* Address Input */}
          <div className="space-y-4 relative z-20">
            <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">Property Address</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Start typing your address..."
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none bg-white text-slate-900 shadow-sm placeholder:text-slate-400 transition-all duration-300"
                value={query}
                onChange={handleInputChange}
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              )}
              
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-slate-200 max-h-60 overflow-y-auto z-50">
                  {suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 text-slate-700 flex items-start gap-3 transition-colors"
                    >
                      <span className="mt-1 text-slate-400">📍</span>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{suggestion.text}</div>
                        <div className="text-xs text-slate-500 truncate">{suggestion.place_name}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </StepContainer>
    </FunnelLayout>
  );
}
