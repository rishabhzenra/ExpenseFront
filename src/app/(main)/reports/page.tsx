'use client';

import { useEffect, useState } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineDocumentChartBar, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
    HiOutlineArrowDownTray, HiOutlineCalendarDays,
} from 'react-icons/hi2';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_S = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="card p-3 text-sm min-w-[150px]">
                <p className="text-slate-500 text-xs mb-2 font-medium">{label}</p>
                {payload.map((p: any) => (
                    <div key={p.name} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-2 h-2 rounded-full" style={{ background: p.color || p.fill }} />
                            {p.name}
                        </span>
                        <span className="font-semibold text-slate-900">{formatCurrency(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function ReportsPage() {
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const { analytics, fetchAnalytics } = useExpenses();
    const { analytics: incomeAnalytics, fetchAnalytics: fetchIncome } = useIncome();
    const { budget, fetchBudget } = useBudget();

    useEffect(() => {
        fetchAnalytics();
        fetchIncome();
        fetchBudget();
    }, [fetchAnalytics, fetchIncome, fetchBudget]);

    // Build full year monthly table
    const monthlyTable = MONTHS.map((name, i) => {
        const key = `${selectedYear}-${String(i + 1).padStart(2, '0')}`;
        const exp = analytics?.monthlyBreakdown?.find(m => m.month === key)?.total ?? 0;
        const inc = incomeAnalytics?.monthlyBreakdown?.find(m => m.month === key)?.total ?? 0;
        const net = inc - exp;
        return { name, short: MONTHS_S[i], income: inc, expenses: exp, net };
    });

    const totalIncome = monthlyTable.reduce((s, m) => s + m.income, 0);
    const totalExpenses = monthlyTable.reduce((s, m) => s + m.expenses, 0);
    const totalNet = totalIncome - totalExpenses;
    const avgMonthlyExpense = totalExpenses / 12;
    const savingsRate = totalIncome > 0 ? Math.round((totalNet / totalIncome) * 100) : 0;

    // Chart data (only months with data)
    const chartData = monthlyTable.filter(m => m.income > 0 || m.expenses > 0);

    // Category breakdown
    const categories = analytics?.categoryBreakdown || [];
    const necessaryTotal = analytics?.necessaryBreakdown?.find(n => n.isNecessary === true || (n.isNecessary as any) === 'true')?.total ?? 0;
    const unnecessaryTotal = analytics?.necessaryBreakdown?.find(n => n.isNecessary === false || (n.isNecessary as any) === 'false')?.total ?? 0;

    const years = [now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()];

    return (
        <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="page-header">Financial Report</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Comprehensive overview of your financial activity</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(Number(e.target.value))}
                        className="select-field"
                        style={{ width: 'auto' }}
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Annual Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: `${selectedYear} Total Income`, value: formatCurrency(totalIncome), color: 'text-emerald-600', bg: 'bg-emerald-50', icon: HiOutlineArrowTrendingUp },
                    { label: `${selectedYear} Total Expenses`, value: formatCurrency(totalExpenses), color: 'text-red-600', bg: 'bg-red-50', icon: HiOutlineArrowTrendingDown },
                    { label: 'Net Savings', value: formatCurrency(Math.abs(totalNet)), color: totalNet >= 0 ? 'text-blue-600' : 'text-red-600', bg: 'bg-blue-50', icon: HiOutlineDocumentChartBar },
                    { label: 'Savings Rate', value: `${Math.max(0, savingsRate)}%`, color: savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-amber-600' : 'text-red-600', bg: 'bg-amber-50', icon: HiOutlineCalendarDays },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                    <div key={label} className="card p-5">
                        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                            <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <p className={`text-xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-slate-500 mt-1">{label}</p>
                    </div>
                ))}
            </div>

            {/* Cash Flow Chart */}
            <div className="card p-5 mb-6">
                <h2 className="section-title mb-1">Cash Flow — {selectedYear}</h2>
                <p className="meta-text mb-5">Monthly income vs expenses</p>
                {chartData.length === 0 ? (
                    <div className="h-[220px] flex items-center justify-center">
                        <p className="text-slate-400 text-sm">No data for {selectedYear} yet</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                            <defs>
                                <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="short" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                            <Area type="monotone" dataKey="income" name="Income" stroke="#059669" strokeWidth={2} fill="url(#incGrad)" dot={false} />
                            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#DC2626" strokeWidth={2} fill="url(#expGrad)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Monthly Table + Category Breakdown */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                {/* Monthly Table */}
                <div className="xl:col-span-2 card overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100">
                        <h2 className="section-title">Monthly Breakdown</h2>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/60 border-b border-slate-100">
                                <th className="table-header text-left px-5 py-3">Month</th>
                                <th className="table-header text-right px-4 py-3">Income</th>
                                <th className="table-header text-right px-4 py-3">Expenses</th>
                                <th className="table-header text-right px-5 py-3">Net</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlyTable.map((m, i) => {
                                const isCurrent = i === now.getMonth() && selectedYear === now.getFullYear();
                                return (
                                    <tr key={m.name} className={`table-row ${isCurrent ? 'bg-blue-50/40' : ''}`}>
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-900">{m.name}</span>
                                                {isCurrent && <span className="badge badge-info text-[10px]">Current</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-medium ${m.income > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                {m.income > 0 ? formatCurrency(m.income) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={`text-sm font-medium ${m.expenses > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                                                {m.expenses > 0 ? formatCurrency(m.expenses) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <span className={`text-sm font-semibold ${m.net > 0 ? 'text-emerald-600' : m.net < 0 ? 'text-red-600' : 'text-slate-300'}`}>
                                                {m.income > 0 || m.expenses > 0
                                                    ? `${m.net >= 0 ? '+' : ''}${formatCurrency(m.net)}`
                                                    : '—'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 border-t-2 border-slate-200">
                                <td className="px-5 py-3 text-sm font-bold text-slate-900">Total</td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-emerald-600">{formatCurrency(totalIncome)}</td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{formatCurrency(totalExpenses)}</td>
                                <td className={`px-5 py-3 text-right text-sm font-bold ${totalNet >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {totalNet >= 0 ? '+' : ''}{formatCurrency(totalNet)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Category & Stats Panel */}
                <div className="space-y-5">
                    {/* Spending by Category */}
                    <div className="card p-5">
                        <h2 className="section-title mb-4">Top Categories</h2>
                        {categories.length === 0 ? (
                            <p className="text-slate-400 text-sm text-center py-4">No expense data</p>
                        ) : (
                            <div className="space-y-3">
                                {categories.sort((a, b) => b.total - a.total).slice(0, 5).map((cat, i) => {
                                    const pct = totalExpenses > 0 ? Math.round((cat.total / totalExpenses) * 100) : 0;
                                    const colors = ['#2563EB', '#059669', '#D97706', '#8B5CF6', '#EF4444'];
                                    return (
                                        <div key={cat.category}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="text-slate-700">{cat.category}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400 text-xs">{pct}%</span>
                                                    <span className="font-semibold text-slate-900">{formatCurrency(cat.total)}</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[i] }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Key Metrics */}
                    <div className="card p-5">
                        <h2 className="section-title mb-4">Key Metrics</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Avg Monthly Expense', value: formatCurrency(avgMonthlyExpense) },
                                { label: 'Essential Spending', value: formatCurrency(parseFloat(String(necessaryTotal))) },
                                { label: 'Optional Spending', value: formatCurrency(parseFloat(String(unnecessaryTotal))) },
                                { label: 'Budget Limit', value: budget ? formatCurrency(budget.monthlyLimit) : 'Not set' },
                                { label: 'Health Score', value: `${analytics?.healthScore ?? 0} / 100` },
                            ].map(m => (
                                <div key={m.label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-sm text-slate-600">{m.label}</span>
                                    <span className="text-sm font-semibold text-slate-900">{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Savings Bar Chart */}
            {chartData.length > 0 && (
                <div className="card p-5">
                    <h2 className="section-title mb-1">Monthly Net Savings</h2>
                    <p className="meta-text mb-5">Positive = saved money, Negative = overspent</p>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="short" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                            <Tooltip formatter={(v: any) => formatCurrency(Math.abs(v))} />
                            <Bar dataKey="net" name="Net" radius={[4, 4, 0, 0]} maxBarSize={36}>
                                {chartData.map((entry, i) => (
                                    <rect key={i} fill={entry.net >= 0 ? '#059669' : '#DC2626'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
