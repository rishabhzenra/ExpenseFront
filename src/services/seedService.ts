import api from './api';

export const seedService = {
    seed: () => api.post('/seed'),
    clear: () => api.delete('/seed'),
};
