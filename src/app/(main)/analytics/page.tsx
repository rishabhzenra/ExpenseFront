'use client';

import { useEffect } from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { useIncome } from '@/hooks/useIncome';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B', '#10B981', '#6B7280'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="card p-3 text-sm min-w-[130px]">
                <p className="text-slate-500 text-xs mb-2 font-medium">{label}</p>
                {payload.map((p: any) => (
                    <div key={p.name} className="flex items-center justify-between gap-3">
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

export default function AnalyticsPage() {
    const { analytics, fetchAnalytics, loading } = useExpenses();
    const { analytics: incomeAnalytics, fetchAnalytics: fetchIncomeAnalytics } = useIncome();

    useEffect(() => {
        fetchAnalytics();
        fetchIncomeAnalytics();
    }, [fetchAnalytics, fetchIncomeAnalytics]);

    // Monthly comparison chart
    const monthlyData = (() => {
        const expMap: Record<string, number> = {};
        const incMap: Record<string, number> = {};
        analytics?.monthlyBreakdown?.forEach(m => { expMap[m.month] = m.total; });
        incomeAnalytics?.monthlyBreakdown?.forEach(m => { incMap[m.month] = m.total; });
        const allMonths = [...new Set([...Object.keys(expMap), ...Object.keys(incMap)])].sort();
        return allMonths.map(m => {
            const [, mo] = m.split('-');
            return {
                month: MONTHS_SHORT[parseInt(mo) - 1],
                Expenses: expMap[m] || 0,
                Income: incMap[m] || 0,
                Net: (incMap[m] || 0) - (expMap[m] || 0),
            };
        });
    })();

    // Daily breakdown for bar chart
    const dailyData = (analytics?.dailyBreakdown || []).map(d => ({
        day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        Spent: d.total,
    }));

    // Category pie
    const categoryData = (analytics?.categoryBreakdown || []).map((c, i) => ({
        name: c.category,
        value: c.total,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    }));

    // Necessary vs unnecessary
    const necessaryTotal = analytics?.necessaryBreakdown?.find(n => n.isNecessary === true || (n.isNecessary as any) === 'true')?.total ?? 0;
    const unnecessaryTotal = analytics?.necessaryBreakdown?.find(n => n.isNecessary === false || (n.isNecessary as any) === 'false')?.total ?? 0;
    const needsData = [
        { name: 'Essential', value: parseFloat(necessaryTotal as any), color: '#2563EB' },
        { name: 'Optional', value: parseFloat(unnecessaryTotal as any), color: '#F59E0B' },
    ].filter(d => d.value > 0);

    const StatCard = ({ label, value, color = 'text-slate-900' }: { label: string; value: string; color?: string }) => (
        <div className="card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
            <div className="mb-6">
                <h1 className="page-header">Analytics</h1>
                <p className="text-sm text-slate-500 mt-0.5">Detailed breakdown of your financial activity</p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard label="This Month Expenses" value={formatCurrency(analytics?.spentThisMonth ?? 0)} color="text-red-600" />
                <StatCard label="This Month Income" value={formatCurrency(incomeAnalytics?.thisMonthTotal ?? 0)} color="text-emerald-600" />
                <StatCard label="Health Score" value={`${analytics?.healthScore ?? 0}/100`} color="text-blue-600" />
                <StatCard
                    label="Month vs Last Month"
                    value={`${analytics?.monthTrend && analytics.monthTrend > 0 ? '+' : ''}${(analytics?.monthTrend ?? 0).toFixed(1)}%`}
                    color={(analytics?.monthTrend ?? 0) > 0 ? 'text-red-600' : 'text-emerald-600'}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Monthly Income vs Expenses */}
                <div className="card p-5 xl:col-span-2">
                    <h2 className="section-title mb-1">Monthly Cash Flow</h2>
                    <p className="meta-text mb-5">Income vs expenses comparison by month</p>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                                <Bar dataKey="Income" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                <Bar dataKey="Expenses" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[240px] flex items-center justify-center">
                            <p className="text-slate-400 text-sm">No data available yet</p>
                        </div>
                    )}
                </div>

                {/* Weekly Spending */}
                <div className="card p-5">
                    <h2 className="section-title mb-1">This Week</h2>
                    <p className="meta-text mb-5">Daily spending pattern</p>
                    {dailyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={dailyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="Spent" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[200px] flex items-center justify-center">
                            <p className="text-slate-400 text-sm">No data this week</p>
                        </div>
                    )}
                </div>

                {/* Category Breakdown */}
                <div className="card p-5">
                    <h2 className="section-title mb-1">Category Breakdown</h2>
                    <p className="meta-text mb-5">Spending by category this month</p>
                    {categoryData.length > 0 ? (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={index} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-2.5">
                                {categoryData.map((c, i) => (
                                    <div key={c.name} className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                                            <span className="text-sm text-slate-700">{c.name}</span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">{formatCurrency(c.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[180px] flex items-center justify-center">
                            <p className="text-slate-400 text-sm">No expense data this month</p>
                        </div>
                    )}
                </div>

                {/* Essential vs Optional */}
                <div className="card p-5">
                    <h2 className="section-title mb-1">Spending Quality</h2>
                    <p className="meta-text mb-5">Essential vs optional expenses</p>
                    {needsData.length > 0 ? (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width={180} height={180}>
                                <PieChart>
                                    <Pie data={needsData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                                        {needsData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-4">
                                {needsData.map((d) => {
                                    const total = needsData.reduce((s, x) => s + x.value, 0);
                                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                                    return (
                                        <div key={d.name}>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                                                    <span className="text-sm text-slate-700">{d.name}</span>
                                                </div>
                                                <span className="text-sm font-medium text-slate-900">{pct}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{formatCurrency(d.value)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-[180px] flex items-center justify-center">
                            <p className="text-slate-400 text-sm">No expense data this month</p>
                        </div>
                    )}
                </div>

                {/* Insights */}
                {analytics?.insights && analytics.insights.length > 0 && (
                    <div className="card p-5 xl:col-span-2">
                        <h2 className="section-title mb-4">Financial Insights</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {analytics.insights.map((insight, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                    <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
