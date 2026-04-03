'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useBudget } from '@/hooks/useBudget';
import { formatCurrency } from '@/utils/formatCurrency';
import { seedService } from '@/services/seedService';

export default function SettingsPage() {
    const { user, updateProfile } = useAuth();
    const { budget, fetchBudget, saveBudget } = useBudget();

    const [name, setName] = useState('');
    const [nameSaving, setNameSaving] = useState(false);
    const [nameSaved, setNameSaved] = useState(false);

    const [budgetLimit, setBudgetLimit] = useState('');
    const [budgetSaving, setBudgetSaving] = useState(false);
    const [budgetSaved, setBudgetSaved] = useState(false);

    const [error, setError] = useState('');
    const [seedLoading, setSeedLoading] = useState(false);
    const [seedMsg, setSeedMsg] = useState('');

    useEffect(() => {
        setName(user?.name || '');
        fetchBudget();
    }, [user, fetchBudget]);

    useEffect(() => {
        if (budget?.monthlyLimit) {
            setBudgetLimit(String(budget.monthlyLimit));
        }
    }, [budget]);

    const handleNameSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setNameSaving(true);
        setError('');
        try {
            await updateProfile({ name });
            setNameSaved(true);
            setTimeout(() => setNameSaved(false), 2000);
        } catch {
            setError('Failed to update profile');
        } finally {
            setNameSaving(false);
        }
    };

    const handleBudgetSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!budgetLimit || parseFloat(budgetLimit) <= 0) return;
        setBudgetSaving(true);
        setError('');
        try {
            await saveBudget(parseFloat(budgetLimit));
            setBudgetSaved(true);
            setTimeout(() => setBudgetSaved(false), 2000);
        } catch {
            setError('Failed to update budget');
        } finally {
            setBudgetSaving(false);
        }
    };

    const initials = user?.name
        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() ?? 'FT';

    return (
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="page-header">Settings</h1>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account and preferences</p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {/* Profile Section */}
            <div className="card p-6 mb-5">
                <h2 className="section-title mb-4">Profile</h2>
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-semibold shrink-0">
                        {initials}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{user?.name || 'No name set'}</p>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                </div>
                <form onSubmit={handleNameSave} className="space-y-4">
                    <div>
                        <label className="label">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="input-field"
                            placeholder="Your full name"
                        />
                    </div>
                    <div>
                        <label className="label">Email Address</label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="input-field"
                            style={{ background: '#F8FAFC', color: '#94A3B8', cursor: 'not-allowed' }}
                        />
                        <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                    </div>
                    <button type="submit" disabled={nameSaving} className="btn-primary">
                        {nameSaved ? 'Saved!' : nameSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </form>
            </div>

            {/* Budget Section */}
            <div className="card p-6 mb-5">
                <h2 className="section-title mb-1">Monthly Budget</h2>
                <p className="text-sm text-slate-500 mb-4">Set a spending limit for each month to track your budget utilization</p>

                {budget && (
                    <div className="flex items-center gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-0.5">Current Limit</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(budget.monthlyLimit)}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 mb-0.5">Remaining</p>
                            <p className={`text-lg font-bold ${(budget.remaining ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(Math.abs(budget.remaining ?? 0))}
                                {(budget.remaining ?? 0) < 0 ? ' over' : ''}
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleBudgetSave} className="space-y-4">
                    <div>
                        <label className="label">Monthly Limit</label>
                        <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={budgetLimit}
                            onChange={e => setBudgetLimit(e.target.value)}
                            className="input-field"
                            placeholder="e.g. 50000"
                        />
                    </div>
                    <button type="submit" disabled={budgetSaving} className="btn-primary">
                        {budgetSaved ? 'Saved!' : budgetSaving ? 'Saving...' : budget ? 'Update Budget' : 'Set Budget'}
                    </button>
                </form>
            </div>

            {/* Demo Data Section */}
            <div className="card p-6 mb-5 border border-blue-100">
                <h2 className="section-title mb-1">Demo Data</h2>
                <p className="text-sm text-slate-500 mb-4">Load realistic sample data to showcase all features — expenses, income, goals, clients, invoices, subscriptions, and tax entries. All dummy data can be cleared at any time.</p>
                {seedMsg && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${seedMsg.includes('cleared') ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {seedMsg}
                    </div>
                )}
                <div className="flex gap-3">
                    <button
                        onClick={async () => {
                            setSeedLoading(true); setSeedMsg('');
                            try { const r = await seedService.seed(); setSeedMsg((r.data as any).message); } catch { setSeedMsg('Failed to load demo data'); }
                            finally { setSeedLoading(false); }
                        }}
                        disabled={seedLoading}
                        className="btn-primary">
                        {seedLoading ? 'Loading...' : 'Load Demo Data'}
                    </button>
                    <button
                        onClick={async () => {
                            if (!confirm('Clear all demo data? This will delete all your current data.')) return;
                            setSeedLoading(true); setSeedMsg('');
                            try { const r = await seedService.clear(); setSeedMsg((r.data as any).message); } catch { setSeedMsg('Failed to clear data'); }
                            finally { setSeedLoading(false); }
                        }}
                        disabled={seedLoading}
                        className="btn-danger">
                        Clear All Data
                    </button>
                </div>
            </div>

            {/* App Info */}
            <div className="card p-5">
                <h2 className="section-title mb-3">About</h2>
                <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Application</span>
                        <span className="text-sm font-medium text-slate-900">Savora</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Version</span>
                        <span className="text-sm font-medium text-slate-900">2.0.0</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Stack</span>
                        <span className="text-sm font-medium text-slate-900">Next.js 16 + NestJS 11</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-slate-600">Account Type</span>
                        <span className="badge badge-info">Standard</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
