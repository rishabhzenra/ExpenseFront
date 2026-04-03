'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useExpenses } from '@/hooks/useExpenses';
import { useBudget } from '@/hooks/useBudget';
import { useAuth } from '@/hooks/useAuth';
import { useIncome } from '@/hooks/useIncome';
import { formatCurrency } from '@/utils/formatCurrency';
import { goalService, SavingsGoal } from '@/services/goalService';
import { incomeService } from '@/services/incomeService';
import { Income } from '@/types/income';
import {
    HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiOutlineBanknotes,
    HiOutlineScale, HiOutlinePlusCircle, HiOutlineArrowUpRight, HiOutlineArrowDownRight,
    HiOutlineChartBarSquare, HiOutlineTrophy, HiOutlineXMark, HiOutlineChartPie,
    HiOutlineDocumentChartBar, HiOutlineExclamationTriangle, HiOutlineCheckCircle,
    HiOutlineClock,
} from 'react-icons/hi2';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';

const CATEGORY_COLORS: Record<string, string> = {
    Food: '#3B82F6', Travel: '#8B5CF6', Bills: '#EF4444',
    Shopping: '#F59E0B', Fun: '#10B981', Other: '#6B7280',
};

function TrendBadge({ value, invertColor = false }: { value: number; invertColor?: boolean }) {
    const isPositive = value >= 0;
    const isGood = invertColor ? !isPositive : isPositive;
    return (
        <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isGood ? 'text-red-500' : 'text-emerald-600'}`}>
            {isPositive ? <HiOutlineArrowUpRight className="w-3 h-3" /> : <HiOutlineArrowDownRight className="w-3 h-3" />}
            {Math.abs(value).toFixed(1)}%
        </span>
    );
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="card p-3 text-sm min-w-[140px]">
                <p className="text-slate-500 text-xs mb-2 font-medium">{label}</p>
                {payload.map((p: any) => (
                    <div key={p.name} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
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

export default function DashboardPage() {
    const { user } = useAuth();
    const { analytics, fetchAnalytics, expenses, fetchExpenses } = useExpenses();
    const { budget, fetchBudget } = useBudget();
    const { analytics: incomeAnalytics, fetchAnalytics: fetchIncomeAnalytics } = useIncome();

    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [recentIncomes, setRecentIncomes] = useState<Income[]>([]);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', target: '', deadline: '' });
    const [goalLoading, setGoalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'expenses' | 'income'>('expenses');

    const fetchGoals = useCallback(async () => {
        try { const res = await goalService.findAll(); setGoals(res.data); } catch { /* silent */ }
    }, []);

    const fetchRecentIncomes = useCallback(async () => {
        try { const res = await incomeService.findAll(); setRecentIncomes(res.data.slice(0, 5)); } catch { /* silent */ }
    }, []);

    useEffect(() => {
        fetchAnalytics(); fetchBudget(); fetchGoals();
        fetchIncomeAnalytics(); fetchExpenses(); fetchRecentIncomes();
    }, [fetchAnalytics, fetchBudget, fetchGoals, fetchIncomeAnalytics, fetchExpenses, fetchRecentIncomes]);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGoal.title || !newGoal.target) return;
        setGoalLoading(true);
        try {
            await goalService.create({ title: newGoal.title, target: parseFloat(newGoal.target), current: 0, deadline: newGoal.deadline || undefined });
            setNewGoal({ title: '', target: '', deadline: '' });
            setIsGoalModalOpen(false);
            fetchGoals();
        } finally { setGoalLoading(false); }
    };

    const firstName = user?.name?.split(' ')[0] || 'there';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    // Chart data
    const chartData = (() => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const expMap: Record<string, number> = {};
        const incMap: Record<string, number> = {};
        analytics?.monthlyBreakdown?.forEach(m => { expMap[m.month] = m.total; });
        incomeAnalytics?.monthlyBreakdown?.forEach(m => { incMap[m.month] = m.total; });
        const allMonths = [...new Set([...Object.keys(expMap), ...Object.keys(incMap)])].sort();
        return allMonths.map(m => {
            const [, mo] = m.split('-');
            return { month: months[parseInt(mo) - 1], Expenses: expMap[m] || 0, Income: incMap[m] || 0 };
        });
    })();

    const netBalance = (incomeAnalytics?.thisMonthTotal ?? 0) - (analytics?.spentThisMonth ?? 0);
    const savingsRate = incomeAnalytics?.thisMonthTotal && incomeAnalytics.thisMonthTotal > 0
        ? Math.round((netBalance / incomeAnalytics.thisMonthTotal) * 100) : 0;

    const recentExpenses = expenses.slice(0, 6);
    const budgetPct = budget?.monthlyLimit ? Math.min(100, ((analytics?.spentThisMonth ?? 0) / budget.monthlyLimit) * 100) : 0;
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const daysPassed = new Date().getDate();
    const dailyAvg = analytics?.spentThisMonth && daysPassed > 0 ? analytics.spentThisMonth / daysPassed : 0;

    // Quick stat cards data
    const kpiCards = [
        {
            label: 'Monthly Income', value: incomeAnalytics?.thisMonthTotal ?? 0,
            trend: incomeAnalytics?.trend, icon: HiOutlineArrowTrendingUp,
            iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', valueColor: 'text-emerald-700',
        },
        {
            label: 'Monthly Expenses', value: analytics?.spentThisMonth ?? 0,
            trend: analytics?.monthTrend, icon: HiOutlineBanknotes,
            iconBg: 'bg-red-50', iconColor: 'text-red-600', valueColor: 'text-red-700',
        },
        {
            label: 'Net Balance', value: Math.abs(netBalance),
            icon: HiOutlineScale,
            iconBg: netBalance >= 0 ? 'bg-blue-50' : 'bg-amber-50',
            iconColor: netBalance >= 0 ? 'text-blue-600' : 'text-amber-600',
            valueColor: netBalance >= 0 ? 'text-blue-700' : 'text-red-700',
            prefix: netBalance < 0 ? '-' : '',
        },
        {
            label: 'Today\'s Spend', value: analytics?.spentToday ?? 0,
            icon: HiOutlineClock, iconBg: 'bg-purple-50', iconColor: 'text-purple-600', valueColor: 'text-slate-900',
        },
    ];

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-7">
                <div>
                    <p className="text-sm text-slate-500 mb-0.5">{todayStr}</p>
                    <h1 className="text-2xl font-bold text-slate-900">{greeting}, {firstName}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/income/add" className="btn-secondary">
                        <HiOutlineArrowTrendingUp className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Income</span>
                    </Link>
                    <Link href="/expenses/add" className="btn-primary">
                        <HiOutlinePlusCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Add Expense</span>
                    </Link>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {kpiCards.map((card) => (
                    <div key={card.label} className="card p-5">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                            </div>
                            {card.trend !== undefined && <TrendBadge value={card.trend} />}
                        </div>
                        <p className={`text-xl font-bold tracking-tight ${card.valueColor}`}>
                            {card.prefix}{formatCurrency(card.value)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Alerts row - budget warning, goal nudge */}
            <div className="space-y-2 mb-6">
                {budget && budgetPct >= 80 && (
                    <div className={`flex items-center gap-3 p-3.5 rounded-lg border ${budgetPct >= 100 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <HiOutlineExclamationTriangle className={`w-4 h-4 shrink-0 ${budgetPct >= 100 ? 'text-red-500' : 'text-amber-500'}`} />
                        <p className={`text-sm font-medium ${budgetPct >= 100 ? 'text-red-700' : 'text-amber-700'}`}>
                            {budgetPct >= 100
                                ? `You've exceeded your monthly budget by ${formatCurrency(Math.abs(budget.remaining))}.`
                                : `You've used ${Math.round(budgetPct)}% of your monthly budget. ${formatCurrency(budget.remaining)} remaining.`}
                        </p>
                        <Link href="/budget" className="ml-auto text-xs font-semibold text-slate-700 whitespace-nowrap hover:underline">View Budget</Link>
                    </div>
                )}
                {goals.some(g => g.current >= g.target) && (
                    <div className="flex items-center gap-3 p-3.5 rounded-lg border bg-emerald-50 border-emerald-200">
                        <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <p className="text-sm font-medium text-emerald-700">
                            You have achieved {goals.filter(g => g.current >= g.target).length} savings goal(s). Keep it up!
                        </p>
                        <Link href="/goals" className="ml-auto text-xs font-semibold text-emerald-700 whitespace-nowrap hover:underline">View Goals</Link>
                    </div>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left - Chart + Transactions */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Cash Flow Chart */}
                    <div className="card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="section-title">Cash Flow</h2>
                                <p className="meta-text mt-0.5">Income vs expenses by month</p>
                            </div>
                            <Link href="/reports" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Full Report</Link>
                        </div>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={210}>
                                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="iGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#059669" stopOpacity={0.12} />
                                            <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="eGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#DC2626" stopOpacity={0.12} />
                                            <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                    <Area type="monotone" dataKey="Income" stroke="#059669" strokeWidth={2} fill="url(#iGrad)" dot={false} />
                                    <Area type="monotone" dataKey="Expenses" stroke="#DC2626" strokeWidth={2} fill="url(#eGrad)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[210px] flex flex-col items-center justify-center gap-3">
                                <p className="text-slate-400 text-sm">No financial data yet.</p>
                                <div className="flex gap-2">
                                    <Link href="/expenses/add" className="btn-primary" style={{ fontSize: '0.8125rem' }}>Add Expense</Link>
                                    <Link href="/income/add" className="btn-secondary" style={{ fontSize: '0.8125rem' }}>Add Income</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="card p-4 text-center">
                            <p className="text-xs text-slate-500 mb-1">Health Score</p>
                            <p className="text-2xl font-bold text-blue-600">{analytics?.healthScore ?? 0}</p>
                            <p className="text-xs text-slate-400 mt-0.5">out of 100</p>
                        </div>
                        <div className="card p-4 text-center">
                            <p className="text-xs text-slate-500 mb-1">Savings Rate</p>
                            <p className={`text-2xl font-bold ${savingsRate >= 20 ? 'text-emerald-600' : savingsRate >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                                {Math.max(0, savingsRate)}%
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">this month</p>
                        </div>
                        <div className="card p-4 text-center">
                            <p className="text-xs text-slate-500 mb-1">Daily Avg Spend</p>
                            <p className="text-2xl font-bold text-slate-900">{formatCurrency(dailyAvg)}</p>
                            <p className="text-xs text-slate-400 mt-0.5">day {daysPassed} of {daysInMonth}</p>
                        </div>
                    </div>

                    {/* Transactions */}
                    <div className="card overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="section-title">Recent Transactions</h2>
                            <div className="flex items-center gap-3">
                                <div className="flex rounded-lg overflow-hidden border border-slate-200">
                                    <button onClick={() => setActiveTab('expenses')} className={`px-3 py-1 text-xs font-medium transition-colors ${activeTab === 'expenses' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                                        Expenses
                                    </button>
                                    <button onClick={() => setActiveTab('income')} className={`px-3 py-1 text-xs font-medium transition-colors ${activeTab === 'income' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                                        Income
                                    </button>
                                </div>
                                <Link href={activeTab === 'expenses' ? '/expenses' : '/income'} className="text-xs text-blue-600 font-medium hover:text-blue-700">View all</Link>
                            </div>
                        </div>

                        {activeTab === 'expenses' && (
                            recentExpenses.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-slate-400 text-sm mb-3">No expenses yet</p>
                                    <Link href="/expenses/add" className="btn-primary inline-flex">Add Expense</Link>
                                </div>
                            ) : (
                                <div>
                                    {recentExpenses.map((exp) => (
                                        <div key={exp.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ background: CATEGORY_COLORS[exp.category] || '#6B7280' }}>
                                                {exp.category.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{exp.merchant || exp.category}</p>
                                                <p className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &bull; {exp.category}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-semibold text-red-600">-{formatCurrency(exp.amount)}</p>
                                                <span className={`badge text-[10px] ${exp.isNecessary ? 'badge-info' : 'badge-warning'}`}>
                                                    {exp.isNecessary ? 'Essential' : 'Optional'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === 'income' && (
                            recentIncomes.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-slate-400 text-sm mb-3">No income records yet</p>
                                    <Link href="/income/add" className="btn-primary inline-flex">Add Income</Link>
                                </div>
                            ) : (
                                <div>
                                    {recentIncomes.map((inc) => (
                                        <div key={inc.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold shrink-0">
                                                {inc.category.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">{inc.source || inc.category}</p>
                                                <p className="text-xs text-slate-400">{new Date(inc.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &bull; {inc.category}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-sm font-semibold text-emerald-600">+{formatCurrency(inc.amount)}</p>
                                                {inc.isRecurring && <span className="badge badge-info text-[10px]">Recurring</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="space-y-5">
                    {/* Budget */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title">Monthly Budget</h2>
                            <Link href="/budget" className="text-xs text-blue-600 font-medium hover:text-blue-700">Manage</Link>
                        </div>
                        {budget ? (
                            <>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-sm text-slate-600">Spent</span>
                                    <span className="text-sm font-semibold">
                                        {formatCurrency(analytics?.spentThisMonth ?? 0)}<span className="text-slate-400 font-normal"> / {formatCurrency(budget.monthlyLimit)}</span>
                                    </span>
                                </div>
                                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
                                    <div className="h-full rounded-full transition-all duration-700"
                                        style={{ width: `${Math.min(100, budgetPct)}%`, background: budgetPct >= 100 ? '#DC2626' : budgetPct >= 80 ? '#D97706' : '#2563EB' }} />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>{Math.round(budgetPct)}% used</span>
                                    <span className={`font-medium ${(budget.remaining ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {(budget.remaining ?? 0) >= 0 ? formatCurrency(budget.remaining) + ' left' : formatCurrency(Math.abs(budget.remaining)) + ' over'}
                                    </span>
                                </div>

                                {analytics?.categoryBreakdown && analytics.categoryBreakdown.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2.5">
                                        {analytics.categoryBreakdown.sort((a, b) => b.total - a.total).slice(0, 4).map(cat => {
                                            const pct = budget.monthlyLimit > 0 ? Math.min(100, (cat.total / budget.monthlyLimit) * 100) : 0;
                                            return (
                                                <div key={cat.category}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-slate-600">{cat.category}</span>
                                                        <span className="text-slate-500">{formatCurrency(cat.total)}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat.category] || '#6B7280' }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-3">
                                <p className="text-slate-400 text-sm mb-3">Set a budget to track spending</p>
                                <Link href="/budget" className="btn-primary">Set Budget</Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="card p-5">
                        <h2 className="section-title mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-2.5">
                            {[
                                { href: '/expenses/add', label: 'Add Expense', icon: HiOutlineBanknotes, bg: 'bg-red-50', color: 'text-red-600' },
                                { href: '/income/add', label: 'Add Income', icon: HiOutlineArrowTrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
                                { href: '/budget', label: 'View Budget', icon: HiOutlineChartPie, bg: 'bg-blue-50', color: 'text-blue-600' },
                                { href: '/goals', label: 'My Goals', icon: HiOutlineTrophy, bg: 'bg-purple-50', color: 'text-purple-600' },
                                { href: '/analytics', label: 'Analytics', icon: HiOutlineChartBarSquare, bg: 'bg-amber-50', color: 'text-amber-600' },
                                { href: '/reports', label: 'Reports', icon: HiOutlineDocumentChartBar, bg: 'bg-slate-100', color: 'text-slate-600' },
                            ].map(({ href, label, icon: Icon, bg, color }) => (
                                <Link key={href} href={href} className={`flex flex-col items-center gap-2 p-3.5 ${bg} rounded-xl hover:opacity-80 transition-opacity`}>
                                    <Icon className={`w-5 h-5 ${color}`} />
                                    <span className="text-xs font-medium text-slate-700">{label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Savings Goals Summary */}
                    <div className="card p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title">Savings Goals</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setIsGoalModalOpen(true)} className="btn-ghost" style={{ height: '1.75rem', width: '1.75rem', padding: 0 }}>
                                    <HiOutlinePlusCircle className="w-4 h-4" />
                                </button>
                                <Link href="/goals" className="text-xs text-blue-600 font-medium hover:text-blue-700">All</Link>
                            </div>
                        </div>
                        {goals.length === 0 ? (
                            <div className="text-center py-3">
                                <HiOutlineTrophy className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-400 text-xs mb-3">No goals yet</p>
                                <button onClick={() => setIsGoalModalOpen(true)} className="btn-secondary" style={{ fontSize: '0.75rem' }}>Create Goal</button>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {goals.slice(0, 3).map((goal) => {
                                    const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
                                    return (
                                        <div key={goal.id}>
                                            <div className="flex justify-between mb-1.5">
                                                <span className="text-sm font-medium text-slate-900 truncate max-w-[140px]">{goal.title}</span>
                                                <span className="text-xs text-slate-500">{Math.round(pct)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? '#059669' : '#2563EB' }} />
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-[11px] text-slate-400">{formatCurrency(goal.current)}</span>
                                                <span className="text-[11px] text-slate-400">{formatCurrency(goal.target)}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                {goals.length > 3 && (
                                    <Link href="/goals" className="text-xs text-blue-600 font-medium hover:underline block text-center pt-1">
                                        +{goals.length - 3} more goals
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Insights */}
                    {analytics?.insights && analytics.insights.length > 0 && (
                        <div className="card p-5">
                            <h2 className="section-title mb-4">Insights</h2>
                            <div className="space-y-2.5">
                                {analytics.insights.map((insight, i) => (
                                    <div key={i} className="flex gap-2.5 p-3 bg-blue-50 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                        <p className="text-xs text-slate-700 leading-relaxed">{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Goal Modal */}
            {isGoalModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsGoalModalOpen(false)} />
                    <div className="relative card w-full max-w-sm p-6 z-10">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-slate-900">New Savings Goal</h3>
                            <button onClick={() => setIsGoalModalOpen(false)} className="btn-ghost" style={{ width: '2rem', height: '2rem', padding: 0 }}>
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddGoal} className="space-y-4">
                            <div>
                                <label className="label">Goal Name</label>
                                <input type="text" required value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                    className="input-field" placeholder="e.g. Emergency Fund" />
                            </div>
                            <div>
                                <label className="label">Target Amount</label>
                                <input type="number" required min="1" value={newGoal.target}
                                    onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                                    className="input-field" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="label">Deadline (optional)</label>
                                <input type="date" value={newGoal.deadline}
                                    onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                    className="input-field" />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setIsGoalModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={goalLoading} className="btn-primary flex-1">
                                    {goalLoading ? 'Saving...' : 'Create Goal'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
