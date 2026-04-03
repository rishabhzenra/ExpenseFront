'use client';

import { useEffect, useState, useCallback } from 'react';
import { investmentService, Investment, PortfolioSummary } from '@/services/investmentService';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineChartBarSquare, HiOutlinePlusCircle, HiOutlineXMark, HiOutlinePencil,
    HiOutlineTrash, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown,
} from 'react-icons/hi2';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    stocks:       { label: 'Stocks',         color: '#2563EB', bg: 'bg-blue-50 text-blue-700' },
    mutual_fund:  { label: 'Mutual Funds',   color: '#7C3AED', bg: 'bg-violet-50 text-violet-700' },
    fixed_deposit:{ label: 'Fixed Deposit',  color: '#059669', bg: 'bg-emerald-50 text-emerald-700' },
    crypto:       { label: 'Crypto',         color: '#F59E0B', bg: 'bg-amber-50 text-amber-700' },
    gold:         { label: 'Gold',           color: '#D97706', bg: 'bg-yellow-50 text-yellow-700' },
    real_estate:  { label: 'Real Estate',    color: '#DC2626', bg: 'bg-red-50 text-red-700' },
    bonds:        { label: 'Bonds',          color: '#0891B2', bg: 'bg-cyan-50 text-cyan-700' },
    ppf:          { label: 'PPF',            color: '#16A34A', bg: 'bg-green-50 text-green-700' },
    other:        { label: 'Other',          color: '#6B7280', bg: 'bg-slate-100 text-slate-600' },
};

const EMPTY_FORM = { name: '', type: 'stocks', investedAmount: '', currentValue: '', platform: '', ticker: '', purchaseDate: '', notes: '' };

export default function InvestmentsPage() {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [summary, setSummary] = useState<PortfolioSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Investment | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [filterType, setFilterType] = useState('all');

    const load = useCallback(async () => {
        try {
            const [inv, sum] = await Promise.all([investmentService.findAll(), investmentService.getSummary()]);
            setInvestments(inv.data);
            setSummary(sum.data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (inv: Investment) => {
        setEditItem(inv);
        setForm({ name: inv.name, type: inv.type, investedAmount: String(inv.investedAmount), currentValue: String(inv.currentValue), platform: inv.platform || '', ticker: inv.ticker || '', purchaseDate: inv.purchaseDate || '', notes: inv.notes || '' });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, investedAmount: parseFloat(form.investedAmount), currentValue: parseFloat(form.currentValue || form.investedAmount) };
            if (editItem) await investmentService.update(editItem.id, payload);
            else await investmentService.create(payload);
            setShowModal(false);
            load();
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        await investmentService.delete(id);
        load();
    };

    const filtered = filterType === 'all' ? investments : investments.filter(i => i.type === filterType);

    const pieData = summary ? Object.entries(summary.byType).map(([type, data]) => ({
        name: TYPE_CONFIG[type]?.label || type,
        value: data.current,
        color: TYPE_CONFIG[type]?.color || '#6B7280',
    })) : [];

    const totalGain = summary?.totalGain || 0;
    const gainPct = summary?.gainPct || 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Investment Portfolio</h1>
                    <p className="text-slate-500 text-sm mt-1">Track stocks, mutual funds, crypto and all your assets</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlusCircle className="w-4 h-4" /> Add Investment
                </button>
            </div>

            {/* Portfolio KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Invested</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.totalInvested || 0)}</p>
                    <p className="text-xs text-slate-500 mt-1">{summary?.count || 0} holdings</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Current Value</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary?.totalCurrent || 0)}</p>
                    <p className="text-xs text-slate-500 mt-1">Live portfolio value</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total P&L</p>
                    <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                    </p>
                    <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {totalGain >= 0 ? <HiOutlineArrowTrendingUp className="w-3 h-3" /> : <HiOutlineArrowTrendingDown className="w-3 h-3" />}
                        {gainPct >= 0 ? '+' : ''}{gainPct.toFixed(2)}%
                    </div>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Asset Classes</p>
                    <p className="text-2xl font-bold text-slate-900">{Object.keys(summary?.byType || {}).length}</p>
                    <p className="text-xs text-slate-500 mt-1">Diversification score</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pie Chart */}
                <div className="card p-6">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Allocation by Asset Class</h2>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                </Pie>
                                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
                    )}
                </div>

                {/* By Type Breakdown */}
                <div className="card p-6 lg:col-span-2">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Performance by Asset Class</h2>
                    <div className="space-y-3">
                        {Object.entries(summary?.byType || {}).map(([type, data]) => {
                            const gain = data.current - data.invested;
                            const pct = data.invested > 0 ? (gain / data.invested) * 100 : 0;
                            const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.other;
                            return (
                                <div key={type} className="flex items-center justify-between py-2 border-b border-slate-50">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.bg}`}>{cfg.label}</span>
                                        <span className="text-xs text-slate-500">{data.count} holding{data.count > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex items-center gap-6 text-right">
                                        <div>
                                            <p className="text-xs text-slate-500">Invested</p>
                                            <p className="text-sm font-medium text-slate-900">{formatCurrency(data.invested)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Current</p>
                                            <p className="text-sm font-medium text-slate-900">{formatCurrency(data.current)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">P&L</p>
                                            <p className={`text-sm font-bold ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {gain >= 0 ? '+' : ''}{pct.toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                    All ({investments.length})
                </button>
                {Object.entries(TYPE_CONFIG).filter(([type]) => investments.some(i => i.type === type)).map(([type, cfg]) => (
                    <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterType === type ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        {cfg.label}
                    </button>
                ))}
            </div>

            {/* Holdings Table */}
            {loading ? (
                <div className="card p-12 text-center text-slate-400">Loading portfolio...</div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <HiOutlineChartBarSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No investments yet</p>
                    <button onClick={openAdd} className="btn-primary mt-4">Add your first investment</button>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Asset</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Platform</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Invested</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Current</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">P&L</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Return</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(inv => {
                                const gain = Number(inv.currentValue) - Number(inv.investedAmount);
                                const pct = Number(inv.investedAmount) > 0 ? (gain / Number(inv.investedAmount)) * 100 : 0;
                                const cfg = TYPE_CONFIG[inv.type] || TYPE_CONFIG.other;
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: cfg.color + '15', color: cfg.color }}>
                                                    {inv.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{inv.name}</p>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${cfg.bg}`}>{cfg.label}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 hidden md:table-cell">{inv.platform || '—'}</td>
                                        <td className="px-5 py-4 text-right font-medium text-slate-700">{formatCurrency(inv.investedAmount)}</td>
                                        <td className="px-5 py-4 text-right font-semibold text-slate-900">{formatCurrency(inv.currentValue)}</td>
                                        <td className={`px-5 py-4 text-right font-semibold ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                                        </td>
                                        <td className="px-5 py-4 text-right hidden lg:table-cell">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gain >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                                {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => openEdit(inv)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><HiOutlinePencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-900">{editItem ? 'Edit Investment' : 'Add Investment'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg"><HiOutlineXMark className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="label-sm">Asset Name *</label>
                                    <input className="input-field" placeholder="e.g. Reliance Industries" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="label-sm">Type</label>
                                    <select className="input-field" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                        {Object.entries(TYPE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-sm">Platform</label>
                                    <input className="input-field" placeholder="Zerodha, Groww..." value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Invested Amount (₹) *</label>
                                    <input className="input-field" type="number" min="0" step="0.01" value={form.investedAmount} onChange={e => setForm({ ...form, investedAmount: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="label-sm">Current Value (₹)</label>
                                    <input className="input-field" type="number" min="0" step="0.01" placeholder="Leave blank = same as invested" value={form.currentValue} onChange={e => setForm({ ...form, currentValue: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Ticker / Symbol</label>
                                    <input className="input-field" placeholder="RELIANCE, BTC..." value={form.ticker} onChange={e => setForm({ ...form, ticker: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Purchase Date</label>
                                    <input className="input-field" type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label-sm">Notes</label>
                                    <textarea className="input-field min-h-[60px] resize-none" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : editItem ? 'Update' : 'Add Investment'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
