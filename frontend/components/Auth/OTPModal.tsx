"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Toast from '../UI/Toast';

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        name: string;
        email: string;
        phone: string;
        password: string;
    };
}

export default function OTPModal({ isOpen, onClose, data }: OTPModalProps) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const { register } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            inputRefs.current[0]?.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        setIsLoading(true);
        const otpString = otp.join('');

        try {
            await register({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password
            }, otpString);
            setToast({ message: 'Registration successful! Redirecting...', type: 'success' });
            setTimeout(() => {
                onClose();
                router.push('/dashboard');
            }, 1000);
        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Invalid OTP or Registration Failed';
            setToast({ message: 'Verification failed: ' + message, type: 'error' });
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="glass-card rounded-3xl w-full max-w-md overflow-hidden p-8 text-center border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                    🔐
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">Verify OTP</h3>
                <p className="text-sm text-gray-400 mb-8">
                    We sent a code to <span className="font-bold text-blue-400">{data.email}</span>
                </p>

                <div className="flex justify-center gap-3 mb-8">
                    {otp.map((value, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            className="w-12 h-14 text-center bg-black/40 border border-white/20 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xl font-bold text-white outline-none transition-all"
                            type="text"
                            name="otp"
                            maxLength={1}
                            value={value}
                            onChange={(e) => handleChange(e.target, index)}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                        />
                    ))}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={isLoading || otp.join("").length !== 6}
                    className={`w-full py-3.5 rounded-xl text-white font-bold transition-all shadow-lg shadow-blue-900/20 ${isLoading || otp.join("").length !== 6
                        ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-500'
                        }`}
                >
                    {isLoading ? 'Verifying...' : 'Verify & Proceed'}
                </button>

                <p className="mt-6 text-xs text-gray-500">
                    Didn&apos;t receive code? <button className="text-blue-400 hover:text-white transition-colors font-bold">Resend in 30s</button>
                </p>
            </div>
        </div>
    );
}
