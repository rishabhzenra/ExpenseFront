'use client';

import { useEffect, useState, useCallback } from 'react';
import { investmentService } from '@/services/investmentService';
import { goalService } from '@/services/goalService';
import { taxService } from '@/services/taxService';
import { invoiceService } from '@/services/invoiceService';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineScale, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
    HiOutlineBanknotes, HiOutlineChartPie,
} from 'react-icons/hi2';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function NetWorthPage() {
    const [portfolio, setPortfolio] = useState<any>(null);
    const [goals, setGoals] = useState<any[]>([]);
    const [taxSummary, setTaxSummary] = useState<any>(null);
    const [invStats, setInvStats] = useState<any>(null);
    const { analytics: incomeAnalytics, fetchAnalytics: fetchIncomeAnalytics } = useIncome();
    const { analytics: expenseAnalytics, fetchAnalytics: fetchExpenseAnalytics } = useExpenses();

    useEffect(() => {
        Promise.all([
            investmentService.getSummary().then(r => setPortfolio(r.data)),
            goalService.findAll().then(r => setGoals(r.data)),
            taxService.getSummary().then(r => setTaxSummary(r.data)),
            invoiceService.getStats().then(r => setInvStats(r.data)),
        ]);
        fetchIncomeAnalytics();
        fetchExpenseAnalytics();
    }, [fetchIncomeAnalytics, fetchExpenseAnalytics]);

    // Calculate net worth components
    const investmentValue = portfolio?.totalCurrent || 0;
    const savingsGoalsValue = goals.reduce((s, g) => s + Number(g.current), 0);
    const outstandingInvoices = invStats?.outstanding || 0;
    const taxLiability = taxSummary?.pendingAmount || 0;
    const monthlyIncome = incomeAnalytics?.thisMonthTotal ? incomeAnalytics.thisMonthTotal : 0;
    const monthlySavings = monthlyIncome * 0.32; // est 32% savings rate
    const liquidCash = monthlySavings * 3; // 3 months emergency

    const totalAssets = investmentValue + savingsGoalsValue + outstandingInvoices + liquidCash;
    const totalLiabilities = taxLiability;
    const netWorth = totalAssets - totalLiabilities;

    // Simulated historical net worth (last 6 months)
    const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const historicalData = months.map((m, i) => ({
        month: m,
        netWorth: Math.round(netWorth * (0.72 + i * 0.055)),
        assets: Math.round(totalAssets * (0.74 + i * 0.05)),
        liabilities: Math.round(totalLiabilities * (1.3 - i * 0.1)),
    }));

    const assetBreakdown = [
        { label: 'Investment Portfolio', value: investmentValue, color: '#2563EB', icon: HiOutlineChartPie },
        { label: 'Savings Goals', value: savingsGoalsValue, color: '#7C3AED', icon: HiOutlineBanknotes },
        { label: 'Receivables (Invoices)', value: outstandingInvoices, color: '#059669', icon: HiOutlineArrowTrendingUp },
        { label: 'Liquid Cash (Est.)', value: liquidCash, color: '#0891B2', icon: HiOutlineBanknotes },
    ];

    const liabilityBreakdown = [
        { label: 'Pending Tax Obligations', value: taxLiability, color: '#DC2626' },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="card p-3 text-sm min-w-[160px]">
                    <p className="text-slate-500 text-xs mb-2 font-medium">{label}</p>
                    {payload.map((p: any) => (
                        <div key={p.name} className="flex justify-between gap-4 mb-1">
                            <span className="text-slate-600">{p.name}</span>
                            <span className="font-semibold">{formatCurrency(p.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Net Worth</h1>
                <p className="text-slate-500 text-sm mt-1">Complete financial snapshot — assets, liabilities and wealth trajectory</p>
            </div>

            {/* Net Worth Hero */}
            <div className="card p-8 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
                <p className="text-blue-200 text-sm font-medium uppercase tracking-wide mb-2">Total Net Worth</p>
                <p className="text-5xl font-bold text-white mb-3">{formatCurrency(netWorth)}</p>
                <div className="flex items-center gap-6 flex-wrap">
                    <div>
                        <p className="text-blue-200 text-xs">Total Assets</p>
                        <p className="text-white text-lg font-semibold">{formatCurrency(totalAssets)}</p>
                    </div>
                    <div className="text-blue-300 text-2xl">−</div>
                    <div>
                        <p className="text-blue-200 text-xs">Total Liabilities</p>
                        <p className="text-white text-lg font-semibold">{formatCurrency(totalLiabilities)}</p>
                    </div>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Investment Value</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(investmentValue)}</p>
                    <p className="text-xs mt-1 text-emerald-600 font-medium">+{portfolio?.gainPct?.toFixed(1) || 0}% return</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Savings Accumulated</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(savingsGoalsValue)}</p>
                    <p className="text-xs text-slate-500 mt-1">Across {goals.length} goals</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Receivables</p>
                    <p className="text-xl font-bold text-slate-900">{formatCurrency(outstandingInvoices)}</p>
                    <p className="text-xs text-slate-500 mt-1">Pending invoices</p>
                </div>
                <div className="card p-5 border border-red-100">
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Tax Liability</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(taxLiability)}</p>
                    <p className="text-xs text-slate-500 mt-1">Pending obligations</p>
                </div>
            </div>

            {/* Chart */}
            <div className="card p-6">
                <div className="mb-4">
                    <h2 className="text-sm font-semibold text-slate-900">Net Worth Trajectory (6 Months)</h2>
                    <p className="text-xs text-slate-500 mt-0.5">Estimated historical progression</p>
                </div>
                <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={historicalData}>
                        <defs>
                            <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="#2563EB" strokeWidth={2.5} fill="url(#nwGrad)" dot={{ r: 4, fill: '#2563EB' }} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Assets & Liabilities breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-slate-900">Assets Breakdown</h2>
                        <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalAssets)}</span>
                    </div>
                    <div className="space-y-4">
                        {assetBreakdown.map(a => {
                            const pct = totalAssets > 0 ? (a.value / totalAssets) * 100 : 0;
                            return (
                                <div key={a.label}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: a.color }} />
                                            <span className="text-sm text-slate-700">{a.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400">{pct.toFixed(1)}%</span>
                                            <span className="text-sm font-semibold text-slate-900 w-28 text-right">{formatCurrency(a.value)}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: a.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Liabilities + Financial Health */}
                <div className="space-y-5">
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-slate-900">Liabilities</h2>
                            <span className="text-sm font-bold text-red-600">{formatCurrency(totalLiabilities)}</span>
                        </div>
                        <div className="space-y-3">
                            {liabilityBreakdown.map(l => (
                                <div key={l.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                                        <span className="text-sm text-slate-700">{l.label}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-red-600">{formatCurrency(l.value)}</span>
                                </div>
                            ))}
                            {totalLiabilities === 0 && <p className="text-sm text-slate-400 text-center py-2">No liabilities recorded</p>}
                        </div>
                    </div>

                    <div className="card p-6">
                        <h2 className="text-sm font-semibold text-slate-900 mb-4">Financial Health Score</h2>
                        <div className="space-y-3">
                            {[
                                { label: 'Debt-to-Asset Ratio', value: totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) + '%' : '0%', good: true, note: 'Low is better' },
                                { label: 'Investment Coverage', value: totalAssets > 0 ? ((investmentValue / totalAssets) * 100).toFixed(1) + '%' : '0%', good: true, note: 'Of total assets' },
                                { label: 'Monthly Savings Rate', value: monthlyIncome > 0 ? ((monthlySavings / monthlyIncome) * 100).toFixed(1) + '%' : '0%', good: true, note: 'Estimated' },
                                { label: 'Emergency Fund (months)', value: '3', good: true, note: 'Recommended: 6' },
                            ].map(metric => (
                                <div key={metric.label} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                                    <div>
                                        <p className="text-sm text-slate-700">{metric.label}</p>
                                        <p className="text-xs text-slate-400">{metric.note}</p>
                                    </div>
                                    <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${metric.good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                        {metric.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
