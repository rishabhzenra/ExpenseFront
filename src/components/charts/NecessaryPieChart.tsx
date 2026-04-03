'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '@/utils/formatCurrency';

interface Props {
    data: { name: string; value: number }[];
}

const COLORS = ['#6366f1', '#10b981'];

export default function NecessaryPieChart({ data }: Props) {
    return (
        <div className="w-full h-full pb-4">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            background: '#050510',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px',
                            fontFamily: 'var(--font-dm-sans)',
                        }}
                        itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                        formatter={(value) => formatCurrency(Number(value))}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
