'use client';

import { useState, useCallback } from 'react';
import { Budget } from '@/types/budget';
import { budgetService } from '@/services/budgetService';

export function useBudget() {
    const [budget, setBudget] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBudget = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await budgetService.get();
            setBudget(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch budget');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveBudget = useCallback(async (monthlyLimit: number) => {
        try {
            if (budget?.id) {
                const res = await budgetService.update(monthlyLimit);
                setBudget(prev => prev ? { ...prev, monthlyLimit: res.data.monthlyLimit } : prev);
            } else {
                const res = await budgetService.create(monthlyLimit);
                setBudget(prev => prev ? { ...prev, monthlyLimit: res.data.monthlyLimit } : prev);
            }
            await fetchBudget();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save budget');
            throw err;
        }
    }, [budget, fetchBudget]);

    return { budget, loading, error, fetchBudget, saveBudget };
}
