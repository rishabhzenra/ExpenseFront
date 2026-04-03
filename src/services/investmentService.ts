import api from './api';

export interface Investment {
    id: string;
    name: string;
    type: 'stocks' | 'mutual_fund' | 'fixed_deposit' | 'crypto' | 'gold' | 'real_estate' | 'bonds' | 'ppf' | 'other';
    investedAmount: number;
    currentValue: number;
    platform?: string;
    ticker?: string;
    purchaseDate?: string;
    notes?: string;
    isActive: boolean;
    userId: string;
    createdAt: string;
}

export interface PortfolioSummary {
    totalInvested: number;
    totalCurrent: number;
    totalGain: number;
    gainPct: number;
    count: number;
    byType: Record<string, { invested: number; current: number; count: number }>;
}

export const investmentService = {
    findAll: () => api.get<Investment[]>('/investments'),
    findOne: (id: string) => api.get<Investment>(`/investments/${id}`),
    create: (data: Partial<Investment>) => api.post<Investment>('/investments', data),
    update: (id: string, data: Partial<Investment>) => api.patch<Investment>(`/investments/${id}`, data),
    delete: (id: string) => api.delete(`/investments/${id}`),
    getSummary: () => api.get<PortfolioSummary>('/investments/summary'),
};
