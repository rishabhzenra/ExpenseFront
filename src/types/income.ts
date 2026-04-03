export type IncomeCategory = 'Salary' | 'Freelance' | 'Business' | 'Investment' | 'Rental' | 'Bonus' | 'Other';

export interface Income {
    id: string;
    userId: string;
    amount: number;
    category: IncomeCategory;
    notes?: string;
    source?: string;
    isRecurring: boolean;
    date: string;
    createdAt: string;
}

export interface CreateIncomeDto {
    amount: number;
    category: IncomeCategory;
    date: string;
    notes?: string;
    source?: string;
    isRecurring?: boolean;
}

export interface IncomeAnalytics {
    thisMonthTotal: number;
    lastMonthTotal: number;
    trend: number;
    categoryBreakdown: { category: string; total: number }[];
    monthlyBreakdown: { month: string; total: number }[];
}

export const INCOME_CATEGORIES: IncomeCategory[] = [
    'Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Bonus', 'Other'
];
