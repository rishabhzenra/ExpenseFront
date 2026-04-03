'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';

interface Props {
    data: { date: string; total: number }[];
}

export default function WeeklyLineChart({ data }: Props) {
    const chartData = data.map((d) => ({
        date: new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' }),
        amount: d.total,
    }));

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={10}
                        fontWeight={600}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="rgba(255,255,255,0.2)"
                        fontSize={10}
                        fontWeight={600}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#050510',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            fontFamily: 'var(--font-dm-sans)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value) => [formatCurrency(Number(value)), '']}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4, fill: '#fff' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
