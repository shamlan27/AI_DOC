"use client";

import Link from 'next/link';

export default function Emergency() {
    return (
        <div className="min-h-screen bg-[#030712] text-gray-100 relative overflow-hidden">
            {/* Background Effects - Urgent Red/Orange Tones */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-900/20 rounded-full blur-[120px]"></div>
            </div>

            <main className="relative z-10 pt-32 pb-20 px-4">
                {/* Hero */}
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-bold uppercase tracking-wider mb-6 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        Emergency Response
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                        Immediate <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Care & Support</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                        24/7 Medical support for critical situations. We prioritize your health with instant response teams.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-lg shadow-lg shadow-red-900/40 transition-transform transform hover:scale-105 flex items-center justify-center gap-2">
                            <span className="text-2xl">🚑</span> Call Ambulance Now
                        </button>
                        <Link href="/contact" className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold text-lg border border-white/10 transition-colors">
                            Contact Support
                        </Link>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto space-y-20">
                    {/* Home Care Support Section */}
                    <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className="h-64 lg:h-auto relative">
                                {/* Use standard Next.js Image or simple img if external config not set, using img for simplicity with local asset */}
                                <img
                                    src="/emergency-care.jpg"
                                    alt="Compassionate Home Care"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent lg:bg-gradient-to-r"></div>
                            </div>
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Home Care Support</h2>
                                <p className="text-gray-300 mb-6 leading-relaxed">
                                    Professional medical assistance delivered to your doorstep. Our compassionate team provides comprehensive home care for elderly patients, post-operative recovery, and chronic disease management.
                                </p>
                                <ul className="space-y-4 mb-8">
                                    {[
                                        "24/7 Nursing Availability",
                                        "Post-Hospitalization Care",
                                        "Elderly Companion Services",
                                        "In-Home Physiotherapy"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300">
                                            <span className="text-green-400">✓</span> {item}
                                        </li>
                                    ))}
                                </ul>
                                <button className="self-start px-6 py-3 bg-blue-600/20 md:bg-blue-600 text-blue-400 md:text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                                    Request Home Care
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Free Pregnancy Ambulance Support */}
                    <div className="glass-card p-8 md:p-12 rounded-3xl border border-pink-500/20 bg-gradient-to-br from-pink-900/10 to-purple-900/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                            <div className="flex-1">
                                <span className="inline-block px-4 py-1 rounded-full bg-pink-500/20 text-pink-300 text-sm font-bold mb-4 border border-pink-500/30">
                                    Free Service
                                </span>
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Maternal Emergency Support</h2>
                                <p className="text-gray-300 text-lg mb-8">
                                    We are dedicated to ensuring safe deliveries. We provide <span className="text-pink-400 font-bold">100% Free Ambulance Services</span> for pregnant women in emergency situations, ensuring specialized care during transport.
                                </p>
                                <div className="flex flex-wrap gap-4">
                                    <button className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-full font-bold shadow-lg shadow-pink-900/40 transition-colors">
                                        Request Maternal Ambulance
                                    </button>
                                </div>
                            </div>
                            <div className="shrink-0 relative">
                                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-pink-500/20 flex items-center justify-center border-2 border-pink-500/30 animate-pulse">
                                    <span className="text-6xl md:text-8xl">🤰</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
