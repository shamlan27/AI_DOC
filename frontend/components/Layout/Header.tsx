"use client";

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import NextImage from 'next/image';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navItems = [
        { name: 'Home', href: '/' },
        { name: 'Find a Doctor', href: '/#symptom-analyzer' },
        { name: 'Report Analyzer', href: '/#report-analyzer' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative h-16 w-60 overflow-hidden group-hover:opacity-80 transition-opacity">
                                <NextImage
                                    src="/header-logo-v2.png"
                                    alt="AI Doc Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`text-sm font-medium transition-colors duration-200 ${pathname === item.href ? 'text-blue-400' : 'text-gray-300 hover:text-white'
                                    }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link href="/emergency" className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 font-medium text-sm animate-pulse hover:animate-none">
                            <span>🚨</span> Emergency
                        </Link>

                        {user ? (
                            <div className="relative ml-2">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-3 focus:outline-none"
                                >
                                    <div className="text-right hidden lg:block">
                                        <p className="text-xs text-blue-400 font-medium">Hello,</p>
                                        <p className="text-sm text-white font-bold">{user.name}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20 transition-transform hover:scale-105">
                                        {user.name.charAt(0)}
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <>
                                        {/* Backdrop to close on click outside */}
                                        <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>

                                        <div className="absolute right-0 mt-3 w-48 bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl py-2 z-20 overflow-hidden transform origin-top-right transition-all">
                                            <Link
                                                href="/dashboard"
                                                className="block px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                📊 My Dashboard
                                            </Link>
                                            <div className="h-px bg-white/5 my-1"></div>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setIsProfileOpen(false);
                                                }}
                                                className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                🚪 Log Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link href="/auth/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                    Log In
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="px-5 py-2.5 text-sm font-medium rounded-full text-white bg-white/10 border border-white/10 hover:bg-white/20 hover:border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 absolute w-full">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {user && (
                            <div className="px-3 py-3 border-b border-white/10 mb-2 flex items-center gap-3">
                                <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-blue-400">Welcome back,</p>
                                    <p className="text-white font-bold">{user.name}</p>
                                </div>
                            </div>
                        )}

                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}

                        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col space-y-2 px-3">
                            {user ? (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="block text-center px-4 py-2 border border-blue-500/30 rounded-md text-blue-400 hover:bg-blue-500/10 mb-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        My Dashboard
                                    </Link>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full text-center px-4 py-2 border border-red-500/30 rounded-md text-red-400 hover:bg-red-500/10"
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/login" className="block text-center px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-white/5">
                                        Log In
                                    </Link>
                                    <Link href="/auth/register" className="block text-center px-4 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
