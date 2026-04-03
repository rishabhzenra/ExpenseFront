'use client';

import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFilters, Analytics } from '@/types/expense';
import { expenseService } from '@/services/expenseService';

export function useExpenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExpenses = useCallback(async (filters?: ExpenseFilters) => {
        setLoading(true);
        setError(null);
        try {
            const res = await expenseService.getAll(filters);
            setExpenses(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch expenses');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await expenseService.getAnalytics();
            setAnalytics(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch analytics');
        }
    }, []);

    const addExpense = useCallback(async (data: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
        const res = await expenseService.create(data);
        setExpenses(prev => [res.data, ...prev]);
        return res.data;
    }, []);

    const updateExpense = useCallback(async (id: string, data: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => {
        const res = await expenseService.update(id, data);
        setExpenses(prev => prev.map(e => (e.id === id ? res.data : e)));
        return res.data;
    }, []);

    const deleteExpense = useCallback(async (id: string) => {
        await expenseService.delete(id);
        setExpenses(prev => prev.filter(e => e.id !== id));
    }, []);

    return {
        expenses,
        analytics,
        loading,
        error,
        fetchExpenses,
        fetchAnalytics,
        addExpense,
        updateExpense,
        deleteExpense,
    };
}
