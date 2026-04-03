import api from './api';
import { Expense, ExpenseFilters, Analytics } from '@/types/expense';

export const expenseService = {
    create: (data: Omit<Expense, 'id' | 'userId' | 'createdAt'>) =>
        api.post<Expense>('/expenses', data),

    getAll: (filters?: ExpenseFilters) =>
        api.get<Expense[]>('/expenses', { params: filters }),

    update: (id: string, data: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) =>
        api.patch<Expense>(`/expenses/${id}`, data),

    delete: (id: string) => api.delete(`/expenses/${id}`),

    getAnalytics: () => api.get<Analytics>('/expenses/analytics'),
};
