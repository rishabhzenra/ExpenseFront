'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';

interface Props {
    data: { month: string; total: number }[];
}

export default function MonthlyLineChart({ data }: Props) {
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis
                        dataKey="month"
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
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Total']}
                    />
                    <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4, fill: '#fff' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
