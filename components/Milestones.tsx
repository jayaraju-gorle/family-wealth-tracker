import React, { useState } from 'react';
import { Target, Trash2, Plus } from 'lucide-react';
import { AppState, Milestone } from '../types';
import { GlassCard } from './ui/GlassCard';
import { formatCurrency } from '../utils';

interface Props {
  data: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

export const Milestones: React.FC<Props> = ({ data, onUpdate }) => {
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');

  // We assume 'progress' tracks against Net Worth for simplicity in this MVP,
  // OR the user tracks generic savings. 

  const currentNetWorth = data.assets.reduce((a, b) => a + b.value, 0) - data.liabilities.reduce((a, b) => a + b.value, 0);

  const addMilestone = () => {
    if (!newGoalName || !newGoalTarget) return;
    const newMilestone: Milestone = {
      id: crypto.randomUUID(),
      name: newGoalName,
      targetAmount: Number(newGoalTarget),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    onUpdate({ milestones: [...data.milestones, newMilestone] });
    setNewGoalName('');
    setNewGoalTarget('');
  };

  const removeMilestone = (id: string) => {
    onUpdate({ milestones: data.milestones.filter(m => m.id !== id) });
  };

  return (
    <GlassCard title="Financial Milestones">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {data.milestones.map(milestone => {
          const percent = Math.min(100, Math.max(0, (currentNetWorth / milestone.targetAmount) * 100));
          return (
            <div key={milestone.id} className="relative bg-white/5 p-5 rounded-2xl border border-white/5 overflow-hidden group">
              {/* Background Progress Bar */}
              <div
                className="absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-out"
                style={{ width: `${percent}%`, backgroundColor: milestone.color }}
              />

              <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="p-2 rounded-lg bg-white/5">
                  <Target className="w-5 h-5" style={{ color: milestone.color }} />
                </div>
                <button onClick={() => removeMilestone(milestone.id)} className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-white font-semibold text-lg relative z-10 mb-3">{milestone.name}</h4>
              <div className="relative z-10">
                <span className="text-slate-400 text-sm block">Target: {formatCurrency(milestone.targetAmount)}</span>
                <span className="text-2xl font-bold mt-1 block" style={{ color: milestone.color }}>{percent.toFixed(0)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add New */}
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-slate-900/30 p-4 rounded-xl border border-slate-700/50">
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-400 block mb-1">Goal Name</label>
          <input
            type="text"
            value={newGoalName}
            onChange={e => setNewGoalName(e.target.value)}
            placeholder="e.g. Daughter's Education"
            className="w-full bg-transparent border-b border-slate-600 text-white focus:border-white outline-none py-1"
          />
        </div>
        <div className="flex-1 w-full">
          <label className="text-xs text-slate-400 block mb-1">Target Amount (₹)</label>
          <input
            type="number"
            value={newGoalTarget}
            onChange={e => setNewGoalTarget(e.target.value)}
            placeholder="e.g. 2500000"
            className="w-full bg-transparent border-b border-slate-600 text-white focus:border-white outline-none py-1"
          />
        </div>
        <button
          onClick={addMilestone}
          className="w-full sm:w-auto px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
    </GlassCard>
  );
};