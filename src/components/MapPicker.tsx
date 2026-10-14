'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass } from 'lucide-react';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  locality?: string;
  city?: string;
}

export function MapPicker({
  latitude = 28.6139,
  longitude = 77.209,
  onLocationSelect,
  readOnly = false,
  locality = '',
  city = 'New Delhi',
}: MapPickerProps) {
  const [currentLat, setCurrentLat] = useState(latitude);
  const [currentLng, setCurrentLng] = useState(longitude);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentLat(latitude);
      setCurrentLng(longitude);
    }
  }, [latitude, longitude]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setCurrentLat(lat);
        setCurrentLng(lng);
        if (onLocationSelect) onLocationSelect(lat, lng);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        // Fallback to New Delhi default
        setIsLocating(false);
      }
    );
  };

  // OpenStreetMap embed URL with marker
  const mapEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.01}%2C${currentLat - 0.01}%2C${currentLng + 0.01}%2C${currentLat + 0.01}&layer=mapnik&marker=${currentLat}%2C${currentLng}`;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-red-500" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {locality ? `${locality}, ${city}` : 'Incident Geographic Pin'}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            ({currentLat.toFixed(4)}, {currentLng.toFixed(4)})
          </span>
        </div>

        {!readOnly && (
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <Navigation size={12} className={isLocating ? 'animate-spin' : ''} />
            <span>{isLocating ? 'Detecting...' : 'Detect GPS'}</span>
          </button>
        )}
      </div>

      {/* Interactive Map Embed */}
      <div className="relative w-full h-56 bg-slate-100 dark:bg-slate-800">
        <iframe
          title="OpenStreetMap Location"
          width="100%"
          height="100%"
          src={mapEmbedUrl}
          className="w-full h-full border-0"
        />
        <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
          <Compass size={10} />
          <span>OpenStreetMap • India Grid</span>
        </div>
      </div>

      {!readOnly && (
        <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
          <span>Coordinates automatically bind to your civic complaint record.</span>
          <a
            href={`https://www.openstreetmap.org/?mlat=${currentLat}&mlon=${currentLng}#map=16/${currentLat}/${currentLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open in OSM →
          </a>
        </div>
      )}
    </div>
  );
}
