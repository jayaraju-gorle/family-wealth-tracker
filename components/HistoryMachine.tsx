import React, { useState } from 'react';
import { Calendar, Save, RotateCcw } from 'lucide-react';
import { AppState, Snapshot } from '../types';
import { GlassCard } from './ui/GlassCard';
import { formatCurrency } from '../utils';

interface Props {
  data: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
}

export const HistoryMachine: React.FC<Props> = ({ data, onUpdate }) => {
  const [newSnapshotDate, setNewSnapshotDate] = useState(new Date().toISOString().slice(0, 10));
  const [newSnapshotValue, setNewSnapshotValue] = useState<number | ''>('');

  const currentNetWorth = data.assets.reduce((a, b) => a + b.value, 0) - data.liabilities.reduce((a, b) => a + b.value, 0);

  const handleLogCurrent = () => {
    const today = new Date().toISOString().slice(0, 10);
    // Check if entry exists for today
    const exists = data.snapshots.find(s => s.date === today);
    if (exists) {
      if(!confirm("A snapshot for today already exists. Overwrite?")) return;
    }

    const newSnapshot: Snapshot = {
      id: exists ? exists.id : crypto.randomUUID(),
      date: today,
      netWorth: currentNetWorth,
      isManual: false,
      note: 'Auto-logged from dashboard'
    };

    const updatedSnapshots = [...data.snapshots.filter(s => s.date !== today), newSnapshot]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    onUpdate({ snapshots: updatedSnapshots });
  };

  const handleAddHistorical = () => {
    if (!newSnapshotValue) return;

    const newSnapshot: Snapshot = {
      id: crypto.randomUUID(),
      date: newSnapshotDate,
      netWorth: Number(newSnapshotValue),
      isManual: true,
      note: 'Manual historical entry'
    };

    // Replace if date exists
    const updatedSnapshots = [...data.snapshots.filter(s => s.date !== newSnapshotDate), newSnapshot]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    onUpdate({ snapshots: updatedSnapshots });
    setNewSnapshotValue('');
  };

  const deleteSnapshot = (id: string) => {
    onUpdate({ snapshots: data.snapshots.filter(s => s.id !== id) });
  };

  return (
    <div className="space-y-6">
      <GlassCard title="Time Machine Control">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Quick Action: Log Today */}
          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <h4 className="text-emerald-300 font-semibold mb-1">Capture Today</h4>
              <p className="text-slate-400 text-sm mb-4">
                Record your current calculated net worth ({formatCurrency(currentNetWorth)}) as a permanent history point.
              </p>
            </div>
            <button 
              onClick={handleLogCurrent}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Log Snapshot
            </button>
          </div>

          {/* Manual Entry */}
          <div className="bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20">
            <h4 className="text-indigo-300 font-semibold mb-3">Add Past Data</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Date</label>
                <input 
                  type="date" 
                  value={newSnapshotDate}
                  onChange={(e) => setNewSnapshotDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-white text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Net Worth (₹)</label>
                <input 
                  type="number" 
                  value={newSnapshotValue}
                  onChange={(e) => setNewSnapshotValue(parseFloat(e.target.value))}
                  placeholder="e.g. 500000"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-white text-sm"
                />
              </div>
              <button 
                onClick={handleAddHistorical}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Backdate
              </button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* History Log Table */}
      <GlassCard title="History Log">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-white/5 uppercase font-medium text-xs">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Date</th>
                <th className="px-4 py-3">Net Worth</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.snapshots.length === 0 ? (
                <tr>
                   <td colSpan={4} className="px-4 py-6 text-center text-slate-500 italic">No history recorded yet.</td>
                </tr>
              ) : (
                data.snapshots.map(snap => (
                  <tr key={snap.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{snap.date}</td>
                    <td className="px-4 py-3 text-emerald-400 font-bold">{formatCurrency(snap.netWorth)}</td>
                    <td className="px-4 py-3 text-xs">
                      {snap.isManual ? (
                        <span className="bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded">Manual</span>
                      ) : (
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">Auto</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deleteSnapshot(snap.id)} className="text-slate-500 hover:text-rose-400 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};