export interface Complaint {
  id: string;
  text: string;
  category: 'Road' | 'Water' | 'Electricity' | 'Sanitation' | 'Other';
  priority_score: number;
  reasoning: string;
  department: string;
  resolution_days: number;
  ward: string;
  lat: number;
  lng: number;
  timestamp: string;
  status: 'Submitted' | 'In Progress' | 'Resolved' | 'SLA Breached';
}

export interface ClassifyResponse {
  category: 'Road' | 'Water' | 'Electricity' | 'Sanitation' | 'Other';
  priority_score: number;
  reasoning: string;
  department: string;
  resolution_days: number;
  priority_reasoning?: string;
  estimated_resolution_days?: number;
}

export interface AnalyticsSummary {
  total_today: number;
  avg_resolution_days: number;
  sla_breach_pct: number;
  department_loads: Record<string, number>;
  category_counts: Record<string, number>;
}

export interface KPIData {
  label: string;
  value: number;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  trendPct?: number;
  alertCondition?: boolean;
}

export interface WardHotspot {
  ward: string;
  lat: number;
  lng: number;
  count: number;
  avg_score: number;
  top_category: string;
}

export interface TimelineNode {
  status: 'Submitted' | 'Classified' | 'Routed' | 'In Progress' | 'Resolved';
  title: string;
  timestamp?: string;
  description?: string;
  details?: {
    complainantId?: string;
    ward?: string;
    category?: string;
    priority_score?: number;
    reasoning?: string;
    department?: string;
    sla_deadline?: string;
    assignee?: string;
    last_updated?: string;
  };
}
