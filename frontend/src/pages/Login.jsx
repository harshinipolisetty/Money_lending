import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../components/AuthLayout';

const schema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});

const fieldClass =
    'mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-[15px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/15';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            email: 'lender@test.com',
            password: 'Test@12345'
        }
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        setError('');
        try {
            await login(data.email, data.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout
            brandSide="left"
            headline="Money between friends, without the awkward reminders."
            description="Log what you lent, request loans from people you trust, confirm repayments and settle instantly with UPI QR codes."
        >
            <h1 className="text-4xl font-semibold tracking-tight text-gray-950">Sign in</h1>
            <p className="mt-2 text-sm text-gray-500">
                Try lender@test.com or borrower@test.com
            </p>

            {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-gray-800">Email</label>
                    <input id="email" type="email" className={fieldClass} {...register('email')} />
                    {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-medium text-gray-800">Password</label>
                    <input id="password" type="password" className={fieldClass} {...register('password')} />
                    {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 w-full rounded-xl bg-emerald-900 py-3.5 text-[15px] font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
                No account?{' '}
                <Link to="/register" className="font-semibold text-emerald-800 hover:underline">
                    Create one
                </Link>
            </p>
        </AuthLayout>
    );
};

export default Login;
