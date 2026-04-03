'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { invoiceService, Invoice } from '@/services/invoiceService';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlineDocumentText, HiOutlinePlusCircle, HiOutlineTrash, HiOutlineEye,
    HiOutlineMagnifyingGlass, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

const STATUS_CONFIG = {
    draft: { label: 'Draft', className: 'bg-slate-100 text-slate-600', icon: null },
    sent: { label: 'Sent', className: 'bg-blue-50 text-blue-700', icon: HiOutlineClock },
    paid: { label: 'Paid', className: 'bg-emerald-50 text-emerald-700', icon: HiOutlineCheckCircle },
    overdue: { label: 'Overdue', className: 'bg-red-50 text-red-600', icon: HiOutlineExclamationTriangle },
    cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-500', icon: null },
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [stats, setStats] = useState({ total: 0, draft: 0, sent: 0, paid: 0, overdue: 0, totalValue: 0, paidValue: 0, outstanding: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const load = useCallback(async () => {
        try {
            const [i, s] = await Promise.all([invoiceService.findAll(), invoiceService.getStats()]);
            setInvoices(i.data);
            setStats(s.data);
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this invoice?')) return;
        await invoiceService.delete(id);
        load();
    };

    const filtered = invoices.filter(inv => {
        const matchesSearch = !search || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || inv.clientName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
                    <p className="text-slate-500 text-sm mt-1">Create, manage and track professional invoices</p>
                </div>
                <Link href="/invoices/new" className="btn-primary flex items-center gap-2">
                    <HiOutlinePlusCircle className="w-4 h-4" /> New Invoice
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Value</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</p>
                    <p className="text-xs text-slate-500 mt-1">{stats.total} invoices</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Collected</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.paidValue)}</p>
                    <p className="text-xs text-slate-500 mt-1">{stats.paid} paid</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Outstanding</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.outstanding)}</p>
                    <p className="text-xs text-slate-500 mt-1">{stats.sent} sent</p>
                </div>
                <div className="card p-5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                    <p className="text-xs text-slate-500 mt-1">Requires follow-up</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input className="input-field pl-9" placeholder="Search by invoice # or client..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['all', 'draft', 'sent', 'paid', 'overdue'].map(f => (
                        <button key={f} onClick={() => setFilterStatus(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${filterStatus === f ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoice Table */}
            {loading ? (
                <div className="card p-12 text-center text-slate-400">Loading...</div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <HiOutlineDocumentText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No invoices found</p>
                    <p className="text-slate-400 text-sm mt-1">Create your first invoice to get started</p>
                    <Link href="/invoices/new" className="btn-primary inline-flex items-center gap-2 mt-4">
                        <HiOutlinePlusCircle className="w-4 h-4" /> Create Invoice
                    </Link>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Client</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Issue Date</th>
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Due Date</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map(inv => {
                                const cfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.draft;
                                const isOverdue = inv.status === 'overdue';
                                return (
                                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-900">{inv.invoiceNumber}</p>
                                            <p className="text-xs text-slate-500 md:hidden">{inv.clientName}</p>
                                        </td>
                                        <td className="px-5 py-4 text-slate-700 hidden md:table-cell">{inv.clientName || '—'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.className}`}>
                                                {cfg.icon && <cfg.icon className="w-3 h-3" />}
                                                {cfg.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-slate-600 hidden lg:table-cell">{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                                        <td className={`px-5 py-4 hidden lg:table-cell ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                                            {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <p className="font-bold text-slate-900">{formatCurrency(inv.total)}</p>
                                            {inv.taxRate > 0 && <p className="text-xs text-slate-400">incl. {inv.taxRate}% tax</p>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Link href={`/invoices/${inv.id}`} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600">
                                                    <HiOutlineEye className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
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
        </div>
    );
}
