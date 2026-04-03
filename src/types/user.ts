export interface User {
    id: string;
    email: string;
    name?: string;
    isVerified?: boolean;
    is2FAEnabled?: boolean;
}

export interface AuthResponse {
    user?: User;
    userId?: string;
    require2FA?: boolean;
    message?: string;
}
