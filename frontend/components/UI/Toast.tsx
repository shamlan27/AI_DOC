"use client";

import { useEffect, useState } from 'react';

type ToastProps = {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
};

export default function Toast({ message, type, onClose }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${type === 'success'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                } backdrop-blur-md`}>
                <span className="text-xl">
                    {type === 'success' ? '✅' : '⚠️'}
                </span>
                <p className="font-medium text-sm">{message}</p>
                <button onClick={() => setIsVisible(false)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
            </div>
        </div>
    );
}
