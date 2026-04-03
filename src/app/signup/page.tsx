'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';

interface FormData { name: string; email: string; password: string; confirmPassword: string; }

export default function SignupPage() {
    const { signup } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
    const password = watch('password');

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        setError('');
        try {
            await signup(data.email, data.password, data.name);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left - Branding */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 flex-col p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />

                <div className="relative z-10 flex flex-col h-full">
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
                            Start your financial<br />journey today.
                        </h1>
                        <p className="text-blue-100 text-base leading-relaxed mb-10">
                            Join Savora and get complete visibility over your money — income, expenses, budgets, goals, and insightful reports.
                        </p>
                        <div className="space-y-3">
                            {[
                                'Track expenses across 6+ categories',
                                'Log income from multiple sources',
                                'Set and monitor monthly budgets',
                                'Create savings goals and milestones',
                                'View detailed financial analytics',
                                'Generate monthly and annual reports',
                            ].map((f, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <span className="text-blue-100 text-sm">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-blue-200 text-xs mt-10">Trusted by individuals and small businesses.</p>
                </div>
            </div>

            {/* Right - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-[380px]">
                    <div className="flex items-center gap-2.5 mb-8 lg:hidden">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5"/>
                                <path d="M10 6.5v4l2.5 2.5" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <span className="font-bold text-slate-900 text-lg">Savora</span>
                    </div>

                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
                        <p className="text-slate-500 mt-1.5 text-sm">Get started with Savora — it's free</p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="label">Full Name *</label>
                            <input type="text" className="input-field" placeholder="Rishabh Joshi"
                                {...register('name', { required: 'Name is required' })} />
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="label">Email address *</label>
                            <input type="email" className="input-field" placeholder="you@example.com"
                                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/, message: 'Invalid email' } })} />
                            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="label">Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input-field pr-10"
                                    placeholder="Minimum 6 characters"
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters required' } })}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <HiOutlineEyeSlash className="w-4 h-4" /> : <HiOutlineEye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="label">Confirm Password *</label>
                            <input type="password" className="input-field" placeholder="Repeat your password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: v => v === password || 'Passwords do not match',
                                })} />
                            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full" style={{ height: '2.625rem', borderRadius: '0.625rem' }}>
                            {loading ? 'Creating account...' : 'Create Savora Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
