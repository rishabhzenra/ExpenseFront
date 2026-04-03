import api from './api';
import { Budget } from '@/types/budget';

export const budgetService = {
    get: () => api.get<Budget>('/budget'),

    create: (monthlyLimit: number) =>
        api.post<Budget>('/budget', { monthlyLimit }),

    update: (monthlyLimit: number) =>
        api.patch<Budget>('/budget', { monthlyLimit }),
};
