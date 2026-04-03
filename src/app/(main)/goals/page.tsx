'use client';

import { useEffect, useState, useCallback } from 'react';
import { goalService, SavingsGoal } from '@/services/goalService';
import { formatCurrency } from '@/utils/formatCurrency';
import {
    HiOutlinePlusCircle, HiOutlineXMark, HiOutlinePencil, HiOutlineTrash,
    HiOutlineTrophy, HiOutlineCalendarDays, HiOutlineCheckCircle,
    HiOutlineCurrencyDollar,
} from 'react-icons/hi2';

function daysLeft(deadline?: string): number | null {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function GoalCard({
    goal,
    onEdit,
    onDelete,
    onDeposit,
}: {
    goal: SavingsGoal;
    onEdit: (g: SavingsGoal) => void;
    onDelete: (id: string) => void;
    onDeposit: (g: SavingsGoal) => void;
}) {
    const pct = goal.target > 0 ? Math.min(100, (goal.current / goal.target) * 100) : 0;
    const left = goal.target - goal.current;
    const days = daysLeft(goal.deadline);
    const done = pct >= 100;

    return (
        <div className="card p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${done ? 'bg-emerald-100' : 'bg-blue-50'}`}>
                        {done
                            ? <HiOutlineCheckCircle className="w-5 h-5 text-emerald-600" />
                            : <HiOutlineTrophy className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">{goal.title}</h3>
                        {done && <span className="badge badge-success text-[10px]">Achieved</span>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => onEdit(goal)} className="btn-ghost" style={{ width: '2rem', height: '2rem', padding: 0 }}>
                        <HiOutlinePencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(goal.id)} className="btn-ghost" style={{ width: '2rem', height: '2rem', padding: 0, color: '#DC2626' }}>
                        <HiOutlineTrash className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress bar */}
            <div>
                <div className="flex items-end justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Progress</span>
                    <span className="text-sm font-bold text-slate-900">{Math.round(pct)}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: done ? '#059669' : '#2563EB' }}
                    />
                </div>
            </div>

            {/* Amount info */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 mb-0.5">Saved</p>
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(goal.current)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 mb-0.5">Target</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(goal.target)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                    <p className="text-[10px] text-slate-500 mb-0.5">Remaining</p>
                    <p className={`text-sm font-bold ${done ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {done ? 'Done!' : formatCurrency(left)}
                    </p>
                </div>
            </div>

            {/* Deadline */}
            {goal.deadline && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <HiOutlineCalendarDays className="w-3.5 h-3.5" />
                    <span>
                        Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        {days !== null && !done && (
                            <span className={`ml-1 font-medium ${days < 0 ? 'text-red-500' : days < 30 ? 'text-amber-500' : 'text-slate-600'}`}>
                                ({days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`})
                            </span>
                        )}
                    </span>
                </div>
            )}

            {!done && (
                <button onClick={() => onDeposit(goal)} className="btn-secondary w-full" style={{ fontSize: '0.8125rem' }}>
                    <HiOutlineCurrencyDollar className="w-4 h-4" />
                    Add Funds
                </button>
            )}
        </div>
    );
}

interface GoalForm { title: string; target: string; current: string; deadline: string; }
const emptyForm: GoalForm = { title: '', target: '', current: '0', deadline: '' };

export default function GoalsPage() {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState<'create' | 'edit' | 'deposit' | null>(null);
    const [form, setForm] = useState<GoalForm>(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [deposit, setDeposit] = useState('');
    const [depositGoal, setDepositGoal] = useState<SavingsGoal | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await goalService.findAll();
            setGoals(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const openCreate = () => { setForm(emptyForm); setEditId(null); setModal('create'); };
    const openEdit = (g: SavingsGoal) => {
        setForm({ title: g.title, target: String(g.target), current: String(g.current), deadline: g.deadline || '' });
        setEditId(g.id);
        setModal('edit');
    };
    const openDeposit = (g: SavingsGoal) => { setDepositGoal(g); setDeposit(''); setModal('deposit'); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = {
                title: form.title,
                target: parseFloat(form.target),
                current: parseFloat(form.current || '0'),
                deadline: form.deadline || undefined,
            };
            if (editId) await goalService.update(editId, data);
            else await goalService.create(data);
            setModal(null);
            load();
        } finally {
            setSaving(false);
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!depositGoal || !deposit) return;
        setSaving(true);
        try {
            const newAmount = Math.min(depositGoal.target, depositGoal.current + parseFloat(deposit));
            await goalService.update(depositGoal.id, { current: newAmount });
            setModal(null);
            load();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        await goalService.delete(id);
        setDeleteId(null);
        load();
    };

    const totalSaved = goals.reduce((s, g) => s + g.current, 0);
    const totalTarget = goals.reduce((s, g) => s + g.target, 0);
    const achieved = goals.filter(g => g.current >= g.target).length;

    return (
        <div className="p-6 lg:p-8 max-w-[1100px] mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="page-header">Savings Goals</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Track and achieve your financial milestones</p>
                </div>
                <button onClick={openCreate} className="btn-primary">
                    <HiOutlinePlusCircle className="w-4 h-4" />
                    New Goal
                </button>
            </div>

            {/* Summary Cards */}
            {goals.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Goals', value: String(goals.length), color: 'text-slate-900' },
                        { label: 'Total Saved', value: formatCurrency(totalSaved), color: 'text-emerald-600' },
                        { label: 'Total Target', value: formatCurrency(totalTarget), color: 'text-blue-600' },
                        { label: 'Goals Achieved', value: `${achieved} / ${goals.length}`, color: achieved > 0 ? 'text-emerald-600' : 'text-slate-700' },
                    ].map(s => (
                        <div key={s.label} className="card p-4">
                            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Goals Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-64 w-full rounded-xl" />)}
                </div>
            ) : goals.length === 0 ? (
                <div className="card p-16 text-center">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HiOutlineTrophy className="w-8 h-8 text-blue-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">No Goals Yet</h2>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                        Create savings goals to track your progress toward financial milestones — emergency fund, vacation, down payment, and more.
                    </p>
                    <button onClick={openCreate} className="btn-primary">Create Your First Goal</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals.map(g => (
                        <GoalCard key={g.id} goal={g} onEdit={openEdit} onDelete={id => setDeleteId(id)} onDeposit={openDeposit} />
                    ))}
                </div>
            )}

            {/* Create / Edit Modal */}
            {(modal === 'create' || modal === 'edit') && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModal(null)} />
                    <div className="relative card w-full max-w-md p-6 z-10">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-slate-900">{modal === 'create' ? 'New Savings Goal' : 'Edit Goal'}</h3>
                            <button onClick={() => setModal(null)} className="btn-ghost" style={{ width: '2rem', height: '2rem', padding: 0 }}>
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="label">Goal Name *</label>
                                <input type="text" required className="input-field" placeholder="e.g. Emergency Fund, Vacation"
                                    value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Target Amount *</label>
                                    <input type="number" min="1" required className="input-field" placeholder="0.00"
                                        value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label">Already Saved</label>
                                    <input type="number" min="0" className="input-field" placeholder="0.00"
                                        value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="label">Target Date (optional)</label>
                                <input type="date" className="input-field"
                                    value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
                            </div>
                            <div className="flex gap-3 pt-1">
                                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : modal === 'create' ? 'Create Goal' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deposit Modal */}
            {modal === 'deposit' && depositGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModal(null)} />
                    <div className="relative card w-full max-w-sm p-6 z-10">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-slate-900">Add Funds to Goal</h3>
                            <button onClick={() => setModal(null)} className="btn-ghost" style={{ width: '2rem', height: '2rem', padding: 0 }}>
                                <HiOutlineXMark className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                            <p className="text-sm font-medium text-blue-800">{depositGoal.title}</p>
                            <p className="text-xs text-blue-600 mt-0.5">
                                {formatCurrency(depositGoal.current)} saved of {formatCurrency(depositGoal.target)}
                            </p>
                        </div>
                        <form onSubmit={handleDeposit} className="space-y-4">
                            <div>
                                <label className="label">Amount to Add *</label>
                                <input type="number" min="1" required className="input-field" placeholder="0.00"
                                    value={deposit} onChange={e => setDeposit(e.target.value)} autoFocus />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : 'Add Funds'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative card w-full max-w-sm p-6 z-10">
                        <h3 className="text-base font-semibold text-slate-900 mb-2">Delete Goal</h3>
                        <p className="text-sm text-slate-600 mb-5">Are you sure? This will permanently delete this savings goal.</p>
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
