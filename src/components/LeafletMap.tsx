import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Complaint, LocationData } from '../types';
import { Language, translations } from '../utils/translations';
import { MapPin, Navigation } from 'lucide-react';

interface LeafletMapProps {
  complaints?: Complaint[];
  selectedLocation?: { latitude: number; longitude: number };
  onSelectLocation?: (lat: number, lng: number) => void;
  isPicker?: boolean;
  onComplaintClick?: (complaint: Complaint) => void;
  language: Language;
  height?: string;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  complaints = [],
  selectedLocation,
  onSelectLocation,
  isPicker = false,
  onComplaintClick,
  language,
  height = '400px',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  const defaultCenter: [number, number] = selectedLocation
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : complaints.length > 0
    ? [complaints[0].location.latitude, complaints[0].location.longitude]
    : [25.3176, 82.9739]; // Varanasi / Kashi Vidyapeeth rural cluster

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: isPicker ? 14 : 13,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | GramSewa GIS',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      if (isPicker && onSelectLocation) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onSelectLocation(e.latlng.lat, e.latlng.lng);
        });
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers for Complaints
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (!isPicker && complaints.length > 0) {
      const bounds = L.latLngBounds([]);

      complaints.forEach(cmp => {
        if (!cmp.location || !cmp.location.latitude || !cmp.location.longitude) return;

        const { latitude, longitude } = cmp.location;
        bounds.extend([latitude, longitude]);

        let color = '#10b981'; // green
        let pulseClass = '';
        if (cmp.priority === 'Critical' || cmp.severity === 'Critical') {
          color = '#e11d48'; // red
          pulseClass = 'animate-ping';
        } else if (cmp.priority === 'High' || cmp.severity === 'High') {
          color = '#f97316'; // orange
        } else if (cmp.priority === 'Medium') {
          color = '#f59e0b'; // amber
        }

        if (cmp.status === 'Closed') {
          color = '#64748b'; // slate for closed
        }

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
              <div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 10px; font-weight: bold;">
                !
              </div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
              <strong style="color: #0f172a; font-size: 13px;">${cmp.complaintId}</strong>
              <span style="background-color: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
                ${cmp.priority}
              </span>
            </div>
            <div style="font-weight: 600; color: #334155; margin-bottom: 2px;">${cmp.category}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">${cmp.location.village} (${cmp.location.ward})</div>
            <div style="color: #475569; font-size: 11px; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${cmp.title}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 4px;">
              <span>Status: <strong style="color: #0f172a;">${cmp.status}</strong></span>
              <span>${cmp.createdAt ? new Date(cmp.createdAt).toLocaleDateString() : 'Recent'}</span>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (onComplaintClick) {
          marker.on('click', () => onComplaintClick(cmp));
        }

        markersLayerRef.current?.addLayer(marker);
      });

      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      }
    }
  }, [complaints, isPicker, onComplaintClick]);

  // Update Location Picker Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !isPicker) return;

    if (selectedLocation && selectedLocation.latitude && selectedLocation.longitude) {
      const { latitude, longitude } = selectedLocation;

      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([latitude, longitude]);
      } else {
        const pickerIcon = L.divIcon({
          className: 'picker-pin',
          html: `
            <div style="width: 32px; height: 32px; background: #059669; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
              <div style="width: 10px; height: 10px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });

        pickerMarkerRef.current = L.marker([latitude, longitude], {
          icon: pickerIcon,
          draggable: true,
        }).addTo(mapInstanceRef.current);

        pickerMarkerRef.current.on('dragend', (e: any) => {
          const latlng = e.target.getLatLng();
          if (onSelectLocation) onSelectLocation(latlng.lat, latlng.lng);
        });
      }

      mapInstanceRef.current.panTo([latitude, longitude]);
    }
  }, [selectedLocation, isPicker, onSelectLocation]);

  const handleUseGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (onSelectLocation) onSelectLocation(lat, lng);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([lat, lng], 16);
          }
        },
        error => {
          console.warn('Geolocation failed:', error);
          // Fallback to sample village center coordinates
          const fallbackLat = 25.3215;
          const fallbackLng = 82.9782;
          if (onSelectLocation) onSelectLocation(fallbackLat, fallbackLng);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([fallbackLat, fallbackLng], 15);
          }
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-slate-200 shadow-xs ${className}`}>
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* GPS Location Button */}
      {isPicker && (
        <button
          id="gps-locate-btn"
          type="button"
          onClick={handleUseGPS}
          className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-xs text-slate-800 hover:text-emerald-700 px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
        >
          <Navigation size={14} className="text-emerald-600" />
          <span>{language === 'hi' ? 'मेरा GPS स्थान' : 'Use GPS Location'}</span>
        </button>
      )}

      {isPicker && (
        <div className="absolute bottom-2 left-2 z-[400] bg-slate-900/85 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-md">
          {language === 'hi' ? '📌 स्थान चुनने हेतु मैप पर क्लिक करें' : '📌 Click anywhere on map to pinpoint issue'}
        </div>
      )}
    </div>
  );
};
