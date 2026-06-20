import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { WardHotspot } from '../../types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Badge } from '../ui/Badge';

interface HotspotMarkerProps {
  hotspot: WardHotspot;
}

export const HotspotMarker: React.FC<HotspotMarkerProps> = ({ hotspot }) => {
  const prefersReduced = useReducedMotion();
  const { count, lat, lng, ward, avg_score, top_category } = hotspot;
  
  // Color mapping based on complaint count:
  // 1-3 = cp-teal (#00CED1)
  // 4-7 = cp-amber (#F59E0B)
  // 8+ = cp-coral (#EF4444)
  let color = '#00CED1';
  let colorClass = 'bg-cp-teal';
  let borderGlowClass = 'border-cp-teal/40';
  
  if (count >= 4 && count <= 7) {
    color = '#F59E0B';
    colorClass = 'bg-cp-amber';
    borderGlowClass = 'border-cp-amber/40';
  } else if (count > 7) {
    color = '#EF4444';
    colorClass = 'bg-cp-coral';
    borderGlowClass = 'border-cp-coral/40';
  }

  // DivIcon HTML markup
  const iconHtml = prefersReduced
    ? `<div class="relative flex items-center justify-center w-6 h-6">
        <div class="w-3.5 h-3.5 rounded-full ${colorClass} border border-white/25 shadow-md"></div>
       </div>`
    : `<div class="relative flex items-center justify-center w-6 h-6">
        <div class="absolute w-6 h-6 rounded-full border-2 ${borderGlowClass} animate-radar-ping"></div>
        <div class="relative w-3.5 h-3.5 rounded-full ${colorClass} border border-white/25 shadow-md"></div>
       </div>`;

  const customIcon = L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return (
    <Marker position={[lat, lng]} icon={customIcon}>
      <Popup className="custom-popup">
        <div className="p-3 min-w-[200px] bg-cp-surface text-cp-text-primary rounded-card font-body shadow-card border border-cp-border">
          <div className="font-display font-bold text-body-md border-b border-cp-border pb-1.5 mb-2 flex justify-between items-center">
            <span>{ward}</span>
            <span className="text-body-sm font-semibold text-cp-teal font-display bg-cp-teal-glow px-2 py-0.5 rounded-pill">
              {count} {count === 1 ? 'Grievance' : 'Grievances'}
            </span>
          </div>
          
          <div className="flex flex-col gap-1.5 text-body-sm">
            <div className="flex justify-between items-center">
              <span className="text-cp-text-secondary">Avg Priority:</span>
              <span className="font-display font-semibold" style={{ color }}>
                {avg_score.toFixed(1)} / 10
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-cp-text-secondary">Top Category:</span>
              <Badge category={top_category as any} className="!text-[10px] !px-1.5 !py-0.5 !gap-1" />
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
export default HotspotMarker;
