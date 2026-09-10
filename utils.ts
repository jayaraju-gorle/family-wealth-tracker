import { Asset, ExpenseCategory, LIQUID_ASSET_TYPES } from './types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatCompact = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatIndianInput = (n: number): string => (n ? n.toLocaleString('en-IN') : '');
export const parseIndianInput = (s: string): number => parseFloat(s.replace(/,/g, '')) || 0;

export const liquidAssetsTotal = (assets: Asset[]): number =>
  assets.filter(a => LIQUID_ASSET_TYPES.includes(a.type)).reduce((s, a) => s + a.value, 0);

export const passiveIncomeTotal = (assets: Asset[]): number =>
  assets.reduce((s, a) => s + (a.monthlyIncome || 0), 0);

export const expensesTotal = (expenses: ExpenseCategory[]): number =>
  expenses.reduce((s, e) => s + (e.amount || 0), 0);

/** Months of coverage. null means outflow is 0 (covered / not applicable). */
export const monthsOfRunway = (liquid: number, monthlyOutflow: number): number | null => {
  if (monthlyOutflow <= 0) return null;
  if (liquid <= 0) return 0;
  return liquid / monthlyOutflow;
};

export const formatRunway = (months: number | null): string => {
  if (months === null) return 'Covered';
  if (months >= 120) return '10+ yrs';
  if (months >= 12) return `${(months / 12).toFixed(1)} yrs`;
  return `${months.toFixed(1)} mo`;
};