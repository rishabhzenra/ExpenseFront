'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

interface FormData { email: string; password: string; }

const features = [
    { title: 'Smart Expense Tracking', desc: 'Log and categorize every rupee you spend.' },
    { title: 'Income Management', desc: 'Track all your income sources in one place.' },
    { title: 'Budget Planning', desc: 'Set limits and get alerts when nearing them.' },
    { title: 'Savings Goals', desc: 'Define goals and monitor progress visually.' },
    { title: 'Financial Reports', desc: 'Monthly & yearly summaries at a glance.' },
];

export default function LoginPage() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');
        try {
            await login(data.email, data.password);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loginAsDemo = () => {
        const demoUser = { id: 'demo', name: 'Demo User', email: 'demo@savora.app' };
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('demoMode', 'true');
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen flex">
            {/* Left - Branding */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex-col p-12 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5" />
                                <path d="M10 6.5v4l2.5 2.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg leading-none">Savora</p>
                            <p className="text-blue-200 text-xs mt-0.5">Finance Tracker</p>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                            Take control of<br />your money.
                        </h1>
                        <p className="text-blue-100 text-base leading-relaxed mb-10">
                            Savora brings all your finances into one place — expenses, income, budgets, and goals — so you always know where you stand.
                        </p>

                        <div className="space-y-4">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{f.title}</p>
                                        <p className="text-blue-200 text-xs mt-0.5">{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-blue-200 text-xs mt-10">For individuals, freelancers, and small businesses.</p>
                </div>
            </div>

            {/* Right - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-[380px]">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5"/>
                                <path d="M10 6.5v4l2.5 2.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="font-bold text-slate-900 text-lg">Savora</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Sign in to your Savora account</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label">Email address</label>
                            <input type="email" className="input-field" placeholder="you@example.com"
                                {...register('email', { required: 'Email is required' })} />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-10"
                                    placeholder="Your password"
                                    {...register('password', { required: 'Password is required' })}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full" style={{ height: '2.625rem', borderRadius: '0.625rem' }}>
                            {loading ? 'Signing in...' : 'Sign in to Savora'}
                        </button>
                    </form>

                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="bg-slate-50 px-3 text-slate-400 font-medium">or</span>
                        </div>
                    </div>

                    <button
                        onClick={loginAsDemo}
                        className="w-full flex items-center justify-center gap-2.5 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-[0.625rem] transition-colors"
                        style={{ height: '2.625rem' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                            <circle cx="10" cy="10" r="7" stroke="#2563EB" strokeWidth="1.75"/>
                            <path d="M10 6.5v4l2.5 2.5" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Try Demo — No signup needed
                    </button>

                    <p className="text-center text-[11px] text-slate-400 mt-2">
                        Demo account is pre-filled with sample data
                    </p>

                    <p className="text-center text-sm text-slate-500 mt-5">
                        New to Savora?{' '}
                        <Link href="/signup" className="text-blue-600 font-semibold hover:text-blue-700">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
