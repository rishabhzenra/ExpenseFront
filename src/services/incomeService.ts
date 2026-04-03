import api from './api';
import { Income, CreateIncomeDto, IncomeAnalytics } from '@/types/income';

export const incomeService = {
    findAll: (params?: { startDate?: string; endDate?: string; category?: string }) =>
        api.get<Income[]>('/income', { params }),

    findOne: (id: string) =>
        api.get<Income>(`/income/${id}`),

    create: (dto: CreateIncomeDto) =>
        api.post<Income>('/income', dto),

    update: (id: string, dto: Partial<CreateIncomeDto>) =>
        api.patch<Income>(`/income/${id}`, dto),

    remove: (id: string) =>
        api.delete(`/income/${id}`),

    getAnalytics: () =>
        api.get<IncomeAnalytics>('/income/analytics'),
};
