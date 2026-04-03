import api from './api';

export interface SavingsGoal {
    id: string;
    title: string;
    target: number;
    current: number;
    deadline?: string;
    userId: string;
}

export const goalService = {
    findAll: () => api.get<SavingsGoal[]>('/savings-goals'),
    create: (data: Partial<SavingsGoal>) => api.post<SavingsGoal>('/savings-goals', data),
    update: (id: string, data: Partial<SavingsGoal>) => api.patch<SavingsGoal>(`/savings-goals/${id}`, data),
    delete: (id: string) => api.delete(`/savings-goals/${id}`),
};
