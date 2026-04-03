'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { incomeService } from '@/services/incomeService';
import { IncomeCategory, INCOME_CATEGORIES } from '@/types/income';
import { getToday } from '@/utils/dateHelpers';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

interface FormData {
    amount: number;
    category: IncomeCategory;
    date: string;
    source: string;
    notes: string;
    isRecurring: boolean;
}

export default function AddIncomePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            date: getToday(),
            isRecurring: false,
        },
    });

    const onSubmit = async (data: FormData) => {
        setSubmitting(true);
        setError('');
        try {
            await incomeService.create({
                amount: Number(data.amount),
                category: data.category,
                date: data.date,
                source: data.source || undefined,
                notes: data.notes || undefined,
                isRecurring: Boolean(data.isRecurring),
            });
            router.push('/income');
        } catch {
            setError('Failed to add income. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/income" className="btn-ghost" style={{ width: '2.25rem', padding: 0 }}>
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="page-header">Add Income</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Record a new income entry</p>
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
                                {...register('amount', { required: 'Amount is required', min: { value: 0.01, message: 'Must be positive' } })}
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
                                {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <p className="text-xs text-red-500 mt-1">Category is required</p>}
                        </div>

                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Source</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g. Employer name, Client"
                                {...register('source')}
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
                        <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors w-fit">
                            <input type="checkbox" className="mt-0.5 accent-blue-600" {...register('isRecurring')} />
                            <div>
                                <p className="text-sm font-medium text-slate-900">Recurring Income</p>
                                <p className="text-xs text-slate-500">This income repeats regularly (e.g. salary)</p>
                            </div>
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Link href="/income" className="btn-secondary flex-1 justify-center">Cancel</Link>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1">
                            {submitting ? 'Saving...' : 'Add Income'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
