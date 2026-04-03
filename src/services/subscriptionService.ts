import api from './api';

export interface Subscription {
    id: string;
    name: string;
    description?: string;
    amount: number;
    billingCycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly';
    status: 'active' | 'paused' | 'cancelled';
    category?: string;
    logo?: string;
    nextBillingDate?: string;
    startDate?: string;
    isTrial?: boolean;
    userId: string;
    createdAt: string;
}

export interface SubscriptionAnalytics {
    totalActive: number;
    monthlyTotal: number;
    yearlyTotal: number;
}

export const subscriptionService = {
    findAll: () => api.get<Subscription[]>('/subscriptions'),
    findOne: (id: string) => api.get<Subscription>(`/subscriptions/${id}`),
    create: (data: Partial<Subscription>) => api.post<Subscription>('/subscriptions', data),
    update: (id: string, data: Partial<Subscription>) => api.patch<Subscription>(`/subscriptions/${id}`, data),
    delete: (id: string) => api.delete(`/subscriptions/${id}`),
    getAnalytics: () => api.get<SubscriptionAnalytics>('/subscriptions/analytics'),
};
