import React from 'react';
import { Plus, Trash2, Droplets, Wallet, TrendingDown } from 'lucide-react';
import { AppState, ExpenseCategory } from '../types';
import { GlassCard } from './ui/GlassCard';
import { formatCompact, formatCurrency, formatIndianInput, formatRunway, expensesTotal, liquidAssetsTotal, monthsOfRunway, parseIndianInput, passiveIncomeTotal } from '../utils';
import { useLanguage } from '../i18n/LanguageContext';

interface Props {
  data: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onOpenLiquidAssets?: () => void;
}

export const Runway: React.FC<Props> = ({ data, onUpdate, onOpenLiquidAssets }) => {
  const { t } = useLanguage();
  const expenses = data.expenses || [];
  const spend = expensesTotal(expenses);
  const liquid = liquidAssetsTotal(data.assets);
  const totalAssets = data.assets.reduce((s, a) => s + a.value, 0);
  const income = passiveIncomeTotal(data.assets);
  const netBurn = Math.max(spend - income, 0);
  const grossMonths = monthsOfRunway(liquid, spend);
  const netMonths = monthsOfRunway(liquid, netBurn);

  const updateExpense = (id: string, updates: Partial<ExpenseCategory>) => {
    onUpdate({
      expenses: expenses.map(e => e.id === id ? { ...e, ...updates } : e),
    });
  };

  const addExpense = () => {
    onUpdate({
      expenses: [...expenses, { id: crypto.randomUUID(), name: '', amount: 0 }],
    });
  };

  const removeExpense = (id: string) => {
    onUpdate({ expenses: expenses.filter(e => e.id !== id) });
  };

  return (
    <GlassCard
      title={t('runway_title')}
      action={<span className="text-xs text-slate-400">{t('runway_subtitle')}</span>}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <button
          type="button"
          onClick={onOpenLiquidAssets}
          disabled={!onOpenLiquidAssets}
          className="bg-white/5 rounded-xl p-3 text-left w-full transition-colors hover:bg-white/10 hover:ring-1 hover:ring-white/10 disabled:pointer-events-none"
          aria-label={t('open_portfolio')}
        >
          <div className="flex items-center gap-1.5 mb-1 text-slate-400">
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t('liquid_for_runway')}</span>
          </div>
          <p className="text-lg font-bold text-white">{formatCompact(liquid)}</p>
          {totalAssets > 0 && (
            <p className="text-[10px] text-slate-500 mt-0.5">
              {t('liquid_of_total').replace('{amount}', formatCompact(totalAssets))}
            </p>
          )}
          {onOpenLiquidAssets && (
            <p className="text-[10px] text-indigo-300/80 mt-1">{t('open_portfolio')}</p>
          )}
        </button>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1 text-slate-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t('monthly_expenses')}</span>
          </div>
          <p className="text-lg font-bold text-white">{formatCompact(spend)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-[11px] text-slate-400 mb-1">{t('gross_runway')}</p>
          <p className="text-lg font-bold text-indigo-300">{spend > 0 ? formatRunway(grossMonths) : '—'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{t('gross_runway_hint')}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1 text-slate-400">
            <Droplets className="w-3.5 h-3.5" />
            <span className="text-[11px]">{t('net_runway')}</span>
          </div>
          <p className="text-lg font-bold text-emerald-300">{spend > 0 ? formatRunway(netMonths) : '—'}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {income > 0
              ? `${t('passive_income')} ${formatCurrency(income)} · ${t('net_burn')} ${formatCurrency(netBurn)}`
              : t('net_runway_hint')}
          </p>
        </div>
      </div>

      <div className="mb-6 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[12px] text-slate-400 leading-relaxed space-y-1.5">
        <p>
          <span className="text-slate-200 font-medium">{t('liquid_what_title')} </span>
          {t('liquid_what_body')}
        </p>
        <p>{t('liquid_vs_total')}</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white">{t('expense_categories')}</h4>
        <button
          onClick={addExpense}
          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-white transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> {t('add_expense')}
        </button>
      </div>

      {expenses.length === 0 && (
        <p className="text-sm text-slate-500 mb-3">{t('add_expenses_hint')}</p>
      )}

      <div className="space-y-2">
        {expenses.map(item => (
          <div key={item.id} className="flex items-center gap-2">
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateExpense(item.id, { name: e.target.value })}
              placeholder={t('expense_name')}
              className="flex-1 bg-white/[0.03] text-white rounded-lg px-3 py-2 text-sm border border-white/[0.08] focus:border-indigo-400/40 outline-none"
            />
            <div className="flex items-center gap-1 w-36 shrink-0">
              <span className="text-slate-500 text-sm">₹</span>
              <input
                type="text"
                inputMode="decimal"
                value={formatIndianInput(item.amount)}
                onChange={(e) => updateExpense(item.id, { amount: parseIndianInput(e.target.value) })}
                placeholder="0"
                className="w-full bg-white/[0.03] text-white rounded-lg px-3 py-2 text-sm border border-white/[0.08] focus:border-indigo-400/40 outline-none text-right font-mono"
              />
            </div>
            <button
              onClick={() => removeExpense(item.id)}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all shrink-0"
              title={t('remove_expense')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
