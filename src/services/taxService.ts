import api from './api';

export interface TaxEntry {
    id: string;
    title: string;
    category: 'income_tax' | 'gst' | 'tds' | 'advance_tax' | 'property_tax' | 'other';
    status: 'pending' | 'paid' | 'overdue' | 'filed';
    amount: number;
    dueDate?: string;
    paidDate?: string;
    notes?: string;
    financialYear?: string;
    referenceNumber?: string;
    userId: string;
    createdAt: string;
}

export interface TaxSummary {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
    totalLiability: number;
    totalPaid: number;
    pendingAmount: number;
}

export const taxService = {
    findAll: () => api.get<TaxEntry[]>('/tax'),
    findOne: (id: string) => api.get<TaxEntry>(`/tax/${id}`),
    create: (data: Partial<TaxEntry>) => api.post<TaxEntry>('/tax', data),
    update: (id: string, data: Partial<TaxEntry>) => api.patch<TaxEntry>(`/tax/${id}`, data),
    delete: (id: string) => api.delete(`/tax/${id}`),
    getSummary: () => api.get<TaxSummary>('/tax/summary'),
};
