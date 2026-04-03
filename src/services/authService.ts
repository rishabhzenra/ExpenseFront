import api from './api';
import { AuthResponse } from '@/types/user';

export const authService = {
    signup: (email: string, password: string, name?: string) =>
        api.post<AuthResponse>('/auth/signup', { email, password, name }),

    login: (email: string, password: string) =>
        api.post<AuthResponse>('/auth/login', { email, password }),

    logout: () => api.post('/auth/logout'),
};
