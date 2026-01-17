"use client";

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '../../../services/authService';
import Toast from '../../../components/UI/Toast';

export default function Login() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login({ email, password });
            setToast({ message: 'Welcome back!', type: 'success' });
            setTimeout(() => {
                router.push('/dashboard');
            }, 500);
        } catch (error) {
            console.error('Login failed:', error);
            setToast({ message: 'We couldn\'t find an account with those details.', type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col justify-center py-12 pt-24 sm:px-6 lg:px-8 relative overflow-hidden">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
                <Link href="/" className="flex justify-center mb-6 group">
                    <div className="h-20 w-20 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-900/20 group-hover:scale-105 transition-all p-2">
                        <img
                            src="/logo.jpg"
                            alt="AI Doc"
                            className="h-full w-full object-contain"
                        />
                    </div>
                </Link>
                <h2 className="text-center text-3xl font-bold text-white tracking-tight">
                    Welcome Back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Sign in to access your AI health dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card py-10 px-6 shadow-2xl rounded-3xl border border-white/10 sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white sm:text-sm transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white sm:text-sm transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-black/40"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/auth/forgot-password" className="font-medium text-blue-400 hover:text-blue-300">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-900/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5"
                            >
                                {isLoading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#0C1221] text-gray-500 rounded-full">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                className="w-full flex justify-center py-3 px-4 border border-white/10 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-white/5 hover:bg-white/10 focus:outline-none transition-colors"
                                onClick={() => authService.socialLogin('google')}
                                type="button"
                            >
                                <img className="h-5 w-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                                Google
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link href="/auth/register" className="font-medium text-blue-400 hover:text-blue-300">
                            Create a new account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
