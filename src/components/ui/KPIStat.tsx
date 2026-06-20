import React, { useRef, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Card } from './Card';

interface KPIStatProps {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPct?: number;
  alertCondition?: boolean;
  icon: LucideIcon;
}

export const KPIStat: React.FC<KPIStatProps> = ({
  label,
  value,
  unit = '',
  trend = 'neutral',
  trendPct,
  alertCondition = false,
  icon: Icon,
}) => {
  const prefersReduced = useReducedMotion();
  const [inView, setInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  // Trigger count-up only when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const animatedValue = useCountUp(value, 1200, inView && !prefersReduced);

  // Determine trend color:
  // For negative metrics like SLA Breach % or resolution time, 'up' is red (coral) and 'down' is green (resolved).
  // For total complaints, 'up' is alert warning (amber).
  const isNegativeMetric = label.toLowerCase().includes('breach') || label.toLowerCase().includes('resolution');
  let trendColor = 'text-cp-text-secondary';
  
  if (trend === 'up') {
    trendColor = isNegativeMetric ? 'text-cp-coral' : 'text-status-resolved';
  } else if (trend === 'down') {
    trendColor = isNegativeMetric ? 'text-status-resolved' : 'text-cp-coral';
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <div ref={elementRef} className="w-full">
      <Card
        className={`
          flex flex-col gap-2 relative overflow-hidden h-full border
          ${alertCondition 
            ? 'border-cp-amber shadow-glow-amber text-cp-amber bg-cp-surface-2' 
            : 'border-cp-border bg-cp-surface text-cp-text-primary'
          }
        `}
      >
        {/* Top bar with Icon and label */}
        <div className="flex items-center justify-between">
          <span className="text-label text-cp-text-secondary">{label}</span>
          <Icon size={20} className={alertCondition ? 'text-cp-amber' : 'text-cp-teal'} />
        </div>

        {/* Large Value */}
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-[2rem] leading-none font-display font-bold ${alertCondition ? 'text-cp-amber' : 'text-cp-text-primary'}`}>
            {animatedValue}
          </span>
          {unit && <span className="text-body-sm text-cp-text-secondary font-medium ml-1">{unit}</span>}
        </div>

        {/* Trend Indicator */}
        {trendPct !== undefined && (
          <div className="flex items-center gap-1 mt-2 text-body-sm">
            <span className={`flex items-center gap-0.5 font-medium ${trendColor}`}>
              <TrendIcon size={14} aria-hidden="true" />
              <span>{trendPct}%</span>
            </span>
            <span className="text-cp-text-muted">vs yesterday</span>
          </div>
        )}
      </Card>
    </div>
  );
};
export default KPIStat;
