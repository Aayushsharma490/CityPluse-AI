import React, { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Complaint, WardHotspot } from '../../types';
import HotspotMarker from './HotspotMarker';

interface CityHeatmapProps {
  complaints: Complaint[];
}

export const CityHeatmap: React.FC<CityHeatmapProps> = ({ complaints }) => {
  // Dynamic aggregation of complaints into ward hotspots
  const hotspots = useMemo(() => {
    const wardGroups: Record<string, Complaint[]> = {};
    
    complaints.forEach((c) => {
      if (!wardGroups[c.ward]) {
        wardGroups[c.ward] = [];
      }
      wardGroups[c.ward].push(c);
    });

    const list: WardHotspot[] = [];
    Object.entries(wardGroups).forEach(([wardName, listComplaints]) => {
      if (listComplaints.length === 0) return;
      
      const sum = listComplaints.reduce((acc, c) => acc + c.priority_score, 0);
      const avg_score = sum / listComplaints.length;
      
      const categoryCounts: Record<string, number> = {};
      listComplaints.forEach((c) => {
        categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
      });
      const top_category = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0][0];
      
      // Use average of complaint coordinates for ward centroid
      const avgLat = listComplaints.reduce((acc, c) => acc + c.lat, 0) / listComplaints.length;
      const avgLng = listComplaints.reduce((acc, c) => acc + c.lng, 0) / listComplaints.length;
      
      list.push({
        ward: wardName,
        lat: avgLat,
        lng: avgLng,
        count: listComplaints.length,
        avg_score,
        top_category,
      });
    });
    
    return list;
  }, [complaints]);

  return (
    <div 
      className="w-full h-full min-h-[350px] relative rounded-card overflow-hidden border border-cp-border" 
      role="region" 
      aria-label="Udaipur Ward Heatmap"
    >
      <MapContainer
        center={[24.5854, 73.7125]}
        zoom={12}
        style={{ width: '100%', height: '100%', background: '#F1F5F9' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {hotspots.map((hotspot) => (
          <HotspotMarker key={hotspot.ward} hotspot={hotspot} />
        ))}
      </MapContainer>
    </div>
  );
};
export default CityHeatmap;
