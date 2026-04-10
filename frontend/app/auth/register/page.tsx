"use client";

import { useState } from 'react';
import OTPModal from '../../../components/Auth/OTPModal';
import Link from 'next/link';
import { authService } from '../../../services/authService';
import Toast from '../../../components/UI/Toast';

export default function Register() {
    const [showOTP, setShowOTP] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const validatePassword = (pass: string) => {
        const hasUpperCase = /[A-Z]/.test(pass);
        const hasLowerCase = /[a-z]/.test(pass);
        const hasNumbers = /\d/.test(pass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
        const isValidLength = pass.length >= 8;

        if (!isValidLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecial) {
            return "Password must be at least 8 chars with uppercase, lowercase, number & symbol.";
        }
        return "";
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const error = validatePassword(formData.password);
        if (error) {
            setPasswordError(error);
            return;
        }
        setPasswordError('');

        setIsLoading(true);
        try {
            await authService.sendRegistrationOtp(formData.email);
            setToast({ message: 'OTP sent to your email!', type: 'success' });
            setShowOTP(true);
        } catch (error: any) {
            const emailError = error.response?.data?.email;
            const message = error.response?.data?.message || (Array.isArray(emailError) ? emailError[0] : emailError) || 'Failed to send OTP. Please try again.';

            const normalizedMessage = message.includes('email has already been taken') || message.includes('already registered')
                ? 'This email is already registered. Please login instead.'
                : message;

            setToast({ message: normalizedMessage, type: 'error' });
        } finally {
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
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-400">
                    Get started with your free health analysis
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="glass-card py-10 px-6 shadow-2xl rounded-3xl border border-white/10 sm:px-10">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        {['Name', 'Email', 'Phone', 'Password'].map((field) => (
                            <div key={field}>
                                <label className="block text-sm font-medium text-gray-300 mb-2">{field}</label>
                                <div className="mt-1">
                                    <input
                                        type={field === 'Password' ? 'password' : field === 'Email' ? 'email' : 'text'}
                                        required
                                        className="appearance-none block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl shadow-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white sm:text-sm transition-all"
                                        placeholder={`Enter your ${field.toLowerCase()}`}
                                        onChange={(e) => setFormData({ ...formData, [field.toLowerCase()]: e.target.value })}
                                    />
                                </div>
                            </div>
                        ))}


                        {passwordError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                                {passwordError}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-900/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5"
                            >
                                {isLoading ? 'Creating Account...' : 'Register'}
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
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-medium text-blue-400 hover:text-blue-300">
                            Sign in
                        </Link>
                    </p>
                </div>


                <OTPModal
                    isOpen={showOTP}
                    onClose={() => setShowOTP(false)}
                    data={formData}
                />
            </div>
        </div>
    );
}
