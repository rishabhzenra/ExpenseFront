export interface Budget {
    id: string | null;
    monthlyLimit: number;
    totalSpent: number;
    remaining: number;
    savings: number;
}
