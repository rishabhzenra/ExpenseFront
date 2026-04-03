'use client';

import { useEffect, useState, useCallback } from 'react';
import { subscriptionService, Subscription } from '@/services/subscriptionService';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineCreditCard, HiOutlinePlusCircle, HiOutlineXMark, HiOutlinePencil,
    HiOutlineTrash, HiOutlineCheckCircle, HiOutlinePause, HiOutlineCalendarDays,
} from 'react-icons/hi2';

const CATEGORY_COLORS: Record<string, string> = {
    Infrastructure: 'bg-blue-100 text-blue-700',
    Development: 'bg-violet-100 text-violet-700',
    Design: 'bg-pink-100 text-pink-700',
    Productivity: 'bg-amber-100 text-amber-700',
    Communication: 'bg-emerald-100 text-emerald-700',
    Marketing: 'bg-orange-100 text-orange-700',
    Other: 'bg-slate-100 text-slate-700',
};

const STATUS_STYLES = {
    active: 'bg-emerald-50 text-emerald-700',
    paused: 'bg-amber-50 text-amber-700',
    cancelled: 'bg-red-50 text-red-600',
};

const EMPTY_FORM = { name: '', description: '', amount: '', billingCycle: 'monthly', status: 'active', category: '', nextBillingDate: '', startDate: '' };

export default function SubscriptionsPage() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [analytics, setAnalytics] = useState({ totalActive: 0, monthlyTotal: 0, yearlyTotal: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Subscription | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');

    const load = useCallback(async () => {
        try {
            const [s, a] = await Promise.all([subscriptionService.findAll(), subscriptionService.getAnalytics()]);
            setSubs(s.data);
            setAnalytics(a.data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (s: Subscription) => {
        setEditItem(s);
        setForm({ name: s.name, description: s.description || '', amount: String(s.amount), billingCycle: s.billingCycle, status: s.status, category: s.category || '', nextBillingDate: s.nextBillingDate || '', startDate: s.startDate || '' });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, amount: parseFloat(form.amount) };
            if (editItem) await subscriptionService.update(editItem.id, payload);
            else await subscriptionService.create(payload);
            setShowModal(false);
            load();
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this subscription?')) return;
        await subscriptionService.delete(id);
        load();
    };

    const toMonthly = (s: Subscription) => {
        const amt = Number(s.amount);
        if (s.billingCycle === 'yearly') return amt / 12;
        if (s.billingCycle === 'weekly') return amt * 4.33;
        if (s.billingCycle === 'quarterly') return amt / 3;
        return amt;
    };

    const filtered = subs.filter(s => filter === 'all' || s.status === filter);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Subscriptions</h1>
                    <p className="text-slate-500 text-sm mt-1">Track all recurring software and service subscriptions</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlusCircle className="w-4 h-4" /> Add Subscription
                </button>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Subscriptions</p>
                    <p className="text-3xl font-bold text-slate-900">{analytics.totalActive}</p>
                    <p className="text-xs text-slate-500 mt-1">Services running</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Monthly Spend</p>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(analytics.monthlyTotal)}</p>
                    <p className="text-xs text-slate-500 mt-1">Normalized monthly cost</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Annual Commitment</p>
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(analytics.yearlyTotal)}</p>
                    <p className="text-xs text-slate-500 mt-1">Projected annual spend</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'active', 'paused', 'cancelled'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        {f} {f === 'all' ? `(${subs.length})` : `(${subs.filter(s => s.status === f).length})`}
                    </button>
                ))}
            </div>

            {/* Subscriptions list */}
            {loading ? (
                <div className="card p-12 text-center text-slate-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <HiOutlineCreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No subscriptions yet</p>
                    <p className="text-slate-400 text-sm mt-1">Add your first subscription to start tracking</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(sub => (
                        <div key={sub.id} className="card p-5 flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-slate-900 truncate">{sub.name}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[sub.status] || STATUS_STYLES.active}`}>
                                            {sub.status}
                                        </span>
                                        {sub.isTrial && <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">Trial</span>}
                                    </div>
                                    {sub.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{sub.description}</p>}
                                </div>
                                <div className="flex items-center gap-1 ml-2 shrink-0">
                                    <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                                        <HiOutlinePencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDelete(sub.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                                        <HiOutlineTrash className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(sub.amount)}</p>
                                    <p className="text-xs text-slate-500 capitalize">/ {sub.billingCycle}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">Monthly equiv.</p>
                                    <p className="text-sm font-semibold text-blue-600">{formatCurrency(toMonthly(sub))}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                {sub.category && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[sub.category] || CATEGORY_COLORS.Other}`}>
                                        {sub.category}
                                    </span>
                                )}
                                {sub.nextBillingDate && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                                        <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                                        Next: {new Date(sub.nextBillingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="card w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-900">{editItem ? 'Edit Subscription' : 'Add Subscription'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                <HiOutlineXMark className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="label-sm">Service Name *</label>
                                    <input className="input-field" placeholder="e.g. GitHub Teams" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="col-span-2">
                                    <label className="label-sm">Description</label>
                                    <input className="input-field" placeholder="What is it used for?" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Amount (₹) *</label>
                                    <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="label-sm">Billing Cycle</label>
                                    <select className="input-field" value={form.billingCycle} onChange={e => setForm({ ...form, billingCycle: e.target.value })}>
                                        <option value="monthly">Monthly</option>
                                        <option value="yearly">Yearly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="weekly">Weekly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-sm">Status</label>
                                    <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-sm">Category</label>
                                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="">Select...</option>
                                        {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-sm">Start Date</label>
                                    <input className="input-field" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Next Billing Date</label>
                                    <input className="input-field" type="date" value={form.nextBillingDate} onChange={e => setForm({ ...form, nextBillingDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : editItem ? 'Update' : 'Add Subscription'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
