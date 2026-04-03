'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useExpenses } from '@/hooks/useExpenses';
import { formatCurrency } from '@/utils/formatCurrency';
import { ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';
import {
    HiOutlinePlusCircle,
    HiOutlinePencil,
    HiOutlineTrash,
    HiOutlineFunnel,
    HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

const CATEGORY_COLORS: Record<string, string> = {
    Food: '#3B82F6',
    Travel: '#8B5CF6',
    Bills: '#EF4444',
    Shopping: '#F59E0B',
    Fun: '#10B981',
    Other: '#6B7280',
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ExpensesPage() {
    const { expenses, loading, fetchExpenses, deleteExpense } = useExpenses();
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [necessity, setNecessity] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    useEffect(() => {
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = new Date(year, month, 0).toISOString().split('T')[0];
        fetchExpenses({ startDate, endDate, category: category as ExpenseCategory || undefined, isNecessary: necessity || undefined });
    }, [fetchExpenses, month, year, category, necessity]);

    const filtered = expenses.filter(e =>
        !search ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        (e.merchant || '').toLowerCase().includes(search.toLowerCase()) ||
        (e.notes || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalFiltered = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

    const handleDelete = async (id: string) => {
        await deleteExpense(id);
        setDeleteId(null);
    };

    const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

    return (
        <div className="p-6 lg:p-8 max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="page-header">Expenses</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track and manage your spending</p>
                </div>
                <Link href="/expenses/add" className="btn-primary">
                    <HiOutlinePlusCircle className="w-4 h-4" />
                    Add Expense
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="card p-4 mb-5">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search expenses..."
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
                        {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={necessity} onChange={e => setNecessity(e.target.value)} className="select-field" style={{ width: 'auto', minWidth: '130px' }}>
                        <option value="">All Types</option>
                        <option value="true">Essential</option>
                        <option value="false">Optional</option>
                    </select>
                </div>
            </div>

            {/* Summary Row */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{filtered.length}</span> transactions
                </p>
                <p className="text-sm text-slate-600">
                    Total: <span className="font-semibold text-red-600">{formatCurrency(totalFiltered)}</span>
                </p>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
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
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <HiOutlineFunnel className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium mb-1">No expenses found</p>
                        <p className="text-slate-400 text-sm mb-4">Try adjusting filters or add a new expense</p>
                        <Link href="/expenses/add" className="btn-primary inline-flex">Add Expense</Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/60">
                                <th className="table-header text-left px-5 py-3">Description</th>
                                <th className="table-header text-left px-4 py-3">Category</th>
                                <th className="table-header text-left px-4 py-3 hidden md:table-cell">Date</th>
                                <th className="table-header text-left px-4 py-3 hidden lg:table-cell">Type</th>
                                <th className="table-header text-right px-5 py-3">Amount</th>
                                <th className="table-header px-4 py-3 w-20"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((expense) => (
                                <tr key={expense.id} className="table-row">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                style={{ background: CATEGORY_COLORS[expense.category] || '#6B7280' }}
                                            >
                                                {expense.category.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
                                                    {expense.merchant || expense.category}
                                                </p>
                                                {expense.notes && (
                                                    <p className="text-xs text-slate-400 truncate max-w-[160px]">{expense.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <span className="badge badge-neutral">{expense.category}</span>
                                    </td>
                                    <td className="px-4 py-3.5 hidden md:table-cell">
                                        <span className="text-sm text-slate-600">
                                            {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 hidden lg:table-cell">
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <span className={`badge ${expense.isNecessary ? 'badge-info' : 'badge-warning'}`}>
                                                {expense.isNecessary ? 'Essential' : 'Optional'}
                                            </span>
                                            {expense.isRecurring && <span className="badge badge-purple">Recurring</span>}
                                            {expense.isTaxDeductible && <span className="badge badge-success">Tax</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3.5 text-right">
                                        <span className="text-sm font-semibold text-red-600">{formatCurrency(expense.amount)}</span>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Link href={`/expenses/edit/${expense.id}`} className="btn-ghost" style={{ height: '2rem', width: '2rem', padding: 0 }}>
                                                <HiOutlinePencil className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => setDeleteId(expense.id)}
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

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative card w-full max-w-sm p-6 z-10">
                        <h3 className="text-base font-semibold text-slate-900 mb-2">Delete Expense</h3>
                        <p className="text-sm text-slate-600 mb-5">Are you sure? This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">Cancel</button>
                            <button onClick={() => handleDelete(deleteId)} className="btn-danger flex-1">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
