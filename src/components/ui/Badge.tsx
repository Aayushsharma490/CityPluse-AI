import React from 'react';
import { Milestone, Droplets, Zap, Trash2, HelpCircle, Clock, CheckCircle2, AlertOctagon, LucideIcon } from 'lucide-react';

type CategoryType = 'Road' | 'Water' | 'Electricity' | 'Sanitation' | 'Other';
type StatusType = 'Submitted' | 'In Progress' | 'Resolved' | 'SLA Breached';

interface BadgeProps {
  category?: CategoryType;
  status?: StatusType;
  className?: string;
  pill?: boolean;
}

const categoryConfig: Record<CategoryType, { color: string; bg: string; icon: LucideIcon }> = {
  Road: { color: 'text-white', bg: 'bg-cat-road', icon: Milestone },
  Water: { color: 'text-white', bg: 'bg-cat-water', icon: Droplets },
  Electricity: { color: 'text-white', bg: 'bg-cat-electricity', icon: Zap },
  Sanitation: { color: 'text-white', bg: 'bg-cat-sanitation', icon: Trash2 },
  Other: { color: 'text-white', bg: 'bg-cat-other', icon: HelpCircle },
};

const statusConfig: Record<StatusType, { color: string; bg: string; icon: LucideIcon }> = {
  Submitted: { color: 'text-cp-text-primary', bg: 'bg-status-submitted/20 border border-status-submitted/40', icon: Clock },
  'In Progress': { color: 'text-cp-amber', bg: 'bg-cp-amber/20 border border-cp-amber/40', icon: Clock },
  Resolved: { color: 'text-status-resolved', bg: 'bg-status-resolved/20 border border-status-resolved/40', icon: CheckCircle2 },
  'SLA Breached': { color: 'text-cp-coral', bg: 'bg-cp-coral/20 border border-cp-coral/40', icon: AlertOctagon },
};

export const Badge: React.FC<BadgeProps> = ({ category, status, className = '', pill = false }) => {
  if (category) {
    const config = categoryConfig[category] || categoryConfig.Other;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-label font-bold rounded-badge ${config.bg} ${config.color} ${className}`}>
        <Icon size={12} aria-hidden="true" />
        <span>{category}</span>
      </span>
    );
  }
  
  if (status) {
    const config = statusConfig[status] || statusConfig.Submitted;
    const Icon = config.icon;
    const borderRadiusClass = pill ? 'rounded-pill' : 'rounded-badge';
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-body-sm font-semibold ${borderRadiusClass} ${config.bg} ${config.color} ${className}`}>
        <Icon size={14} aria-hidden="true" />
        <span>{status}</span>
      </span>
    );
  }
  
  return null;
};
export default Badge;
