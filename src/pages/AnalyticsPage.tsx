import React, { useMemo, useRef, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  Line, 
  BarChart, 
  Bar, 
  ComposedChart,
  ReferenceLine,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useInView } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { PageTransition } from '../components/layout/PageTransition';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useComplaints } from '../context/ComplaintsContext';
import { useReducedMotion } from '../hooks/useReducedMotion';

export const AnalyticsPage: React.FC = () => {
  const prefersReduced = useReducedMotion();
  const { complaints, loading } = useComplaints();
  const [isExporting, setIsExporting] = useState(false);

  // View refs for triggering chart entry animations only when visible
  const trendRef = useRef<HTMLDivElement>(null);
  const momRef = useRef<HTMLDivElement>(null);
  const forecastRef = useRef<HTMLDivElement>(null);

  const trendInView = useInView(trendRef, { once: true, amount: 0.2 });
  const momInView = useInView(momRef, { once: true, amount: 0.2 });
  const forecastInView = useInView(forecastRef, { once: true, amount: 0.2 });

  // 1. Group complaints into 30-day trend
  const trendData = useMemo(() => {
    if (!complaints.length) return [];
    
    // Create map of last 30 days
    const daysMap: Record<string, number> = {};
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      daysMap[key] = 0;
    }

    complaints.forEach((c) => {
      const dateKey = new Date(c.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      if (dateKey in daysMap) {
        daysMap[dateKey]++;
      }
    });

    return Object.entries(daysMap).map(([date, count]) => ({
      date,
      count
    }));
  }, [complaints]);

  // 2. Group complaints for Month over Month comparison (Current vs Previous)
  // Mock data has realistic distribution, we use current database counts for current month,
  // and map realistic baseline counts for previous month.
  const momData = useMemo(() => {
    const categories = ['Road', 'Water', 'Electricity', 'Sanitation', 'Other'];
    const currentCounts: Record<string, number> = { Road: 0, Water: 0, Electricity: 0, Sanitation: 0, Other: 0 };
    
    complaints.forEach((c) => {
      if (c.category in currentCounts) {
        currentCounts[c.category]++;
      }
    });

    // Baseline previous month counts
    const prevCounts: Record<string, number> = {
      Road: 48,
      Water: 40,
      Electricity: 28,
      Sanitation: 28,
      Other: 12
    };

    return categories.map((cat) => ({
      category: cat,
      Previous: prevCounts[cat],
      Current: currentCounts[cat]
    }));
  }, [complaints]);

  // 3. Linear Regression Forecast projection (7 days ahead)
  const forecastData = useMemo(() => {
    if (trendData.length < 7) return [];
    
    // Take last 7 days of actual counts to calculate regression slope
    const last7Actuals = trendData.slice(-7);
    const n = 7;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    last7Actuals.forEach((d, idx) => {
      const x = idx; // 0 to 6
      const y = d.count;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Build composed actuals + 7 days forecast
    const data: {
      name: string;
      actual: number | null;
      forecast: number | null;
      upper: number | null;
      lower: number | null;
    }[] = trendData.map((d) => ({
      name: d.date,
      actual: d.count,
      forecast: null,
      upper: null,
      lower: null
    }));

    // Extrapolate next 7 days
    const lastActualIdx = trendData.length - 1;
    const now = new Date();
    
    // Anchor first forecast point to last actual point
    const lastActualValue = trendData[lastActualIdx].count;
    data[lastActualIdx].forecast = lastActualValue;
    data[lastActualIdx].upper = lastActualValue;
    data[lastActualIdx].lower = lastActualValue;

    for (let i = 1; i <= 7; i++) {
      const forecastDay = new Date();
      forecastDay.setDate(now.getDate() + i);
      const dateLabel = forecastDay.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      
      // Compute forecast count using regression line: y = m * x + c
      // We map the x coordinate to progress past the anchor index (6 + i)
      const projectedValue = Math.max(0, Math.round(slope * (6 + i) + intercept));
      
      // Shaded confidence band is +/- 15% of forecast value
      const upper = Math.round(projectedValue * 1.15);
      const lower = Math.max(0, Math.round(projectedValue * 0.85));

      data.push({
        name: dateLabel,
        actual: null,
        forecast: projectedValue,
        upper,
        lower
      });
    }

    return data;
  }, [trendData]);

  // 4. CSV Report Exporter
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const headers = ['date', 'category', 'priority_score', 'department', 'resolution_days', 'status', 'ward'];
      const rows = complaints.map(c => [
        c.timestamp.substring(0, 10),
        c.category,
        c.priority_score,
        c.department,
        c.resolution_days,
        c.status,
        c.ward
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(r => r.map(val => `"${val}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      
      const dateStamp = new Date().toISOString().substring(0, 10);
      link.setAttribute('download', `citypulse-report-${dateStamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-grow flex flex-col items-center justify-center text-cp-teal">
          <Loader2 className="animate-spin h-8 w-8 mb-2" />
          <span>Generating Analytics Reports...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-grow flex flex-col justify-start">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="font-display text-display-md text-cp-text-primary tracking-tight font-extrabold">
              System Analytics & Reports
            </h1>
            <Button
              variant="secondary"
              onClick={handleExportCSV}
              loading={isExporting}
              icon={<Download size={18} />}
            >
              Export CSV Report
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            
            {/* SECTION 1: 30-Day Trend Area Chart */}
            <div ref={trendRef} className="w-full">
              {trendInView && (
                <Card className="border border-cp-border flex flex-col gap-4">
                  <div>
                    <h2 className="font-display font-semibold text-body-lg text-cp-text-primary">
                      Daily Grievance Trend (Last 30 Days)
                    </h2>
                    <p className="text-body-sm text-cp-text-secondary">
                      Daily volume mapping of registered citizen complaints.
                    </p>
                  </div>
                  
                  <div className="w-full h-[300px] mt-4 font-mono text-[11px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00CED1" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#00CED1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1E3A52" strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="date" stroke="#4E6D84" />
                        <YAxis stroke="#4E6D84" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0F2A3F', borderColor: '#1E3A52', borderRadius: '8px' }}
                          labelStyle={{ color: '#F0F9FF', fontFamily: 'Space Grotesk' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#00CED1" 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#trendColor)" 
                          name="Tickets Received"
                          isAnimationActive={!prefersReduced}
                          animationDuration={800}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </div>

            {/* SECTION 2: Month over Month Category Bar Chart */}
            <div ref={momRef} className="w-full">
              {momInView && (
                <Card className="border border-cp-border flex flex-col gap-4">
                  <div>
                    <h2 className="font-display font-semibold text-body-lg text-cp-text-primary">
                      Category Comparison (Month over Month)
                    </h2>
                    <p className="text-body-sm text-cp-text-secondary">
                      Comparison of category counts between current and previous calendar periods.
                    </p>
                  </div>
                  
                  <div className="w-full h-[300px] mt-4 font-mono text-[11px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={momData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid stroke="#1E3A52" strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="category" stroke="#4E6D84" />
                        <YAxis stroke="#4E6D84" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0F2A3F', borderColor: '#1E3A52', borderRadius: '8px' }}
                          labelStyle={{ color: '#F0F9FF', fontFamily: 'Space Grotesk' }}
                        />
                        <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: '12px' }} />
                        <Bar 
                          dataKey="Previous" 
                          fill="#132F47" 
                          stroke="#1E3A52" 
                          strokeWidth={1.5}
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={!prefersReduced}
                          animationDuration={800}
                        />
                        <Bar 
                          dataKey="Current" 
                          fill="#00CED1" 
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={!prefersReduced}
                          animationDuration={800}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </div>

            {/* SECTION 3: 7-Day Composed Forecast Chart */}
            <div ref={forecastRef} className="w-full">
              {forecastInView && (
                <Card className="border border-cp-border flex flex-col gap-4">
                  <div>
                    <h2 className="font-display font-semibold text-body-lg text-cp-text-primary">
                      Linear Dispatch Forecast (Next 7 Days)
                    </h2>
                    <p className="text-body-sm text-cp-text-secondary">
                      Extrapolated linear trend forecast with shaded 15% confidence boundaries.
                    </p>
                  </div>
                  
                  <div className="w-full h-[300px] mt-4 font-mono text-[11px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={forecastData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid stroke="#1E3A52" strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" stroke="#4E6D84" />
                        <YAxis stroke="#4E6D84" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0F2A3F', borderColor: '#1E3A52', borderRadius: '8px' }}
                          labelStyle={{ color: '#F0F9FF', fontFamily: 'Space Grotesk' }}
                        />
                        <Legend wrapperStyle={{ fontFamily: 'DM Sans', fontSize: '12px' }} />
                        {/* Shaded Confidence Area */}
                        <Area 
                          type="monotone" 
                          dataKey="upper"
                          stroke="none"
                          fill="#F59E0B"
                          fillOpacity={0.08}
                          name="Confidence Limit (Max)"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="lower"
                          stroke="none"
                          fill="#F59E0B"
                          fillOpacity={0}
                          name="Confidence Limit (Min)"
                        />
                        {/* Actual counts line */}
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="#00CED1" 
                          strokeWidth={2.5}
                          dot={{ r: 3 }}
                          name="Actual Grievances"
                          isAnimationActive={!prefersReduced}
                          animationDuration={800}
                        />
                        {/* Forecast dashed line */}
                        <Line 
                          type="monotone" 
                          dataKey="forecast" 
                          stroke="#F59E0B" 
                          strokeDasharray="5 5"
                          strokeWidth={2}
                          dot={{ r: 3, stroke: '#F59E0B' }}
                          name="Projected Forecast"
                          isAnimationActive={!prefersReduced}
                          animationDuration={800}
                        />
                        {/* Today Marker */}
                        <ReferenceLine 
                          x={trendData[trendData.length - 1]?.date} 
                          stroke="#EF4444" 
                          strokeWidth={1.5}
                          label={{ value: 'TODAY', fill: '#EF4444', position: 'top', fontFamily: 'Space Grotesk', fontWeight: 'bold' }} 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              )}
            </div>

          </div>

        </div>
      </PageTransition>
    </AppLayout>
  );
};
export default AnalyticsPage;
