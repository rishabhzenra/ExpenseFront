'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';

interface Props {
    data: { category: string; total: number }[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

export default function CategoryBreakdown({ data }: Props) {
    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="category"
                        type="category"
                        stroke="rgba(255,255,255,0.3)"
                        fontSize={9}
                        fontWeight={700}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#050510',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            fontFamily: 'var(--font-dm-sans)',
                        }}
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        labelStyle={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(value) => [formatCurrency(Number(value)), 'Total']}
                    />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={12}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
