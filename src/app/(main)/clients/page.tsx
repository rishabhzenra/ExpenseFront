'use client';

import { useEffect, useState, useCallback } from 'react';
import { clientService, Client } from '@/services/clientService';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineUsers, HiOutlinePlusCircle, HiOutlineXMark, HiOutlinePencil,
    HiOutlineTrash, HiOutlineEnvelope, HiOutlinePhone, HiOutlineBuildingOffice2,
    HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

const STATUS_STYLES = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    prospect: 'bg-blue-50 text-blue-700 border-blue-200',
};

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', address: '', industry: '', status: 'active', notes: '', taxId: '' };

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [stats, setStats] = useState({ total: 0, active: 0, totalBilled: 0, totalPaid: 0, outstanding: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<Client | null>(null);
    const [form, setForm] = useState<any>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'prospect'>('all');

    const load = useCallback(async () => {
        try {
            const [c, s] = await Promise.all([clientService.findAll(), clientService.getStats()]);
            setClients(c.data);
            setStats(s.data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (c: Client) => {
        setEditItem(c);
        setForm({ name: c.name, email: c.email || '', phone: c.phone || '', company: c.company || '', address: c.address || '', industry: c.industry || '', status: c.status, notes: c.notes || '', taxId: c.taxId || '' });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editItem) await clientService.update(editItem.id, form);
            else await clientService.create(form);
            setShowModal(false);
            load();
        } finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this client? This cannot be undone.')) return;
        await clientService.delete(id);
        load();
    };

    const filtered = clients.filter(c => {
        const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const AVATAR_COLORS = ['#2563EB', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0891B2'];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your client relationships and billing history</p>
                </div>
                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <HiOutlinePlusCircle className="w-4 h-4" /> Add Client
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Clients', value: stats.total, format: false },
                    { label: 'Active Clients', value: stats.active, format: false },
                    { label: 'Total Billed', value: stats.totalBilled, format: true },
                    { label: 'Total Collected', value: stats.totalPaid, format: true },
                    { label: 'Outstanding', value: stats.outstanding, format: true },
                ].map(s => (
                    <div key={s.label} className="card p-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{s.label}</p>
                        <p className={`text-xl font-bold ${s.label === 'Outstanding' && s.value > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            {s.format ? formatCurrency(s.value) : s.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input-field pl-9" placeholder="Search by name, company, email..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    {(['all', 'active', 'inactive', 'prospect'] as const).map(f => (
                        <button key={f} onClick={() => setFilterStatus(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Client Table */}
            {loading ? (
                <div className="card p-12 text-center text-slate-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <HiOutlineUsers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No clients found</p>
                    <p className="text-slate-400 text-sm mt-1">Add your first client to get started</p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Industry</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Billed</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Collected</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Outstanding</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((c, idx) => {
                                const outstanding = Number(c.totalBilled) - Number(c.totalPaid);
                                return (
                                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                                                    {getInitials(c.name)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{c.name}</p>
                                                    <p className="text-xs text-slate-500">{c.company || c.email || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 hidden md:table-cell">{c.industry || '-'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_STYLES[c.status]}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right font-medium text-slate-900 hidden lg:table-cell">{formatCurrency(c.totalBilled)}</td>
                                        <td className="px-5 py-4 text-right text-emerald-600 font-medium hidden lg:table-cell">{formatCurrency(c.totalPaid)}</td>
                                        <td className="px-5 py-4 text-right hidden lg:table-cell">
                                            <span className={`font-semibold ${outstanding > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                                {outstanding > 0 ? formatCurrency(outstanding) : '—'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
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
                    <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-900">{editItem ? 'Edit Client' : 'Add Client'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                                <HiOutlineXMark className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="label-sm">Full Name *</label>
                                    <input className="input-field" placeholder="Arjun Mehta" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="label-sm">Company</label>
                                    <input className="input-field" placeholder="Acme Corp" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Industry</label>
                                    <select className="input-field" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
                                        <option value="">Select...</option>
                                        {['Technology', 'Finance', 'Healthcare', 'Retail', 'SaaS', 'Manufacturing', 'Education', 'Real Estate', 'Media', 'Other'].map(i => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-sm">Email</label>
                                    <input className="input-field" type="email" placeholder="client@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Phone</label>
                                    <input className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label-sm">Address</label>
                                    <input className="input-field" placeholder="City, State, PIN" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-sm">Status</label>
                                    <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="prospect">Prospect</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-sm">GST / Tax ID</label>
                                    <input className="input-field" placeholder="27AAPFU0939F1ZV" value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} />
                                </div>
                                <div className="col-span-2">
                                    <label className="label-sm">Notes</label>
                                    <textarea className="input-field min-h-[80px] resize-none" placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : editItem ? 'Update Client' : 'Add Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
