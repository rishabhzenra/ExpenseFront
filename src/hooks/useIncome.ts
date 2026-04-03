import { useState, useCallback } from 'react';
import { incomeService } from '@/services/incomeService';
import { Income, IncomeAnalytics } from '@/types/income';

export function useIncome() {
    const [incomes, setIncomes] = useState<Income[]>([]);
    const [analytics, setAnalytics] = useState<IncomeAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchIncomes = useCallback(async (params?: { startDate?: string; endDate?: string; category?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const res = await incomeService.findAll(params);
            setIncomes(res.data);
        } catch {
            setError('Failed to load income records');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await incomeService.getAnalytics();
            setAnalytics(res.data);
        } catch {
            setError('Failed to load income analytics');
        }
    }, []);

    return { incomes, analytics, loading, error, fetchIncomes, fetchAnalytics };
}
