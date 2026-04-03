'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { expenseService } from '@/services/expenseService';
import { ExpenseCategory, EXPENSE_CATEGORIES } from '@/types/expense';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

interface FormData {
    amount: number;
    category: ExpenseCategory;
    isNecessary: boolean;
    date: string;
    merchant: string;
    notes: string;
    isRecurring: boolean;
    isTaxDeductible: boolean;
}

export default function EditExpensePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

    useEffect(() => {
        expenseService.getAll()
            .then(res => {
                const expense = res.data.find((e: any) => e.id === id);
                if (expense) {
                    reset({
                        amount: expense.amount,
                        category: expense.category,
                        isNecessary: expense.isNecessary,
                        date: expense.date,
                        merchant: expense.merchant || '',
                        notes: expense.notes || '',
                        isRecurring: expense.isRecurring || false,
                        isTaxDeductible: expense.isTaxDeductible || false,
                    });
                }
            })
            .finally(() => setLoading(false));
    }, [id, reset]);

    const onSubmit = async (data: FormData) => {
        setSubmitting(true);
        setError('');
        try {
            await expenseService.update(id, {
                amount: Number(data.amount),
                category: data.category,
                isNecessary: Boolean(data.isNecessary),
                date: data.date,
                merchant: data.merchant || undefined,
                notes: data.notes || undefined,
                isRecurring: Boolean(data.isRecurring),
                isTaxDeductible: Boolean(data.isTaxDeductible),
            } as any);
            router.push('/expenses');
        } catch {
            setError('Failed to update expense. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                <div className="card p-6 space-y-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-9 w-full" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/expenses" className="btn-ghost" style={{ width: '2.25rem', padding: 0 }}>
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="page-header">Edit Expense</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Update transaction details</p>
                </div>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Amount *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="input-field"
                                placeholder="0.00"
                                {...register('amount', { required: 'Amount is required' })}
                            />
                            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Date *</label>
                            <input
                                type="date"
                                className="input-field"
                                {...register('date', { required: 'Date is required' })}
                            />
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Category *</label>
                            <select className="select-field" {...register('category', { required: true })}>
                                <option value="">Select category</option>
                                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Merchant / Store</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Amazon, Starbucks"
                                {...register('merchant')}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="label">Notes</label>
                            <textarea
                                className="textarea-field"
                                rows={2}
                                placeholder="Optional notes..."
                                {...register('notes')}
                            />
                        </div>
                    </div>

                    <div className="pt-1" style={{ borderTop: '1px solid #F1F5F9' }}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Flags</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { name: 'isNecessary' as const, label: 'Essential', desc: 'Necessary expense' },
                                { name: 'isRecurring' as const, label: 'Recurring', desc: 'Happens regularly' },
                                { name: 'isTaxDeductible' as const, label: 'Tax Deductible', desc: 'Can claim tax' },
                            ].map(({ name, label, desc }) => (
                                <label key={name} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input type="checkbox" className="mt-0.5 accent-blue-600" {...register(name)} />
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{label}</p>
                                        <p className="text-xs text-slate-500">{desc}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Link href="/expenses" className="btn-secondary flex-1 justify-center">Cancel</Link>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1">
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
