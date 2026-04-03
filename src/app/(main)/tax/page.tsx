'use client';

import { useEffect, useState, useCallback } from 'react';
import { taxService, TaxEntry } from '@/services/taxService';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineReceiptPercent, HiOutlinePlusCircle, HiOutlineXMark, HiOutlinePencil,
    HiOutlineTrash, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationTriangle,
    HiOutlineDocumentCheck,
} from 'react-icons/hi2';

const CATEGORY_LABELS: Record<string, string> = {
    income_tax: 'Income Tax', gst: 'GST', tds: 'TDS',
    advance_tax: 'Advance Tax', property_tax: 'Property Tax', other: 'Other',
};

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700', icon: HiOutlineClock },
    paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700', icon: HiOutlineCheckCircle },
    overdue: { label: 'Overdue', className: 'bg-red-50 text-red-600', icon: HiOutlineExclamationTriangle },
    filed: { label: 'Filed', className: 'bg-blue-50 text-blue-700', icon: HiOutlineDocumentCheck },
};

const EMPTY_FORM = {
    title: '', category: 'income_tax', status: 'pending', amount: '',
    dueDate: '', paidDate: '', financialYear: 'FY 2024-25', referenceNumber: '', notes: '',
};

export default function TaxPage() {
    const [entries, setEntries] = useState<TaxEntry[]>([]);
    const [summary, setSummary] = useState({ total: 0, pending: 0, paid: 0, overdue: 0, totalLiability: 0, totalPaid: 0, pendingAmount: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<TaxEntry | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const load = useCallback(async () => {
        try {
            const [e, s] = await Promise.all([taxService.findAll(), taxService.getSummary()]);
            setEntries(e.data);
            setSummary(s.data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (e: TaxEntry) => {
        setEditItem(e);
        setForm({ title: e.title, category: e.category, status: e.status, amount: String(e.amount), dueDate: e.dueDate || '', paidDate: e.paidDate || '', financialYear: e.financialYear || '', referenceNumber: e.referenceNumber || '', notes: e.notes || '' });
        setShowModal(true);
    };

    const handleSave = async (ev: React.FormEvent) => {
        ev.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, amount: parseFloat(form.amount) };
            if (editItem) await taxService.update(editItem.id, payload);
            else await taxService.create(payload);
            setShowModal(false);
            load();
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this tax entry?')) return;
        await taxService.delete(id);
        load();
    };

    const filtered = filterStatus === 'all' ? entries : entries.filter(e => e.status === filterStatus);

    const urgentEntries = entries.filter(e => e.status === 'pending' || e.status === 'overdue');

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tax Tracker</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage GST, TDS, Income Tax and other tax obligations</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlusCircle className="w-4 h-4" /> Add Entry
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Liability</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(summary.totalLiability)}</p>
                    <p className="text-xs text-slate-500 mt-1">{summary.total} entries</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Paid / Filed</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalPaid)}</p>
                    <p className="text-xs text-slate-500 mt-1">{summary.paid} entries cleared</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Pending Amount</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(summary.pendingAmount)}</p>
                    <p className="text-xs text-slate-500 mt-1">{summary.pending} pending</p>
                </div>
                <div className="card p-5 border border-red-100">
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
                    <p className="text-xs text-slate-500 mt-1">Requires immediate action</p>
                </div>
            </div>

            {/* Upcoming / Alerts */}
            {urgentEntries.length > 0 && (
                <div className="card p-4 border border-amber-200 bg-amber-50">
                    <p className="text-sm font-semibold text-amber-800 mb-2">Action Required</p>
                    <div className="space-y-2">
                        {urgentEntries.slice(0, 3).map(e => (
                            <div key={e.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    {e.status === 'overdue' ? <HiOutlineExclamationTriangle className="w-4 h-4 text-red-500" /> : <HiOutlineClock className="w-4 h-4 text-amber-600" />}
                                    <span className={e.status === 'overdue' ? 'text-red-700 font-medium' : 'text-amber-800'}>{e.title}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-600 font-medium">{formatCurrency(e.amount)}</span>
                                    {e.dueDate && <span className={`text-xs ${e.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>Due {new Date(e.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'pending', 'paid', 'overdue', 'filed'].map(f => (
                    <button key={f} onClick={() => setFilterStatus(f)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Entries */}
            {loading ? (
                <div className="card p-12 text-center text-slate-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <HiOutlineReceiptPercent className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No tax entries</p>
                    <p className="text-slate-400 text-sm mt-1">Add your first tax obligation to start tracking</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Title</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Category</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">FY</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Due Date</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(e => {
                                const cfg = STATUS_CONFIG[e.status] || STATUS_CONFIG.pending;
                                return (
                                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-900">{e.title}</p>
                                            {e.referenceNumber && <p className="text-xs text-slate-400">{e.referenceNumber}</p>}
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 hidden md:table-cell">{CATEGORY_LABELS[e.category] || e.category}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.className}`}>
                                                <cfg.icon className="w-3 h-3" />
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 text-xs hidden lg:table-cell">{e.financialYear || '—'}</td>
                                        <td className={`px-5 py-4 text-sm hidden lg:table-cell ${e.status === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                            {e.dueDate ? new Date(e.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right font-bold text-slate-900">{formatCurrency(e.amount)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
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
                            <h2 className="text-lg font-bold text-slate-900">{editItem ? 'Edit Tax Entry' : 'Add Tax Entry'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                <HiOutlineXMark className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="label-sm">Title *</label>
                                <input className="input-field" placeholder="e.g. GST Return – March 2025" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label-sm">Category</label>
                                    <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-sm">Status</label>
                                    <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-sm">Amount (₹) *</label>
                                    <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="label-sm">Financial Year</label>
                                    <input className="input-field" placeholder="FY 2024-25" value={form.financialYear} onChange={e => setForm({ ...form, financialYear: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Due Date</label>
                                    <input className="input-field" type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Paid Date</label>
                                    <input className="input-field" type="date" value={form.paidDate} onChange={e => setForm({ ...form, paidDate: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label-sm">Reference Number</label>
                                    <input className="input-field" placeholder="GSTR1-MAR25 / TDS-Q4-24" value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label-sm">Notes</label>
                                    <textarea className="input-field min-h-[70px] resize-none" placeholder="Additional details..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : editItem ? 'Update' : 'Add Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
