export enum ExpenseCategory {
    FOOD = 'Food',
    TRAVEL = 'Travel',
    BILLS = 'Bills',
    SHOPPING = 'Shopping',
    FUN = 'Fun',
    OTHER = 'Other',
}

export interface Expense {
    id: string;
    userId: string;
    amount: number;
    category: ExpenseCategory;
    isNecessary: boolean;
    notes?: string;
    merchant?: string;
    isRecurring?: boolean;
    isTaxDeductible?: boolean;
    date: string;
    createdAt: string;
}

export interface ExpenseFilters {
    startDate?: string;
    endDate?: string;
    category?: ExpenseCategory;
    isNecessary?: string;
}

export interface Analytics {
    spentToday: number;
    spentThisWeek: number;
    spentThisMonth: number;
    spentLastWeek: number;
    spentLastMonth: number;
    weekTrend: number;
    monthTrend: number;
    healthScore: number;
    insights: string[];
    categoryBreakdown: { category: string; total: number }[];
    necessaryBreakdown: { isNecessary: boolean; total: number }[];
    dailyBreakdown: { date: string; total: number }[];
    monthlyBreakdown: { month: string; total: number }[];
}

export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);
