'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDayName } from '@/utils/dateHelpers';
import { formatCurrency } from '@/utils/formatCurrency';

interface Props {
    data: { date: string; total: number }[];
}

export default function WeeklyBarChart({ data }: Props) {
    const chartData = data.map((d) => ({
        day: getDayName(d.date),
        amount: d.total,
    }));

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(15,15,35,0.95)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                        }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Spent']}
                    />
                    <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                    <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                    </defs>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
