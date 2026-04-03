'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useIncome } from '@/hooks/useIncome';
import { incomeService } from '@/services/incomeService';
import { formatCurrency } from '@/utils/formatCurrency';
import { INCOME_CATEGORIES } from '@/types/income';
import {
    HiOutlinePlusCircle,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

const CATEGORY_COLORS: Record<string, string> = {
    Salary: '#059669',
    Freelance: '#2563EB',
    Business: '#7C3AED',
    Investment: '#D97706',
    Rental: '#0891B2',
    Bonus: '#DC2626',
    Other: '#6B7280',
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function IncomePage() {
    const { incomes, loading, fetchIncomes } = useIncome();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    useEffect(() => {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        fetchIncomes({ startDate, endDate, category: category || undefined });
    }, [fetchIncomes, month, year, category]);

    const filtered = incomes.filter(i =>
        !search ||
        i.category.toLowerCase().includes(search.toLowerCase()) ||
        (i.source || '').toLowerCase().includes(search.toLowerCase()) ||
        (i.notes || '').toLowerCase().includes(search.toLowerCase())
    );

    const total = filtered.reduce((sum, i) => sum + Number(i.amount), 0);

    const handleDelete = async (id: string) => {
        setDeleting(true);
        try {
            await incomeService.remove(id);
            fetchIncomes();
            setDeleteId(null);
        } catch { /* silent */ }
        finally { setDeleting(false); }
    };

    const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

    return (
        <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="page-header">Income</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track all your income sources</p>
                </div>
                <Link href="/income/add" className="btn-primary">
                    <HiOutlinePlusCircle className="w-4 h-4" />
                    Add Income
                </Link>
            </div>

            {/* Filters */}
            <div className="card p-4 mb-5">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search income..."
                            className="input-field pl-9"
                        />
                    </div>
                    <select value={month} onChange={e => setMonth(Number(e.target.value))} className="select-field" style={{ width: 'auto', minWidth: '130px' }}>
                        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                    </select>
                    <select value={year} onChange={e => setYear(Number(e.target.value))} className="select-field" style={{ width: 'auto', minWidth: '90px' }}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="select-field" style={{ width: 'auto', minWidth: '130px' }}>
                        <option value="">All Categories</option>
                        {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{filtered.length}</span> records
                </p>
                <p className="text-sm text-slate-600">
                    Total: <span className="font-semibold text-emerald-600">{formatCurrency(total)}</span>
                </p>
            </div>

            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4">
                                <div className="skeleton h-8 w-8 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <div className="skeleton h-3.5 w-40" />
                                    <div className="skeleton h-3 w-24" />
                                </div>
                                <div className="skeleton h-4 w-20" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <HiOutlinePlusCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-slate-600 font-medium mb-1">No income records found</p>
                        <p className="text-slate-400 text-sm mb-4">Start by adding your first income entry</p>
                        <Link href="/income/add" className="btn-primary inline-flex">Add Income</Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="table-header text-left px-5 py-3">Source</th>
                                <th className="table-header text-left px-4 py-3">Category</th>
                                <th className="table-header text-left px-4 py-3 hidden md:table-cell">Date</th>
                                <th className="table-header text-left px-4 py-3 hidden lg:table-cell">Notes</th>
                                <th className="table-header text-right px-5 py-3">Amount</th>
                                <th className="table-header px-4 py-3 w-20"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((income) => (
                                <tr key={income.id} className="table-row">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                style={{ background: CATEGORY_COLORS[income.category] || '#6B7280' }}
                                            >
                                                {income.category.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
                                                    {income.source || income.category}
                                                </p>
                                                {income.isRecurring && (
                                                    <span className="badge badge-info text-[10px]">Recurring</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="badge badge-success">{income.category}</span>
                                    </td>
                                    <td className="px-4 py-3.5 hidden md:table-cell">
                                        <span className="text-sm text-slate-600">
                                            {new Date(income.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 hidden lg:table-cell">
                                        <span className="text-sm text-slate-500 truncate max-w-[150px] block">{income.notes || '-'}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-sm font-semibold text-emerald-600">+{formatCurrency(income.amount)}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Link href={`/income/edit/${income.id}`} className="btn-ghost" style={{ height: '2rem', width: '2rem', padding: 0 }}>
                                                <HiOutlinePencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteId(income.id)}
                                                className="btn-ghost"
                                                style={{ height: '2rem', width: '2rem', padding: 0, color: '#DC2626' }}
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative card w-full max-w-sm p-6 z-10">
                        <h3 className="text-base font-semibold text-slate-900 mb-2">Delete Income Record</h3>
                        <p className="text-sm text-slate-600 mb-5">Are you sure? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="btn-danger flex-1">
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
