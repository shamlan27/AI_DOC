"use client";

import Link from 'next/link';
import NextImage from 'next/image';

export default function Footer() {
    return (
        <footer className="relative bg-black/40 border-t border-white/5 pt-20 pb-10 overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="inline-block group">
                            <div className="relative h-16 w-60 overflow-hidden group-hover:opacity-80 transition-opacity">
                                <NextImage
                                    src="/header-logo-v2.png"
                                    alt="AI Doc Logo"
                                    fill
                                    className="object-contain object-left"
                                    priority
                                />
                            </div>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Empowering your health journey with AI-driven recommendations. Find the right specialist instantly and book with confidence.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="text-gray-400 hover:text-blue-400 transition-colors">Home</Link></li>
                            <li><Link href="/about" className="text-gray-400 hover:text-blue-400 transition-colors">About Us</Link></li>
                            <li><Link href="/recommendations" className="text-gray-400 hover:text-blue-400 transition-colors">Find a Doctor</Link></li>
                            <li><Link href="/dashboard" className="text-gray-400 hover:text-blue-400 transition-colors">My Dashboard</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Services</h3>
                        <ul className="space-y-3">
                            <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Symptom Checker</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Online Pharmacy</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Lab Reports</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-blue-400 transition-colors">Emergency Care</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-6">Stay Updated</h3>
                        <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest health tips.</p>
                        <form className="flex flex-col gap-3">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 text-white border border-white/10 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm placeholder-gray-600 focus:bg-white/10 transition-all"
                            />
                            <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
                    <p>&copy; {new Date().getFullYear()} SmartDoc AI. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
