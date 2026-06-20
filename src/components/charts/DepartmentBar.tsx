import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface DepartmentBarProps {
  data: Record<string, number>;
}

const DEPT_ABBREVIATIONS: Record<string, string> = {
  "Public Works Department": "PWD",
  "Jal Board": "Jal Board",
  "DISCOM": "DISCOM",
  "Municipal Sanitation": "Sanitation",
  "General": "General"
};

export const DepartmentBar: React.FC<DepartmentBarProps> = ({ data }) => {
  const prefersReduced = useReducedMotion();

  const { chartData, maxVal } = useMemo(() => {
    const raw = Object.entries(data).map(([name, value]) => ({
      name: DEPT_ABBREVIATIONS[name] || name,
      fullName: name,
      value,
    }));
    const max = Math.max(...raw.map(d => d.value), 1);
    return { chartData: raw, maxVal: max };
  }, [data]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const capacityPct = Math.round((dataPoint.value / maxVal) * 100);
      return (
        <div className="bg-cp-surface border border-cp-border p-2.5 rounded shadow-lg text-body-sm font-body">
          <p className="font-semibold text-cp-text-primary mb-1">{dataPoint.fullName}</p>
          <div className="flex flex-col gap-1 text-cp-text-secondary text-body-sm">
            <span>Active Tickets: <strong className="text-cp-text-primary">{dataPoint.value}</strong></span>
            <span>Capacity Util: <strong className={capacityPct >= 80 ? 'text-cp-amber' : 'text-cp-teal'}>{capacityPct}%</strong></span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[220px]" role="img" aria-label="Department Workload Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94A3B8', fontSize: 12, fontFamily: 'Space Grotesk', fontWeight: 500 }}
            width={75}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(30, 58, 82, 0.2)' }} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            isAnimationActive={!prefersReduced}
            animationDuration={600}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => {
              // Amber fill when count is >= 80% of max value
              const isOverloaded = entry.value >= 0.8 * maxVal;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={isOverloaded ? '#F59E0B' : '#00CED1'}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default DepartmentBar;
