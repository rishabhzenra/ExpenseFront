import api from './api';

export interface InvoiceItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    clientId?: string;
    clientName?: string;
    clientEmail?: string;
    clientAddress?: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    issueDate: string;
    dueDate?: string;
    items?: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes?: string;
    currency?: string;
    paidDate?: string;
    userId: string;
    createdAt: string;
}

export interface InvoiceStats {
    total: number;
    draft: number;
    sent: number;
    paid: number;
    overdue: number;
    totalValue: number;
    paidValue: number;
    outstanding: number;
}

export const invoiceService = {
    findAll: () => api.get<Invoice[]>('/invoices'),
    findOne: (id: string) => api.get<Invoice>(`/invoices/${id}`),
    create: (data: Partial<Invoice>) => api.post<Invoice>('/invoices', data),
    update: (id: string, data: Partial<Invoice>) => api.patch<Invoice>(`/invoices/${id}`, data),
    delete: (id: string) => api.delete(`/invoices/${id}`),
    getStats: () => api.get<InvoiceStats>('/invoices/stats'),
};
