import React, { useState } from 'react';
import { Cloud, Lock, Users, AlertCircle, Check, Copy, UserPlus, ArrowRight, ArrowLeft, WifiOff, ShieldCheck, RefreshCw, Loader2, Save } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { AppState } from '../types';
import { initFirebase, authenticateAnonymously, isFirebaseInitialized, isMock } from '../services/firebase';
import { SyncStatus } from '../services/store';

interface Props {
  data: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  isSynced: boolean;
  syncStatus?: SyncStatus;
  onForcePull?: () => void;
}

export const SyncManager: React.FC<Props> = ({ data, onUpdate, isSynced, syncStatus = 'idle', onForcePull }) => {
  const [view, setView] = useState<'main' | 'join'>('main');
  const [joinKey, setJoinKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCopyKey = () => {
    if (data.familyId) {
      navigator.clipboard.writeText(data.familyId);
    }
  };

  const initializeSync = async (isNewFamily: boolean) => {
    setError(null);
    setLoading(true);

    try {
      // 1. Init Firebase 
      const isInit = initFirebase();
      if (!isInit) {
        throw new Error("Initialization failed");
      }

      // 2. Auth
      await authenticateAnonymously();

      // 3. Set Family ID
      if (isNewFamily) {
        // Generate a random 4-part key for easier reading/typing: ABCD-1234
        const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
        const newId = `${p1}-${p2}`;

        // IMPORTANT: For a NEW family, we pass Date.now() as lastUpdated.
        // This tells the store: "Push this data to the cloud immediately."
        onUpdate({ familyId: newId, lastUpdated: Date.now() });
      } else {
        if (!joinKey.trim() || joinKey.length < 5) throw new Error("Please enter a valid Sync Key");

        // IMPORTANT: For JOINING, we do NOT pass lastUpdated.
        // The store defaults it to 0, which means "Pull data from cloud".
        onUpdate({ familyId: joinKey.trim().toUpperCase() });
      }

      setView('main');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection failed. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // VIEW: SYNCED (Active)
  // ----------------------------------------------------------------------
  if (isSynced && isFirebaseInitialized()) {
    return (
      <GlassCard className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 border-teal-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 relative">
              <Check className="w-6 h-6" />
              {isMock() && (
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 border border-slate-900" title="Demo Mode">
                  <WifiOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Cloud Sync Active
                  {isMock() && <span className="text-xs font-normal px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Demo Mode</span>}
                </h3>

                {/* STATUS INDICATOR */}
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/20 text-xs font-medium border border-white/5">
                  {syncStatus === 'syncing' && (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                      <span className="text-blue-200">Saving...</span>
                    </>
                  )}
                  {syncStatus === 'saved' && (
                    <>
                      <Cloud className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-200">Saved</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <>
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      <span className="text-rose-200">Sync Error</span>
                    </>
                  )}
                  {syncStatus === 'idle' && (
                    <span className="text-slate-400">Idle</span>
                  )}
                </div>
              </div>

              <p className="text-emerald-200/70 text-xs mt-1">
                Data automatically syncs when you make changes.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 w-full md:w-auto">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Sync Key</p>
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/10 w-full md:w-auto justify-between">
              <code className="text-lg font-mono text-emerald-300 px-2 tracking-widest">{data.familyId}</code>
              <button onClick={handleCopyKey} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors" title="Copy Key">
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 mt-1">
              {onForcePull && (
                <button onClick={onForcePull} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Force Refresh
                </button>
              )}
              <button
                onClick={() => onUpdate({ familyId: null })}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: NOT SYNCED (Setup)
  // ----------------------------------------------------------------------
  return (
    <GlassCard className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-purple-500/20 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>

      {view === 'main' && (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Cloud Sync</h3>
                <p className="text-slate-300 text-sm">Sync wealth data across devices or share with others in real-time.</p>
              </div>
            </div>
            {isMock() && (
              <span className="px-2 py-1 text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded">Demo Mode</span>
            )}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-3 items-start relative z-10">
            <ShieldCheck className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
            <div className="text-sm text-blue-100/90 leading-relaxed">
              <span className="font-semibold text-blue-200 block mb-1">Privacy First</span>
              Your data stays 100% on your device by default. It is not transmitted to any server unless you choose to enable <strong className="text-white">Cloud Sync</strong> below.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            <button
              onClick={() => initializeSync(true)}
              disabled={loading}
              className="group relative flex flex-col items-start p-5 rounded-xl bg-white/5 hover:bg-indigo-500/10 border border-white/10 hover:border-indigo-500/30 transition-all text-left"
            >
              <div className="mb-3 p-2 bg-indigo-500/20 rounded-lg text-indigo-400 group-hover:text-white group-hover:bg-indigo-500 transition-colors">
                <UserPlus className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-1">Create Sync Key</h4>
              <p className="text-sm text-slate-400">Generate a unique key to sync across devices or share with others.</p>
              {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl"><span className="text-xs text-white">Creating...</span></div>}
            </button>

            <button
              onClick={() => setView('join')}
              disabled={loading}
              className="group flex flex-col items-start p-5 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 transition-all text-left"
            >
              <div className="mb-3 p-2 bg-purple-500/20 rounded-lg text-purple-400 group-hover:text-white group-hover:bg-purple-500 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-1">Join Sync Group</h4>
              <p className="text-sm text-slate-400">I have a key from my partner.</p>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 relative z-10">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>
      )}

      {view === 'join' && (
        <div className="max-w-md mx-auto py-4">
          <button onClick={() => setView('main')} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Enter Sync Key</h3>
            <p className="text-slate-400 text-sm mt-1">Paste the code shared by your partner.</p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={joinKey}
              onChange={(e) => setJoinKey(e.target.value.toUpperCase())}
              placeholder="ABCD-1234"
              className="w-full text-center text-2xl font-mono tracking-widest uppercase bg-black/30 border border-purple-500/30 rounded-xl p-4 text-white focus:border-purple-400 outline-none placeholder:text-slate-700"
              autoFocus
            />

            <button
              onClick={() => initializeSync(false)}
              disabled={loading}
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-900/50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Connecting...' : <>Connect <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>

          {error && <p className="text-center text-rose-400 text-sm mt-4">{error}</p>}
        </div>
      )}

    </GlassCard>
  );
};