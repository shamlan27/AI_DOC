"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../../../services/authService';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth(); // We might need a direct way to set token without full login payload, or fetch user.

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Manually set token
            localStorage.setItem('token', token);

            // Validate token and get user
            authService.getCurrentUser()
                .then(user => {
                    // Force a "login" update in context
                    // We can reload or rely on the context init. 
                    // But context init only runs on mount. 
                    // Best to expose a 'setUser' or trigger a re-check.
                    // For now, simple window reload or redirect to dashboard might work if Context checks LS on page load.
                    window.location.href = '/dashboard';
                })
                .catch(err => {
                    console.error("Social login failed", err);
                    router.push('/auth/login?error=social_failed');
                });
        } else {
            router.push('/auth/login?error=no_token');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="animate-pulse text-blue-400">Authenticating...</p>
            </div>
        </div>
    );
}
