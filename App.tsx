import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { LayoutDashboard, Wallet, History, TrendingUp, Menu, X, Activity } from 'lucide-react';
import { useStore } from './services/store';
import { AssetsLiabilities } from './components/AssetsLiabilities';
import { HistoryMachine } from './components/HistoryMachine';
import { Projections } from './components/Projections';
import { Milestones } from './components/Milestones';
import { SyncManager } from './components/SyncManager';
import { formatCurrency } from './utils';

const App: React.FC = () => {
  const { state, updateState, isSynced, syncStatus, forcePull } = useStore();
  const [activeView, setActiveView] = useState<'dashboard' | 'assets' | 'history'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ view, label, icon: Icon }: any) => (
    <button
      onClick={() => {
        setActiveView(view);
        setMobileMenuOpen(false);
      }}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
        activeView === view 
          ? 'bg-white/10 text-white shadow-lg border border-white/5' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <HashRouter>
      <div className="min-h-screen pb-20 md:pb-0 flex flex-col md:flex-row max-w-7xl mx-auto md:p-8">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center p-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-500 p-2 rounded-lg">
               <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">FamilyWealth</h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Sidebar / Navigation */}
        <nav className={`
          fixed md:static inset-0 z-40 bg-slate-900/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none
          transition-transform duration-300 ease-in-out md:translate-x-0 md:w-64 flex-shrink-0
          ${mobileMenuOpen ? 'translate-x-0 pt-20 px-4' : '-translate-x-full md:pt-0 md:px-0'}
        `}>
           <div className="hidden md:flex items-center gap-3 mb-10 px-4">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
                 <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">FamilyWealth</h1>
                <p className="text-xs text-slate-400">Track. Sync. Grow.</p>
              </div>
           </div>

           <div className="space-y-2">
             <NavItem view="dashboard" label="Dashboard" icon={LayoutDashboard} />
             <NavItem view="assets" label="Assets & Debts" icon={Wallet} />
             <NavItem view="history" label="Time Machine" icon={History} />
           </div>

           <div className="mt-10 px-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                 <p className="text-xs text-indigo-200 mb-1 font-semibold uppercase tracking-wider">Net Worth</p>
                 <p className="text-2xl font-bold text-white">
                   {formatCurrency(state.assets.reduce((a, b) => a + b.value, 0) - state.liabilities.reduce((a, b) => a + b.value, 0))}
                 </p>
              </div>
           </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-0 md:ml-8 overflow-y-auto">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Sync Manager is always visible at top of dashboard or settings-like area. Placing at top for visibility here */}
            <SyncManager 
              data={state} 
              onUpdate={updateState} 
              isSynced={isSynced} 
              syncStatus={syncStatus} 
              onForcePull={forcePull} 
            />

            {activeView === 'dashboard' && (
              <>
                <Projections data={state} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Milestones data={state} onUpdate={updateState} />
                  {/* Quick View of Assets - Simplified */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Top Assets</h3>
                        <button onClick={() => setActiveView('assets')} className="text-sm text-indigo-400 hover:text-white">Manage</button>
                     </div>
                     <div className="space-y-3">
                        {state.assets.slice(0, 5).map(asset => (
                           <div key={asset.id} className="flex justify-between items-center text-sm p-3 rounded bg-white/5">
                              <span className="text-slate-300">{asset.name}</span>
                              <span className="font-mono text-white">{formatCurrency(asset.value)}</span>
                           </div>
                        ))}
                        {state.assets.length === 0 && <p className="text-slate-500 text-sm">No assets tracked yet.</p>}
                     </div>
                  </div>
                </div>
              </>
            )}

            {activeView === 'assets' && (
              <AssetsLiabilities data={state} onUpdate={updateState} />
            )}

            {activeView === 'history' && (
              <HistoryMachine data={state} onUpdate={updateState} />
            )}

          </div>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;