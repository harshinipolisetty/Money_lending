import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/AuthLayout';

const schema = z.object({
    name: z.string().min(2, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    phone: z.string().optional(),
    upiId: z.string().optional(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

const fieldClass =
    'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/15';

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            await registerUser(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            brandSide="right"
            headline="One place for every rupee you lent or owe."
            description="Borrow requests, lender approvals, repayment confirmations and shareable UPI QR codes."
        >
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-950">
                Create your account
            </h1>
            <p className="mt-2 text-sm text-gray-500">
                Add UPI details to generate your payment QR code.
            </p>

            {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label className="text-sm font-medium text-gray-800" htmlFor="name">Full name</label>
                    <input id="name" placeholder="Aarav Mehta" className={fieldClass} {...register('name')} />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-800" htmlFor="email">Email</label>
                    <input id="email" type="email" placeholder="you@mail.com" className={fieldClass} {...register('email')} />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm font-medium text-gray-800" htmlFor="phone">Phone (optional)</label>
                        <input id="phone" placeholder="98765 43210" className={fieldClass} {...register('phone')} />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-800" htmlFor="upiId">UPI ID (optional)</label>
                        <input id="upiId" placeholder="aarav@okaxis" className={fieldClass} {...register('upiId')} />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-800" htmlFor="password">Password</label>
                    <input id="password" type="password" className={fieldClass} {...register('password')} />
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full rounded-xl bg-emerald-900 py-3.5 text-[15px] font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                >
                    {isLoading ? 'Creating...' : 'Create account'}
                </button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-500">
                Already registered?{' '}
                <Link to="/login" className="font-semibold text-emerald-800 hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Register;
