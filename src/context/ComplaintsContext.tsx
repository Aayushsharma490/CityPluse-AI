import React, { createContext, useContext, useState, useEffect } from 'react';
import { Complaint, AnalyticsSummary, ClassifyResponse } from '../types';
import * as api from '../lib/api';

interface ComplaintsContextType {
  complaints: Complaint[];
  analytics: AnalyticsSummary | null;
  loading: boolean;
  error: string | null;
  addComplaint: (text: string, classification: ClassifyResponse, wardName: string) => Promise<Complaint>;
  refreshData: () => Promise<void>;
}

const ComplaintsContext = createContext<ComplaintsContextType | undefined>(undefined);

// Udaipur ward coordinate map for geographic lookup
const WARD_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Chetak Circle": { lat: 24.5937, lng: 73.6934 },
  "Hiran Magri": { lat: 24.5684, lng: 73.7144 },
  "Bhupalpura": { lat: 24.5945, lng: 73.7088 },
  "Sukhadia Circle": { lat: 24.6033, lng: 73.6922 },
  "Fateh Sagar": { lat: 24.5982, lng: 73.6828 },
  "Ambamata": { lat: 24.5919, lng: 73.6745 },
  "Hathi Pol": { lat: 24.5878, lng: 73.6875 },
  "Surajpole": { lat: 24.5815, lng: 73.7001 },
  "City Station": { lat: 24.5712, lng: 73.6985 },
  "Sector 4": { lat: 24.5631, lng: 73.7224 },
  "Sector 11": { lat: 24.5550, lng: 73.7202 },
  "Sector 14": { lat: 24.5450, lng: 73.7180 },
  "Mallatalai": { lat: 24.5902, lng: 73.6655 },
  "Shobhagpura": { lat: 24.6135, lng: 73.7092 },
  "Sajjan Nagar": { lat: 24.5824, lng: 73.6601 },
  "Goverdhan Vilas": { lat: 24.5501, lng: 73.6902 },
  "Panchwati": { lat: 24.6012, lng: 73.6995 }
};

export const ComplaintsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [complaintsData, analyticsData] = await Promise.all([
        api.getComplaints(),
        api.getAnalyticsSummary(),
      ]);
      setComplaints(complaintsData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to load civic intelligence feed. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addComplaint = async (text: string, classification: ClassifyResponse, wardName: string): Promise<Complaint> => {
    // 1. Resolve ward coordinates
    const wardCoord = WARD_COORDINATES[wardName] || WARD_COORDINATES["Chetak Circle"];
    
    // 2. Add slight random jitter (approx +/- 200m)
    const jitterLat = wardCoord.lat + (Math.random() - 0.5) * 0.002;
    const jitterLng = wardCoord.lng + (Math.random() - 0.5) * 0.002;

    // 3. Construct new complaint
    const newComplaint: Complaint = {
      id: Math.random().toString(36).substring(2, 10), // 8-char random id
      text,
      category: classification.category,
      priority_score: classification.priority_score,
      reasoning: classification.reasoning || classification.priority_reasoning || "Classified by AI model.",
      department: classification.department,
      resolution_days: classification.resolution_days || classification.estimated_resolution_days || 5,
      ward: wardName,
      lat: parseFloat(jitterLat.toFixed(6)),
      lng: parseFloat(jitterLng.toFixed(6)),
      timestamp: new Date().toISOString(),
      status: 'Submitted'
    };

    try {
      // 4. Save to backend database
      const saved = await api.saveComplaint(newComplaint);
      
      // 5. Update local state
      setComplaints(prev => [saved, ...prev]);
      
      // 6. Refresh analytics summary from backend to reflect updates
      const updatedAnalytics = await api.getAnalyticsSummary();
      setAnalytics(updatedAnalytics);
      
      return saved;
    } catch (err) {
      console.error("Error saving complaint:", err);
      // Fallback: update local state anyway so demo functions offline/locally
      setComplaints(prev => [newComplaint, ...prev]);
      return newComplaint;
    }
  };

  return (
    <ComplaintsContext.Provider value={{ complaints, analytics, loading, error, addComplaint, refreshData }}>
      {children}
    </ComplaintsContext.Provider>
  );
};

export const useComplaints = () => {
  const context = useContext(ComplaintsContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintsProvider');
  }
  return context;
};
