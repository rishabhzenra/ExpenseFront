'use client';

import { useEffect, useState } from 'react';
import { useBudget } from '@/hooks/useBudget';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineChartPie,
    HiOutlinePencil,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlineInformationCircle,
    HiOutlineCurrencyDollar,
} from 'react-icons/hi2';
import {
    RadialBarChart, RadialBar, ResponsiveContainer, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import Link from 'next/link';

const CATEGORY_COLORS: Record<string, string> = {
    Food: '#3B82F6', Travel: '#8B5CF6', Bills: '#EF4444',
    Shopping: '#F59E0B', Fun: '#10B981', Other: '#6B7280',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function StatusBadge({ pct }: { pct: number }) {
    if (pct >= 100) return (
        <span className="inline-flex items-center gap-1.5 badge badge-danger text-xs px-2.5 py-1">
            <HiOutlineExclamationTriangle className="w-3.5 h-3.5" /> Over Budget
        </span>
    );
    if (pct >= 80) return (
        <span className="inline-flex items-center gap-1.5 badge badge-warning text-xs px-2.5 py-1">
            <HiOutlineExclamationTriangle className="w-3.5 h-3.5" /> Approaching Limit
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1.5 badge badge-success text-xs px-2.5 py-1">
            <HiOutlineCheckCircle className="w-3.5 h-3.5" /> On Track
        </span>
    );
}

export default function BudgetPage() {
    const { budget, fetchBudget, saveBudget } = useBudget();
    const { analytics, fetchAnalytics } = useExpenses();
    const [editing, setEditing] = useState(false);
    const [newLimit, setNewLimit] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetchBudget();
        fetchAnalytics();
    }, [fetchBudget, fetchAnalytics]);

    useEffect(() => {
        if (budget?.monthlyLimit) setNewLimit(String(budget.monthlyLimit));
    }, [budget]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLimit || parseFloat(newLimit) <= 0) return;
        setSaving(true);
        try {
            await saveBudget(parseFloat(newLimit));
            setSaved(true);
            setEditing(false);
            setTimeout(() => setSaved(false), 2000);
        } finally {
            setSaving(false);
        }
    };

    const spent = analytics?.spentThisMonth ?? 0;
    const limit = budget?.monthlyLimit ?? 0;
    const remaining = budget?.remaining ?? 0;
    const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
    const dailyAvg = spent > 0 ? spent / new Date().getDate() : 0;
    const daysLeft = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate();
    const projectedSpend = dailyAvg * new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyBudget = remaining > 0 && daysLeft > 0 ? remaining / daysLeft : 0;

    // Monthly bar chart data from analytics
    const monthlyData = (analytics?.monthlyBreakdown || []).map(m => {
        const [, mo] = m.month.split('-');
        return { month: MONTHS[parseInt(mo) - 1], Spent: m.total, Limit: limit };
    });

    // Category breakdown
    const categories = (analytics?.categoryBreakdown || []).sort((a, b) => b.total - a.total);

    // Gauge data
    const gaugeData = [{ value: Math.min(100, pct), fill: pct >= 100 ? '#DC2626' : pct >= 80 ? '#D97706' : '#059669' }];

    const tips = [
        `You spend an average of ${formatCurrency(dailyAvg)} per day this month.`,
        daysLeft > 0 && dailyBudget > 0 ? `To stay within budget, limit spending to ${formatCurrency(dailyBudget)}/day for the next ${daysLeft} days.` : null,
        projectedSpend > limit && limit > 0 ? `At current pace, you will exceed your budget by ${formatCurrency(projectedSpend - limit)} this month.` : null,
        projectedSpend <= limit && limit > 0 ? `At current pace, you will end the month with ${formatCurrency(limit - projectedSpend)} to spare.` : null,
        categories[0] ? `Your top spending category is ${categories[0].category} at ${formatCurrency(categories[0].total)}.` : null,
    ].filter(Boolean) as string[];

    return (
        <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="page-header">Budget</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} spending plan
                    </p>
                </div>
                {!editing && (
                    <button onClick={() => setEditing(true)} className="btn-secondary">
                        <HiOutlinePencil className="w-4 h-4" />
                        {budget ? 'Edit Budget' : 'Set Budget'}
                    </button>
                )}
            </div>

            {!budget && !editing && (
                <div className="card p-10 text-center mb-6">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineChartPie className="w-7 h-7 text-blue-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">No Budget Set</h2>
                    <p className="text-slate-500 text-sm mb-5 max-w-sm mx-auto">Set a monthly spending limit to track your budget utilization and get smart spending insights.</p>
                    <button onClick={() => setEditing(true)} className="btn-primary">Set Monthly Budget</button>
                </div>
            )}

            {editing && (
                <div className="card p-6 mb-6">
                    <h2 className="section-title mb-4">{budget ? 'Update' : 'Set'} Monthly Budget</h2>
                    <form onSubmit={handleSave} className="flex items-end gap-3">
                        <div className="flex-1 max-w-xs">
                            <label className="label">Monthly Spending Limit</label>
                            <input
                                type="number"
                                min="1"
                                step="100"
                                value={newLimit}
                                onChange={e => setNewLimit(e.target.value)}
                                className="input-field"
                                placeholder="e.g. 50000"
                                autoFocus
                            />
                        </div>
                        <button type="submit" disabled={saving} className="btn-primary">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        {budget && <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>}
                    </form>
                </div>
            )}

            {budget && (
                <>
                    {/* Main Overview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
                        {/* Gauge Card */}
                        <div className="card p-6 flex flex-col items-center">
                            <div className="flex items-center justify-between w-full mb-2">
                                <h2 className="section-title">Usage</h2>
                                <StatusBadge pct={pct} />
                            </div>
                            <div className="relative w-full" style={{ height: 160 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="80%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={[{ value: 100 }, ...gaugeData]}>
                                        <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#F1F5F9' }}>
                                            {[{ fill: '#F1F5F9' }, { fill: gaugeData[0].fill }].map((c, i) => (
                                                <Cell key={i} fill={c.fill} />
                                            ))}
                                        </RadialBar>
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
                                    <p className="text-3xl font-bold text-slate-900">{Math.round(pct)}%</p>
                                    <p className="text-xs text-slate-500">of budget used</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                            {[
                                { label: 'Monthly Limit', value: formatCurrency(limit), color: 'text-slate-900', bg: 'bg-slate-50' },
                                { label: 'Total Spent', value: formatCurrency(spent), color: 'text-red-600', bg: 'bg-red-50' },
                                { label: remaining >= 0 ? 'Remaining' : 'Over Budget', value: formatCurrency(Math.abs(remaining)), color: remaining >= 0 ? 'text-emerald-600' : 'text-red-600', bg: remaining >= 0 ? 'bg-emerald-50' : 'bg-red-50' },
                                { label: 'Daily Average', value: formatCurrency(dailyAvg), color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Daily Budget Left', value: dailyBudget > 0 ? formatCurrency(dailyBudget) : '—', color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'Projected Spend', value: formatCurrency(projectedSpend), color: projectedSpend > limit ? 'text-red-600' : 'text-slate-700', bg: projectedSpend > limit ? 'bg-red-50' : 'bg-slate-50' },
                            ].map(s => (
                                <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
                                    <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Budget Bar */}
                    <div className="card p-5 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-slate-700">
                                {formatCurrency(spent)} spent of {formatCurrency(limit)}
                            </p>
                            <p className="text-sm text-slate-500">{Math.round(pct)}%</p>
                        </div>
                        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                    width: `${Math.min(100, pct)}%`,
                                    background: pct >= 100 ? '#DC2626' : pct >= 80 ? '#D97706' : '#059669',
                                }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5">
                            <span className="text-xs text-slate-400">0</span>
                            <span className="text-xs text-slate-400">{formatCurrency(limit)}</span>
                        </div>
                    </div>

                    {/* Category Breakdown + Monthly Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                        {/* Category Breakdown */}
                        <div className="card p-5">
                            <h2 className="section-title mb-4">Category Breakdown</h2>
                            {categories.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-slate-400 text-sm">No expenses this month</p>
                                    <Link href="/expenses/add" className="btn-primary mt-3 inline-flex">Add Expense</Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categories.map(cat => {
                                        const catPct = limit > 0 ? Math.min(100, (cat.total / limit) * 100) : 0;
                                        const ofSpent = spent > 0 ? Math.round((cat.total / spent) * 100) : 0;
                                        return (
                                            <div key={cat.category}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[cat.category] || '#6B7280' }} />
                                                        <span className="text-sm text-slate-700">{cat.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm">
                                                        <span className="text-slate-500">{ofSpent}% of spend</span>
                                                        <span className="font-semibold text-slate-900">{formatCurrency(cat.total)}</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${catPct}%`, background: CATEGORY_COLORS[cat.category] || '#6B7280' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Monthly History */}
                        <div className="card p-5">
                            <h2 className="section-title mb-4">Monthly History</h2>
                            {monthlyData.length === 0 ? (
                                <div className="h-[200px] flex items-center justify-center">
                                    <p className="text-slate-400 text-sm">No history yet</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                                        <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                        <Bar dataKey="Spent" fill="#2563EB" radius={[4,4,0,0]} maxBarSize={30} />
                                        {limit > 0 && <Bar dataKey="Limit" fill="#E2E8F0" radius={[4,4,0,0]} maxBarSize={30} />}
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Smart Tips */}
                    {tips.length > 0 && (
                        <div className="card p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <HiOutlineInformationCircle className="w-5 h-5 text-blue-500" />
                                <h2 className="section-title">Budget Insights</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {tips.map((tip, i) => (
                                    <div key={i} className="flex gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                        <p className="text-sm text-slate-700 leading-relaxed">{tip}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
