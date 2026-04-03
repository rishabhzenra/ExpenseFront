export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export function formatShortDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    });
}

export function getToday(): string {
    return new Date().toISOString().split('T')[0];
}

export function getDayName(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', { weekday: 'short' });
}

export function getMonthName(monthStr: string): string {
    const [year, month] = monthStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-IN', {
        month: 'short',
    });
}
