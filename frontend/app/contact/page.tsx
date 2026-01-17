"use client";

import { useState } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#030712] text-gray-100 flex relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass-panel text-sm font-medium text-blue-400 border border-blue-500/20">
                        📞 We're here to help
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Support</span></h1>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Have questions about our AI diagnosis? Need help with your account? Reach out to our 24/7 support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    {/* Contact Form */}
                    <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10">
                        <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
                        {submitted ? (
                            <div className="p-8 bg-green-500/10 rounded-2xl border border-green-500/20 text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">✅</span>
                                </div>
                                <h3 className="text-xl font-bold text-green-400 mb-2">Message Sent!</h3>
                                <p className="text-gray-300">Thank you for contacting us. We will get back to you shortly.</p>
                                <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-green-400 hover:text-green-300 underline">Send another</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 transition-all"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 transition-all"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-white placeholder-gray-600 transition-all resize-none"
                                        placeholder="How can we help you?"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all transform hover:-translate-y-1"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Info & Map */}
                    <div className="space-y-8">
                        <div className="glass-panel p-8 rounded-3xl border border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-8">Contact Information</h2>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4 group">
                                    <div className="mt-1 bg-blue-500/20 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">📍</div>
                                    <div>
                                        <p className="font-bold text-white mb-1">Headquarters</p>
                                        <p className="text-gray-400 text-sm leading-relaxed">123 Health Tech Park, Medical District,<br />Innovation City, 45001</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">📞</div>
                                    <div>
                                        <p className="font-bold text-white mb-1">Phone</p>
                                        <p className="text-gray-400 text-sm">+1 (800) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">✉️</div>
                                    <div>
                                        <p className="font-bold text-white mb-1">Email</p>
                                        <p className="text-gray-400 text-sm">support@smartdoc.ai</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="h-72 rounded-3xl overflow-hidden relative shadow-lg border border-white/10 group">
                            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center text-gray-500 group-hover:bg-gray-800 transition-colors">
                                <div className="text-center opacity-50 group-hover:opacity-100 transition-opacity">
                                    <span className="text-5xl block mb-4">🗺️</span>
                                    <span className="font-semibold text-gray-300">Map Integration</span>
                                    <p className="text-xs mt-2">Google Maps / OpenStreetMaps</p>
                                </div>
                            </div>
                            {/* Decorative Glow */}
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-colors"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
