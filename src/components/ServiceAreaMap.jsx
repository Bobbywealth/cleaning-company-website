import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const serviceCounties = [
  { name: 'Union County', lat: 40.6337, lng: -74.2697, cities: ['Elizabeth', 'Jersey City', 'Union', 'Westfield', 'Summit', 'Cranford'] },
  { name: 'Essex County', lat: 40.7873, lng: -74.2454, cities: ['Newark', 'East Orange', 'Orange', 'Bloomfield', 'Montclair', 'West Orange'] },
  { name: 'Hudson County', lat: 40.7282, lng: -74.0776, cities: ['Hoboken', 'Jersey City', 'Weehawken', 'Bayonne', 'Union City', 'North Bergen'] },
  { name: 'Bergen County', lat: 40.9268, lng: -74.0773, cities: ['Hackensack', 'Englewood', 'Teaneck', 'Fort Lee', 'Ridgefield', 'Paramus'] },
];

const ServiceAreaMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([40.7891, -74.2454], 10);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      const cyanIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: #06b6d4; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(6, 182, 212, 0.5);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      serviceCounties.forEach(county => {
        const marker = L.marker([county.lat, county.lng], { icon: cyanIcon }).addTo(mapInstanceRef.current);

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 180px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold; color: #06b6d4;">${county.name}</h3>
            <p style="margin: 0; font-size: 13px; color: #64748b;">Serving: ${county.cities.join(', ')}</p>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'custom-popup',
          closeButton: false,
        });
      });

      const bounds = L.latLngBounds(serviceCounties.map(c => [c.lat, c.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <section className="bg-slate-900/50 py-16" aria-labelledby="service-area-heading">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-10">
          <p className="text-cyan-300 font-semibold">Coverage Map</p>
          <h2 id="service-area-heading" className="text-4xl font-black mt-2">Service Areas in New Jersey</h2>
          <p className="text-slate-300 mt-4 max-w-2xl mx-auto">
            Professional cleaning services throughout North Jersey with primary coverage in Essex, Union, Hudson, and Bergen County.
          </p>
        </div>

        <Card className="bg-white/10 border-white/10 rounded-3xl overflow-hidden">
          <CardContent className="p-0">
            <div ref={mapRef} className="h-[400px] w-full" />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-4 gap-6 mt-8">
          {serviceCounties.map((county) => (
            <div key={county.name} className="bg-slate-800/50 backdrop-blur rounded-2xl p-5 border border-cyan-500/20">
              <h3 className="font-bold text-cyan-300 text-lg mb-3 flex items-center gap-2">
                <span aria-hidden="true">📍</span> {county.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                {county.cities.map((city) => (
                  <span key={city} className="text-sm text-slate-300 bg-slate-700/50 px-2 py-1 rounded-lg">{city}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }
        .custom-popup .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95);
        }
        .custom-popup .leaflet-popup-content {
          margin: 12px 16px;
        }
      `}</style>
    </section>
  );
};

export default ServiceAreaMap;