import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface CategoryDonutProps {
  data: Record<string, number>;
}

const COLOR_MAP: Record<string, string> = {
  Road: '#3B82F6',        // cat-road (blue)
  Water: '#06B6D4',       // cat-water (cyan)
  Electricity: '#F59E0B', // cat-electricity (amber)
  Sanitation: '#10B981',  // cat-sanitation (green)
  Other: '#6B7280',       // cat-other (grey)
};

export const CategoryDonut: React.FC<CategoryDonutProps> = ({ data }) => {
  const prefersReduced = useReducedMotion();

  // Convert Record<string, number> to Recharts array structure
  const chartData = useMemo(() => {
    return Object.entries(data).map(([name, value]) => ({
      name,
      value,
    }));
  }, [data]);

  const totalComplaints = useMemo(() => {
    return Object.values(data).reduce((acc, curr) => acc + curr, 0) || 1;
  }, [data]);

  // Custom HTML Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const pct = ((dataPoint.value / totalComplaints) * 100).toFixed(1);
      return (
        <div className="bg-cp-surface border border-cp-border p-2.5 rounded shadow-lg text-body-sm font-body">
          <p className="font-semibold text-cp-text-primary mb-1">{dataPoint.name}</p>
          <div className="flex gap-4 text-cp-text-secondary">
            <span>Volume: <strong className="text-cp-text-primary">{dataPoint.value}</strong></span>
            <span>Ratio: <strong className="text-cp-teal">{pct}%</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[220px] flex flex-col justify-between">
      <div className="w-full flex-grow relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive={!prefersReduced}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLOR_MAP[entry.name] || '#6B7280'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Horizontal Custom Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2 font-body text-body-sm">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: COLOR_MAP[item.name] }}
            />
            <span className="text-cp-text-secondary">{item.name}</span>
            <span className="text-cp-text-primary font-semibold font-mono text-body-sm">
              ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CategoryDonut;
