import api from './api';
import { User } from '@/types/user';

export const userService = {
    updateProfile: (data: Partial<User>) =>
        api.patch<User>('/users/profile', data),
};
