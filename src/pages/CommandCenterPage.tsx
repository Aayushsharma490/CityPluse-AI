import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  Building2, 
  Loader2 
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageTransition } from '../components/layout/PageTransition';
import { KPIStat } from '../components/ui/KPIStat';
import { Card } from '../components/ui/Card';
import { CityHeatmap } from '../components/map/CityHeatmap';
import { CategoryDonut } from '../components/charts/CategoryDonut';
import { DepartmentBar } from '../components/charts/DepartmentBar';
import { useComplaints } from '../context/ComplaintsContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

const CATEGORY_DOT_COLOR: Record<string, string> = {
  Road: 'bg-cat-road',
  Water: 'bg-cat-water',
  Electricity: 'bg-cat-electricity',
  Sanitation: 'bg-cat-sanitation',
  Other: 'bg-cat-other',
};

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();
  const { complaints, analytics, loading, error } = useComplaints();
  
  // Ticker pause state
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  // Time formatter
  const getRelativeTime = (isoString: string) => {
    const diffMs = new Date().getTime() - new Date(isoString).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${Math.max(1, diffMins)}m ago`;
    }
    if (diffHrs < 24) {
      return `${diffHrs}h ago`;
    }
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  // Duplicate complaints list for infinite scrolling ticker feed (seamless loop)
  const tickerItems = useMemo(() => {
    const slice = complaints.slice(0, 10);
    return [...slice, ...slice];
  }, [complaints]);

  // Loading fallback
  if (loading) {
    return (
      <AppLayout>
        <div className="flex-grow flex flex-col items-center justify-center bg-cp-base text-cp-teal gap-3">
          <Loader2 className="animate-spin h-10 w-10" />
          <span className="font-display font-medium text-body-md tracking-wider">Syncing Command Center Feed...</span>
        </div>
      </AppLayout>
    );
  }

  // Error fallback
  if (error) {
    return (
      <AppLayout>
        <div className="flex-grow flex items-center justify-center p-6 bg-cp-base">
          <Card className="border border-cp-coral/30 max-w-md w-full bg-cp-coral/5 flex flex-col items-center gap-4 text-center">
            <AlertTriangle className="text-cp-coral" size={48} />
            <h2 className="font-display font-bold text-body-lg text-cp-coral">Connection Interrupted</h2>
            <p className="text-body-sm text-cp-text-secondary leading-relaxed">
              {error}
            </p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-grow flex flex-col">
          
          {/* Header Dashboard Information */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-cp-border">
            <div>
              <h1 className="font-display text-display-md text-cp-text-primary tracking-tight font-extrabold">
                Civic Command Center
              </h1>
              <p className="text-body-sm text-cp-text-secondary mt-1">
                Udaipur Smart City Municipal Grievance Dashboard
              </p>
            </div>
            <div className="flex items-center gap-2 text-body-sm text-cp-text-secondary bg-cp-surface border border-cp-border px-3 py-1.5 rounded-badge">
              <span className="w-2 h-2 bg-cp-teal rounded-full animate-pulse"></span>
              <span className="font-semibold tracking-wide">Live Feed Active</span>
            </div>
          </div>

          {/* BENTO GRID (12 Columns at Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-card-gap mt-8 flex-grow">
            
            {/* SLOT 1: Heatmap (col-span-8, row-span-2) */}
            <div className="lg:col-span-8 lg:row-span-2 flex flex-col min-h-[450px]">
              <CityHeatmap complaints={complaints} />
            </div>

            {/* SLOT 2: KPI Stats (col-span-4, row-span-2) */}
            <div className="lg:col-span-4 lg:row-span-2 flex flex-col gap-card-gap justify-between">
              {analytics && (
                <>
                  <KPIStat
                    label="Active Complaints Today"
                    value={analytics.total_today}
                    unit="Grievances"
                    trend="up"
                    trendPct={8}
                    icon={AlertCircle}
                  />
                  <KPIStat
                    label="Avg Resolution Speed"
                    value={analytics.avg_resolution_days}
                    unit="Days"
                    trend="down"
                    trendPct={12}
                    icon={Clock}
                  />
                  <KPIStat
                    label="SLA Breach Ratio"
                    value={analytics.sla_breach_pct}
                    unit="%"
                    trend="down"
                    trendPct={4}
                    alertCondition={analytics.sla_breach_pct > 20}
                    icon={AlertTriangle}
                  />
                  <KPIStat
                    label="Active Department Load"
                    value={Object.values(analytics.department_loads).reduce((a, b) => a + b, 0)}
                    unit="Assignments"
                    trend="neutral"
                    trendPct={0}
                    icon={Building2}
                  />
                </>
              )}
            </div>

            {/* SLOT 3: Category Distribution Chart (col-span-5) */}
            <Card className="lg:col-span-5 flex flex-col border border-cp-border">
              <h3 className="text-label text-cp-text-secondary mb-4 font-semibold tracking-wider">
                Grievance Category Distribution
              </h3>
              <div className="flex-grow flex items-center justify-center">
                {analytics && <CategoryDonut data={analytics.category_counts} />}
              </div>
            </Card>

            {/* SLOT 4: Department Workload Chart (col-span-4) */}
            <Card className="lg:col-span-4 flex flex-col border border-cp-border">
              <h3 className="text-label text-cp-text-secondary mb-4 font-semibold tracking-wider">
                Department Workload Comparison
              </h3>
              <div className="flex-grow flex items-center justify-center">
                {analytics && <DepartmentBar data={analytics.department_loads} />}
              </div>
            </Card>

            {/* SLOT 5: Recent Complaints Ticker Feed (col-span-3) */}
            <Card className="lg:col-span-3 flex flex-col border border-cp-border h-[280px] overflow-hidden relative group">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-label text-cp-text-secondary font-semibold tracking-wider">
                  Live Dispatch Feed
                </h3>
                <span className="text-label text-cp-teal font-mono font-bold">Latest</span>
              </div>
              
              <div className="flex-grow relative overflow-hidden">
                {prefersReduced ? (
                  // Reduced Motion static scrollable list
                  <div className="h-full overflow-y-auto space-y-2 pr-1.5 scrollbar-thin select-none">
                    {complaints.slice(0, 15).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => navigate(`/timeline/${item.id}`)}
                        className="flex items-center justify-between p-2 rounded hover:bg-cp-surface-2/60 border border-transparent hover:border-cp-border cursor-pointer transition-all gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${CATEGORY_DOT_COLOR[item.category] || 'bg-cp-teal'}`} />
                          <span className="text-body-sm text-cp-text-primary truncate pr-1">{item.text}</span>
                        </div>
                        <span className="text-mono-sm text-cp-text-muted flex-shrink-0">{getRelativeTime(item.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Infinite marquee scroll loop animation
                  <div 
                    className="absolute inset-0 h-full w-full overflow-hidden"
                    onMouseEnter={() => setIsTickerPaused(true)}
                    onMouseLeave={() => setIsTickerPaused(false)}
                  >
                    <div 
                      className="flex flex-col gap-2 w-full animate-ticker-scroll"
                      style={{ 
                        animationPlayState: isTickerPaused ? 'paused' : 'running'
                      }}
                    >
                      {tickerItems.map((item, idx) => (
                        <div
                          key={`${item.id}-${idx}`}
                          onClick={() => navigate(`/timeline/${item.id}`)}
                          className="flex items-center justify-between p-2 rounded hover:bg-cp-surface-2/60 border border-transparent hover:border-cp-border cursor-pointer transition-all gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${CATEGORY_DOT_COLOR[item.category] || 'bg-cp-teal'}`} />
                            <span className="text-body-sm text-cp-text-primary truncate pr-1">{item.text}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-label font-bold text-cp-teal bg-cp-teal-glow px-1.5 py-0.5 rounded text-[9px]">{item.priority_score}</span>
                            <span className="text-mono-sm text-cp-text-muted text-[10px]">{getRelativeTime(item.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

          </div>

        </div>
      </PageTransition>
    </AppLayout>
  );
};
export default CommandCenterPage;
