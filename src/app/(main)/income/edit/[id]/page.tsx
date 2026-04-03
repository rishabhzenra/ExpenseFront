'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { incomeService } from '@/services/incomeService';
import { IncomeCategory, INCOME_CATEGORIES } from '@/types/income';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

interface FormData {
    amount: number;
    category: IncomeCategory;
    date: string;
    source: string;
    notes: string;
    isRecurring: boolean;
}

export default function EditIncomePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

    useEffect(() => {
        incomeService.findOne(id)
            .then(res => {
                const income = res.data;
                reset({
                    amount: income.amount,
                    category: income.category,
                    date: income.date,
                    source: income.source || '',
                    notes: income.notes || '',
                    isRecurring: income.isRecurring,
                });
            })
            .catch(() => router.push('/income'))
            .finally(() => setLoading(false));
    }, [id, reset, router]);

    const onSubmit = async (data: FormData) => {
        setSubmitting(true);
        setError('');
        try {
            await incomeService.update(id, {
                amount: Number(data.amount),
                category: data.category,
                date: data.date,
                source: data.source || undefined,
                notes: data.notes || undefined,
                isRecurring: Boolean(data.isRecurring),
            });
            router.push('/income');
        } catch {
            setError('Failed to update. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                <div className="card p-6 space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton h-9 w-full" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/income" className="btn-ghost" style={{ width: '2.25rem', padding: 0 }}>
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="page-header">Edit Income</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Update income details</p>
                </div>
            </div>

            <div className="card p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Amount *</label>
                            <input type="number" step="0.01" min="0.01" className="input-field" placeholder="0.00"
                                {...register('amount', { required: true })} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Date *</label>
                            <input type="date" className="input-field" {...register('date', { required: true })} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Category *</label>
                            <select className="select-field" {...register('category', { required: true })}>
                                <option value="">Select category</option>
                                {INCOME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="label">Source</label>
                            <input type="text" className="input-field" placeholder="e.g. Employer name" {...register('source')} />
                        </div>
                        <div className="col-span-2">
                            <label className="label">Notes</label>
                            <textarea className="textarea-field" rows={2} placeholder="Optional notes..." {...register('notes')} />
                        </div>
                    </div>

                    <div className="pt-1" style={{ borderTop: '1px solid #F1F5F9' }}>
                        <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 w-fit">
                            <input type="checkbox" className="mt-0.5 accent-blue-600" {...register('isRecurring')} />
                            <div>
                                <p className="text-sm font-medium text-slate-900">Recurring Income</p>
                                <p className="text-xs text-slate-500">This income repeats regularly</p>
                            </div>
                        </label>
                    </div>

                    {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

                    <div className="flex gap-3 pt-2">
                        <Link href="/income" className="btn-secondary flex-1 justify-center">Cancel</Link>
                        <button type="submit" disabled={submitting} className="btn-primary flex-1">
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
