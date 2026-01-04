import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { AppState } from '../types';
import { GlassCard } from './ui/GlassCard';
import { formatCompact, formatCurrency } from '../utils';

interface Props {
  data: AppState;
}

export const Projections: React.FC<Props> = ({ data }) => {
  const chartData = useMemo(() => {
    // 1. Gather historical points
    const points = data.snapshots.map(s => ({
      date: s.date,
      history: s.netWorth,
      projected: null as number | null,
      isProjected: false
    }));

    if (points.length === 0) return [];

    // 2. Calculate current derived net worth
    const currentNetWorth = data.assets.reduce((a, b) => a + b.value, 0) - data.liabilities.reduce((a, b) => a + b.value, 0);
    const lastDate = new Date().toISOString().slice(0, 10);
    
    // Check if we need to append "today" if it's not in snapshots
    const lastSnapshot = points[points.length - 1];
    if (lastSnapshot.date !== lastDate) {
      points.push({
        date: lastDate,
        history: currentNetWorth,
        projected: currentNetWorth, // Connect the lines
        isProjected: false
      });
    } else {
        // Ensure the connection point exists
        points[points.length -1].projected = points[points.length -1].history;
    }

    // 3. Project Future (Next 5 Years)
    // Simple projection: (Current NW + (Monthly Contrib * months)) * Growth
    // Weighted average growth
    const totalAssets = data.assets.reduce((sum, a) => sum + a.value, 0) || 1; // avoid div 0
    const weightedGrowth = data.assets.reduce((sum, a) => sum + (a.value * a.growthRate), 0) / totalAssets;
    const monthlyRate = weightedGrowth / 12;

    let projectedVal = currentNetWorth;
    let currentDate = new Date();

    for (let i = 1; i <= 60; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      
      // Add contribution
      projectedVal += data.monthlyContribution;
      // Add growth
      projectedVal = projectedVal * (1 + monthlyRate);

      points.push({
        date: currentDate.toISOString().slice(0, 7), // YYYY-MM format for less clutter
        history: null,
        projected: Math.round(projectedVal),
        isProjected: true
      });
    }

    return points;
  }, [data]);

  return (
    <GlassCard title="Wealth Trajectory: History vs Future">
      <div className="h-[400px] w-full mt-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                fontSize={12} 
                tickMargin={10} 
                tickFormatter={(val) => val.slice(0, 7)} // Show YYYY-MM
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickFormatter={(val) => formatCompact(val)} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                formatter={(val: number) => [formatCurrency(val), 'Net Worth']}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area 
                type="monotone" 
                dataKey="history" 
                stroke="#10b981" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorHistory)" 
                name="History"
              />
              <Area 
                type="monotone" 
                dataKey="projected" 
                stroke="#6366f1" 
                strokeWidth={3} 
                strokeDasharray="5 5" 
                fillOpacity={1} 
                fill="url(#colorProjected)" 
                name="Projection"
              />
              <ReferenceLine x={new Date().toISOString().slice(0, 10)} stroke="#f472b6" label="Today" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            Add historical data to see the chart.
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-slate-300">Recorded History</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full opacity-50"></div>
          <span className="text-slate-300">Projected Future</span>
        </div>
      </div>
    </GlassCard>
  );
};