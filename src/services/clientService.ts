import api from './api';

export interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    address?: string;
    industry?: string;
    status: 'active' | 'inactive' | 'prospect';
    totalBilled: number;
    totalPaid: number;
    notes?: string;
    taxId?: string;
    userId: string;
    createdAt: string;
}

export interface ClientStats {
    total: number;
    active: number;
    totalBilled: number;
    totalPaid: number;
    outstanding: number;
}

export const clientService = {
    findAll: () => api.get<Client[]>('/clients'),
    findOne: (id: string) => api.get<Client>(`/clients/${id}`),
    create: (data: Partial<Client>) => api.post<Client>('/clients', data),
    update: (id: string, data: Partial<Client>) => api.patch<Client>(`/clients/${id}`, data),
    delete: (id: string) => api.delete(`/clients/${id}`),
    getStats: () => api.get<ClientStats>('/clients/stats'),
};
